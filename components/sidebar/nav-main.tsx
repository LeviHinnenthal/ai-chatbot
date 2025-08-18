"use client";

import { ChevronRight, TypeIcon as type, LucideIcon } from "lucide-react";

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

export function NavMain({
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
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={item.title}>
                <a href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRight className="size-3" />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) =>
                        subItem.hasSubitems && subItem.subitems?.length ? (
                          // Render nested collapsible for subitems that have their own subitems
                          <Collapsible
                            key={subItem.title}
                            asChild
                            className="w-full"
                          >
                            <SidebarMenuSubItem className="relative w-full">
                              <SidebarMenuSubButton asChild>
                                <a href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </a>
                              </SidebarMenuSubButton>
                              <CollapsibleTrigger asChild>
                                <SidebarMenuAction className="data-[state=open]:rotate-90 right-0 top-1">
                                  <ChevronRight className="size-3" />
                                  <span className="sr-only">Toggle</span>
                                </SidebarMenuAction>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                {/* Nested subitems */}
                                <SidebarMenuSub className="ml-2 mt-1">
                                  {subItem.subitems?.map((nestedItem) => (
                                    <SidebarMenuSubItem
                                      key={nestedItem.title}
                                      className={`${
                                        nestedItem.disabled ? "disabled" : ""
                                      }`}
                                    >
                                      <SidebarMenuSubButton asChild>
                                        <a href={nestedItem.url}>
                                          <span>{nestedItem.title}</span>
                                        </a>
                                      </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                  ))}
                                </SidebarMenuSub>
                              </CollapsibleContent>
                            </SidebarMenuSubItem>
                          </Collapsible>
                        ) : (
                          // Regular subitem without nested items
                          <SidebarMenuSubItem
                            key={subItem.title}
                            className={subItem.disabled ? "disabled" : ""}
                          >
                            <SidebarMenuSubButton asChild>
                              <a href={subItem.url}>
                                <span>{subItem.title}</span>
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      )}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
