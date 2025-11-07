// utils/navItems.js
import {
  LuChartColumnIncreasing, // Overview / Analytics
  LuFileText,              // Reports / Documents (future use)
  LuShield,                // Security / Admin (future use)
} from "react-icons/lu";

import { TbCalendarTime } from "react-icons/tb";          // Attendance
import { RiMoneyDollarCircleLine } from "react-icons/ri"; // Salary
import { GiReceiveMoney } from "react-icons/gi";           // Bonus (distinct from salary)
import { HiOutlineUserAdd } from "react-icons/hi";        // Add Employee

// Sidebar / Dashboard Navigation
export const navItems = [
  {
    name: "Overview",
    href: "/dashboard/overview",
    icon: LuChartColumnIncreasing, // analytics/performance
  },
  {
    name: "Attendance",
    href: "/dashboard/attendance",
    icon: TbCalendarTime, // calendar clock fits attendance
  },
    {
    name: "Bonus",
    href: "/dashboard/bonus",
    icon: GiReceiveMoney, // distinct bonus payout icon
  },
  {
    name: "Salary",
    href: "/dashboard/salary",
    icon: RiMoneyDollarCircleLine, // payroll / salary
  },

  {
    name: "Add Employee",
    href: "/dashboard/add-employee",
    icon: HiOutlineUserAdd, // simple plus-user icon
  },
];
