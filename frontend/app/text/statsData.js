import {
  FaUsers,
  FaUserCheck,
  FaDollarSign,
  FaHeadset
} from "react-icons/fa";

export const statsData = [
  {
    title: "Total Employees",
    icon: <FaUsers />,
    value: 86,
    change: "+12% from last week",
    color: "text-cyan-500"
  },
  {
    title: "Active Employees",
    icon: <FaUserCheck />,
    value: 145,
    change: "+8% from yesterday",
    color: "text-green-500"
  },

    // {
    //   title: "Support Tickets",
    //   icon: <FaHeadset />,
    //   value: 24,
    //   change: "-3% since last week",
    //   color: "text-red-500"
    // }
];
