import { useState, useRef, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { restaurants, shops } from "../../data/mockData";
import "./Chat.css";

interface Message {
  id: number;
  sender: "visitor" | "vendor";
  text: string;
  time: string;
}

const vendorReplies = [
  "Thank you for reaching out! How can I help you today?",
  "Sure, we can accommodate that request.",
  "Our opening hours are 8am – 10pm daily.",
  "Yes, that item is currently available!",
  "We'll have your order ready in about 20 minutes.",
  "Feel free to ask any other questions!",
];

export default function Chat() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "restaurant";
  const { user } = useApp();

  const vendor = type === "shop"
    ? shops.find((s) => s.id === Number(id))
    : restaurants.find((r) => r.id === Number(id));

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: "vendor", text: `Hello! Welcome to ${vendor?.name}. How can we help you?`, time: now() },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function now() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now(), sender: "visitor", text: input, time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const reply = vendorReplies[Math.floor(Math.random() * vendorReplies.length)];
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: "vendor", text: reply, time: now() }]);
    }, 1000);
  };

  if (!vendor) return <div className="chat-error">Vendor not found. <Link to="/">Go home</Link></div>;

  if (!user) {
    return (
      <div className="chat-error">
        <p>Please log in to chat with vendors.</p>
        <Link to="/login" className="btn-primary">Login</Link>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-header">
          <Link to={`/${type === "shop" ? "shops" : "restaurants"}/${id}`} className="back-link">←</Link>
          <div className="chat-vendor-info">
            <div className="vendor-avatar">{vendor.name[0]}</div>
            <div>
              <h4>{vendor.name}</h4>
              <span className="online-status">🟢 Online</span>
            </div>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender === "visitor" ? "sent" : "received"}`}>
              <div className="bubble">{msg.text}</div>
              <span className="msg-time">{msg.time}</span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form className="chat-input-bar" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
          <button type="submit" disabled={!input.trim()}>Send ➤</button>
        </form>
      </div>
    </div>
  );
}
