import SalaryDaily from "../models/Salary.js";
import SalaryDailyEvent from "../models/SalaryDailyEvent.js";
import Employee from "../models/Employee.js";

// normalize to "YYYY-MM-DD"
function toYMD(dateStr) {
  if (dateStr) {
    const d = new Date(dateStr);
    if (!isNaN(d)) return d.toISOString().slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  }
  throw new Error("Valid date (YYYY-MM-DD) is required");
}

// POST /api/employee-salary
// Create/Upsert a day (cumulative): payable adjusts from existing.payable_amount if record exists
export const upsertDailySalary = async (req, res) => {
  try {
    const { employee_id, date, increment, deduction, note } = req.body;

    if (!employee_id || !date) {
      return res.status(400).json({ error: "employee_id and date are required" });
    }

    const inc = increment !== undefined ? Number(increment) : 0;
    const ded = deduction !== undefined ? Number(deduction) : 0;
    if (!Number.isFinite(inc) || inc < 0 || !Number.isFinite(ded) || ded < 0) {
      return res.status(400).json({ error: "increment/deduction must be non-negative numbers" });
    }

    const emp = await Employee.findOne({ employee_id });
    if (!emp) return res.status(404).json({ error: "Employee not found" });

    const salary_date = toYMD(date);

    // check existing daily
    const existing = await SalaryDaily.findOne({ employee_id, salary_date });

    let doc;
    if (!existing) {
      // first entry of the day
      const base = Number(emp.salary) || 0;
      let payable = base - ded + inc;
      if (payable < 0) payable = 0;

      doc = await SalaryDaily.findOneAndUpdate(
        { employee_id, salary_date },
        {
          $set: {
            base_salary: base,
            increment: inc,
            deduction: ded,
            payable_amount: payable,
            note: note || ""
          }
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    } else {
      // cumulative update on same day
      const newIncrement = (existing.increment || 0) + inc;
      const newDeduction = (existing.deduction || 0) + ded;

      let newPayable = (existing.payable_amount || 0) - ded + inc;
      if (newPayable < 0) newPayable = 0;

      const updates = {
        increment: newIncrement,
        deduction: newDeduction,
        payable_amount: newPayable
      };

      // append notes (optional)
      if (note !== undefined && note !== "") {
        updates.note = existing.note ? `${existing.note}\n${note}` : note;
      }

      doc = await SalaryDaily.findOneAndUpdate(
        { employee_id, salary_date },
        { $set: updates },
        { new: true }
      );
    }

    // audit events
    const events = [];
    if (inc > 0) {
      events.push({ employee_id, salary_date, type: "increment", amount: inc, note: note || "" });
    }
    if (ded > 0) {
      events.push({ employee_id, salary_date, type: "deduction", amount: ded, note: note || "" });
    }
    if (events.length) {
      await SalaryDailyEvent.insertMany(events);
    }

    return res.status(200).json({ message: "Daily salary saved", success: true, data: doc });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: "Salary record already exists for this date" });
    }
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};

