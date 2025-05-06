import Image from "next/image";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import RadioButton from "./radioButton";
import { Button } from "@/components/ui/button";
import { EditAPIKeyModal } from "./EditAPIKeyModal";
import { AIProvider } from "../types/ai-provider";
import { patchActivateProvider } from "../utils/api/patch-activate-provider";
import { toast } from "react-toastify";
import { AIModel } from "../types/ai-model";
import { patchSetActiveModel } from "../utils/api/patch-set-active-model";

export interface AIBoxProps {
  provider: AIProvider;
  refreshProviders: () => void;
  testOpenDropdown?: boolean;
}

const AIBox: React.FC<AIBoxProps> = ({ provider, refreshProviders, testOpenDropdown = false }) => {
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(provider.activeModel);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  const onSelectProvider = async () => {
    const result = await patchActivateProvider({
      providerId: provider.id,
    });
    if (result.success) {
      toast.success(`Provider ${provider.displayName} diaktifkan!`);
      refreshProviders();
    } else {
      toast.error(result.message);
    }
  };

  const onSelectModel = async (model: AIModel) => {
    const result = await patchSetActiveModel({
      providerId: provider.id,
      modelId: model.id,
    });
    if (result.success) {
      setSelectedModel(model);
      toast.success(`Model ${model.name} untuk provider ${provider.displayName} diaktifkan!`);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="flex items-start gap-4">
      {/* Radio button */}
      <button
        type="button"
        onClick={onSelectProvider}
        className="mt-6 shrink-0"
        data-testid={`${provider.name}-radio-button`}
        role="radio"
        aria-checked={provider.isActive}
        aria-labelledby={`${provider.name}-heading`}  
      >
        <RadioButton selected={provider.isActive} />
      </button>

      {/* Main content */}
      <div className="relative border-2 border-teal-700 rounded-lg p-6 w-[280px] min-h-[240px] shadow-sm bg-white flex flex-col justify-between">
        <div className="flex items-center justify-between w-full mb-4">
          <Image
            src={provider.logoUrl!}
            alt={`${provider.displayName} Logo`}
            width={50}
            height={50}
          />
          <Button
            onClick={() => setIsEditModalOpen(true)}
            aria-label="Edit API Key"
            role="button"
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
          <h2 id={`${provider.name}-heading`} className="text-2xl font-semibold text-teal-700">{provider.displayName}</h2>
          <h3 className="text-sm text-slate-600">
            Pilih model AI untuk provider {provider.displayName}:
          </h3>
        </div>

        <div className="mt-5 w-full">
          <DropdownMenu.Root defaultOpen={testOpenDropdown}>
            <DropdownMenu.Trigger asChild>
              <button
                className="w-full bg-sky-500 text-white py-2 px-4 rounded-md flex items-center justify-between hover:bg-blue-600 transition-colors"
                aria-haspopup="menu"
              >
                {selectedModel ? selectedModel.name : "Pilih model"}
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="bg-white shadow-md border rounded-md w-[260px] p-2 mt-1"
                sideOffset={4}
              >
                {provider.models.map((model) => (
                  <DropdownMenu.Item
                    key={model.id}
                    onSelect={() => onSelectModel(model)}
                    className="px-3 py-1.5 rounded hover:bg-gray-100 cursor-pointer text-sm text-slate-700"
                  >
                    {model.name}
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
        providerId={provider.id}
        providerName={provider.displayName}
      />
    </div>
  );
};

export default AIBox;
