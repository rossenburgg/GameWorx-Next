// components/search-input.tsx
"use client"

import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react'

export function SearchInput() {
  return (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input placeholder="Search..." className="pl-8 w-[200px] lg:w-[300px]" />
    </div>
  )
}