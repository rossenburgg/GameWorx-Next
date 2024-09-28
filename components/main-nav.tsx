"use client"

import Link from "next/link"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import { SearchInput } from "@/components/search-input"

export function MainNav() {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="hidden lg:block"> {/* Hide on mobile, show on large screens and up */}
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/" legacyBehavior passHref>
                <NavigationMenuLink className="text-sm font-medium transition-colors hover:text-primary">
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Leagues</NavigationMenuTrigger>
              <NavigationMenuContent>
                {/* Add league content here */}
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Tournaments</NavigationMenuTrigger>
              <NavigationMenuContent>
                {/* Add tournament content here */}
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Search input - visible on all screen sizes */}
      <div className="flex-grow max-w-md mx-4">
        <SearchInput />
      </div>
    </div>
  )
}