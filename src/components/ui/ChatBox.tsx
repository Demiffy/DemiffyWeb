// ChatBox.tsx
import React, { useState, useEffect } from "react";
import {
  getDatabase,
  ref,
  push,
  set,
  remove,
  onChildAdded,
  serverTimestamp,
} from "firebase/database";

interface Message {
  id: string;
  username: string;
  profilePic?: string;
  content: string;
  timestamp: number;
  fading?: boolean;
}

interface ChatBoxProps {
  currentUsername: string;
  currentUserProfilePic: string;
}

const ChatBox: React.FC<ChatBoxProps> = (props) => {
  const { currentUsername, currentUserProfilePic } = props;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [hidden, setHidden] = useState<boolean>(false);
  const [newMessageFlag, setNewMessageFlag] = useState<boolean>(false);
  const db = getDatabase();

  useEffect(() => {
    const chatRef = ref(db, "chat");
    const handleNewMessage = (snapshot: any) => {
      const data = snapshot.val();
      const message: Message = {
        id: snapshot.key,
        username: data.username,
        profilePic: data.profilePic,
        content: data.content,
        timestamp: data.timestamp || Date.now(),
      };

      setMessages((prev) => {
        const newMessages = [...prev, message].slice(-3);
        return newMessages;
      });

      if (hidden) {
        setNewMessageFlag(true);
      }

      setTimeout(() => {
        setMessages((current) =>
          current.map((m) =>
            m.id === message.id ? { ...m, fading: true } : m
          )
        );
        setTimeout(() => {
          setMessages((current) => current.filter((m) => m.id !== message.id));
        }, 500);
      }, 5000);

      setTimeout(() => {
        const messageRef = ref(db, `chat/${message.id}`);
        remove(messageRef).catch((error) =>
          console.error("Error removing message:", error)
        );
      }, 5000);
    };

    const unsubscribe = onChildAdded(chatRef, handleNewMessage);
    return () => {
      unsubscribe();
    };
  }, [db, hidden]);

  useEffect(() => {
    if (hidden && messages.length === 0) {
      setNewMessageFlag(false);
    }
  }, [messages, hidden]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const chatRef = ref(db, "chat");
    const newMessageRef = push(chatRef);

    const newMessage = {
      username: currentUsername || "Anonymous",
      content: inputValue,
      timestamp: serverTimestamp(),
      profilePic: currentUserProfilePic,
    };

    try {
      await set(newMessageRef, newMessage);
      setInputValue("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const iconButtonClasses =
    "relative p-2 text-black rounded-full bg-white hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 transition transform hover:scale-105 bg-opacity-20 backdrop-blur-md";

  if (hidden) {
    return (
      <div className="fixed top-0 left-1/2 transform -translate-x-1/2 mt-4 z-50 transition-opacity duration-500">
        <button
          onClick={() => {
            setHidden(false);
            setNewMessageFlag(false);
          }}
          className={iconButtonClasses}
          aria-label="Show Chat"
        >
          ↓
          {/* Red notification dot */}
          {newMessageFlag && (
            <span className="absolute top-0 right-0 block w-3 h-3 bg-red-600 rounded-full ring-2 ring-white"></span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div
      className={`fixed top-0 left-1/2 transform -translate-x-1/2 mt-4 w-96 z-40 transition-all duration-500 ${
        hidden ? "opacity-0 -translate-y-10" : "opacity-100 translate-y-0"
      }`}
      style={{ pointerEvents: "none" }}
    >
      {/* Hide Button */}
      <div className="absolute p-4 -right-10" style={{ pointerEvents: "auto" }}>
        <button
          onClick={() => setHidden(true)}
          className={iconButtonClasses}
          aria-label="Hide Chat"
        >
          ↑
        </button>
      </div>
      {/* Chat Container */}
      <div>
        <div className="p-4" style={{ pointerEvents: "auto" }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full p-2 rounded-full bg-white bg-opacity-20 backdrop-blur-md text-black outline-none transition duration-300 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {/* Chat Messages */}
        <div className="p-4 space-y-4" style={{ pointerEvents: "none" }}>
          {messages.length === 0 ? (
            <div className="text-center text-gray-500"></div>
          ) : (
            [...messages].reverse().map((msg) => (
              <div
                key={msg.id}
                className={`max-w-xs mx-auto p-3 h-20 rounded-lg transition-opacity duration-500 
                            backdrop-blur-sm border border-gray-300 shadow-sm 
                            bg-white/40 ${msg.fading ? "opacity-0" : "opacity-100"}`}
              >
                <div className="flex items-center space-x-2">
                  {msg.profilePic && (
                    <img
                      src={msg.profilePic}
                      alt={`${msg.username}'s profile`}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <div className="font-semibold text-lg text-secondary-color flex-grow">
                    {msg.username}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-base text-gray-700 mt-1">
                  {msg.content}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBox;