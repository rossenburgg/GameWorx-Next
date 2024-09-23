// lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from "@/hooks/use-toast"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function showToast(title: string, description?: string, variant: "default" | "destructive" = "default") {
  toast({
    title,
    description,
    variant,
  })
}

export function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleString()
  }