// GET /api/employee-salary?employee_id=EMP-001
// Or filter daily records by date/month/range
export const getDailySalary = async (req, res) => {
  try {
    const { employee_id, date, month, from, to, page = 1, limit = 20 } = req.query;

    // ✅ Case 1: Only employee_id provided → show base salary + payable summary
    if (employee_id && !date && !month && !from && !to) {
      const emp = await Employee.findOne({ employee_id });
      if (!emp) return res.status(404).json({ error: "Employee not found" });

      // Get latest payable record (if exists)
      const latestSalary = await SalaryDaily.findOne({ employee_id })
        .sort({ salary_date: -1 })
        .select("salary_date payable_amount increment deduction note");

      return res.json({
        employee_id: emp.employee_id,
        name: emp.name,
        designation: emp.designation,
        base_salary: emp.salary, // fixed base salary
        current_employee: emp.current_employee,
        latest_payable:
          latestSalary?.payable_amount !== undefined
            ? latestSalary.payable_amount
            : emp.salary, // if no adjustment yet
        last_update_date: latestSalary?.salary_date || null,
        last_increment: latestSalary?.increment || 0,
        last_deduction: latestSalary?.deduction || 0,
        last_note: latestSalary?.note || "",
        message: "Base salary and latest payable amount fetched successfully",
      });
    }

    // ✅ Case 2: Fetch daily records (filtered)
    const filter = {};
    if (employee_id) filter.employee_id = employee_id;

    if (date) {
      filter.salary_date = toYMD(date);
    } else if (month) {
      filter.salary_date = { $regex: `^${month}` }; // e.g. "2025-10"
    } else if (from || to) {
      const gte = from ? toYMD(from) : "0000-01-01";
      const lte = to ? toYMD(to) : "9999-12-31";
      filter.salary_date = { $gte: gte, $lte: lte };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [list, total] = await Promise.all([
      SalaryDaily.find(filter)
        .sort({ salary_date: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select(
          "employee_id salary_date base_salary increment deduction payable_amount note"
        ),
      SalaryDaily.countDocuments(filter),
    ]);

    // ✅ Compute total payable overview for the filtered records
    const totalPayable = list.reduce(
      (acc, r) => acc + (r.payable_amount || 0),
      0
    );

    return res.json({
      total,
      totalPayable,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
      data: list,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};


// PATCH /api/employee-salary/:employee_id/:date  (absolute totals for the day)
export const updateDailySalaryByEmpAndDate = async (req, res) => {
  try {
    const { employee_id, date } = req.params;
    const { increment, deduction, note } = req.body;

    if (!employee_id || !date) {
      return res.status(400).json({ error: "employee_id and date are required in params" });
    }

    const salary_date = toYMD(date);
    const current = await SalaryDaily.findOne({ employee_id, salary_date });
    if (!current) return res.status(404).json({ error: "Salary record not found" });

    const updates = {};
    const oldInc = current.increment || 0;
    const oldDed = current.deduction || 0;

    const newInc = increment !== undefined ? Number(increment) : oldInc;
    const newDed = deduction !== undefined ? Number(deduction) : oldDed;

    if (increment !== undefined && (!Number.isFinite(newInc) || newInc < 0)) {
      return res.status(400).json({ error: "increment must be a non-negative number" });
    }
    if (deduction !== undefined && (!Number.isFinite(newDed) || newDed < 0)) {
      return res.status(400).json({ error: "deduction must be a non-negative number" });
    }

    // recompute payable with final totals
    let payable = current.base_salary - newDed + newInc;
    if (payable < 0) payable = 0;

    updates.increment = newInc;
    updates.deduction = newDed;
    updates.payable_amount = payable;
    if (note !== undefined) updates.note = note;

    const updated = await SalaryDaily.findOneAndUpdate(
      { employee_id, salary_date },
      { $set: updates },
      { new: true }
    );

    // log only positive deltas
    const deltaInc = Math.max(0, newInc - oldInc);
    const deltaDed = Math.max(0, newDed - oldDed);
    const events = [];
    if (deltaInc > 0) events.push({ employee_id, salary_date, type: "increment", amount: deltaInc, note: note || "" });
    if (deltaDed > 0) events.push({ employee_id, salary_date, type: "deduction", amount: deltaDed, note: note || "" });
    if (events.length) await SalaryDailyEvent.insertMany(events);

    return res.json({ message: "Daily salary updated", success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};

// DELETE /api/employee-salary/:employee_id/:date
export const deleteDailySalaryByEmpAndDate = async (req, res) => {
  try {
    const { employee_id, date } = req.params;
    if (!employee_id || !date) {
      return res.status(400).json({ error: "employee_id and date are required in params" });
    }
    const salary_date = toYMD(date);

    const deleted = await SalaryDaily.findOneAndDelete({ employee_id, salary_date });
    if (!deleted) return res.status(404).json({ error: "Salary record not found" });

    return res.json({ message: "Daily salary deleted", success: true, data: deleted });
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};

// GET /api/employee-salary/events?employee_id=EMP-001[&date=YYYY-MM-DD | &month=YYYY-MM | &from=YYYY-MM-DD&to=YYYY-MM-DD]
export const getSalaryEvents = async (req, res) => {
  try {
    const { employee_id, date, month, from, to, page = 1, limit = 20 } = req.query;
    if (!employee_id) {
      return res.status(400).json({ error: "employee_id is required" });
    }

    const filter = { employee_id };

    const _toYMD = (s) => {
      const d = new Date(s);
      if (!isNaN(d)) return d.toISOString().slice(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      throw new Error("Invalid date");
    };

    if (date) {
      filter.salary_date = _toYMD(date);
    } else if (month) {
      filter.salary_date = { $regex: `^${month}` };
    } else if (from || to) {
      const gte = from ? _toYMD(from) : "0000-01-01";
      const lte = to ? _toYMD(to) : "9999-12-31";
      filter.salary_date = { $gte: gte, $lte: lte };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [list, total] = await Promise.all([
      SalaryDailyEvent.find(filter).sort({ salary_date: -1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      SalaryDailyEvent.countDocuments(filter),
    ]);

    // totals for this filter
    const totalsAgg = await SalaryDailyEvent.aggregate([
      { $match: filter },
      { $group: { _id: "$type", amount: { $sum: "$amount" } } }
    ]);
    const totals = { total_increment: 0, total_deduction: 0, net_change: 0 };
    for (const t of totalsAgg) {
      if (t._id === "increment") totals.total_increment = t.amount;
      if (t._id === "deduction") totals.total_deduction = t.amount;
    }
    totals.net_change = totals.total_increment - totals.total_deduction;

    return res.json({
      employee_id,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
      ...totals,
      data: list
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};

// GET /api/employee-salary/events/summary?employee_id=EMP-001&month=2025-10&groupBy=day
export const getSalaryEventsSummary = async (req, res) => {
  try {
    const { employee_id, date, month, from, to, groupBy = "none" } = req.query;
    if (!employee_id) {
      return res.status(400).json({ error: "employee_id is required" });
    }

    const filter = { employee_id };

    const _toYMD = (s) => {
      const d = new Date(s);
      if (!isNaN(d)) return d.toISOString().slice(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      throw new Error("Invalid date");
    };

    if (date) {
      filter.salary_date = _toYMD(date);
    } else if (month) {
      filter.salary_date = { $regex: `^${month}` };
    } else if (from || to) {
      const gte = from ? _toYMD(from) : "0000-01-01";
      const lte = to ? _toYMD(to) : "9999-12-31";
      filter.salary_date = { $gte: gte, $lte: lte };
    }

    const groupId = groupBy === "day" ? { date: "$salary_date", type: "$type" } : { type: "$type" };

    const rows = await SalaryDailyEvent.aggregate([
      { $match: filter },
      { $group: { _id: groupId, amount: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { "_id.date": 1, "_id.type": 1 } }
    ]);

    let total_increment = 0, total_deduction = 0;
    for (const r of rows) {
      const t = groupBy === "day" ? r._id.type : r._id.type;
      if (t === "increment") total_increment += r.amount;
      if (t === "deduction") total_deduction += r.amount;
    }

    return res.json({
      employee_id,
      groupBy,
      total_increment,
      total_deduction,
      net_change: total_increment - total_deduction,
      rows
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};
