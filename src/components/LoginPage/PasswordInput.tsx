"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
}

export default function PasswordInput({ value, onChange, placeholder, error }: Props) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col w-full">
      <div className="relative w-full">
        
        {/* INPUT */}
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className={`border w-full px-3 py-2 pr-12 rounded text-black focus:outline-none ${
            error ? "border-red-500" : ""
          }`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />

        {/* Eye icon inside field */}
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="
            absolute 
            right-2 
            top-1/2 
            -translate-y-1/2 
            flex 
            items-center 
            justify-center
            text-gray-400 
            hover:text-black
          "
        >
          {show ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>

      </div>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
