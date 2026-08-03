import React, { useState } from "react";
import { Search, Plus, Edit, Trash2, MapPin, Phone, Mail, Calendar, Users, User, X } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { FadeIn } from "@/components/admin/animations";
import UserFormModal from "@/components/admin/UserFormModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Pagination from "@/components/admin/Pagination";
import { useRoleProfiles } from "@/modules/admin/hooks/useRoleProfiles";

const STATUS_BADGE = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  inactive: "bg-slate-50 text-slate-600 border-slate-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

const Students = () => {
  const {
    loading, loadError, records,
    searchTerm, setSearchTerm,
    pageItems, currentPage, totalPages, startIndex, filteredCount, goToPage,
    create, update, remove,
  } = useRoleProfiles("student", (r) => [r.name, r.email, r.admission_no]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);

  const openAdd = () => { setEditingStudent(null); setModalOpen(true); };
  const openEdit = (student) => { setEditingStudent(student); setModalOpen(true); };

  const handleSubmit = async (values) => {
    if (editingStudent) {
      await update(editingStudent, values);
    } else {
      await create(values);
    }
    setModalOpen(false);
  };

  const handleDelete = async () => {
    await remove(deletingStudent);
    setDeletingStudent(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
        <p className="mt-6 text-sm text-gray-500 font-medium">Loading students...</p>
      </div>
    );
  }

  return (
    <FadeIn>
      <div className="space-y-8">
        <PageHeader title="Students" subtitle={`Manage all students${records.length ? ` — ${records.length} total` : ""}`} breadcrumbs={["Admin", "Students"]} />

        <Card className="p-0 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
          {loadError && (
            <div className="px-6 py-3 text-sm text-amber-700 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
              <span className="text-amber-500">⚠️</span> {loadError}
            </div>
          )}

          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white/50 backdrop-blur-sm"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button onClick={openAdd} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-sm">
                <Plus className="w-4 h-4" />
                <span>Add Student</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admission No.</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Class</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pageItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                          <User className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-medium">
                          {searchTerm ? "No students match your search." : "No students found."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageItems.map((student) => (
                    <tr key={student.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                            {student.name?.charAt(0) || "S"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">
                          #{student.admission_no || "N/A"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-gray-700">{student.class_obj || "Not assigned"}</td>
                      <td className="px-4 py-3.5">
                        <Badge className={STATUS_BADGE[student.status] || "bg-gray-50 text-gray-600 border-gray-200"}>
                          {student.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(student)} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeletingStudent(student)} className="p-2 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            itemsShown={pageItems.length}
            totalItems={filteredCount}
            onPageChange={goToPage}
          />
        </Card>
      </div>

      {modalOpen && (
        <UserFormModal
          role="student"
          initialData={editingStudent}
          onSubmit={handleSubmit}
          onClose={() => setModalOpen(false)}
        />
      )}

      {deletingStudent && (
        <ConfirmDialog
          title="Delete this student?"
          message={`This permanently removes ${deletingStudent.name}'s student profile.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeletingStudent(null)}
        />
      )}
    </FadeIn>
  );
};

export default Students;