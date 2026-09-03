"use client";
import * as React from "react";

interface ChatContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  prefill: string | null;
  openWithMessage: (msg: string) => void;
  consumePrefill: () => void;
}

const ChatContext = React.createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [prefill, setPrefill] = React.useState<string | null>(null);

  const value = React.useMemo(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((v) => !v),
      prefill,
      openWithMessage: (msg: string) => {
        setPrefill(msg);
        setIsOpen(true);
      },
      consumePrefill: () => setPrefill(null),
    }),
    [isOpen, prefill]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = React.useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
