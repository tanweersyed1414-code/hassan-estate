"use client";

import { MessageCircle, Phone, Sparkles } from "lucide-react";
import { telLink, whatsappLink } from "@/lib/utils";
import { useChat } from "./chat-context";

export function FloatingButtons() {
  const chat = useChat();

  return (
    <div className="fixed bottom-5 right-5 z-30 flex flex-col items-end gap-3">
      <button
        onClick={chat.toggle}
        aria-label="Hassan AI Assistant"
        className="group flex h-14 w-14 items-center justify-center rounded-full bg-navy-900 text-gold-400 shadow-xl shadow-navy-950/30 transition-transform hover:scale-105"
      >
        <Sparkles className="h-6 w-6 transition-transform group-hover:rotate-12" />
      </button>
      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-900/20 transition-transform hover:scale-105"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
      <a
        href={telLink()}
        aria-label="Call us"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-500 text-white shadow-xl shadow-gold-900/10 transition-transform hover:scale-105"
      >
        <Phone className="h-5 w-5" />
      </a>
    </div>
  );
}
