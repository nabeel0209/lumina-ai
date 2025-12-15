"use client";
import { useEffect, useState, useRef, memo } from "react";
import { db, auth } from "../firebase/firebaseconfig";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { marked } from "marked";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ChatbotPage() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const MessageContent = memo(({ msg }) => {
    if (msg.role === "bot") {
      return (
        <div
          className="prose prose-invert prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: marked(msg.content) }}
        />
      );
    }
    return msg.content;
  });

  const router = useRouter();

  // Auth guard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.replace("/");
      else setUser(u);
    });
    return () => unsub();
  }, [router]);

  // Firestore listener
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "chats", user.uid, "messages"),
      orderBy("timestamp")
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    });

    return () => unsub();
  }, [user]);

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || !user) return;

    const text = input;
    setInput("");
    setLoading(true);

    try {
      await addDoc(collection(db, "chats", user.uid, "messages"), {
        role: "user",
        content: text,
        timestamp: Date.now(),
      });

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      await addDoc(collection(db, "chats", user.uid, "messages"), {
        role: "bot",
        content: data.reply,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h1 className="text-white font-semibold tracking-tight text-lg sm:text-xl">
          Lumina AI
        </h1>
        <button
          onClick={() => signOut(auth)}
          className="text-sm text-white/70 hover:text-white transition"
        >
          Logout
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 space-y-4">
        {messages.map((msg, index) => {
          const isLast = index === messages.length - 1;

          return (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {isLast ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className={`max-w-[90%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed border ${
                    msg.role === "user"
                      ? "bg-white text-black border-white/20 rounded-br-none"
                      : "bg-[#28282B] text-white border-white/10 rounded-bl-none"
                  }`}
                >
                  <MessageContent msg={msg} />
                </motion.div>
              ) : (
                <div
                  className={`max-w-[90%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed border ${
                    msg.role === "user"
                      ? "bg-white text-black border-white/20 rounded-br-none"
                      : "bg-[#28282B] text-white border-white/10 rounded-bl-none"
                  }`}
                >
                  <MessageContent msg={msg} />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl bg-[#28282B] border border-white/10 flex gap-2">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-150" />
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-300" />
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-3 sm:p-4">
        <div className="flex gap-2 sm:gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask Lumina anything..."
            className="flex-1 h-12 rounded-full bg-black border border-white/20 px-4 text-sm text-white placeholder-white/40 outline-none focus:border-white transition"
          />
          <button
            onClick={sendMessage}
            className="h-12 px-5 rounded-full bg-white text-black font-medium text-sm hover:bg-white/90 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
