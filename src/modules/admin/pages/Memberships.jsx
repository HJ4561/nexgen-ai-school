import React from "react";
import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import { FadeIn } from "@/components/admin/animations/index.jsx";
import { FileText, Users, Award, Calendar, Settings } from "lucide-react";

const Memberships = () => {
  return (
    <FadeIn>
      <div className="space-y-6 md:space-y-8 px-4 sm:px-6 md:px-8">
        <PageHeader 
          title="Memberships" 
          subtitle="Manage memberships and subscriptions" 
          breadcrumbs={["Admin", "Memberships"]}
          icon={Users}
        />

        {/* Coming Soon Card */}
        <Card className="p-6 sm:p-8 md:p-10 text-center border-2 border-dashed border-gray-200 hover:border-blue-300 transition-all duration-300">
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 md:py-16">
            {/* Icon */}
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-50 flex items-center justify-center mb-4 sm:mb-6 animate-pulse">
                <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600" />
              </div>
              {/* Decorative rings */}
              <div className="absolute -inset-1 rounded-full bg-blue-100/30 animate-ping" style={{ animationDuration: '3s' }} />
            </div>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800 mb-2">
              Memberships Module
            </h3>
            
            {/* Description */}
            <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto px-4">
              This module is currently under development. 
              It will provide comprehensive membership management features.
            </p>

            {/* Feature Preview */}
            <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl w-full">
              <div className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1 sm:mb-2" />
                <p className="text-[10px] sm:text-xs font-medium text-gray-600">Member Management</p>
              </div>
              <div className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mx-auto mb-1 sm:mb-2" />
                <p className="text-[10px] sm:text-xs font-medium text-gray-600">Membership Plans</p>
              </div>
              <div className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 mx-auto mb-1 sm:mb-2" />
                <p className="text-[10px] sm:text-xs font-medium text-gray-600">Renewals & Expiry</p>
              </div>
              <div className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 mx-auto mb-1 sm:mb-2" />
                <p className="text-[10px] sm:text-xs font-medium text-gray-600">Settings & Config</p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="mt-6 sm:mt-8 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-xs sm:text-sm font-medium text-amber-700">In Development</span>
            </div>
          </div>
        </Card>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-6 border-l-4 border-l-blue-500">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-50 shrink-0">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800">Documentation</h4>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Comprehensive documentation for the Memberships module will be available soon.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 border-l-4 border-l-emerald-500">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 shrink-0">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800">Release Date</h4>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Expected release: Q2 2026. Stay tuned for updates and announcements.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </FadeIn>
  );
};

export default Memberships;