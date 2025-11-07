// controllers/employee.controller.js
import Employee from "../models/Employee.js";

// ---- CONFIG FOR SALARY/HOUR ----
const WORKING_HOURS_PER_DAY = 9;
const WORKING_DAYS_PER_WEEK = 5;
const WEEKS_PER_MONTH = 4; // assumption: 4 weeks
const MONTHLY_HOURS =
  WORKING_HOURS_PER_DAY * WORKING_DAYS_PER_WEEK * WEEKS_PER_MONTH; // 9*5*4 = 180

// ---- HELPERS ----
const parseJoinDate = (body) =>
  body.joining_date ||
  body.joiningDate ||
  body["joining data"] ||
  body.joining ||
  null;

const parseSalary = (body) => {
  const raw = body.salary;
  const num = Number(raw);
  return Number.isFinite(num) ? num : NaN;
};

// calculate salary/hour from monthly salary
const computeSalaryPerHour = (monthlySalary) => {
  if (!MONTHLY_HOURS) return 0;
  return Number((monthlySalary / MONTHLY_HOURS).toFixed(2));
};

// which fields are required on create
const required = [
  "email",
  "employee_id",
  "name",
  "designation",
  "phone_no",
  "job_shift",
  "salary",
];

// ----------------------------------------------------
// CREATE
// ----------------------------------------------------
export const createEmployee = async (req, res) => {
  try {
    const missing = required.filter((k) => !req.body[k]);
    const salary = parseSalary(req.body);

    // build descriptive error message
    if (missing.length || Number.isNaN(salary)) {
      const parts = [];
      if (missing.length)
        parts.push(`  ${missing.join(", ")} missing`);
      if (Number.isNaN(salary))
        parts.push("Invalid or missing salary value");
      return res.status(400).json({
        success: false,
        message: parts.join(". ") + ".",
        missingFields: missing,
        salaryValid: !Number.isNaN(salary),
      });
    }

    const salary_per_hour = computeSalaryPerHour(salary);

    const doc = await Employee.create({
      employee_id: req.body.employee_id.trim(),
      name: req.body.name,
      email: req.body.email,
      designation: req.body.designation,
      phone_no: req.body.phone_no,
      job_shift: req.body.job_shift,
      referred_by: req.body.referred_by || "",
      joining_date: parseJoinDate(req.body),
      salary,
      salary_per_hour,
      image: req.file ? `/${req.file.path.replace(/\\/g, "/")}` : "",
      current_employee: req.body.current_employee || "Active Employee",
      iban_number: req.body.iban_number || "",
      account_title: req.body.account_title || "",
      bank_name: req.body.bank_name || "",
    });

    return res.status(201).json({
      success: true,
      message: "Employee has been created successfully.",
      data: doc,
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Employee ID must be unique.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server error occurred.",
      details: err.message,
    });
  }
};

// ----------------------------------------------------
// GET ALL
// ----------------------------------------------------
export const getAllEmployees = async (_req, res) => {
  try {
    // list + grouped counts in parallel
    const [list, groups] = await Promise.all([
      Employee.find().sort({ createdAt: -1 }),
      Employee.aggregate([
        {
          $addFields: {
            _statusBucket: {
              $cond: [
                {
                  $regexMatch: {
                    input: { $ifNull: ["$current_employee", ""] },
                    regex: /^active/i, // starts with "Active"
                  },
                },
                "active_employee",
                "ex-employee",
              ],
            },
          },
        },
        { $group: { _id: "$_statusBucket", count: { $sum: 1 } } },
      ]),
    ]);

    // normalize counts
    const counts = { "active_employee": 0, "ex-employee": 0 };
    for (const g of groups) counts[g._id] = g.count;

    return res.json({
      count: list.length,
      "active_employee": counts["active_employee"],
      "ex-employee": counts["ex-employee"],
      data: list, // 👈 each document now includes salary_per_hour
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};


export const getEmployeeById = async (req, res) => {
  try {
    const emp = await Employee.findOne({
      employee_id: req.params.employee_id,
    });
    if (!emp) {
      return res.status(404).json({ error: "Employee not found" });
    }
    return res.json({ data: emp }); // 👈 will have salary_per_hour
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

export const updateEmployeeById = async (req, res) => {
  try {
    const updates = {};

    // salary can come with wrong spelling sometimes
    const incomingSalary = req.body.salary ?? req.body.salaray;
    if (incomingSalary !== undefined) {
      const num = Number(incomingSalary);
      if (!Number.isFinite(num)) {
        return res.status(400).json({ error: "salary must be a number" });
      }
      updates.salary = num;
      // 👇 recalculate salary_per_hour
      updates.salary_per_hour = computeSalaryPerHour(num);
    }

    [
      "name",
      "email",
      "designation",
      "phone_no",
      "job_shift",
      "referred_by",
      "current_employee",
    ].forEach((k) => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });

    const jd = parseJoinDate(req.body);
    if (jd !== null) updates.joining_date = jd;

    if (req.file) {
      updates.image = `/${req.file.path.replace(/\\/g, "/")}`;
    }

    const updated = await Employee.findOneAndUpdate(
      { employee_id: req.params.employee_id },
      { $set: updates },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Employee not found" });
    }

    return res.json({
      message: "Employee updated",
      success: true,
      data: updated, // 👈 includes salary_per_hour
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

export const deleteEmployeeById = async (req, res) => {
  try {
    const deleted = await Employee.findOneAndDelete({
      employee_id: req.params.employee_id,
    });
    if (!deleted) {
      return res.status(404).json({ error: "Employee not found" });
    }
    return res.json({
      message: "Employee deleted",
      success: true,
      data: deleted,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};
