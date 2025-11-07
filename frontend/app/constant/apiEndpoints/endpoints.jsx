// /app/constant/apiEndpoints/endpoints.js

const BaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export const ENDPOINTS = {
  LOGIN: {
    DATA: `${BaseUrl}/auth/login`,
  },

  ADDEMPLOYEE: {
    DATA: `${BaseUrl}/add-employee`,
    GETEMPLYEEBYID: `${BaseUrl}/add-employee`,
  },

  ATTENDANCE: {
    CREATE: "/attendance",
    BY_EMPLOYEE: "/attendance",
    BY_DATE: "/attendance/date",     // → /attendance/date/2025-11-01
    TODAY: "/attendance/today",      // → /attendance/today
  },

  SALARY: {
    CREATE: "/salary/apply",
    BY_EMPLOYEE: "/salary/history",
    MARK_PAID: `${BaseUrl}/salary/mark-paid`,
  },

  ADDUSER: {
    DATA: `${BaseUrl}/auth/send-code`,
    VERIFY: `${BaseUrl}/auth/verify-signup`,
  },

  USER: {
    DATA: `${BaseUrl}/user/all`,
    SEARCH: `${BaseUrl}/user/search`,
    ROLE: `${BaseUrl}/user/role`,
    DELETE: `${BaseUrl}/user/delete`,
  },
};
