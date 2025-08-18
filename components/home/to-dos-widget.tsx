"use client";
import React, { useEffect, useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Todo } from "@/lib/db/schema";
import type { User } from "next-auth";
import { useWidgetState } from "@/lib/hooks/use-widget-state";

interface ToDosWidgetProps {
  user: User | undefined;
}

const ToDosWidget = ({ user }: ToDosWidgetProps) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { isMinimized, toggleMinimized } = useWidgetState("todos");

  useEffect(() => {
    if (user?.id) {
      loadTodos();
    }
  }, [user?.id]);

  const loadTodos = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch("/api/todos");
      if (!response.ok) throw new Error("Failed to fetch todos");
      const fetchedTodos = await response.json();
      setTodos(fetchedTodos);
    } catch (error) {
      console.error("Failed to load todos:", error);
    }
  };

  const addTodo = async () => {
    const trimmed = input.trim();
    if (!trimmed || !user?.id) return;

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });

      if (!response.ok) throw new Error("Failed to create todo");
      const newTodo = await response.json();
      setTodos([newTodo, ...todos]);
      setInput("");
      inputRef.current?.focus();
    } catch (error) {
      console.error("Failed to create todo:", error);
    }
  };

  const toggleTodo = async (id: string) => {
    try {
      const todo = todos.find((t) => t.id === id);
      if (!todo) return;

      const response = await fetch("/api/todos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, done: !todo.done }),
      });

      if (!response.ok) throw new Error("Failed to update todo");
      const updatedTodo = await response.json();
      setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)));
    } catch (error) {
      console.error("Failed to update todo:", error);
    }
  };

  const removeTodo = async (id: string) => {
    try {
      const response = await fetch("/api/todos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error("Failed to delete todo");
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") addTodo();
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="border">
      <CardHeader
        className="p-4 flex flex-row items-center justify-between cursor-pointer"
        onClick={toggleMinimized}
      >
        <CardTitle className="text-lg flex items-center gap-2">
          Deine Aufgaben
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          aria-label={isMinimized ? "Aufgaben anzeigen" : "Aufgaben ausblenden"}
        >
          {isMinimized ? (
            <ChevronDown className="size-5" />
          ) : (
            <ChevronUp className="size-5" />
          )}
        </Button>
      </CardHeader>
      {!isMinimized && (
        <CardContent className="flex-1 flex flex-col gap-4 p-4 pt-0">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Neues To-Do..."
              className="flex-1"
              aria-label="Neues To-Do hinzufügen"
              autoComplete="off"
              maxLength={80}
            />
            <Button
              variant="default"
              onClick={(e) => {
                e.stopPropagation();
                addTodo();
              }}
              disabled={!input.trim()}
              aria-label="To-Do hinzufügen"
            >
              <Plus className="size-5" />
            </Button>
          </div>
          <div className="overflow-y-auto flex-1 pr-1">
            {todos.length === 0 ? (
              <div className="text-muted-foreground text-sm mt-8 text-center select-none">
                🎉 Keine offenen To-Dos!
              </div>
            ) : (
              <ul className="space-y-1">
                {todos.map((todo) => (
                  <li
                    key={todo.id}
                    className={cn(
                      "flex items-center max-w-[26rem] break-words whitespace-normal justify-between group rounded px-2 py-1 transition-colors",
                      todo.done ? "bg-muted/50" : "hover:bg-muted/40"
                    )}
                  >
                    <label
                      className="flex items-center gap-2 flex-1 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={todo.done}
                        onCheckedChange={() => toggleTodo(todo.id)}
                        aria-label="Erledigt"
                        className=""
                      />
                      <span
                        className={cn(
                          "text-base",
                          todo.done && "line-through text-muted-foreground"
                        )}
                      >
                        {todo.text}
                      </span>
                    </label>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTodo(todo.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Löschen"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ToDosWidget;
