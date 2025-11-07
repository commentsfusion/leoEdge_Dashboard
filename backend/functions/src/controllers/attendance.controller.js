// controllers/attendance.controller.js
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import EmployeeSalary from "../models/EmployeeSalary.js";
import { toYMD } from "../utils/date.js";
import { getPayCycleForDate } from "../utils/payCycle.js";

// only these two count toward the 20-day bonus
const COUNTABLE_STATUSES = ["Present", "LEAVE"];
const ATTENDANCE_TARGET = 20;
const ATTENDANCE_BONUS_AMOUNT = 5000;

/**
 * POST /api/attendance
 */
export const createOrUpdateAttendance = async (req, res) => {
  try {
    const {
      employee_id,
      attendance_date,
      status,
      note = "",
      extra_note = "",
      changed_by = "system",
      early_hours,
    } = req.body;

    if (!employee_id || !attendance_date || !status) {
      return res.status(400).json({
        success: false,
        message: "employee_id, attendance_date and status are required.",
      });
    }

    const todayYMD = toYMD();
    if (attendance_date > todayYMD) {
      return res.status(400).json({
        success: false,
        message: "You cannot mark attendance for a future date.",
        today: todayYMD,
      });
    }

    const historyEntry = {
      status,
      note,
      extra_note,
      changed_by,
      changed_at: new Date(),
    };

    let attendance = await Attendance.findOne({
      employee_id,
      attendance_date,
    });

    let isNew = false;

    if (!attendance) {
      isNew = true;
      attendance = await Attendance.create({
        employee_id,
        attendance_date,
        status,
        note,
        extra_note,
        ...(early_hours !== undefined ? { early_hours } : {}),
        history: [historyEntry],
      });
    } else {
      attendance.status = status;
      attendance.note = note;
      attendance.extra_note = extra_note;
      if (early_hours !== undefined) {
        attendance.early_hours = early_hours;
      }
      attendance.history.push(historyEntry);
      await attendance.save();
    }

    // attendance → salary auto bonus
    if (COUNTABLE_STATUSES.includes(status)) {
      const attDateObj = new Date(attendance_date);
      const { cycleStart, cycleEnd, cycle_key } = getPayCycleForDate(attDateObj);

      const emp = await Employee.findOne({ employee_id });
      if (emp) {
        let salaryDoc = await EmployeeSalary.findOne({
          employee_id,
          cycle_key,
        });

        if (!salaryDoc) {
          salaryDoc = await EmployeeSalary.create({
            employee: emp._id,
            employee_id,
            cycle_key,
            cycle_start: cycleStart,
            cycle_end: cycleEnd,
            base_salary: emp.salary,
            salary_per_hour: emp.salary_per_hour || 0,
            payable_salary: emp.salary,
            transactions: [],
            attendance_count: 0,
            attendance_bonus_awarded: false,
          });
        }

        salaryDoc.attendance_count = (salaryDoc.attendance_count || 0) + 1;

        if (
          salaryDoc.attendance_count >= ATTENDANCE_TARGET &&
          !salaryDoc.attendance_bonus_awarded
        ) {
          salaryDoc.payable_salary += ATTENDANCE_BONUS_AMOUNT;

          salaryDoc.transactions.push({
            type: "attendance_bonus_auto",
            amount: ATTENDANCE_BONUS_AMOUNT,
            note: `Auto attendance bonus for ${ATTENDANCE_TARGET} days in this cycle.`,
            meta: {
              attendance_count: salaryDoc.attendance_count,
              target: ATTENDANCE_TARGET,
            },
            action_date: attDateObj,
          });

          salaryDoc.attendance_bonus_awarded = true;
        }

        await salaryDoc.save();
      }
    }

    return res.json({
      success: true,
      message: isNew
        ? "Attendance marked successfully."
        : "Attendance updated successfully.",
      data: attendance,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Attendance already marked for this employee and date.",
      });
    }

    console.error("createOrUpdateAttendance error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while saving attendance.",
    });
  }
};

/**
 * GET /api/attendance/:employee_id
 * -> paginated attendance for 1 employee
 * /api/attendance/EMP-1?page=1&limit=20
 */
export const getAttendanceByEmployee = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 20, 1);
    const skip = (page - 1) * limit;

    const filter = { employee_id };

    const total = await Attendance.countDocuments(filter);
    const records = await Attendance.find(filter)
      .sort({ attendance_date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: records,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    console.error("getAttendanceByEmployee error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/attendance/range/:employee_id?start=YYYY-MM-DD&end=YYYY-MM-DD&page=1&limit=20
 * returns attendance of 1 employee between two dates (inclusive)
 */
export const getAttendanceByEmployeeRange = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: "start and end query params are required in YYYY-MM-DD format.",
      });
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 20, 1);
    const skip = (page - 1) * limit;

    const filter = {
      employee_id,
      attendance_date: { $gte: start, $lte: end },
    };

    const total = await Attendance.countDocuments(filter);
    const records = await Attendance.find(filter)
      .sort({ attendance_date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.json({
      success: true,
      data: records,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        start,
        end,
      },
    });
  } catch (err) {
    console.error("getAttendanceByEmployeeRange error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/attendance/:employee_id/:date
 */
export const getAttendanceByEmployeeAndDate = async (req, res) => {
  try {
    const { employee_id, date } = req.params;
    const record = await Attendance.findOne({
      employee_id,
      attendance_date: date,
    }).lean();

    if (!record) return res.json({ found: false });

    res.json({
      success: true,
      found: true,
      status: record.status,
      note: record.note,
      history: record.history,
    });
  } catch (err) {
    console.error("getAttendanceByEmployeeAndDate error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/attendance/date/:date
 * all employees' attendance for a specific date (can paginate)
 * /api/attendance/date/2025-11-06?page=1&limit=50
 */
export const getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 100, 1);
    const skip = (page - 1) * limit;

    const filter = { attendance_date: date };

    const total = await Attendance.countDocuments(filter);
    const records = await Attendance.find(filter)
      .sort({ employee_id: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.json({
      success: true,
      data: records,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    console.error("getAttendanceByDate error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/attendance/today
 */
export const getTodayAttendance = async (req, res) => {
  try {
    const today = toYMD();
    const records = await Attendance.find({ attendance_date: today })
      .sort({ employee_id: 1 })
      .lean();

    return res.json({ success: true, data: records });
  } catch (err) {
    console.error("getTodayAttendance error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
