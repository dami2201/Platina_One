import { useEffect, useState, useRef } from "react";
import axios from "axios";

interface User {
  id: number;
  username: string;
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id?: number | null;
  message: string;
  created_at: string;
  sender_username: string;
}

export default function Chat() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Platina One | Csevegés';
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUserId(parsed.id);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (userId !== null) {
      loadMessages();
    }
  }, [userId, selectedUserId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Hiba a /api/users kérés során:", err);
    }
  };

  const loadMessages = async () => {
    try {
      if (selectedUserId === null) {
        const res = await axios.get("/api/public-messages");
        setMessages(res.data);
      } else {
        const res = await axios.get("/api/messages", {
          params: {
            sender_id: userId,
            receiver_id: selectedUserId,
          },
        });
        setMessages(res.data);
      }
    } catch (err) {
      console.error("Hiba az üzenetek lekérésekor:", err);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || userId === null) return;

    try {
      if (selectedUserId === null) {
        await axios.post("/api/public-messages", {
          sender_id: userId,
          message,
        });
      } else {
        await axios.post("/api/messages", {
          sender_id: userId,
          receiver_id: selectedUserId,
          message,
        });
      }
      setMessage("");
      loadMessages();
    } catch (err) {
      console.error("Hiba az üzenetküldés során:", err);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-neutral-950 text-white p-6 animate-fadeIn">
        <h1 className="text-4xl font-extrabold mb-6 bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
          💬 Platina Chat
        </h1>

        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">Csevegés valakivel:</label>
          <select
            className="w-full bg-neutral-800 border border-neutral-700 rounded p-3 text-white"
            value={selectedUserId ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedUserId(val === "" ? null : parseInt(val));
            }}
          >
            <option value="">🌐 Nyilvános chat</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                👤 {user.username}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded p-4 h-96 overflow-y-scroll space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg max-w-xl w-fit text-sm shadow-md ${
                msg.sender_id === userId
                  ? "bg-blue-600 ml-auto text-white"
                  : "bg-neutral-800 text-neutral-100"
              }`}
            >
              <span className="block font-semibold text-xs opacity-75">
                {msg.sender_username}
              </span>
              <span className="block mt-1 whitespace-pre-line">{msg.message}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="mt-6 flex gap-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 bg-neutral-800 border border-neutral-700 rounded p-3 text-white placeholder:text-neutral-400"
            placeholder="Írj üzenetet..."
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-bold transition-transform hover:scale-105"
          >
            🚀 Küldés
          </button>
        </div>
      </div>
    </>
  );
}