// components/header.tsx
"use client"

import { useState } from "react"
import { NavMain } from "./nav-main"  
import { UserNav } from "./user-nav"  
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export function Header({ navItems, searchResults }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="flex items-center justify-between p-2 sm:p-4 bg-gray-800 text-white">
      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <div className="hidden md:block">
          <NavMain 
            items={navItems} 
            searchResults={searchResults}
          />
        </div>
      </div>
      <UserNav />
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
          <div className="fixed inset-y-0 left-0 z-50 h-full w-3/4 bg-gray-800 p-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <NavMain 
              items={navItems} 
              searchResults={searchResults}
              className="mt-8"
            />
          </div>
        </div>
      )}
    </header>
  )
}