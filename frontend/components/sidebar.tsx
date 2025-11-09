"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Home,
  SearchSlash,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

const Sidebar = () => {
  const router = useRouter();
  const { open, toggleSidebar } = useSidebar();
  const [isOpen, setIsOpen] = useState(true);

  const recentSearches = [
    "What is AI?",
    "Best programming languages",
    "React vs Vue",
    "Next.js features",
  ];

  return (
    <SidebarComponent
      collapsible="icon"
      className={`h-screen bg-linear-to-b from-orange-50 to-white text-gray-800 border-r border-gray-200 flex flex-col justify-between rounded-r-2xl shadow-md transition-all z-30 ${
        open ? "w-64" : "w-[70px] min-w-[70px]"
      }`}
    >
      <SidebarHeader className="py-4 px-4">
        <div className={`flex items-center gap-3 ${!open && "justify-center"}`}>
          <div className="bg-orange-600 rounded-xl h-10 w-10 flex items-center justify-center shadow-md">
            <SearchSlash className="h-5 w-5 text-white" />
          </div>
          {open && (
            <span className="font-semibold text-base text-orange-600">
              Reddit Search
            </span>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-1">
          <SidebarLink
            open={open}
            href="/search/recent"
            icon={<Home size={18} />}
            label="Recent Searches"
          />
          <SidebarLink
            open={open}
            href="/search/saved"
            icon={<Home size={18} />}
            label="Saved Searches"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto px-3">
        {open && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
            <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 py-2 px-3 rounded-lg hover:bg-orange-100 transition">
              <span>Saved Searches</span>
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 flex flex-col gap-1">
              {recentSearches.map((search, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className="justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg px-3 py-2 text-sm font-medium"
                  onClick={() => console.log("Selected:", search)}
                >
                  {search}
                </Button>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </SidebarContent>

      <SidebarSeparator className="mx-4 my-2 bg-gray-200" />

      <SidebarFooter className="px-3 py-3 flex flex-col gap-2">
        <button
          onClick={toggleSidebar}
          className={`flex items-center ${
            open ? "justify-start gap-3 px-3" : "justify-center px-2"
          } py-2.5 rounded-lg text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200 text-sm font-medium`}
        >
          <SidebarTrigger className="hover:bg-transparent hover:text-orange-600 p-0 h-5 w-5" />
          {open && <span>Collapse Sidebar</span>}
        </button>
      </SidebarFooter>
    </SidebarComponent>
  );
};

function SidebarLink({
  open,
  href,
  icon,
  label,
}: {
  open: boolean;
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 text-gray-700 hover:text-orange-600 hover:bg-orange-50 ${
        !open && "justify-center px-2"
      }`}
    >
      <span>{icon}</span>
      {open && <span className="flex-1 text-left">{label}</span>}
    </Link>
  );
}

export default Sidebar;
