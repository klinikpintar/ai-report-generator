import Image from "next/image";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const models = ["o4", "o3-mini", "deepseek-coder", "deepseek-chat"];

const AIBox = () => {
  const [selectedModel, setSelectedModel] = useState("Pilih Model");

  return (
    <div className="relative border-2 border-teal-700 rounded-lg p-6 w-[300px] shadow-sm bg-white">
      <div className="flex justify-between items-start">
        <div className="flex flex-col items-start -mt-2 -ml-2">
          <Image src="/logo-deepseek.png" alt="DeepSeek Logo" height={55} width={55} />
          <h2 className="text-2xl font-semibold text-teal-700 mt-1">DeepSeek</h2>
        </div>
        <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center -mt-2 -ml-2">
          <Image src="/icon-key.svg" alt="icon-key" height={22} width={22} />
        </div>
      </div>

      <div className="mt-10 -ml-2">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="w-full bg-gray-200 text-slate-800 py-2 px-4 rounded-md flex items-center justify-between">
              {selectedModel}
              <ChevronDown className="w-4 h-4 ml-2" />
            </button>
          </DropdownMenu.Trigger>

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
        </DropdownMenu.Root>
      </div>
    </div>
  );
};

export default AIBox;
