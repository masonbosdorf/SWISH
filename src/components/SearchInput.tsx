import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    className?: string;
    autoFocus?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
    onSearch,
    placeholder = "Search...",
    className = "",
    autoFocus = false
}) => {
    const [value, setValue] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSearch(value);
        }
    };

    return (
        <div className={`relative group ${className}`}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors" size={20} />
            <input
                autoFocus={autoFocus}
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-[#111112] border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all shadow-lg"
            />
        </div>
    );
};

export default SearchInput;
