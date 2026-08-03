// src/modules/admin/pages/TimetableManagement/hooks/useTimetableGrid.js

import { useMemo } from "react";
import { DAYS, TIME_SLOTS } from "@/utils/helpers";
const COLOR_TONES = ['admin', 'teacher', 'student', 'parent'];

export function useTimetableGrid(entries, subjects, teachers, rooms) {
  return useMemo(() => {
    const grid = {};
    TIME_SLOTS.forEach((time) => {
      grid[time] = {};
      DAYS.forEach((day) => {
        grid[time][day] = null;
      });
    });

    // 🔥 Mapping: ID → Name
    const getSubjectName = (id) => {
      const subject = subjects.find((s) => s.id === id);
      return subject ? subject.subject_name : id;
    };

    const getTeacherName = (id) => {
      const teacher = teachers.find((t) => t.id === id);
      return teacher ? teacher.full_name : id;
    };

    const getRoomName = (id) => {
      const room = rooms.find((r) => r.id === id);
      return room ? room.name : id;
    };

    entries.forEach((entry) => {
      const startTime = entry.start_time?.slice(0, 5); // "08:00:00" -> "08:00"
      const endTime = entry.end_time?.slice(0, 5);     // "09:00:00" -> "09:00"

      const startIdx = TIME_SLOTS.indexOf(startTime);
      const endIdx = TIME_SLOTS.indexOf(endTime);

      // Agar time match nahi karta to skip karein (safety check)
      if (startIdx === -1 || endIdx === -1) {
        console.warn("Time slot not found for:", entry.start_time, entry.end_time);
        return;
      }

      for (let i = startIdx; i < endIdx && i < TIME_SLOTS.length; i++) {
        const time = TIME_SLOTS[i];
        if (grid[time] && grid[time][entry.day]) {
          // Already filled
        } else if (grid[time]) {
         const colorTone = COLOR_TONES[(entry.subject || 0) % COLOR_TONES.length];
          grid[time][entry.day] = {
            ...entry,
            subject_name: getSubjectName(entry.subject),
            teacher_name: getTeacherName(entry.teacher),
            room_name: getRoomName(entry.room),
            colorTone,
          };
        }
      }
    });

    return grid;
  }, [entries, subjects, teachers, rooms]);
}


export default useTimetableGrid;
