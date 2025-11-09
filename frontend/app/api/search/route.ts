import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  return new Response("Search API is running");
}

export const POST = async (req: Request) => {
  const { query } = await req.json();
  console.log("Received search query:", query);

  const results = [
    { id: 1, title: "First result for " + query },
    { id: 2, title: "Second result for " + query },
  ];

  return NextResponse.json({ results });
}