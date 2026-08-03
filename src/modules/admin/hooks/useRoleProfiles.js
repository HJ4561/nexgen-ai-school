// src/modules/admin/hooks/useRoleProfiles.js
import { useState, useEffect, useMemo } from "react";
import {
  getUsers,
  getStudentProfiles,
  getTeacherProfiles,
  getStaffProfiles,
  getParentProfiles,
  createRoleProfile,
  updateRoleProfile,
  deleteRoleProfile,
  mergeWithUsers,
} from "@/modules/admin/services/adminService";

const PROFILE_FNS = {
  student: getStudentProfiles,
  teacher: getTeacherProfiles,
  staff: getStaffProfiles,
  parent: getParentProfiles,
};

export function useRoleProfiles(role, searchFields = (r) => [r.name, r.email]) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Load data
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [profiles, users] = await Promise.all([
          PROFILE_FNS[role](),
          getUsers(),
        ]);
        const merged = mergeWithUsers(profiles, users);
        setRecords(merged);
      } catch (err) {
        setLoadError(err.message || "Failed to load data");
        console.error("useRoleProfiles load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [role]);

  // Filter and paginate
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return records;
    const searchLower = searchTerm.toLowerCase();
    const fields = typeof searchFields === "function" ? searchFields(records[0] || {}) : searchFields;
    return records.filter((r) => {
      const values = fields.map((f) => (r[f] ?? "").toString().toLowerCase());
      return values.some((v) => v.includes(searchLower));
    });
  }, [records, searchTerm, searchFields]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(startIndex, startIndex + pageSize);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Create
  const create = async (values) => {
    const result = await createRoleProfile(role, values);
    setRecords((prev) => [...prev, result]);
    return result;
  };

  // Update
  const update = async (existing, values) => {
    // Separate base fields from profile fields
    const baseFields = ["name", "email", "password", "status"];
    const accountFields = {};
    const profileFields = {};

    Object.keys(values).forEach((key) => {
      if (baseFields.includes(key)) {
        if (values[key] !== undefined) accountFields[key] = values[key];
      } else {
        if (values[key] !== undefined) profileFields[key] = values[key];
      }
    });

    const result = await updateRoleProfile(role, {
      userId: existing.userId,
      profileId: existing.profileId,
      accountFields,
      profileFields,
    });

    setRecords((prev) =>
      prev.map((r) => (r.profileId === existing.profileId ? result : r))
    );
    return result;
  };

  // Delete
  const remove = async (existing) => {
    await deleteRoleProfile(role, {
      userId: existing.userId,
      profileId: existing.profileId,
    });
    setRecords((prev) =>
      prev.filter((r) => r.profileId !== existing.profileId)
    );
  };

  return {
    loading,
    loadError,
    records,
    searchTerm,
    setSearchTerm,
    pageItems,
    currentPage,
    totalPages,
    startIndex,
    filteredCount: filtered.length,
    goToPage,
    create,
    update,
    remove,
  };
}
