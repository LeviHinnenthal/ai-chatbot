"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Home,
  Menu,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavHistory } from "@/components/sidebar/nav-history";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { SidebarToggle } from "@/components/sidebar/sidebar-toggle";
import { User } from "next-auth";
import { SidebarHistory } from "@/components/sidebar/sidebar-history";
import { title } from "process";
import { NavSecondary } from "./nav-secondary";
// This is sample data.
const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Menu",
      url: "/",
      icon: Menu,
      isActive: true,
      items: [
        {
          title: "Home",
          url: "/",
        },
        {
          title: "Creator Modus",
          url: "/creator",
          disabled: true,
        },
        {
          title: "Projekte",
          url: "/projects",
          hasSubitems: true,
          subitems: [
            {
              title: "Neues Projekt anlegen",
              url: "/projects/create",
            },
            {
              title: "Projektübersicht",
              url: "/projects",
            },
            {
              title: "Projektarchiv",
              url: "/",
              disabled: true,
            },
          ],
        },
        {
          title: "Insights & Analysen",
          url: "/insights",
          disabled: true,
        },
      ],
    },
    {
      title: "KI Portal Module",
      url: "#",
      isActive: true,
      icon: Bot,
      items: [
        {
          title: "Text",
          url: "/chat",
        },
        {
          title: "Bild",
          url: "/image",
        },
        {
          title: "Video",
          url: "/video",
          disabled: true,
        },
        {
          title: "Document",
          url: "/document",
          disabled: true,
        },
        {
          title: "Audio",
          url: "/audio",
          disabled: true,
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      isActive: true,
      icon: Settings2,
      items: [
        {
          title: "My GPT´s",
          url: "/finetune",
        },
        // {
        //   title: "Appearance",
        //   url: "/settings",
        // },
        {
          title: "General",
          url: "/settings",
        },
        {
          title: "Tutorials",
          url: "#",
          disabled: true,
        },
      ],
    },
  ],
  history: [
    {
      title: "History",
      icon: BookOpen,
      url: "#",
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();
  // Check for text or image chat routes
  // const isTextOrImageChat =
  //   pathname.startsWith("/text") || pathname.startsWith("/image");

  return (
    <Sidebar collapsible="icon" {...props}>
      <div className="flex items-center">
        <SidebarToggle />
        {/* <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader> */}
      </div>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects /> */}
        <NavHistory items={data.history} user={user} />

        {/* <NavProjects projects={data.projects} /> */}
        {/* {isTextOrImageChat && <SidebarHistory user={user} />} */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
