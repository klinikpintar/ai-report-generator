import { useEffect, useState } from "react";
import AIBox from "../components/ai-box";
import { AIProvider } from "../types/ai-provider";
import { fetchAiProvider } from "../utils/api/fetch-ai-provider";

const AISelectionSection = () => {
  const [aiProviders, setAiProviders] = useState<AIProvider[]>([]);

  const refreshProviders = async () => {
    const response = await fetchAiProvider();
    if (response.success) {
      setAiProviders(response.data);
    } else {
      console.error(response.message);
    }
  };

  useEffect(() => {
    refreshProviders();
  }, []);

  return (
    <div className="flex flex-wrap justify-center gap-10">
      {aiProviders.map((provider) => (
        <AIBox key={provider.id} {...{ provider, refreshProviders }} />
      ))}
    </div>
  );
};

export default AISelectionSection;
