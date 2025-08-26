"use client";
import React from "react";
import { Card, CardTitle, CardHeader, CardContent } from "../ui/card";
import { SuggestedActions } from "../suggested-actions";
import { useWidgetState } from "@/hooks/use-widget-state";

import { Button } from "../ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

const InspirationWidget = () => {
  const { isMinimized, toggleMinimized } = useWidgetState("inspiration");
  return (
    <Card>
      <CardHeader
        className="p-4 flex flex-row items-center justify-between cursor-pointer"
        onClick={toggleMinimized}
      >
        <CardTitle className="text-lg flex items-center gap-2">
          Inspiration
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          aria-label={
            isMinimized ? "Inspiration anzeigen" : "Inspiration ausblenden"
          }
        >
          {isMinimized ? (
            <ChevronDown className="size-5" />
          ) : (
            <ChevronUp className="size-5" />
          )}
        </Button>
      </CardHeader>
      {!isMinimized && (
        <CardContent className="p-4 pt-0">
          {/* <SuggestedActions orientation="vertical" /> */}
        </CardContent>
      )}
    </Card>
  );
};

export default InspirationWidget;
