"use client";

import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";

export interface CommandAction {
  id: string;
  label: string;
  group: string;
  href?: string;
  onSelect?: () => void;
}

interface CommandPaletteProps {
  actions: CommandAction[];
}

export function CommandPalette({ actions }: CommandPaletteProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }

    function onOpenRequest() {
      setOpen(true);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("fundflow:open-command-palette", onOpenRequest);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("fundflow:open-command-palette", onOpenRequest);
    };
  }, []);

  const groups = Array.from(new Set(actions.map((action) => action.group)));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-xl" showClose={false}>
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
          <Command.Input
            placeholder="Search modules, pages, and actions..."
            className="h-12 w-full border-b border-border bg-transparent px-4 text-sm outline-none"
          />
          <Command.List className="max-h-80 overflow-auto p-2">
            <Command.Empty className="px-2 py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>
            {groups.map((group) => (
              <Command.Group key={group} heading={group}>
                {actions
                  .filter((action) => action.group === group)
                  .map((action) => (
                    <Command.Item
                      key={action.id}
                      value={action.label}
                      className="cursor-pointer rounded-md px-2 py-2 text-sm aria-selected:bg-muted"
                      onSelect={() => {
                        setOpen(false);
                        if (action.onSelect) {
                          action.onSelect();
                        } else if (action.href) {
                          router.push(action.href);
                        }
                      }}
                    >
                      {action.label}
                    </Command.Item>
                  ))}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
