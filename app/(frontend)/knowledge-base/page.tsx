"use client";

import ResourceForm from "./components/resource-form";
import ResourcesList from "./components/resources-list";

export default function KnowledgeBasePage() {
  return (
    <div className="container mx-auto p-8 mt-16">
      <h1 className="text-2xl font-bold mb-6">Knowledge Base Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <ResourceForm />
        </div>
        <div>
          <ResourcesList />
        </div>
      </div>
    </div>
  );
}