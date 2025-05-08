import React from "react";
import ReactMarkdown from "react-markdown"; // Import Markdown Renderer
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { CodeBlock } from "./CodeBlock";

interface ReportFormatterProps {
  content: string;
}

export const ReportFormatter: React.FC<ReportFormatterProps> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        h1: (props) => <h1 className="text-2xl font-bold my-4" {...props} />,
        h2: (props) => <h2 className="text-xl font-bold my-3" {...props} />,
        h3: (props) => <h3 className="text-lg font-bold my-2" {...props} />,
        p: (props) => <p className="my-2" {...props} />,
        ul: (props) => <ul className="list-disc pl-5 my-2" {...props} />,
        ol: (props) => <ol className="list-decimal pl-5 my-2" {...props} />,
        li: (props) => <li className="my-1" {...props} />,
        code: ({
          inline,
          className,
          children,
          ...props
        }: {
          inline?: boolean;
          className?: string;
          children?: React.ReactNode;
        }) => {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <CodeBlock language={match[1]} value={String(children).replace(/\n$/, "")} />
          ) : (
            <code className="bg-gray-100 px-1 rounded text-sm" {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
