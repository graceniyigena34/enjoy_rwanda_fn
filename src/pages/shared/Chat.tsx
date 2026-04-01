import { useState, useRef, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { restaurants, shops } from "../../data/mockData";

interface Message { id: number; sender: "visitor"|"vendor"; text: string; time: string; }
const replies = ["Thank you for reaching out! How can I help?","Sure, we can accommodate that.","Our hours are 8am–10pm daily.","Yes, that item is available!","Ready in about 20 minutes.","Feel free to ask anything!"];
function now() { return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }

export default function Chat() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "restaurant";
  const { user } = useApp();
  const vendor = type === "shop" ? shops.find(s => s.id === Number(id)) : restaurants.find(r => r.id === Number(id));
  const [messages, setMessages] = useState<Message[]>([{ id: 1, sender: "vendor", text: `Hello! Welcome to ${vendor?.name}. How can we help you?`, time: now() }]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  if (!vendor) return <div className="p-10 text-center">Vendor not found. <Link to="/" className="text-blue-600 underline">Go home</Link></div>;
  if (!user) return <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4"><p className="text-gray-500">Please log in to chat.</p><Link to="/login" className="bg-[#1a1a2e] text-white px-6 py-2.5 rounded-xl font-semibold">Login</Link></div>;

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), sender: "visitor", text: input, time: now() }]);
    setInput("");
    setTimeout(() => setMessages(prev => [...prev, { id: Date.now()+1, sender: "vendor", text: replies[Math.floor(Math.random()*replies.length)], time: now() }]), 1000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px]">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <Link to={`/${type === "shop" ? "shops" : "restaurants"}/${id}`} className="text-gray-400 hover:text-gray-700 text-xl font-bold">←</Link>
          <div className="w-10 h-10 bg-[#1a1a2e] text-white rounded-full flex items-center justify-center font-bold text-sm">{vendor.name[0]}</div>
          <div><h4 className="font-bold text-gray-900 text-sm">{vendor.name}</h4><span className="text-xs text-green-500 font-medium">🟢 Online</span></div>
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50">
          {messages.map(msg => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === "visitor" ? "items-end" : "items-start"}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${msg.sender === "visitor" ? "bg-[#1a1a2e] text-white rounded-br-sm" : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-sm"}`}>{msg.text}</div>
              <span className="text-[10px] text-gray-400 mt-1">{msg.time}</span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        {/* Input */}
        <form onSubmit={send} className="flex gap-3 px-5 py-4 border-t border-gray-100 bg-white">
          <input type="text" placeholder="Type a message..." value={input} onChange={e => setInput(e.target.value)} autoFocus
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400 transition-colors" />
          <button type="submit" disabled={!input.trim()} className="bg-[#1a1a2e] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2d2d4e] transition-colors disabled:opacity-50">Send ➤</button>
        </form>
      </div>
    </div>
  );
}
