"use client";

import { useState } from "react";
import { getAuthToken } from "@/app/utils/authUtils";

const DEFAULT_API_BASE_URL = "http://localhost:4000";

const getApiBaseUrl = (): string => {
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
    return raw.endsWith("/") ? raw.slice(0, -1) : raw;
};

interface MessageSellerComponentProps {
    listingId: string | number;
}

export default function MessageSellerComponent({
    listingId,
}: MessageSellerComponentProps) {
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);

    const handleSend = async () => {
        // Don't send if message is empty
        if (message.trim() === "" || isSending) return;

        const messageBody = message.trim();
        setIsSending(true);

        try {
            const token = getAuthToken();
            if (!token) {
                alert("Error: You must be logged in to send a message");
                setIsSending(false);
                return;
            }

            // Step 1: Create or find the conversation
            const conversationResponse = await fetch(
                `${getApiBaseUrl()}/api/chat/conversations`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        listing_id: listingId.toString(),
                    }),
                }
            );

            if (!conversationResponse.ok) {
                const errorData = await conversationResponse.json().catch(() => ({}));
                throw new Error(
                    errorData.error || `Failed to create conversation: ${conversationResponse.statusText}`
                );
            }

            const conversation = await conversationResponse.json();

            // Step 2: Send the message in the conversation
            const messageResponse = await fetch(
                `${getApiBaseUrl()}/api/chat/conversations/${conversation.id}/messages`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        body: messageBody,
                    }),
                }
            );

            if (!messageResponse.ok) {
                const errorData = await messageResponse.json().catch(() => ({}));
                throw new Error(
                    errorData.error || `Failed to send message: ${messageResponse.statusText}`
                );
            }

            // Success - show alert and clear input
            alert("Message successfully sent to seller!");
            setMessage("");
        } catch (error) {
            // Error - show alert and keep input text
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "An unexpected error occurred while sending the message";
            alert(`Error: ${errorMessage}`);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSend();
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSending}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
                type="button"
                onClick={handleSend}
                disabled={isSending || message.trim() === ""}
                className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium
                           hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                           transition-colors duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
            >
                {isSending ? "Sending..." : "Send Message"}
            </button>
        </div>
    );
}

