"use client";

import { ChevronRight, LucideIcon, BookOpen } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import { User } from "next-auth";
import { useSidebar } from "@/components/ui/sidebar";
import { SidebarHistory } from "./sidebar-history";

export function NavHistory({
  items,
  user,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
      disabled?: boolean;
      hasSubitems?: boolean;
      subitems?: {
        title: string;
        url: string;
        disabled?: boolean;
      }[];
    }[];
  }[];
  user?: User;
}) {
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarMenu>
        <Collapsible key="history" asChild defaultOpen={true}>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="History">
              <div>
                <BookOpen />
                <span>History</span>
              </div>
            </SidebarMenuButton>

            <>
              <CollapsibleTrigger asChild>
                <SidebarMenuAction className="data-[state=open]:rotate-90">
                  <ChevronRight className="size-3" />
                  <span className="sr-only">Toggle</span>
                </SidebarMenuAction>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem key="history">
                    <SidebarMenuSubButton asChild>
                      <SidebarHistory user={user} />
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  );
}
