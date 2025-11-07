import axiosInstance from "../utils/axios/axiosInstance";
import { ENDPOINTS } from "@/app/constant/apiEndpoints/endpoints";

export const authAPI = {
  LOGIN: async (payload) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.LOGIN.DATA, payload);
      const { token, user, success, message } = response.data;
       if (success && token) {
   
        localStorage.setItem("token", token);
        localStorage.setItem("userInfo", JSON.stringify(user));
      } else {
        console.warn("⚠️ No token found in login response:", response.data);
      }

      return response.data;
    } catch (error) {
      console.error("❌ Login error:", error);
      throw error.response?.data || { message: "Login failed" };
    }
  },



  MEE: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.ME.DATA);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Login failed" };
    }
  },
};
