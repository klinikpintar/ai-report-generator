"use client";

import type React from "react";
import { useMemo } from "react";
import ReactMarkdown, { type Components, type ExtraProps } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { CodeBlock } from "./CodeBlock";
import type { JSX } from "react/jsx-runtime";
import type { QueryValidationResult } from "../interfaces/QueryValidationResult";

type ElementProps<T extends keyof JSX.IntrinsicElements> = React.ComponentPropsWithoutRef<T> &
  ExtraProps;

interface CustomCodeProps extends ElementProps<"code"> {
  inline?: boolean;
  codeToIdMap?: Map<string, string>;
  validationResults?: QueryValidationResult[];
}

const normalizeCode = (code: string): string => {
  return code
    .trim()
    .replace(/\s+/g, " ") // Replace multiple whitespace with single space
    .replace(/\s*;\s*$/, ""); // Remove trailing semicolons
};

const MarkdownCodeRenderer: React.FC<CustomCodeProps> = ({
  inline,
  className,
  children,
  codeToIdMap,
  validationResults = [],
  ...props
}) => {
  const match = /language-(\w+)/.exec(className ?? "");

  if (!inline && match) {
    const codeContent = String(children);
    const normalizedCode = normalizeCode(codeContent);

    let queryId: string | undefined;

    codeToIdMap?.forEach((id, code) => {
      if (normalizeCode(code) === normalizedCode) {
        queryId = id;
      }
    });

    const validationResult = queryId
      ? validationResults.find((result) => result.query.id === queryId)
      : undefined;

    const validationStatus = validationResult
      ? {
          isValid: validationResult.isValid,
          errorMessage: validationResult.errorMessage,
          warningMessage: validationResult.warningMessage,
        }
      : undefined;

    return (
      <CodeBlock language={match[1]} value={codeContent} validationStatus={validationStatus} />
    );
  }

  return (
    <code className={inline ? "bg-gray-100 px-1 rounded text-sm" : className} {...props}>
      {children}
    </code>
  );
};

const H1Component: React.FC<ElementProps<"h1">> = ({ children, ...props }) => (
  <h1 className="text-2xl font-bold my-4" {...props}>
    {children}
  </h1>
);

const H2Component: React.FC<ElementProps<"h2">> = ({ children, ...props }) => (
  <h2 className="text-xl font-bold my-3" {...props}>
    {children}
  </h2>
);

const H3Component: React.FC<ElementProps<"h3">> = ({ children, ...props }) => (
  <h3 className="text-lg font-bold my-2" {...props}>
    {children}
  </h3>
);

const PComponent: React.FC<ElementProps<"p">> = ({ children, ...props }) => (
  <p className="my-2" {...props}>
    {children}
  </p>
);

const UlComponent: React.FC<ElementProps<"ul">> = ({ children, ...props }) => (
  <ul className="list-disc pl-5 my-2" {...props}>
    {children}
  </ul>
);

const OlComponent: React.FC<ElementProps<"ol">> = ({ children, ...props }) => (
  <ol className="list-decimal pl-5 my-2" {...props}>
    {children}
  </ol>
);

const LiComponent: React.FC<ElementProps<"li">> = ({ children, ...props }) => (
  <li className="my-1" {...props}>
    {children}
  </li>
);

interface ReportFormatterProps {
  content: string;
  validationResults?: QueryValidationResult[];
}

export const ReportFormatter: React.FC<ReportFormatterProps> = ({
  content,
  validationResults = [],
}) => {
  // Pre-process the markdown content to extract code blocks and their IDs
  const codeToIdMap = useMemo(() => {
    const map = new Map<string, string>();
    const codeBlockRegex = /```([a-z]+)\s+id=([a-zA-Z0-9]+)\s*\n([\s\S]*?)```/g;

    let match;
    while ((match = codeBlockRegex.exec(content)) !== null) {
      const [, , id, code] = match;
      map.set(code.trim(), id);
    }

    return map;
  }, [content]);

  const markdownComponents: Components = {
    h1: H1Component,
    h2: H2Component,
    h3: H3Component,
    p: PComponent,
    ul: UlComponent,
    ol: OlComponent,
    li: LiComponent,
    code: (props) =>
      MarkdownCodeRenderer({
        ...props,
        codeToIdMap,
        validationResults,
      }),
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={markdownComponents}
    >
      {content}
    </ReactMarkdown>
  );
};
