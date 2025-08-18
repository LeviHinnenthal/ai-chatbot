"use client";

import {
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import NewProjectDialog from "./new-project-dialog";
import Projects from "./projects";

export function NavProjects() {
  const { isMobile } = useSidebar();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="flex justify-between">
        Projekte
        <NewProjectDialog />
      </SidebarGroupLabel>
      <SidebarMenu>
        <Projects />
      </SidebarMenu>
    </SidebarGroup>
  );
}
