import { useState } from "react";
import AIBox from "../components/ai-box";
import { AI_MODELS } from "../constants/ai-models";

const AISelectionSection = () => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap justify-center gap-10">
      {AI_MODELS.map(({ modelName, logoPath, models }) => (
        <AIBox
          key={modelName}
          modelName={modelName}
          logoPath={logoPath}
          models={models}
          isSelected={selectedProvider === modelName}
          onSelect={() => setSelectedProvider(modelName)}
        />
      ))}
    </div>
  );
};

export default AISelectionSection;