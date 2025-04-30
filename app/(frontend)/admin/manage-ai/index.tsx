import AISelectionSection from "./sections/ai-selection-section";
import DescriptionSection from "./sections/description-section";

const ManageAIModule = () => {
  return (
    <section className="container mx-auto max-w-screen-xl flex flex-col gap-y-6 px-8">
      <div className="flex flex-col gap-10 border-b-2 border-teal-7 pb-16">
        <DescriptionSection />
        <AISelectionSection />
      </div>
    </section>
  );
};

export default ManageAIModule;