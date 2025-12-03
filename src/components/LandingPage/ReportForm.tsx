"use client";

import React, { useState, useEffect } from "react";
import { getAuthToken } from "@/app/utils/authUtils";

const DEFAULT_API_BASE_URL = "http://localhost:4000";

const getApiBaseUrl = (): string => {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
};

export enum ReportReason {
  INAPPROPRIATE_CONTENT = "Inappropriate content",
  INCOMPLETE_DETAILS = "Incomplete details",
  INACTIVE = "Inactive",
  OTHER = "Other",
}

interface ReportFormProps {
  productId: string | number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportForm({
  productId,
  isOpen,
  onClose,
}: ReportFormProps) {
  const [reason, setReason] = useState<ReportReason | "">("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setReason("");
      setDetails("");
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication token not found. Please log in to report a listing.");
        setIsSubmitting(false);
        return;
      }

      if (!reason) {
        setError("Please provide a reason for the report.");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(`${getApiBaseUrl()}/api/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listing_id: String(productId),
          reason: reason,
          details: details.trim() || undefined,
        }),
      });

      if (response.ok) {
        alert("Report Successful");
        onClose();
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        const errorMessage = errorData.error || "Report Unsuccessful";
        setError(errorMessage);
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      setError("An error occurred while submitting the report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setReason("");
    setDetails("");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex justify-end transition-opacity duration-300
                  ${isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
      aria-hidden={!isOpen}
    >
      {/* Overlay */}
      <div
        className="flex-1 bg-black/40"
        onClick={handleCancel}
      />

      {/* Drawer Panel */}
      <div
        className={`
          relative z-50 w-full max-w-md bg-white shadow-xl border-l border-gray-200
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Report Listing
          </h2>
          <button
            type="button"
            onClick={handleCancel}
            className="ml-2 inline-flex items-center justify-center rounded-md p-1
                       text-gray-400 hover:text-gray-600 hover:bg-gray-100
                       focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Close report form"
          >
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex flex-col h-[calc(100vh-4rem)]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Reason Field */}
            <div>
              <label
                htmlFor="reason"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Reason <span className="text-red-500">*</span>
              </label>
              <select
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value as ReportReason)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md
                         focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                         text-gray-900 bg-white"
                required
                disabled={isSubmitting}
              >
                <option value="">Select a reason</option>
                <option value={ReportReason.INAPPROPRIATE_CONTENT}>
                  {ReportReason.INAPPROPRIATE_CONTENT}
                </option>
                <option value={ReportReason.INCOMPLETE_DETAILS}>
                  {ReportReason.INCOMPLETE_DETAILS}
                </option>
                <option value={ReportReason.INACTIVE}>
                  {ReportReason.INACTIVE}
                </option>
                <option value={ReportReason.OTHER}>
                  {ReportReason.OTHER}
                </option>
              </select>
            </div>

            {/* Details Field */}
            <div>
              <label
                htmlFor="details"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Details (Optional)
              </label>
              <textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide additional details about your report"
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md
                         focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                         text-gray-900 placeholder-gray-400 resize-none"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Footer / Action Buttons */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-md text-sm font-medium
                       bg-white text-gray-700 border border-gray-300
                       hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                       transition-colors duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md text-sm font-medium
                       bg-red-600 text-white
                       hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                       transition-colors duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

