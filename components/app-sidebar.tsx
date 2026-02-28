"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  ChartBar,
  Command,
  FactoryIcon,
  Frame,
  GalleryVerticalEnd,
  LayoutDashboard,
  Map,
  Paintbrush2,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "AUC Analysis",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Net Investment FII",
      url: "/dashboard/net-investment",
      icon: ChartBar,
    },
    {
      title: "Sector Wise Analysis",
      url: "/dashboard/industry-analytics",
      icon: FactoryIcon,
    },
    {
      title: "Appearance",
      url: "/dashboard/appearance",
      icon: Paintbrush2,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
