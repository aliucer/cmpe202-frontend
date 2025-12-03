"use client";

import {memo, useId} from "react";

type Props = {
    price : number | undefined;
    onChange : (p: number | undefined) => void;
};

function MaxPriceInputImpl({price, onChange} : Props) {
    const id = useId();

    return (
    <div>
        <label htmlFor={id} className="block text-sm mb-1">Max Price</label>
        <div className="flex items-center gap-2">
            <input
                id={id}
                type="number"
                min={0}
                step="1"
                placeholder="e.g. 50"
                className="w-32 rounded-lg border px-3 py-2"
                value={typeof price === "number" ? String(price) : ""}
                onChange={(e) => {
                    const v = e.target.value.trim();
                    onChange(v === "" || Number(v) == 0 ? undefined : Number(v));
                }}
                suppressHydrationWarning
            />
            <button
                type="button"
                onClick={() => onChange(undefined)}
                className="text-sm underline"
                suppressHydrationWarning
            > 
                Clear
            </button>
           
        </div>
    </div>
    );
} 
export default memo(MaxPriceInputImpl);