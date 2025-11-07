// Apis/attendance.jsx
import axiosInstance from "../utils/axios/axiosInstance";
import { ENDPOINTS } from "@/app/constant/apiEndpoints/endpoints";

export const attendanceAPI = {
  // POST /attendance
  CREATE: async (payload) => {
    const res = await axiosInstance.post(ENDPOINTS.ATTENDANCE.CREATE, payload);
    return res.data;
  },

  // GET /attendance/:employee_id → paginated
  // usage: attendanceAPI.GET_BY_EMPLOYEE("EMP-1", { page: 1, limit: 20 })
  GET_BY_EMPLOYEE: async (employee_id, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await axiosInstance.get(
      `${ENDPOINTS.ATTENDANCE.BY_EMPLOYEE}/${employee_id}${
        query ? `?${query}` : ""
      }`
    );
    return res.data;
  },

  // NEW: GET /attendance/range/:employee_id?start=...&end=...&page=...&limit=...
  GET_BY_EMPLOYEE_RANGE: async (employee_id, { start, end, page, limit }) => {
    const query = new URLSearchParams({
      start,
      end,
      ...(page ? { page } : {}),
      ...(limit ? { limit } : {}),
    }).toString();

    const res = await axiosInstance.get(
      `/attendance/range/${employee_id}?${query}`
    );
    return res.data;
  },

  // GET /attendance/date/:date → all attendance for a specific date
  GET_BY_DATE: async (date, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await axiosInstance.get(
      `${ENDPOINTS.ATTENDANCE.BY_DATE}/${date}${query ? `?${query}` : ""}`
    );
    return res.data;
  },

  // GET /attendance/today
  GET_TODAY: async () => {
    const res = await axiosInstance.get(ENDPOINTS.ATTENDANCE.TODAY);
    return res.data;
  },

  // GET /attendance/:employee_id/:date
  GET_BY_EMPLOYEE_AND_DATE: async (employee_id, date) => {
    const res = await axiosInstance.get(
      `${ENDPOINTS.ATTENDANCE.BY_EMPLOYEE}/${employee_id}/${date}`
    );
    return res.data;
  },
};
