import ky from "ky";
import { NextResponse } from "next/server";
import { SearchResponse } from "@/types/search";

const PORT = process.env.PORT || 3001;

export const GET = async (request: Request) => {
    return new Response("Search API is running");
}

export const POST = async (req: Request) => {
    try {
        const { query } = await req.json();

        if (!query) {
            return NextResponse.json(
                { error: "Query is required" },
                { status: 400 }
            );
        }

        console.log("Received search query:", query);

        const data = await ky.post(`http://localhost:${PORT}/reddit/ask`, {
            json: {
                question: query,
                includeComments: false,
                options: {}
            },
            timeout: 60000,
        }).json<SearchResponse>();

        console.log("Search results:", data);

        return NextResponse.json(data);
    } catch (error) {
        console.error("Search API error:", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Search failed",
            },
            { status: 500 }
        );
    }
}