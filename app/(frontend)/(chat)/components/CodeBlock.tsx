"use client";
import type React from "react";
import { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { ClipboardIcon, CheckIcon, AlertTriangleIcon } from "lucide-react";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { toast } from "react-toastify";
import { Tooltip } from "@/components/ui/tooltip";

type CodeBlockProps = {
  language: string;
  value: string;
  validationStatus?: {
    isValid: boolean;
    errorMessage?: string;
    warningMessage?: string;
  };
};

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, value, validationStatus }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (copied) {
      toast.success("Code copied to clipboard!");
    }
  }, [copied]);

  // Determine tooltip message based on validation status
  const getTooltipMessage = () => {
    if (!validationStatus) return "";

    if (validationStatus.isValid) {
      return "Query is valid and ready to execute";
    } else if (validationStatus.errorMessage) {
      return validationStatus.errorMessage;
    } else if (validationStatus.warningMessage) {
      return validationStatus.warningMessage;
    } else {
      return "Query has validation issues";
    }
  };

  // Determine tooltip variant based on validation status
  const getTooltipVariant = (): "success" | "warning" | "info" => {
    if (!validationStatus) return "info";
    return validationStatus.isValid ? "success" : "warning";
  };

  return (
    <div className="relative">
      <div className="absolute right-2 top-2 flex items-center gap-2">
        {validationStatus && (
          <Tooltip
            data-testid="query-validation-tooltip"
            content={getTooltipMessage()}
            variant={getTooltipVariant()}
            side="top"
            align="end"
          >
            {validationStatus.isValid ? (
              <CheckIcon size={16} className="text-green-500" />
            ) : (
              <AlertTriangleIcon size={16} className="text-amber-500" />
            )}
          </Tooltip>
        )}
        <button
          onClick={copyToClipboard}
          className="p-1 rounded bg-gray-700 hover:bg-gray-600 text-white"
          aria-label="Copy code"
        >
          {copied ? (
            <CheckIcon size={16} data-testid="check-icon" />
          ) : (
            <ClipboardIcon size={16} data-testid="clipboard-icon" />
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={atomDark}
        customStyle={{
          borderRadius: "0.5rem",
          padding: "1rem",
          marginTop: "0.5rem",
          marginBottom: "0.5rem",
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};
