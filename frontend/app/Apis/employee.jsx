// Apis/employee.jsx
import axiosInstance from "../utils/axios/axiosInstance";
import { ENDPOINTS } from "@/app/constant/apiEndpoints/endpoints";

export const employeeAPI = {
  // POST /add-employee
  ADD: async (payload) => {
    const res = await axiosInstance.post(ENDPOINTS.ADDEMPLOYEE.DATA, payload);
    return res.data;
  },

  // GET /add-employee
  GET: async () => {
    const res = await axiosInstance.get(ENDPOINTS.ADDEMPLOYEE.DATA);
    return res.data;
  },

  // GET /add-employee/:employee_id
  GETEMPLYEEBYID: async (employee_id) => {
    const res = await axiosInstance.get(
      `${ENDPOINTS.ADDEMPLOYEE.GETEMPLYEEBYID}/${employee_id}`
    );
    return res.data;
  },

  // 🔥 PATCH /add-employee/:employee_id   <-- this is your SAVE
  UPDATEEMPLOYEE: async (employee_id, payload) => {
    const res = await axiosInstance.post(
      `${ENDPOINTS.ADDEMPLOYEE.GETEMPLYEEBYID}/${employee_id}`,
      payload
    );
    return res.data;
  },

  // 🔥 PATCH (image upload) /add-employee/:employee_id
  // if your backend accepts image in same route
  UPLOADEMPLOYEEIMAGE: async (employee_id, formData) => {
    const res = await axiosInstance.post(
      `${ENDPOINTS.ADDEMPLOYEE.GETEMPLYEEBYID}/${employee_id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res.data;
  },

   DELETE: async (employee_id) => {
    const res = await axiosInstance.post(
      `${ENDPOINTS.ADDEMPLOYEE.GETEMPLYEEBYID}/${employee_id}`
    );
    return res.data;
  },


  // (unrelated)
  MEE: async () => {
    const res = await axiosInstance.get(ENDPOINTS.ME.DATA);
    return res.data;
  },
};
