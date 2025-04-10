"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResourceForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add to knowledge base");
      }

      setMessage({ 
        type: "success", 
        text: "Successfully added to knowledge base!" 
      });
      setTitle("");
      setContent("");
      router.refresh();
    } catch (error: unknown) {
      setMessage({ 
        type: "error", 
        text: error instanceof Error ? error.message : "An error occurred" 
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h2 className="text-xl font-bold mb-4">Add to Knowledge Base</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block mb-2 text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter a descriptive title"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="content" className="block mb-2 text-sm font-medium">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter knowledge to add to the database..."
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md disabled:bg-gray-400"
        >
          {isLoading ? "Adding..." : "Add to Knowledge Base"}
        </button>
        
        {message.text && (
          <p className={`mt-3 ${message.type === "error" ? "text-red-500" : "text-green-500"}`}>
            {message.text}
          </p>
        )}
      </form>
    </div>
  );
}