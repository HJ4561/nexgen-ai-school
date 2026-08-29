// src/components/parent/attendance/AttendanceTable.jsx
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { CalendarDays, ClipboardList } from "lucide-react";

import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import StatusBadge from "@/components/common/StatusBadge";

const AttendanceTable = () => {
  const {
    attendance = [],
    parentLinks = [],
    selectedChild,
  } = useSelector((state) => state.parent);

  const currentChild = parentLinks.find(
    (child) => child.student === selectedChild
  );

  const rows = useMemo(() => {
    if (!currentChild) return [];

    return attendance
      .filter((item) => item.student_name === currentChild.student_name)
      .map((item) => {
        const parsedDate = new Date(item.date);
        return {
          ...item,
          day: parsedDate.toLocaleDateString("en-US", {
            weekday: "long",
          }),
          formattedDate: parsedDate.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [attendance, currentChild]);

  const stats = useMemo(() => {
    const counts = { Present: 0, Absent: 0, Leave: 0 };
    rows.forEach((row) => {
      if (counts[row.status] !== undefined) {
        counts[row.status] += 1;
      }
    });
    return counts;
  }, [rows]);

  const columns = [
    {
      key: "date",
      label: "Date",
      render: (row) => (
        <span className="font-medium text-text-primary">
          {row.formattedDate}
        </span>
      ),
    },
    {
      key: "day",
      label: "Day",
      render: (row) => (
        <span className="text-text-secondary">{row.day}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <Card className="h-[600px]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            Attendance Records
          </h2>
          <p className="text-sm text-text-secondary">
            Daily attendance for the selected child.
          </p>
        </div>

        {rows.length > 0 && (
          <div className="flex items-center gap-2">
            <StatChip
              label="Present"
              value={stats.Present}
              className="border-green-100 bg-green-50 text-green-700"
            />
            <StatChip
              label="Absent"
              value={stats.Absent}
              className="border-red-100 bg-red-50 text-red-700"
            />
            <StatChip
              label="Leave"
              value={stats.Leave}
              className="border-yellow-100 bg-yellow-50 text-yellow-700"
            />
          </div>
        )}
      </div>

      {rows.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-parent-border py-12 text-center">
          <ClipboardList size={28} className="text-text-secondary/50" />
          <p className="text-sm font-medium text-text-primary">
            No attendance records found
          </p>
          <p className="text-xs text-text-secondary">
            Records will appear here once attendance is marked.
          </p>
        </div>
      )}

      {rows.length > 0 && (
        <div className="hidden md:block max-h-[420px] overflow-y-auto rounded-lg [scrollbar-width:thin]">
          <Table
            columns={columns}
            data={rows}
            emptyMessage="No attendance records found."
          />
        </div>
      )}

      {rows.length > 0 && (
        <div className="md:hidden max-h-[420px] overflow-y-auto flex flex-col gap-2.5 pr-1 [scrollbar-width:thin]">
          {rows.map((row, index) => (
            <div
              key={row.id ?? `${row.date}-${index}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-parent-light/40 text-parent-primary">
                  <CalendarDays size={18} />
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-text-primary">
                    {row.formattedDate}
                  </p>
                  <p className="text-xs text-text-secondary">{row.day}</p>
                </div>
              </div>
              <StatusBadge status={row.status} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

function StatChip({ label, value, className }) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${className}`}
    >
      <span>{value}</span>
      <span className="font-medium opacity-80">{label}</span>
    </div>
  );
}

export default AttendanceTable;