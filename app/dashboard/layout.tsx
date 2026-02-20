"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useEffect } from "react";
import RunScraperButton from "./components/fii/run-scraper-button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-x-hidden">
        <header className="flex h-16 shrink-0 items-center  gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
          <div>
            <RunScraperButton />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-2 pt-0 overflow-x-hidden overflow-y-hidden">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
