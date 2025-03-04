'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  modelUsed?: string; // Add this field
}

interface ApiResponse {
  messageId: string;
  userPrompt: string;
  aiResponse: string;
  createdAt: string;
  metadata: {
    finishReason: string;
    usage: {
      promptTokens: number;
      completionTokens: number;
    };
    modelUsed: string; // Add this field
  };
}

// Define available models
const AI_MODELS = [
  { id: 'gemini', name: 'Google Gemini' },
  { id: 'deepseek', name: 'DeepSeek Chat' },
  // Add more models as needed
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            { role: 'user', content: input.trim() },
          ],
          model: selectedModel, // Send selected model to API
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data: ApiResponse = await response.json();

      const assistantMessage: Message = {
        id: data.messageId,
        role: 'assistant',
        content: data.aiResponse,
        modelUsed: data.metadata.modelUsed, // Include the model information
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      
      // Show error in chat
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Sorry, there was an error processing your request.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AI Report Generator</h1>
      
      {/* Model selector */}
      <div className="mb-4">
        <label htmlFor="model-selector" className="block text-sm font-medium text-gray-700 mb-1">
          Select AI Model
        </label>
        <select
          id="model-selector"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        >
          {AI_MODELS.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex-1 overflow-auto mb-4 border border-gray-300 rounded-md p-4">
        {messages.length === 0 ? (
          <p className="text-gray-500">Start a conversation by sending a message.</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 p-3 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-blue-100 ml-auto max-w-[80%]' 
                  : 'bg-gray-100 mr-auto max-w-[80%]'
              }`}
            >
              <div className="font-semibold mb-1">
                {message.role === 'user' ? 'You' : 'AI'}
                {message.modelUsed && <span className="text-xs text-gray-500 ml-2">({message.modelUsed})</span>}
              </div>
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="bg-gray-100 p-3 rounded-lg mr-auto max-w-[80%]">
            <div className="font-semibold mb-1">AI</div>
            <div>Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border border-gray-300 rounded-md"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:bg-blue-300"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
