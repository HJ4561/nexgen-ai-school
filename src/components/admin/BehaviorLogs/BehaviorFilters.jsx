import React from "react";
import { Search, Download, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const BehaviorFilters = ({ 
  search, 
  setSearch, 
  filterSeverity, 
  setFilterSeverity, 
  onExport 
}) => {
  return (
    <Card className="p-4 border border-gray-100 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student, teacher, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
          />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
          >
            <option value="all">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <Button
            variant="outline"
            className="border-gray-200"
            onClick={onExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          {(search || filterSeverity !== "all") && (
            <Button
              variant="outline"
              className="border-gray-200 px-3 text-gray-500"
              onClick={() => {
                setSearch("");
                setFilterSeverity("all");
              }}
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default BehaviorFilters;
