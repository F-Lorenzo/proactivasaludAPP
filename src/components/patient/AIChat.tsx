"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  patientName: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    role: "assistant",
    content: "Hola, ¿cómo te sentís hoy? Recordá tomar tus medicamentos según el horario indicado.",
  },
];

export default function AIChat({ patientName }: Props) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, patientName }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Lo siento, no puedo responder en este momento. Intentá más tarde." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center flex-shrink-0">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 2a5 5 0 015 5c0 2.76-2.24 5-5 5S7 9.76 7 7a5 5 0 015-5zM3 21c0-4 4-7 9-7s9 3 9 7"/>
          </svg>
        </div>
        <div>
          <p className="text-[12.5px] font-semibold text-slate-900">Tu acompañante digital</p>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            <span className="text-[11px] text-green-600">Activo ahora</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-2 p-3 max-h-40 overflow-y-auto flex-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[82%] px-3 py-1.5 rounded-xl text-[12px] leading-relaxed ${
              msg.role === "assistant"
                ? "bg-slate-100 text-slate-900 rounded-tl-sm self-start"
                : "bg-green-500 text-white rounded-tr-sm self-end"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="self-start bg-slate-100 px-3 py-1.5 rounded-xl rounded-tl-sm text-[12px] text-slate-400">
            ···
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 p-2.5 border-t border-slate-100">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Escribe tu consulta…"
          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[12px] text-slate-900 outline-none focus:border-green-400 transition"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="w-8 h-8 rounded-lg bg-green-500 hover:bg-green-600 transition flex items-center justify-center disabled:opacity-50"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13M22 2L15 22l-4-9-9-4z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
