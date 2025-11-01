import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Admin/Sidebar";
import TopNav from "../components/Admin/TopNav";
import ScrollHint from "../components/shared/ScrollHint";

export default function AdminLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-white dark:bg-[var(--bg-elevated)] overflow-hidden">
      <Sidebar 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
      />
      <div className="flex-1 flex flex-col lg:ml-0">
        <TopNav onMenuToggle={() => setIsMobileOpen(!isMobileOpen)} />
        {/* Hide scrollbars but maintain functionality */}
        <main className="flex-1 bg-gray-50 overflow-auto dark:bg-[var(--bg-elevated)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <ScrollHint />
          <Outlet />
        </main>
      </div>
    </div>
  );
}