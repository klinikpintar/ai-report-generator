"use client";

import { useEffect, useState } from "react";

interface Resource {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

export default function ResourcesList() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchResources() {
      try {
        const response = await fetch("/api/resources");
        if (!response.ok) {
          throw new Error("Failed to fetch resources");
        }
        const data = await response.json();
        setResources(data.resources);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchResources();
  }, []);

  if (isLoading) {
    return <div className="p-4">Loading resources...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (resources.length === 0) {
    return <div className="p-4">No resources found. Add some knowledge to get started.</div>;
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h2 className="text-xl font-bold mb-4">Knowledge Resources</h2>
      <div className="space-y-4 max-h-[500px] overflow-y-auto">
        {resources.map((resource) => (
          <div key={resource.id} className="p-3 border rounded-md">
            <h3 className="font-semibold mb-1">{resource.title}</h3>
            <p className="text-sm mb-2 line-clamp-2">{resource.content}</p>
            <p className="text-xs text-gray-500">
              Added on {new Date(resource.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}