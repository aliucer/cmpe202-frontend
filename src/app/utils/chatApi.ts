import { getAuthToken } from "./authUtils";

const DEFAULT_API_BASE_URL = "http://localhost:4000";

const getApiBaseUrl = (): string => {
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
    return raw.endsWith("/") ? raw.slice(0, -1) : raw;
};

// API Types
export interface Conversation {
    id: string;
    listing_id: string;
    buyer_id: string;
    seller_id: string;
    created_at: string;
    last_message_at: string;
    listing: {
        id: string;
        title: string;
        price: string;
        status: string;
        photo: string | null;
    };
    buyer: {
        id: string;
        display_name: string;
        email: string;
    };
    seller: {
        id: string;
        display_name: string;
        email: string;
    };
    last_message?: {
        id: string;
        body: string;
        sender_id: string;
        created_at: string;
    } | null;
}

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    body: string;
    created_at: string;
    sender?: {
        id: string;
        display_name: string;
        email: string;
    };
}

export interface ConversationsResponse {
    conversations: Conversation[];
    total: number;
    page: number;
    limit: number;
}

export interface MessagesResponse {
    messages: Message[];
    total: number;
    page: number;
    limit: number;
}

/**
 * Get all conversations for the current user
 */
export async function getConversations(
    page: number = 1,
    limit: number = 20
): Promise<ConversationsResponse> {
    const token = getAuthToken();
    if (!token) {
        throw new Error("Not authenticated");
    }

    const response = await fetch(
        `${getApiBaseUrl()}/api/chat/conversations?page=${page}&limit=${limit}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Unauthorized: missing or invalid token");
        }
        const text = await response.text();
        throw new Error(
            `Failed to fetch conversations: ${response.status} ${text || response.statusText}`
        );
    }

    return (await response.json()) as ConversationsResponse;
}

/**
 * Get a specific conversation by ID
 */
export async function getConversation(id: string): Promise<Conversation> {
    const token = getAuthToken();
    if (!token) {
        throw new Error("Not authenticated");
    }

    const response = await fetch(`${getApiBaseUrl()}/api/chat/conversations/${id}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Unauthorized: missing or invalid token");
        }
        if (response.status === 403) {
            throw new Error("Forbidden: not your conversation");
        }
        if (response.status === 404) {
            throw new Error("Conversation not found");
        }
        const text = await response.text();
        throw new Error(
            `Failed to fetch conversation: ${response.status} ${text || response.statusText}`
        );
    }

    return (await response.json()) as Conversation;
}

/**
 * Get messages for a conversation
 */
export async function getMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 50
): Promise<MessagesResponse> {
    const token = getAuthToken();
    if (!token) {
        throw new Error("Not authenticated");
    }

    const response = await fetch(
        `${getApiBaseUrl()}/api/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Unauthorized: missing or invalid token");
        }
        if (response.status === 403) {
            throw new Error("Forbidden: not your conversation");
        }
        if (response.status === 404) {
            throw new Error("Conversation not found");
        }
        const text = await response.text();
        throw new Error(
            `Failed to fetch messages: ${response.status} ${text || response.statusText}`
        );
    }

    return (await response.json()) as MessagesResponse;
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(
    conversationId: string,
    body: string
): Promise<Message> {
    const token = getAuthToken();
    if (!token) {
        throw new Error("Not authenticated");
    }

    const response = await fetch(
        `${getApiBaseUrl()}/api/chat/conversations/${conversationId}/messages`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ body }),
        }
    );

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Unauthorized: missing or invalid token");
        }
        if (response.status === 403) {
            throw new Error("Forbidden: not your conversation");
        }
        if (response.status === 404) {
            throw new Error("Conversation not found");
        }
        if (response.status === 400) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                `Invalid input: ${errorData.error || "Validation failed"}`
            );
        }
        const text = await response.text();
        throw new Error(
            `Failed to send message: ${response.status} ${text || response.statusText}`
        );
    }

    return (await response.json()) as Message;
}

