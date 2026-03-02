"use client";

import * as React from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

import { useCompanyStore } from "@/app/store/company-store";
import { INDICES } from "@/app/data/indices";
import { useRouter } from "next/navigation";

export function GlobalCommandPalette() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const companies = useCompanyStore();
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      )
        return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const [query, setQuery] = React.useState("");

  const filteredCompanies = React.useMemo(() => {
    if (!query) return [];

    const q = query.toLowerCase();

    return companies.companies
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.symbol.toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [query, companies]);

  const filteredIndices = React.useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();

    return INDICES.filter((i) => i.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen} className="shadow-none">
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Search stocks or indices..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>Search equity stocks or indexes.</CommandEmpty>

          {filteredCompanies.length > 0 && (
            <CommandGroup heading="Stocks">
              {filteredCompanies.map((c: any) => (
                <CommandItem
                  key={c.symbol}
                  onSelect={() => {
                    setOpen(false);
                    setQuery("");
                    router.push(`/dashboard/equity-info/${c.symbol}`);
                  }}
                >
                  <span>{c.name}</span>
                  <span className="ml-auto text-muted-foreground">
                    {c.symbol}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {filteredIndices.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Indices">
                {filteredIndices.map((i) => (
                  <CommandItem
                    key={i.name}
                    onSelect={() => {
                      setOpen(false);
                      setQuery("");

                      router.push(
                        `/dashboard/equity-stockindices/${encodeURIComponent(i.name)}`,
                      );
                    }}
                  >
                    <span>{i.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
