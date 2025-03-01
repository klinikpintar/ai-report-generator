"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Dropdown from "../app/components/dropdown";
import { useService } from "../app/context/serviceContext"; // Import context

// Definisikan tipe data pesan
interface Message {
  text: string;
  sender: "user" | "bot"; // Hanya boleh user atau bot
}

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]); // Tidak ada pesan bot di awal
  const [input, setInput] = useState("");
  const [hasChatted, setHasChatted] = useState(false);
  const username = "Virgillia Yeala";
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { selectedService } = useService(); // Ambil service dari context


  const sendMessage = () => {
    if (!input.trim()) return;

    // Tambahkan chat user ke dalam state
    const newMessages: Message[] = [...messages, { text: input, sender: "user" }];
    setMessages(newMessages); // Sekarang TypeScript sudah mengenali tipe data yang sesuai
    setInput("");
    setHasChatted(true);

    // Bot merespons setelah user mengirim pesan pertama
    setTimeout(() => {
      const botResponse: Message = { text: "How can I assist you?", sender: "bot" };
      setMessages((prevMessages) => [...prevMessages, botResponse]);
    }, 1000);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="ml-64 flex flex-col h-screen">
      <Dropdown />

        {!hasChatted && (
          <h1 className="text-3xl font-bold text-center flex items-center justify-center h-full pb-24"
          style={{ color: "#00B0EB" }}>
            Hello, {username} !!
          </h1>
        )}

      {/* Bagian Chat Scrollable */}
      {hasChatted && (
        <div 
          ref={chatContainerRef} // Gunakan ref di sini
          className="flex-1 overflow-y-auto p-4 space-y-2 bg-white pb-24"
        >
        {/* Pesan Selamat Datang, akan hilang setelah user chat */}

        {/* Chat Messages */}
        <div className="ml-2 mt-4 space-y-2 flex flex-col mr-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg max-w-[90%] ${
                msg.sender === "user"
                  ? "bg-[#E4F6FC] text-[#00B0EB]  self-end" // Chat user di kanan
                  : "bg-gray-200 text-black self-start" // Chat bot di kiri
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Chat Input */}
      <div className="sticky bottom-3 w-full bg-white py-4 px-6">
        {/* Service Name - Dipindahkan ke pojok kiri atas input */}
        <p className="text-sm text-gray-600 absolute left-6 top-2">
          Reservasi: {selectedService}
        </p>

        {/* Input Chat */}
        <div className="relative w-full flex items-center mx-auto mt-5">
          <input
            type="text"
            className="w-full border rounded-3xl p-3 pr-12 text-black"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            onClick={sendMessage}
          >
            <Image src="/icon-send.svg" width={40} height={40} alt="Send Icon" />
          </button>
        </div>

        {/* Footer Text */}
        <p className="text-xs text-gray-600 mt-2 text-center">
          This AI Report Generator can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}