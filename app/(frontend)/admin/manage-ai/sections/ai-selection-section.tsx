import AIBox from "../components/ai-box";
import { AI_MODELS } from "../constants/ai-models";

const AISelectionSection = () => {
  return (
    <div className="flex justify-between items-center gap-10">
      {AI_MODELS.map(({ modelName, logoPath, models }) => (
        <AIBox
          key={modelName}
          modelName={modelName}
          logoPath={logoPath}
          models={models}
        />
      ))}
    </div>
  );
};

export default AISelectionSection;
