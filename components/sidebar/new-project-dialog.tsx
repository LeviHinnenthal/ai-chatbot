// components/NewProjectDialog.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NewProjectDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: name.trim() }),
    });
    if (res.ok) {
      const { id } = await res.json();
      // close the dialog and redirect:
      setOpen(false);
      router.push(`/project/${id}`);
    } else {
      console.error("Failed to create project", await res.text());
      // you can also show a toast here
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Plus
          className="cursor-pointer size-4 hover:rotate-90 transition-all"
          aria-label="New project"
        />
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create new project</DialogTitle>
          <DialogDescription>Give your project a name.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
              className="col-span-3"
              required
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!name.trim()}>
              Create project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
