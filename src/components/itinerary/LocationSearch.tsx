"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/lib/hooks/useDebounce";

interface LocationSearchResult {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
}

interface LocationSearchProps {
    onSelect: (location: { name: string; lat: number; lon: number }) => void;
}

export function LocationSearch({ onSelect }: LocationSearchProps) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("");
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<LocationSearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    const debouncedQuery = useDebounce(query, 500);

    useEffect(() => {
        if (!debouncedQuery) {
            setResults([]);
            return;
        }

        const searchLocation = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedQuery)}`,
                    {
                        headers: {
                            'User-Agent': 'TripPlannerApp/1.0'
                        }
                    }
                );
                const data = await response.json();
                setResults(data);
            } catch (error) {
                console.error("Error searching location", error);
            } finally {
                setLoading(false);
            }
        };

        searchLocation();
    }, [debouncedQuery]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {value
                        ? results.find((result) => result.display_name === value)?.display_name.substring(0, 30) + "..."
                        : "Search location..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
                <Command shouldFilter={false}>
                    <CommandInput placeholder="Search location..." value={query} onValueChange={setQuery} />
                    <CommandList>
                        {loading && <CommandItem>Loading...</CommandItem>}
                        {!loading && results.length === 0 && <CommandEmpty>No location found.</CommandEmpty>}
                        <CommandGroup>
                            {results.map((result) => (
                                <CommandItem
                                    key={result.place_id}
                                    value={result.display_name}
                                    onSelect={(currentValue) => {
                                        setValue(currentValue);
                                        onSelect({
                                            name: result.display_name,
                                            lat: parseFloat(result.lat),
                                            lon: parseFloat(result.lon),
                                        });
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === result.display_name ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {result.display_name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
