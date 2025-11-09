import Toolbar from "@/components/home/toolbar";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full px-6 bg-linear-to-br from-white via-gray-100 to-gray-50">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-8 text-center">
        Welcome to <span className="text-orange-600">Reddit RAG Search</span>
      </h1>

      <Toolbar />

      <p className="text-gray-500 text-sm mt-6 text-center">
        Retrieving knowledge from Reddit discussions
      </p>
    </div>
  );
}
