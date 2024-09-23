// components/news-carousel.tsx
"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const newsItems = [
  {
    id: 1,
    title: "Beyond Weekly Challenge",
    description: "Check out all the latest improvements to craft.me",
    imageUrl: "https://images.hdqwalls.com/download/pubg-faceit-a0-2560x1440.jpg"
  },
  {
    id: 2,
    title: "New Way to Play",
    description: "Discover exciting new game modes",
    imageUrl: "https://images.hdqwalls.com/download/fortnite-x-prowler-c7-1920x1200.jpg"
  },
  {
    id: 3,
    title: "The Club Officially Join the Game FIFA 24",
    description: "Experience the latest in football gaming",
    imageUrl: "https://images.hdqwalls.com/download/fortnite-game-js-1920x1200.jpg"
  },
  {
    id: 4,
    title: "Nates is Reborn",
    description: "Explore the rebirth of a classic",
    imageUrl: "https://cdn.openart.ai/published/K1dwsDAN4SHjNuptYDDl/b-Cmyurl_Mqkj_1024.webp"
  },
  {
    id: 5,
    title: "The International 2024",
    description: "The biggest Dota 2 tournament of the year",
    imageUrl: "https://images.hdqwalls.com/download/fragpunk-nh-1920x1080.jpg"
  },
]

export function NewsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % newsItems.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + newsItems.length) % newsItems.length)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide()
    }, 5000)  // Change slide every 5 seconds

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="grid grid-cols-3 gap-4 h-[400px]">
      <div className="col-span-2 relative overflow-hidden rounded-lg"> {/* Added rounded-lg */}
        {newsItems.map((item, index) => (
          <div
            key={item.id}
            className={`absolute top-0 left-0 w-full h-full transition-transform duration-500 ease-in-out ${
              index === currentIndex ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <Image
              src={item.imageUrl}
              alt={item.title}
              layout="fill"
              objectFit="cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
              <h3 className="text-xl font-bold">{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          size="icon"
          className="absolute top-1/2 left-4 transform -translate-y-1/2 z-10"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="absolute top-1/2 right-4 transform -translate-y-1/2 z-10"
          onClick={nextSlide}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-rows-2 grid-cols-2 gap-4 h-full">
        {newsItems.slice(1, 5).map((item) => (
          <div key={item.id} className="relative overflow-hidden rounded-lg"> {/* Added rounded-lg */}
            <Image
              src={item.imageUrl}
              alt={item.title}
              layout="fill"
              objectFit="cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
              <h4 className="text-sm font-bold">{item.title}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}