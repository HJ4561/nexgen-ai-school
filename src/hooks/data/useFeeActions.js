// src/hooks/data/useFeeActions.js
import { useDispatch } from "react-redux";
import {
  createFee,
  updateFee,
  deleteFeeChallan,
  recordPayment,
} from "@/modules/admin/store/adminThunks";

export const useFeeActions = () => {
  const dispatch = useDispatch();

  const createFeeRecord = async (data) => {
    try {
      const result = await dispatch(createFee(data)).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateFeeRecord = async (id, data) => {
    try {
      const result = await dispatch(updateFee({ id, data })).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deleteFeeRecord = async (id) => {
    try {
      await dispatch(deleteFeeChallan(id)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const recordFeePayment = async (data) => {
    try {
      const result = await dispatch(recordPayment(data)).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return {
    createFeeRecord,
    updateFeeRecord,
    deleteFeeRecord,
    recordFeePayment,
  };
};

export default useFeeActions;