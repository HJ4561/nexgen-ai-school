// src/hooks/data/useBehaviorActions.js
import { useDispatch } from "react-redux";
import {
  updateBehaviorLogStatus,
  createBehaviorLog,
  exportBehaviorLogs,
} from "@/modules/admin/store/adminThunks";

export const useBehaviorActions = () => {
  const dispatch = useDispatch();

  const updateStatus = async (logId, status) => {
    try {
      const result = await dispatch(
        updateBehaviorLogStatus({ logId, status })
      ).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const createLog = async (data) => {
    try {
      const result = await dispatch(createBehaviorLog(data)).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const exportLogs = async (filters) => {
    try {
      const blob = await dispatch(exportBehaviorLogs(filters)).unwrap();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const timestamp = new Date().toISOString().split("T")[0];
      link.download = `behavior-logs-${timestamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const bulkUpdateStatus = async (logIds, status) => {
    try {
      const results = await Promise.all(
        logIds.map((id) => dispatch(updateBehaviorLogStatus({ logId: id, status })).unwrap())
      );
      return { success: true, data: results };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return {
    updateStatus,
    createLog,
    exportLogs,
    bulkUpdateStatus,
  };
};

export default useBehaviorActions;