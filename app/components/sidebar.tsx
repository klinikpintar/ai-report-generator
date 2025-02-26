"use client";

import Image from "next/image";

export default function Sidebar() {
  return (
    <aside
      className="bg-white border-r-2 text-black h-screen fixed left-0 top-16.3 w-64 px-4 py-4"
      style={{ borderColor: "#036681" }}
    >
      <button className="flex items-center gap-3 p-2 hover:bg-gray-200 w-full text-left">
        <Image
          src="/icon-plus.svg"
          width={20}
          height={20}
          alt="New Chat"
        />
        <h1 className="text-sm font-medium">New Chat</h1>
      </button>

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-gray-600">Recent</h2>
        <div className="flex items-center gap-3 p-2 hover:bg-gray-200 mt-2">
          <Image
            src="/icon-align-left.svg"
            width={20}
            height={20}
            alt="Rekomendasi Icon"
          />
          <p className="text-sm font-medium">Rekomendasi Query <br /> Rekam Media</p>
        </div>
      </div>
    </aside>
  );
}