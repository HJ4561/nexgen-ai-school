import React from "react";
import Card from "@/components/ui/Card";

const BehaviorStats = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Card className="p-4 text-center">
        <p className="text-2xl font-bold text-blue-600">{stats.total || 0}</p>
        <p className="text-sm text-gray-500">Total Logs</p>
      </Card>
      <Card className="p-4 text-center">
        <p className="text-2xl font-bold text-green-600">{stats.positive || 0}</p>
        <p className="text-sm text-gray-500">Positive</p>
      </Card>
      <Card className="p-4 text-center">
        <p className="text-2xl font-bold text-red-600">{stats.negative || 0}</p>
        <p className="text-sm text-gray-500">Negative</p>
      </Card>
      <Card className="p-4 text-center">
        <p className="text-2xl font-bold text-purple-600">{stats.resolved || 0}</p>
        <p className="text-sm text-gray-500">Resolved</p>
      </Card>
    </div>
  );
};

export default BehaviorStats;