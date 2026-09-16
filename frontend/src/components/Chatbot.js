"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your AI Agronomist. Ask me anything about crop diseases or treatments." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Send entire message history and active context if available
      let context = null;
      try {
        const storedContext = sessionStorage.getItem("agriSmartContext");
        if (storedContext) context = JSON.parse(storedContext);
      } catch(e) {}

      const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");
      const response = await axios.post(`${apiBase}/api/v1/chat`, {
        messages: [...messages, userMessage],
        context: context
      });

      const botMessage = { role: "assistant", content: response.data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I'm having trouble connecting right now." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[200] font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 md:w-96 h-[500px] max-h-[80vh] bg-paper border border-coffee/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-coffee text-paper px-4 py-3 flex justify-between items-center">
            <span className="font-semibold text-sm tracking-widest uppercase">Agronomist AI</span>
            <button onClick={() => setIsOpen(false)} className="hover:opacity-70 transition-opacity">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div 
            className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 bg-[#FCFCF7]"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-sm ${
                    msg.role === "user"
                      ? "bg-olive text-white rounded-br-none"
                      : "bg-earth/20 text-coffee rounded-bl-none"
                  }`}
                >
                  <div className={`flex flex-col gap-2 ${msg.role === "user" ? "text-white" : "text-coffee"}`}>
                    <ReactMarkdown 
                      components={{
                        p: ({node, ...props}) => <p className="m-0 leading-relaxed" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-4 m-0 space-y-1" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold" {...props} />
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-earth/20 text-coffee p-3 rounded-2xl rounded-bl-none flex space-x-2">
                  <div className="w-2 h-2 bg-coffee/50 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-coffee/50 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-coffee/50 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-3 bg-paper border-t border-coffee/10 flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about treatments..."
              className="flex-1 bg-transparent border-none focus:outline-none text-sm text-coffee placeholder-coffee/40 px-2"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 bg-coffee text-paper rounded-full hover:bg-olive transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-olive text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
}
