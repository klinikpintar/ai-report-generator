import React from 'react';

// Simple mock of ReactMarkdown that just renders the content
const ReactMarkdown = ({ children }: { children: string }) => {
  return <div data-testid="markdown-content">{children}</div>;
};

export default ReactMarkdown;