// Apis/salary.jsx
import axiosInstance from "../utils/axios/axiosInstance";
import { ENDPOINTS } from "@/app/constant/apiEndpoints/endpoints";

export const salaryAPI = {
  APPLY: async (payload) => {
    const res = await axiosInstance.post(ENDPOINTS.SALARY.CREATE, payload);
    return res.data;
  },

GETSALARYBYID: async (employee_id, params = {}) => {
  // params = { page: 1, limit: 10 }
  const query = new URLSearchParams(params).toString();
  const res = await axiosInstance.get(
    `${ENDPOINTS.SALARY.BY_EMPLOYEE}/${employee_id}?${query}`
  );
  return res.data;
},


  UPDATEEMPLOYEE: async (employee_id, payload) => {
    const res = await axiosInstance.patch(
      `${ENDPOINTS.ADDEMPLOYEE.GETEMPLYEEBYID}/${employee_id}`,
      payload
    );
    return res.data;
  },

  UPLOADEMPLOYEEIMAGE: async (employee_id, formData) => {
    const res = await axiosInstance.patch(
      `${ENDPOINTS.ADDEMPLOYEE.GETEMPLYEEBYID}/${employee_id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  },

  DELETE: async (employee_id) => {
    const res = await axiosInstance.delete(
      `${ENDPOINTS.ADDEMPLOYEE.GETEMPLYEEBYID}/${employee_id}`
    );
    return res.data;
  },

  MEE: async () => {
    const res = await axiosInstance.get(ENDPOINTS.ME.DATA);
    return res.data;
  },

  // ✅ NEW: mark a specific cycle as paid
  MARKPAID: async ({ employee_id, cycle_key }) => {
    // If you already have ENDPOINTS.SALARY.MARK_PAID, use it.
    const url = ENDPOINTS?.SALARY?.MARK_PAID  ;
    const res = await axiosInstance.post(url, { employee_id, cycle_key });
    return res.data;
  },
};
