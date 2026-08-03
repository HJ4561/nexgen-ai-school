import React, { useState } from "react";
import { CheckCircle, AlertCircle, X, RefreshCw } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FadeIn } from "@/components/admin/animations";

// Import from central locations
import { useBehaviorData } from "@/hooks/admin/useBehaviorData";
import { useBehaviorActions } from "@/hooks/admin/useBehaviorActions";
import BehaviorStats from "@/components/admin/BehaviorLogs/BehaviorStats";
import BehaviorFilters from "@/components/admin/BehaviorLogs/BehaviorFilters";
import BehaviorTable from "@/components/admin/BehaviorLogs/BehaviorTable";
import { getInitials, formatDate, getSeverityBadgeClass } from "@/utils/behaviorHelpers";

const BehaviorLogs = () => {
  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  
  const showToast = (message, type = "success") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ message: "", type: "", visible: false }), 4000);
  };

  const {
    logs,
    loading,
    error,
    search,
    setSearch,
    filterSeverity,
    setFilterSeverity,
    filteredByDate,
    filtered,
    paginatedData,
    currentPage,
    totalPages,
    totalItems,
    goToPage,
    itemsPerPage,
    stats,
    recentLogs,
    refetch,
  } = useBehaviorData();

  const {
    selectedLog,
    setSelectedLog,
    isDrawerOpen,
    setIsDrawerOpen,
    loadingDetail,
    handleView,
    exportCSV,
  } = useBehaviorActions({ refetch, showToast });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-blue-50 animate-pulse"></div>
          </div>
        </div>
        <p className="mt-6 text-sm text-gray-500 font-medium">Loading behavior logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
        <p>Error: {error}</p>
        <Button className="mt-4" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 flex flex-col gap-5 min-h-screen bg-gray-50">
      {/* Toast */}
      {toast.visible && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border border-gray-200 p-4 flex items-start gap-3 animate-in slide-in-from-right duration-300">
          {toast.type === "success" ? (
            <CheckCircle size={20} className="text-emerald-500 flex-shrink-0" />
          ) : (
            <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
          )}
          <p className="text-sm text-gray-700 flex-1">{toast.message}</p>
          <button
            onClick={() => setToast({ ...toast, visible: false })}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>
      )}
       
      {/* Page Header */}
      <FadeIn y={10} duration={0.5}>
        <PageHeader
          title="Behavior Management"
          subtitle="Reviewing disciplinary reports submitted by faculty."
          breadcrumbs={["Admin", "Behavior Logs"]}
        />
      </FadeIn>
      
      {/* Stats + Recent Logs */}
      <FadeIn y={15} delay={0.1}>
        <BehaviorStats
          logs={filteredByDate} 
          recentLogs={recentLogs}
          onViewDetail={handleView}
        />
      </FadeIn>

      {/* Filters */}
      <BehaviorFilters
        search={search}
        setSearch={setSearch}
        filterSeverity={filterSeverity}
        setFilterSeverity={setFilterSeverity}
        onExport={() => exportCSV(filtered)}
      />

      {/* Table */}
      <FadeIn y={15} delay={0.3}>
        <BehaviorTable
          data={paginatedData}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={goToPage}
          onView={handleView}
        />
      </FadeIn>
      
      {/* Drawer - Fixed with proper structure */}
      {isDrawerOpen && selectedLog && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => {
            setIsDrawerOpen(false);
            setSelectedLog(null);
          }} />
          <div className="relative w-full max-w-[480px] h-full bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Behavior Report Details</h2>
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  setSelectedLog(null);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {loadingDetail ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Student & Teacher */}
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-bold">
                      {getInitials(selectedLog.student_name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {selectedLog.student_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Reported by: {selectedLog.reported_by_name}
                      </p>
                    </div>
                  </div>

                  {/* Date & Severity */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Date
                      </label>
                      <p className="text-sm text-gray-800">
                        {formatDate(selectedLog.created_at)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Severity
                      </label>
                      <Badge
                        className={"text-[10px] border " + getSeverityBadgeClass(
                          selectedLog.severity
                        )}
                      >
                        {selectedLog.severity || "Medium"}
                      </Badge>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Description
                    </label>
                    <div className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      {selectedLog.description || "No description provided"}
                    </div>
                  </div>

                  {/* Action Taken */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Action Taken
                    </label>
                    <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      {selectedLog.action_taken || "No action recorded"}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4">
              <Button variant="outline" fullWidth onClick={() => {
                setIsDrawerOpen(false);
                setSelectedLog(null);
              }}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BehaviorLogs;
