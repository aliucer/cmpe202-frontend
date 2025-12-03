"use client";

import React, { useState, useEffect } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import ReportForm from "./ReportForm";

interface ReportButtonProps {
  productId: string | number;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  // Prop to control form visibility when parent view closes
  parentViewOpen?: boolean;
}

export default function ReportButton({
  productId,
  className = "",
  onClick,
  parentViewOpen = true,
}: ReportButtonProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Close form when parent view closes
  useEffect(() => {
    if (!parentViewOpen) {
      setIsFormOpen(false);
    }
  }, [parentViewOpen]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    
    // If custom onClick is provided, use it
    if (onClick) {
      onClick(e);
      return;
    }

    // Open the report form
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const baseStyles = "px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center bg-red-600 text-white hover:bg-red-700 focus:ring-red-500";

  return (
    <>
      <button
        type="button"
        className={`${baseStyles} ${className}`}
        onClick={handleClick}
      >
        <span className="pr-2">REPORT</span>
        <FaExclamationTriangle />
      </button>
      
      <ReportForm
        productId={productId}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
      />
    </>
  );
}

