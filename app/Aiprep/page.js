"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, HomeIcon, MoreVertical, SendHorizonal } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { ModeToggle } from "../../components/ModeToggle";
import Link from "next/link";

export default function AIPrepPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hi! I'm your AI interviewer. Ask me anything to start.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleGlobalKey = (e) => {
      const isTyping = ["INPUT", "TEXTAREA"].includes(
        document.activeElement.tagName
      );
      if ((!isTyping && e.key.length === 1) || e.key === "SHIFT") {
        inputRef.current.focus();
      }
    };
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, []);
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();
      const aiReply = data.reply
        ? { role: "assistant", content: data.reply }
        : {
            role: "assistant",
            content: "⚠️ Sorry, I couldn't get a response. Try again later.",
          };

      setMessages([...updatedMessages, aiReply]);
    } catch {
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: "⚠️ Something went wrong while contacting AI.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Top right theme toggle */}
      <div className="absolute flex items-center space-x-3 justify-center top-4 right-5 z-10">
      <Button variant="outline" size="icon"><Link href="/"><HomeIcon className="h-5 w-5"/></Link></Button>
        <ModeToggle />
      </div>

      {/* Chat container */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scroll-smooth"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`group relative flex  ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-xl text-sm whitespace-pre-line leading-relaxed relative  ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-muted text-foreground rounded-bl-none"
              }`}
            >
              {msg.content}
              <div
                className="absolute flex items-center justify-between top-0 right-1 opacity-0 group-hover:opacity-100 transition"
                onClick={() => handleCopy(msg.content)}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 p-1 flex items-center justify-center"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-gray-500 text-sm italic">AI is typing...</div>
        )}
      </div>

      {/* Input area */}
      <div className="bg-background p-4 border-t sticky bottom-0 z-10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-end gap-2 max-w-4xl mx-auto"
        >
          <TextareaAutosize
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleEnter}
            placeholder="Ask a question..."
            minRows={1}
            maxRows={6}
            className="flex-1 resize-none p-3 rounded-lg bg-muted text-foreground placeholder:text-gray-500 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button type="submit" disabled={loading} className="h-10">
            <SendHorizonal className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
