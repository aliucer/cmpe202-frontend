"use client";

import { useState } from "react";
import Image from "next/image";
import notificationsData from "@/app/mock/notifications.json" assert { type: "json" };

interface Notification {
  id: number;
  title: string;
  body: string;
  created_at: string;
}

export default function NotificationDrawer() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(notificationsData);

  const markAsRead = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllAsRead = () => setNotifications([]);

  return (
    <div className="relative">
      {/* Icon */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-10 h-10 flex items-center justify-center hover:bg-[#0033A0]/10 rounded-full transition"
      >
        <Image
          src="/bell.svg"
          alt="Notifications"
          width={26}
          height={26}
          className="object-contain brightness-0 invert-[0%] saturate-0 scale-[1.3]"
        />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 bg-[#0033A0] text-white text-xs rounded-full px-1.5">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 shadow-lg rounded-lg p-3 z-50">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-[#0033A0]">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-[#0033A0] hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length > 0 ? (
            <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
              {notifications.map((note) => (
                <li
                  key={note.id}
                  className="py-2 px-2 hover:bg-gray-100 rounded-md cursor-pointer"
                  onClick={() => markAsRead(note.id)}
                >
                  <p className="text-sm font-semibold text-gray-800">{note.title}</p>
                  <p className="text-xs text-gray-600">{note.body}</p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {new Date(note.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No new notifications 🎉</p>
          )}
        </div>
      )}
    </div>
  );
}
