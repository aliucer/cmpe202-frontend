"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getAuthToken, getUserData, getApiBaseUrl } from "@/app/utils/authUtils";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  listing: {
    id: string;
    title: string;
    photo: string | null;
  };
  buyer: {
    id: string;
    display_name: string;
  };
  seller: {
    id: string;
    display_name: string;
  };
  last_message: {
    body: string;
    created_at: string;
  } | null;
}

export default function MessageDrawer() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openChats, setOpenChats] = useState<string[]>([]);
  const [minimizedChats, setMinimizedChats] = useState<string[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});
  const [messageInputs, setMessageInputs] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user ID
  useEffect(() => {
    const user = getUserData();
    if (user) {
      setCurrentUserId(user.id);
    }
  }, []);

  // Fetch conversations from backend
  const fetchConversations = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/chat/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(
        `${getApiBaseUrl()}/api/chat/conversations/${conversationId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessagesMap((prev) => ({
          ...prev,
          [conversationId]: data.messages || [],
        }));
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Load conversations when dropdown opens
  useEffect(() => {
    if (isDropdownOpen) {
      fetchConversations();
    }
  }, [isDropdownOpen]);

  // Load messages when a chat is opened
  useEffect(() => {
    openChats.forEach((id) => {
      if (!messagesMap[id]) {
        fetchMessages(id);
      }
    });
  }, [openChats]);

  // Listen for conversation open events
  useEffect(() => {
    const handleOpenConversation = (event: CustomEvent<{ conversationId: string }>) => {
      const conversationId = event.detail.conversationId;
      if (conversationId && !openChats.includes(conversationId)) {
        setOpenChats((prev) => [...prev, conversationId]);
        setIsDropdownOpen(false);
        // Fetch messages immediately
        fetchMessages(conversationId);
      }
    };

    window.addEventListener('openConversation' as any, handleOpenConversation as EventListener);
    return () => {
      window.removeEventListener('openConversation' as any, handleOpenConversation as EventListener);
    };
  }, [openChats]);

  const toggleChat = (id: string) => {
    setOpenChats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleMinimize = (id: string) => {
    setMinimizedChats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const sendMessage = async (conversationId: string) => {
    const messageText = messageInputs[conversationId]?.trim();
    if (!messageText) return;

    const token = getAuthToken();
    if (!token) {
      alert("Please log in to send messages.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${getApiBaseUrl()}/api/chat/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ body: messageText }),
        }
      );

      if (response.ok) {
        // Clear input
        setMessageInputs((prev) => ({ ...prev, [conversationId]: "" }));
        // Refresh messages
        await fetchMessages(conversationId);
        // Refresh conversations to update last message
        await fetchConversations();
      } else {
        const errorData = await response.json().catch(() => ({ error: "Failed to send message" }));
        alert(errorData.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, conversationId: string) => {
    if (e.key === "Enter") {
      sendMessage(conversationId);
    }
  };

  const getConversationTitle = (conv: Conversation) => {
    if (!currentUserId) return conv.listing.title;
    // Show the other person's name
    if (currentUserId === conv.buyer_id) {
      return conv.seller.display_name;
    }
    return conv.buyer.display_name;
  };

  const getConversationSubtitle = (conv: Conversation) => {
    return conv.listing.title;
  };

  const getUserRole = (conv: Conversation): "Buyer" | "Seller" | null => {
    if (!currentUserId) return null;
    // Convert to string for comparison to handle type mismatches
    const userId = String(currentUserId);
    const buyerId = String(conv.buyer_id);
    const sellerId = String(conv.seller_id);
    
    if (userId === buyerId) {
      return "Buyer";
    }
    if (userId === sellerId) {
      return "Seller";
    }
    return null;
  };

  return (
    <div className="relative">
      {/* Icon */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-10 h-10 flex items-center justify-center hover:bg-[#0033A0]/10 rounded-full transition"
      >
        <Image
          src="/message.svg"
          alt="Messages"
          width={26}
          height={26}
          className="object-contain brightness-0 invert-[35%] saturate-0 scale-[1.3]"
        />
      </button>

      {/* Dropdown */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-3 w-72 bg-white border border-gray-200 shadow-lg rounded-lg p-3 z-50 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-semibold text-[#0033A0] mb-2">Messages</h3>
          {conversations.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">No conversations yet</p>
          ) : (
            <div className="divide-y divide-gray-200">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  className="w-full text-left py-2 hover:bg-gray-100 px-2 rounded-md"
                  onClick={() => {
                    toggleChat(conv.id);
                    setIsDropdownOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-800">
                      {getConversationTitle(conv)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-gray-600 font-medium truncate">
                      {getConversationSubtitle(conv)}
                    </p>
                    {getUserRole(conv) && (
                      <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${
                        getUserRole(conv) === "Buyer" 
                          ? "bg-blue-100 text-blue-700" 
                          : "bg-green-100 text-green-700"
                      }`}>
                        You are {getUserRole(conv)}
                      </span>
                    )}
                  </div>
                  {conv.last_message && (
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {conv.last_message.body}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chat Popups */}
      <div className="fixed bottom-0 right-4 flex gap-4 z-40">
        {openChats.map((id) => {
          const conv = conversations.find((c) => c.id === id);
          const messages = messagesMap[id] || [];
          const minimized = minimizedChats.includes(id);

          return (
            <div
              key={id}
              className={`w-80 bg-white border border-gray-300 rounded-t-lg shadow-xl overflow-hidden transition-all duration-300 ${
                minimized ? "h-10" : "h-96"
              }`}
            >
              {/* Header */}
              <div className="bg-[#0033A0] text-white px-3 py-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 pr-2">
                    <div>
                      <p className="font-semibold text-sm truncate">
                        {conv ? getConversationTitle(conv) : `Chat #${id}`}
                      </p>
                      {conv && (
                        <p className="text-xs text-white/80 truncate mt-0.5">
                          {getConversationSubtitle(conv)}
                        </p>
                      )}
                      {conv && getUserRole(conv) && (
                        <span className={`text-xs px-1.5 py-0.5 rounded inline-block mt-1 ${
                          getUserRole(conv) === "Buyer" 
                            ? "bg-blue-200 text-blue-800" 
                            : "bg-green-200 text-green-800"
                        }`}>
                          You are {getUserRole(conv)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center flex-shrink-0">
                  <button
                    onClick={() => toggleMinimize(id)}
                    className="text-white hover:text-gray-200 text-lg"
                  >
                    {minimized ? "⬆️" : "—"}
                  </button>
                  <button
                    onClick={() => toggleChat(id)}
                    className="text-white hover:text-gray-200 text-lg"
                  >
                    ✖
                  </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              {!minimized && (
                <>
                  <div className="p-3 h-64 overflow-y-auto space-y-2 bg-gray-50">
                    {messages.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No messages yet. Start the conversation!
                      </p>
                    ) : (
                      messages.map((msg) => {
                        const isCurrentUser = currentUserId && msg.sender_id === currentUserId;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
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
                      })
                    )}
                  </div>

                  {/* Input */}
                  <div className="flex border-t border-gray-200">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={messageInputs[id] || ""}
                      onChange={(e) =>
                        setMessageInputs((prev) => ({ ...prev, [id]: e.target.value }))
                      }
                      onKeyPress={(e) => handleKeyPress(e, id)}
                      className="text-black flex-1 px-3 py-2 text-sm focus:outline-none"
                      disabled={isLoading}
                    />
                    <button
                      onClick={() => sendMessage(id)}
                      disabled={isLoading || !messageInputs[id]?.trim()}
                      className="bg-[#0033A0] text-white px-4 text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
