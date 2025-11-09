"use client";

import { useState } from "react";
import ky from "ky";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Toolbar = () => {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);

        try {
            const data = await ky
                .post("/api/search", { json: { query } })
                .json();
            console.log("Search results:", data);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-xl flex items-center gap-2 bg-white border border-gray-200 rounded-full shadow-sm px-4 py-2 focus-within:ring-2 focus-within:ring-orange-500 transition">
            <Search className="text-gray-500" size={20} />
            <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Reddit topics, threads, or keywords..."
                className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button
                onClick={handleSearch}
                disabled={loading}
                className="rounded-full bg-orange-600 hover:bg-orange-700 transition px-6"
            >
                {loading ? "Searching..." : "Search"}
            </Button>
        </div>
    );
}

export default Toolbar;
