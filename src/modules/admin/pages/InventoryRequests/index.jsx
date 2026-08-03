import React from "react";
import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import { FadeIn } from "@/components/admin/animations";
import { FileText } from "lucide-react";

const InventoryRequests = () => {
  return (
    <FadeIn>
      <div className="space-y-8">
        <PageHeader 
          title="InventoryRequests" 
          subtitle="Manage InventoryRequests" 
          breadcrumbs={["Admin", "InventoryRequests"]}
        />
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <FileText className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">InventoryRequests</h3>
            <p className="text-gray-500 mt-2 max-w-md">This module is coming soon.</p>
          </div>
        </Card>
      </div>
    </FadeIn>
  );
};

export default InventoryRequests;
