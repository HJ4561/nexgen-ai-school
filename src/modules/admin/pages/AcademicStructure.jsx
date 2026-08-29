// // src/modules/admin/pages/AcademicStructure.jsx
// import React, { useState, useEffect } from "react";
// import { BookOpen, School, Users, Plus, Edit, Trash2, Eye } from "lucide-react";
// import PageHeader from "@/components/layout/PageHeader";
// import Button from "@/components/ui/Button";
// import Card from "@/components/ui/Card";
// import { FadeIn } from "@/components/admin/animations/index.jsx";
// import { Link } from "react-router-dom";
// import api from "@/services/api";

// const AcademicStructure = () => {
//   const [stats, setStats] = useState({ classes: 0, subjects: 0, sections: 0 });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchStats();
//   }, []);

//   const fetchStats = async () => {
//     setLoading(true);
//     try {
//       const [classesRes, subjectsRes, sectionsRes] = await Promise.all([
//         api.get("/academics/classes/").catch(() => ({ data: [] })),
//         api.get("/academics/subjects/").catch(() => ({ data: [] })),
//         api.get("/academics/sections/").catch(() => ({ data: [] })),
//       ]);
//       setStats({
//         classes: classesRes.data?.length || 0,
//         subjects: subjectsRes.data?.length || 0,
//         sections: sectionsRes.data?.length || 0,
//       });
//     } catch (error) {
//       console.error("Failed to fetch academic stats:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const modules = [
//     {
//       title: "Classes",
//       icon: School,
//       count: stats.classes,
//       description: "Manage all classes and grade levels",
//       link: "/admin/academics/classes",
//       color: "blue",
//     },
//     {
//       title: "Subjects",
//       icon: BookOpen,
//       count: stats.subjects,
//       description: "Manage all subjects offered",
//       link: "/admin/academics/subjects",
//       color: "purple",
//     },
//     {
//       title: "Sections",
//       icon: Users,
//       count: stats.sections,
//       description: "Manage class sections and capacity",
//       link: "/admin/academics/sections",
//       color: "green",
//     },
//   ];

//   if (loading) {
//     return (
//       <div className="flex flex-col md:flex-row items-center justify-center h-64 px-4 sm:px-6 lg:px-8">
//         <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent px-4 sm:px-6 lg:px-8"></div>
//       </div>
//     );
//   }

//   return (
//     <FadeIn>
//       <div className="space-y-6 px-4 sm:px-6 lg:px-8">
//         <PageHeader
//           title="Academic Structure"
//           subtitle="Manage classes, subjects, and sections"
//           breadcrumbs={["Admin", "Academic Structure"]}
//           actions={
//             <button className="min-h-11 min-w-11 px-4 sm:px-6 lg:px-8 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 lg:px-8">
//               <Plus className="w-4 h-4 mr-2 px-4 sm:px-6 lg:px-8" />
//               Add New
//             </Button>
//           }
//         />

//         <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 lg:grid-cols-3 md:grid-cols-3 gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 sm:p-4 sm:p-6 px-4 sm:px-6 lg:px-8">
//           {modules.map((module) => {
//             const Icon = module.icon;
//             const colorClasses = {
//               blue: "border-blue-500 bg-blue-50/50 hover:bg-blue-50",
//               purple: "border-purple-500 bg-purple-50/50 hover:bg-purple-50",
//               green: "border-green-500 bg-green-50/50 hover:bg-green-50",
//             };
//             const iconColors = {
//               blue: "text-blue-600",
//               purple: "text-purple-600",
//               green: "text-green-600",
//             };

//             return (
//               <Link key={module.title} to={module.link}>
//                 <Card className={`p-4 sm:p-4 sm:p-6 sm:p-4 sm:p-6 border-l-4 ${colorClasses[module.color]} transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer`}>
//                   <div className="flex flex-col md:flex-row items-start justify-between px-4 sm:px-6 lg:px-8">
//                     <div>
//                       <div className={`p-3 rounded-xl bg-white ${iconColors[module.color]}`}>
//                         <Icon className="w-6 h-6 px-4 sm:px-6 lg:px-8" />
//                       </div>
//                       <h3 className="text-lg md:text-xl md:text-2xl font-semibold text-gray-800 mt-4 px-4 sm:px-6 lg:px-8">{module.title}</h3>
//                       <p className="text-sm md:text-base md:text-base text-gray-500 px-4 sm:px-6 lg:px-8">{module.description}</p>
//                     </div>
//                     <span className="text-2xl md:text-3xl font-bold text-gray-700 px-4 sm:px-6 lg:px-8">{module.count}</span>
//                   </div>
//                 </Card>
//               </Link>
//             );
//           })}
//         </div>
//       </div>
//     </FadeIn>
//   );
// };

// export default AcademicStructure;
