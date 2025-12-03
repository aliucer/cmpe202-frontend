"use client";

import { memo, useId } from "react";

type Props = {
  minPrice: number | undefined;
  maxPrice: number | undefined;
  onChangeMin: (p: number | undefined) => void;
  onChangeMax: (p: number | undefined) => void;
};

function PriceRangeImpl({
  minPrice,
  maxPrice,
  onChangeMin,
  onChangeMax,
}: Props) {
  const id = useId();
  const minId = `${id}-min`;
  const maxId = `${id}-max`;

  return (
    <div className="flex flex-col gap-2">

        {/* Row aligned to TOP so Clear doesn't shift Max */}
        <div className="flex items-start gap-6">

            {/* MIN COLUMN */}
            <div className="flex flex-col">
            <label className="text-sm font-medium text-white">Min Price:</label>
            <input
                type="number"
                className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-grey-300"
                placeholder="10"
                value={minPrice ?? ""}
                onChange={(e) =>
                onChangeMin(e.target.value === "" ? undefined : Number(e.target.value))
                }
            />

            {/* CLEAR (left) */}
            <button
                className="text-left text-sm underline text-white mt-5"
                onClick={() => {
                onChangeMin(undefined);
                onChangeMax(undefined);
                }}
            >
                Clear
            </button>
            </div>

            {/* DASH */}
            <span className="text-xl font-medium text-white pt-6">–</span>

            {/* MAX COLUMN */}
            <div className="flex flex-col">
            <label className="text-sm font-medium text-white">Max Price:</label>
            <input
                type="number"
                className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-grey-300"
                placeholder="50"
                value={maxPrice ?? ""}
                onChange={(e) =>
                onChangeMax(e.target.value === "" ? undefined : Number(e.target.value))
                }
            />

            {/* INVISIBLE SPACER — keeps row aligned */}
            <span className="invisible mt-2 text-sm">Clear</span>
            </div>
        </div>
    </div>
  );
}

export default memo(PriceRangeImpl);
