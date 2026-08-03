// src/components/admin/FeeStats/index.jsx
import React from "react";
import Card from "@/components/ui/Card";
import { DollarSign, CheckCircle, Clock, AlertCircle } from "lucide-react";

const FeeStats = ({ stats, formatCurrency }) => {
  const collectedPercent = stats.collected + stats.outstanding > 0
    ? Math.round((stats.collected / (stats.collected + stats.outstanding)) * 100)
    : 0;

  const statItems = [
    {
      label: "Total Fees",
      value: stats.total || 0,
      subtext: "All fee records",
      color: "blue",
      icon: DollarSign,
    },
    {
      label: "Collected",
      value: formatCurrency ? formatCurrency(stats.collected) : stats.collected,
      subtext: `${collectedPercent}% of assigned fees`,
      color: "green",
      icon: CheckCircle,
    },
    {
      label: "Pending",
      value: stats.pending || 0,
      subtext: "Awaiting payment",
      color: "yellow",
      icon: Clock,
    },
    {
      label: "Overdue",
      value: stats.overdue || 0,
      subtext: "Past due date",
      color: "red",
      icon: AlertCircle,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((stat) => (
        <Card key={stat.label} className={`p-4 border-l-4 border-l-${stat.color}-500`}>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
          <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
          <p className="text-xs text-gray-400 mt-1">{stat.subtext}</p>
        </Card>
      ))}
    </div>
  );
};

export default FeeStats;
