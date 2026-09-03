"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Loader2, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChat } from "./chat-context";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  quickActions?: { label: string; href: string }[];
};

const WELCOME: ChatMessage = {
  role: "assistant",
  content:
    "Assalam-o-Alaikum! I'm the Hassan AI Assistant. I can help you find properties, explore payment plans, learn about our construction services, or connect you with our team. How can I help today?",
  quickActions: [
    { label: "Find a Property", href: "/properties" },
    { label: "Explore Payment Plans", href: "/payment-plans" },
    { label: "Construction Services", href: "/builders" },
    { label: "Contact Us", href: "/contact" },
  ],
};

export function ChatWidget() {
  const chat = useChat();
  const [messages, setMessages] = React.useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (chat.prefill) {
      setInput(chat.prefill);
      chat.consumePrefill();
    }
  }, [chat]);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: nextMessages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Something went wrong");
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply, quickActions: data.quickActions }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Our team will confirm the latest information for you. Would you like to contact Hassan Estates with Sandhu Builders directly?",
          quickActions: WELCOME.quickActions,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {chat.isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-24 right-5 z-40 flex h-[70vh] max-h-[640px] w-[92vw] max-w-sm flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-white/[0.06] dark:bg-navy-900 sm:right-6"
        >
          <div className="flex items-center justify-between bg-navy-950 px-5 py-4 text-white">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 text-navy-950">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">Hassan AI Assistant</p>
                <p className="text-[11px] text-white/50">Ask about properties, plans &amp; construction</p>
              </div>
            </div>
            <button onClick={chat.close} className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-gray-50 px-4 py-4 dark:bg-white/[0.02]">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex flex-col gap-2", m.role === "user" ? "items-end" : "items-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg px-4 py-2.5 text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-navy-900 text-white"
                      : "border border-gray-200 bg-white text-navy-900 dark:border-white/[0.06] dark:bg-navy-800 dark:text-white"
                  )}
                >
                  {m.content}
                </div>
                {m.quickActions && (
                  <div className="flex flex-wrap gap-2">
                    {m.quickActions.map((a) => (
                      <Link
                        key={a.href}
                        href={a.href}
                        onClick={chat.close}
                        className="rounded-full border border-gold-400 bg-gold-50 px-3 py-1.5 text-xs font-medium text-navy-900 transition-colors hover:bg-gold-100 dark:border-gold-500/30 dark:bg-gold-500/10 dark:text-gold-300 dark:hover:bg-gold-500/20"
                      >
                        {a.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-white/35">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Hassan AI Assistant is typing…
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-center gap-2 border-t border-gray-100 p-3 dark:border-white/[0.06]"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="h-11 flex-1 rounded-full border border-gray-200 bg-white px-4 text-sm outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 dark:border-white/15 dark:bg-navy-900 dark:text-white dark:placeholder:text-white/30"
            />
            <Button type="submit" size="icon" disabled={loading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </motion.div>
      )}
      {!chat.isOpen && null}
    </AnimatePresence>
  );
}

export function ChatLauncherHint() {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gold-400">
      <Sparkles className="h-3 w-3" /> Ask Hassan AI Assistant
    </span>
  );
}
