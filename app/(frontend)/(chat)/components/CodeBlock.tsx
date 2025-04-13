"use client";
import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { ClipboardIcon, CheckIcon } from "lucide-react";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

type CodeBlockProps = {
  language: string;
  value: string;
};

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <div className="absolute right-2 top-2">
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
