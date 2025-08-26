"use client";

import React, { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Paperclip, ArrowUp, ArrowUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function HomeInput({ projectId }: { projectId?: string }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit() {
    if (projectId) {
      router.push(
        `/chat?message=${encodeURIComponent(
          query.trim()
        )}&projectId=${projectId}`
      );
    } else {
      if (query.trim()) {
        router.push(`/chat?message=${encodeURIComponent(query.trim())}`);
        setQuery("");
      }
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="flex gap-2">
      <div
        className={cn(
          "flex bg-background gap-2 px-4 h-10 border w-full  dark:border-zinc-600 rounded-md items-center",
          "shadow-none border border-border",
          "max-w-4xl md:w-96"
        )}
      >
        {/* attachment icon */}
        {/* <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground"
        aria-label="Attach file"
      >
        <Paperclip />
      </Button> */}

        {/* multiline input */}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message to start a new chat…"
          className="flex-1 border-0 bg-transparent w-full p-0 m-0 text-sm focus:outline-none placeholder:text-muted-foreground"
        />
      </div>
      {/* send button */}
      <Button
        data-testid="send-button"
        className="h-10 border dark:border-zinc-600"
        onClick={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        Neuen Chat starten
      </Button>
    </div>
  );
}
