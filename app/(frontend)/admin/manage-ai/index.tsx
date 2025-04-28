import AISelectionSection from "./sections/ai-selection-section";
import DescriptionSection from "./sections/description-section";

const ManageAIModule = () => {
  return (
    <section className="container mx-auto flex flex-col gap-y-6 py-8 mt-16 items-center mb-5 border-teal-7 border-y-2">
      <div className="flex flex-col justify-between items-center gap-10 py-16">
        <DescriptionSection />
        <AISelectionSection />
      </div>
    </section>
  )
}

export default ManageAIModule;