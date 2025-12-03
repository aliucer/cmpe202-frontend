"use client";

import { useState, useEffect, useRef } from "react";
// import { sendMessage } from "@/app/utils/chatApi"; // For API version
// import { getUserData } from "@/app/utils/authUtils"; // For API version

interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  body: string;
  created_at: string;
}

interface MessageBoxProps {
  conversationId: number;
  conversation: Message[];
  otherParticipantName: string;
  minimized: boolean;
  onMinimize: () => void;
  onClose: () => void;
}

export default function MessageBox({
  conversationId,
  conversation,
  otherParticipantName,
  minimized,
  onMinimize,
  onClose,
}: MessageBoxProps) {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>(conversation);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // const [isSending, setIsSending] = useState(false); // For API version

  // Update messages when conversation prop changes
  useEffect(() => {
    setMessages(conversation);
  }, [conversation]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (!minimized && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, minimized]);

  // ========== MOCK DATA VERSION (CURRENTLY ACTIVE) ==========
  const handleSend = () => {
    if (inputValue.trim() === "") return;

    const newMessage: Message = {
      id: Date.now(), // Temporary ID for frontend-only
      conversation_id: conversationId,
      sender_id: 1, // Assuming sender_id 1 is the current user
      body: inputValue.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
  };

  // ========== API VERSION (COMMENTED OUT - UNCOMMENT TO USE) ==========
  /*
  const handleSend = async () => {
    if (inputValue.trim() === "" || isSending) return;

    const messageBody = inputValue.trim();
    setInputValue(""); // Clear input immediately for better UX
    setIsSending(true);

    try {
      // Send message to API
      const sentMessage = await sendMessage(conversationId.toString(), messageBody);

      // Convert API message format to component format
      const newMessage: Message = {
        id: parseInt(sentMessage.id),
        conversation_id: parseInt(sentMessage.conversation_id),
        sender_id: parseInt(sentMessage.sender_id),
        body: sentMessage.body,
        created_at: sentMessage.created_at,
      };

      // Add the new message to the list
      setMessages((prev) => [...prev, newMessage]);
    } catch (error) {
      // On error, restore the input value and show error
      setInputValue(messageBody);
      console.error("Error sending message:", error);
      alert(error instanceof Error ? error.message : "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };
  */

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div
      className={`w-80 bg-white border border-gray-300 rounded-t-lg shadow-xl overflow-hidden transition-all duration-300 ${
        minimized ? "h-10" : "h-96"
      }`}
    >
      {/* Header */}
      <div className="bg-[#0033A0] text-white px-3 py-2 flex justify-between items-center">
        <p className="font-semibold">{otherParticipantName}</p>
        <div className="flex gap-2 items-center">
          <button
            onClick={onMinimize}
            className="text-white hover:text-gray-200 text-lg"
          >
            {minimized ? "⬆️" : "—"}
          </button>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-lg"
          >
            ✖
          </button>
        </div>
      </div>

      {/* Messages */}
      {!minimized && (
        <>
          <div className="p-3 h-64 overflow-y-auto space-y-2 bg-gray-50">
            {messages.map((msg) => {
              // MOCK DATA VERSION: Hardcoded check for sender_id === 1
              // API VERSION: Should use currentUser.id instead
              // const currentUser = getUserData();
              // const isCurrentUser = currentUser && parseInt(currentUser.id) === msg.sender_id;
              const isCurrentUser = msg.sender_id === 1; // Mock version

              return (
                <div
                  key={msg.id}
                  className={`flex ${
                    isCurrentUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-3 py-2 rounded-lg max-w-[75%] text-sm ${
                      isCurrentUser
                        ? "bg-[#0033A0] text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    {msg.body}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex border-t border-gray-200">
            <input
              type="text"
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="text-black flex-1 px-3 py-2 text-sm focus:outline-none"
            />
            <button
              onClick={handleSend}
              className="bg-[#0033A0] text-white px-4 text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
              // disabled={isSending} // For API version
            >
              Send
              {/* {isSending ? "Sending..." : "Send"} // For API version */}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

