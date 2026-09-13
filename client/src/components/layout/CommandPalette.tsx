import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useWorkspaces } from "@/api/workspaces";
import { useAuthSession, useSignOut } from "@/api/auth";
import { useTheme } from "@/components/provider/theme-provider";
import {
  FolderOpen,
  Plus,
  BrainCircuit,
  Sun,
  Moon,
  LogOut,
  Laptop,
} from "lucide-react";

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CommandPalette({ open: controlledOpen, onOpenChange }: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const navigate = useNavigate();
  const { data: session } = useAuthSession();
  const { data: workspaces } = useWorkspaces();
  const { theme, setTheme } = useTheme();
  const signOutMutation = useSignOut();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName))) {
        e.preventDefault();
        setOpen(!isOpen);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen, setOpen]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={setOpen}
      title="Quick Navigation & Research Commands"
      description="Search workspaces, jump to research modules, or toggle workspace settings."
      className="max-w-lg border border-border bg-surface shadow-2xl rounded-2xl"
    >
      <CommandInput placeholder="Type a command or search workspaces..." />
      <CommandList className="max-h-80 py-2">
        <CommandEmpty>No results found.</CommandEmpty>

        {session?.user && workspaces && workspaces.length > 0 && (
          <CommandGroup heading="Recent Workspaces">
            {workspaces.map((ws) => (
              <CommandItem
                key={ws.id}
                onSelect={() => runCommand(() => navigate(`/workspace/${ws.id}`))}
                className="flex items-center gap-2.5 py-2 cursor-pointer"
              >
                <span className="text-base">{ws.icon || "🧠"}</span>
                <span className="font-medium text-foreground truncate flex-1">
                  {ws.title}
                </span>
                <span className="text-[10px] font-mono text-muted bg-surface-secondary px-1.5 py-0.5 rounded border border-border">
                  {ws.defaultModel}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {session?.user && <CommandSeparator className="my-1" />}

        <CommandGroup heading="Navigation">
          {session?.user && (
            <>
              <CommandItem
                onSelect={() => runCommand(() => navigate("/dashboard"))}
                className="flex items-center gap-2 py-2 cursor-pointer"
              >
                <FolderOpen className="h-4 w-4 text-accent" />
                <span>Workspaces Library</span>
                <CommandShortcut>G W</CommandShortcut>
              </CommandItem>

              <CommandItem
                onSelect={() => runCommand(() => navigate("/memories"))}
                className="flex items-center gap-2 py-2 cursor-pointer"
              >
                <BrainCircuit className="h-4 w-4 text-accent" />
                <span>Personal Knowledge & Memories</span>
                <CommandShortcut>G M</CommandShortcut>
              </CommandItem>
            </>
          )}

          {!session?.user && (
            <CommandItem
              onSelect={() => runCommand(() => navigate("/login"))}
              className="flex items-center gap-2 py-2 cursor-pointer"
            >
              <Plus className="h-4 w-4 text-accent" />
              <span>Sign In with Google</span>
            </CommandItem>
          )}
        </CommandGroup>

        <CommandSeparator className="my-1" />

        <CommandGroup heading="Preferences & Theme">
          <CommandItem
            onSelect={() => runCommand(() => setTheme("light"))}
            className="flex items-center gap-2 py-2 cursor-pointer"
          >
            <Sun className="h-4 w-4 text-amber-500" />
            <span>Switch to Warm Light Mode</span>
            {theme === "light" && <span className="text-[10px] font-mono text-accent ml-auto">Active</span>}
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => setTheme("dark"))}
            className="flex items-center gap-2 py-2 cursor-pointer"
          >
            <Moon className="h-4 w-4 text-zinc-400" />
            <span>Switch to Technical Dark Mode</span>
            {theme === "dark" && <span className="text-[10px] font-mono text-accent ml-auto">Active</span>}
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => setTheme("system"))}
            className="flex items-center gap-2 py-2 cursor-pointer"
          >
            <Laptop className="h-4 w-4 text-muted" />
            <span>System Preference</span>
          </CommandItem>
        </CommandGroup>

        {session?.user && (
          <>
            <CommandSeparator className="my-1" />
            <CommandGroup heading="Account">
              <CommandItem
                onSelect={() => runCommand(() => signOutMutation.mutate())}
                className="flex items-center gap-2 py-2 text-error cursor-pointer"
              >
                <LogOut className="h-4 w-4 text-error" />
                <span>Sign Out</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
