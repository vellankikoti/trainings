"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface SearchItem {
  title: string;
  description: string;
  href: string;
  type: "path" | "module" | "lesson" | "blog";
  tags?: string[];
}

const TYPE_LABELS: Record<SearchItem["type"], string> = {
  path: "Learning Path",
  module: "Module",
  lesson: "Lesson",
  blog: "Blog Post",
};

const TYPE_ICONS: Record<SearchItem["type"], string> = {
  path: "\u{1F4DA}",
  module: "\u{1F4D6}",
  lesson: "\u{1F4DD}",
  blog: "\u{270D}\u{FE0F}",
};

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Fetch search index when dialog opens
  useEffect(() => {
    if (open && items.length === 0) {
      setLoading(true);
      fetch("/api/search")
        .then((res) => res.json())
        .then((data) => {
          setItems(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [open, items.length]);

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  // Group items by type
  const grouped = items.reduce(
    (acc, item) => {
      const group = TYPE_LABELS[item.type];
      if (!acc[group]) acc[group] = [];
      acc[group].push(item);
      return acc;
    },
    {} as Record<string, SearchItem[]>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
      >
        <span>Search...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">&#8984;</span>K
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        description="Search for learning paths, modules, lessons, and blog posts"
      >
        <CommandInput placeholder="Search lessons, paths, blog posts..." />
        <CommandList>
          {loading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Loading search index...
            </div>
          ) : (
            <>
              <CommandEmpty>No results found.</CommandEmpty>
              {Object.entries(grouped).map(([group, groupItems]) => (
                <CommandGroup key={group} heading={group}>
                  {groupItems.map((item) => (
                    <CommandItem
                      key={item.href}
                      value={`${item.title} ${item.description} ${(item.tags || []).join(" ")}`}
                      onSelect={() => handleSelect(item.href)}
                    >
                      <span className="mr-2">{TYPE_ICONS[item.type]}</span>
                      <div className="flex flex-col">
                        <span>{item.title}</span>
                        {item.description && (
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {item.description}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
