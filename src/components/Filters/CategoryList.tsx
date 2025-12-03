import {memo} from "react";

type Props = {
    categories : string[];
    active: string[];
    onToggle : (c: string) => void;
};

function CategoryListImpl(
{categories, active, onToggle} : Props)
{
    return (
        <fieldset className="space-y-2">
            <legend className="sr-only">Categories</legend>
            {categories.map((c) => {
                const checked = active.includes(c);
                const id = `cat-${c}`;
                return (
                    <label key={c} htmlFor={id} className="flex items-center gap-2 cursor-pointer">
                        <input
                            id = {id}
                            type = "checkbox"
                            checked = {checked}
                            onChange={() => onToggle(c)}
                        />
                        <span>{c}</span>
                    </label>
                );
            })}
        </fieldset>
    );
}
export default memo(CategoryListImpl);
// memo avoids unnecessary re-rendering