"use client";

import { useEffect, useState } from "react";
import AIBox from "../components/ai-box";
import AIBoxSkeleton from "../components/ai-box-skeleton";
import type { AIProvider } from "../types/ai-provider";
import { fetchAiProvider } from "../utils/api/fetch-ai-provider";

const AISelectionSection = () => {
  const [aiProviders, setAiProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshProviders = async () => {
    setLoading(true);
    const response = await fetchAiProvider();
    if (response.success) {
      setAiProviders(response.data);
    } else {
      console.error(response.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshProviders();
  }, []);

  return (
    <div className="flex flex-wrap justify-center gap-10">
      {loading ? (
      // Show two skeleton boxes while loading
      <>
        <AIBoxSkeleton />
        <AIBoxSkeleton />
      </>
      ) : (
      // Show actual AI provider boxes when loaded, sorted by name
      [...aiProviders]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((provider) => (
        <AIBox key={provider.id} {...{ provider, refreshProviders }} />
        ))
      )}
    </div>
  );
};  

export default AISelectionSection;
