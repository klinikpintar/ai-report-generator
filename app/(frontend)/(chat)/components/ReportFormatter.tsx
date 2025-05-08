"use client";

import React from "react";
import ReactMarkdown, { Components, ExtraProps } from "react-markdown"; // Import Markdown Renderer
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { CodeBlock } from "./CodeBlock"; // Assuming CodeBlock is correctly implemented
import { JSX } from "react/jsx-runtime";

type ElementProps<T extends keyof JSX.IntrinsicElements> = React.ComponentPropsWithoutRef<T> &
  ExtraProps;

interface CustomCodeProps extends ElementProps<"code"> {
  inline?: boolean; 
}

const MarkdownCodeRenderer: React.FC<CustomCodeProps> = ({
  inline,
  className,
  children,
  ...props 
}) => {
  const match = /language-(\w+)/.exec(className || "");
  if (!inline && match && React.isValidElement(children)) {
    const childString = Array.isArray(children) ? children.join("") : String(children);
    return <CodeBlock language={match[1]} value={childString.replace(/\n$/, "")} />;
  } else if (!inline && match) {
    return <CodeBlock language={match[1]} value={String(children).replace(/\n$/, "")} />;
  }

  return (
    <code
      className={inline ? "bg-gray-100 px-1 rounded text-sm" : className}
      {...props}
    >
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
}

export const ReportFormatter: React.FC<ReportFormatterProps> = ({ content }) => {
  const markdownComponents: Components = {
    h1: H1Component,
    h2: H2Component,
    h3: H3Component,
    p: PComponent,
    ul: UlComponent,
    ol: OlComponent,
    li: LiComponent,
    code: MarkdownCodeRenderer,
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
