// controllers/salaryController.js
import Employee from "../models/Employee.js";
import EmployeeSalary from "../models/EmployeeSalary.js";
import { getPayCycleForDate } from "../utils/payCycle.js";
import { sendMail } from "../config/mailer.js";
import { salaryPaidTemplate, thirdMonthReferralTemplate } from "../utils/emailTemplates.js";
export const applySalaryAction = async (req, res) => {
  try {
    const {
      employee_id,
      note,
      action_date,          // user-selected date
      increment,
      decrement,
      bonus_amount,
      bonus_percentage,
      extra_hour,
      attendance_bonus,
      overtime_percent,
      overtime_hours,
      absent_amount,
      early_hour,           // 👈 NEW coming from frontend
    } = req.body;

    // 1) validate required fields
    if (!employee_id || !note || !action_date) {
      return res.status(400).json({
        success: false,
        message: "employee_id, note and action_date are required.",
      });
    }

    // 2) convert user date
    const actionDateObj = new Date(action_date);
    if (isNaN(actionDateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: "action_date is not a valid date.",
      });
    }

    // 3) find employee
    const employee = await Employee.findOne({ employee_id });
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    // 4) get pay-cycle for that date
    const { cycleStart, cycleEnd, cycle_key } = getPayCycleForDate(actionDateObj);

    // extra safety
    if (!(actionDateObj >= cycleStart && actionDateObj <= cycleEnd)) {
      return res.status(400).json({
        success: false,
        message: "action_date does not fall inside computed pay cycle.",
      });
    }

    // 5) find or create salary doc for THAT cycle
    let salaryDoc = await EmployeeSalary.findOne({
      employee_id,
      cycle_key,
    });

    if (!salaryDoc) {
      salaryDoc = await EmployeeSalary.create({
        employee: employee._id,
        employee_id,
        cycle_key,
        cycle_start: cycleStart,
        cycle_end: cycleEnd,
        base_salary: employee.salary,
        salary_per_hour: employee.salary_per_hour || 0,
        payable_salary: employee.salary,
        transactions: [],
      });
    }

    // 6) start working on payable
    let payable = salaryDoc.payable_salary;
    const txnsToPush = [];

    // increment
    if (typeof increment === "number" && increment !== 0) {
      payable += increment;
      txnsToPush.push({
        type: "increment",
        amount: increment,
        meta: { increment },
        note,
        action_date: actionDateObj,
      });
    }

    // decrement
    if (typeof decrement === "number" && decrement !== 0) {
      payable -= decrement;
      txnsToPush.push({
        type: "decrement",
        amount: -Math.abs(decrement),
        meta: { decrement },
        note,
        action_date: actionDateObj,
      });
    }

    // bonus_amount
    if (typeof bonus_amount === "number" && bonus_amount !== 0) {
      payable += bonus_amount;
      txnsToPush.push({
        type: "bonus_amount",
        amount: bonus_amount,
        meta: { bonus_amount },
        note,
        action_date: actionDateObj,
      });
    }

    // bonus_percentage (needs extra_hour)
    if (typeof bonus_percentage === "number" && bonus_percentage !== 0) {
      if (typeof extra_hour !== "number" || extra_hour <= 0) {
        return res.status(400).json({
          success: false,
          message:
            "extra_hour is required and must be > 0 when bonus_percentage is sent.",
        });
      }
      const sph = salaryDoc.salary_per_hour || employee.salary_per_hour || 0;
      const bonusByPercent = extra_hour * bonus_percentage * sph;

      payable += bonusByPercent;
      txnsToPush.push({
        type: "bonus_percentage",
        amount: bonusByPercent,
        meta: {
          bonus_percentage,
          extra_hour,
          salary_per_hour: sph,
          formula: "extra_hour * bonus_percentage * salary_per_hour",
        },
        note,
        action_date: actionDateObj,
      });
    }

    // attendance_bonus
    if (typeof attendance_bonus === "number" && attendance_bonus !== 0) {
      payable += attendance_bonus;
      txnsToPush.push({
        type: "attendance_bonus",
        amount: attendance_bonus,
        meta: { attendance_bonus },
        note,
        action_date: actionDateObj,
      });
    }

    // overtime
    if (
      typeof overtime_percent === "number" &&
      overtime_percent > 0 &&
      typeof overtime_hours === "number" &&
      overtime_hours > 0
    ) {
      const sph = salaryDoc.salary_per_hour || employee.salary_per_hour || 0;
      const overtimeToAdd =
        overtime_hours * (overtime_percent / 100) * sph;
      payable += overtimeToAdd;
      txnsToPush.push({
        type: "overtime",
        amount: overtimeToAdd,
        meta: {
          overtime_percent,
          overtime_hours,
          salary_per_hour: sph,
          formula:
            "overtime_hours * (overtime_percent / 100) * salary_per_hour",
        },
        note,
        action_date: actionDateObj,
      });
    }

    // absent_amount
    if (typeof absent_amount === "number" && absent_amount > 0) {
      const sph = salaryDoc.salary_per_hour || employee.salary_per_hour || 0;
      const absentCut = absent_amount * sph;
      payable -= absentCut;
      txnsToPush.push({
        type: "absent",
        amount: -Math.abs(absentCut),
        meta: {
          absent_amount,
          salary_per_hour: sph,
          formula: "absent_amount * salary_per_hour",
        },
        note,
        action_date: actionDateObj,
      });
    }

    // ✅ EARLY LEAVE SCENARIO
    // comes from frontend: { employee_id, action_date, note, early_hour }
    if (typeof early_hour === "number" && early_hour > 0) {
      const sph = salaryDoc.salary_per_hour || employee.salary_per_hour || 0;
      const earlyCut = early_hour * sph; // simple multiply
      payable -= earlyCut;
      txnsToPush.push({
        type: "early_leave",
        amount: -Math.abs(earlyCut),
        meta: {
          early_hour,
          salary_per_hour: sph,
          formula: "early_hour * salary_per_hour",
        },
        note,
        action_date: actionDateObj,
      });
    }

    // 7) save doc
    salaryDoc.payable_salary = payable;
    salaryDoc.transactions.push(...txnsToPush);
    salaryDoc.last_action_at = actionDateObj;
    await salaryDoc.save();

    return res.json({
      success: true,
      message: "Salary updated for selected date's pay cycle.",
      data: salaryDoc,
    });
  } catch (err) {
    console.error("applySalaryAction error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};


// controllers/salaryController.js  (add this)
export const getEmployeeSalaryHistory = async (req, res) => {
  try {
    const { employee_id } = req.params;
    if (!employee_id) {
      return res
        .status(400)
        .json({ success: false, message: "employee_id is required" });
    }

    // read from query string: /api/salary/history/EMP-1?page=2&limit=20
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const skip = (page - 1) * limit;

    // count total first
    const total = await EmployeeSalary.countDocuments({ employee_id });

    // get paginated docs
    const docs = await EmployeeSalary.find({ employee_id })
      .sort({ cycle_start: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.json({
      success: true,
      data: docs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    console.error("getEmployeeSalaryHistory error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};


// controllers/salaryController.js  (add this)
export const markSalaryPaid = async (req, res) => {
  try {
    const { employee_id, cycle_key } = req.body;
    if (!employee_id || !cycle_key) {
      return res.status(400).json({
        success: false,
        message: "employee_id and cycle_key are required",
      });
    }

    // 1) Load salary doc for that cycle
    const doc = await EmployeeSalary.findOne({ employee_id, cycle_key });
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Salary document not found for this cycle",
      });
    }

    // Prevent double-paying & double-incrementing
    if (doc.status === "paid") {
      return res.status(409).json({
        success: false,
        message: "This cycle is already marked as paid.",
        data: doc,
      });
    }

    // 2) Mark the cycle paid
    doc.status = "paid";
    doc.paid_at = new Date();
    await doc.save();

    // 3) Increment employee.salary_count atomically
    const employee = await Employee.findOneAndUpdate(
      { employee_id },
      { $inc: { salary_count: 1 } },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found (after marking paid)",
      });
    }

    const newCount = employee.salary_count || 0;

    // 4) Email the employee: “salary credited”
    const monthLabel = doc.cycle_key; // e.g. "2025-11" — use your own pretty format if needed
    const cycleStartStr = new Date(doc.cycle_start).toLocaleDateString();
    const cycleEndStr   = new Date(doc.cycle_end).toLocaleDateString();
    const amount = doc.payable_salary;

    await sendMail({
      to: employee.email,
      subject: `Salary Paid — ${monthLabel}`,
      html: salaryPaidTemplate({
        name: employee.name,
        monthLabel,
        amount,
        cycleStart: cycleStartStr,
        cycleEnd: cycleEndStr,
      }),
    });

    // 5) If referred and this is the 3rd salary → email the owner
    if ((employee.referred_by || "").trim() && newCount === 3) {
      const ownerEmail = process.env.OWNER_EMAIL; // set in .env
      if (ownerEmail) {
        await sendMail({
          to: ownerEmail,
          subject: `Referral Bonus Due — ${employee.name} (3 months reached)`,
          html: thirdMonthReferralTemplate({
            employeeName: employee.name,
            referredBy: employee.referred_by,
            monthLabel,
          }),
        });
      }
    }

    return res.json({
      success: true,
      message: "Salary marked as paid. Notification(s) sent.",
      data: { salaryDoc: doc, employee },
    });
  } catch (err) {
    console.error("markSalaryPaid error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};