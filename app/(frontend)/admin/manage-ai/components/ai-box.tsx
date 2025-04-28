import Image from "next/image";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import RadioButton from "./radioButton";
import { Button } from "@/components/ui/button";
import { EditAPIKeyModal } from "./EditAPIKeyModal";

interface AIBoxProps {
  modelName: string;
  logoPath: string;
  models: string[];
  isSelected?: boolean;
  onSelect?: () => void;
  testOpenDropdown?: boolean;
}

const AIBox: React.FC<AIBoxProps> = ({
  modelName,
  logoPath,
  models,
  isSelected = false,
  onSelect = () => {},
  testOpenDropdown = false,
}) => {
  const [selectedModel, setSelectedModel] = useState<string>("Pilih Model");
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  return (
    <div className="flex items-start gap-4">
      {/* Radio button */}
      <button type="button" onClick={onSelect} className="mt-6 shrink-0">
        <RadioButton selected={isSelected} />
      </button>

      {/* Main content */}
      <div className="relative border-2 border-teal-700 rounded-lg p-6 w-[280px] min-h-[240px] shadow-sm bg-white flex flex-col justify-between">
        <div className="flex items-center justify-between w-full mb-4">
          <Image src={logoPath} alt={`${modelName} Logo`} width={50} height={50} />
          <Button
            onClick={() => setIsEditModalOpen(true)}
            className="w-10 h-10 bg-sky-500 hover:bg-sky-500/80 rounded-full flex items-center justify-center overflow-hidden shrink-0 p-0"
          >
            <Image
              src="/icon-key.svg"
              alt="icon-key"
              width={22}
              height={22}
              className="object-contain invert"
            />
          </Button>
        </div>

        <div className="flex flex-col items-start gap-2 -ml-1 flex-grow">
          <h2 className="text-2xl font-semibold text-teal-700">{modelName}</h2>
          <h3 className="text-sm text-slate-600">Pilih model AI untuk provider {modelName}:</h3>
        </div>

        <div className="mt-5 w-full">
          <DropdownMenu.Root defaultOpen={testOpenDropdown}>
            <DropdownMenu.Trigger asChild>
              <button
                className="w-full bg-sky-500 text-white py-2 px-4 rounded-md flex items-center justify-between hover:bg-blue-600 transition-colors"
                aria-haspopup="menu"
              >
                {selectedModel}
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="bg-white shadow-md border rounded-md w-[260px] p-2 mt-1"
                sideOffset={4}
              >
                {models.map((model) => (
                  <DropdownMenu.Item
                    key={model}
                    onSelect={() => setSelectedModel(model)}
                    className="px-3 py-1.5 rounded hover:bg-gray-100 cursor-pointer text-sm text-slate-700"
                  >
                    {model}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      {/* Edit API Key Modal */}
      <EditAPIKeyModal
        isVisible={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
        }}
        providerId={modelName}
        providerName={modelName}
      />
    </div>
  );
};

export default AIBox;
