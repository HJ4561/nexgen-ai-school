// src/modules/admin/pages/InventoryRequests.jsx
import React from "react";
import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import { FadeIn } from "@/components/admin/animations/index.jsx";
import { FileText } from "lucide-react";

const InventoryRequests = () => {
  return (
    <FadeIn>
      <div className="space-y-8 px-4 sm:px-6 lg:px-8">
        <PageHeader 
          title="Inventory Requests" 
          subtitle="Manage inventory requests and requisitions" 
          breadcrumbs={["Admin", "Inventory", "Requests"]}
        />
        <Card className="p-4 sm:p-6 text-center">
          <div className="flex flex-col items-center justify-center py-8 sm:py-12">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
              Inventory Requests
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mt-2 max-w-md px-4">
              This module is coming soon.
            </p>
          </div>
        </Card>
      </div>
    </FadeIn>
  );
};

export default InventoryRequests;