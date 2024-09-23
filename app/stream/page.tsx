import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Image from 'next/image';
import VideoPlayer from '@/components/VideoPlayer';
import ChatSection from '@/components/ChatSection';
import RecommendedStreams from '@/components/RecommendedStreams';
import { CoinsIcon, GamepadIcon, TicketCheckIcon, Tv2Icon } from 'lucide-react';

export default function StreamPage() {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto p-4 flex flex-col lg:flex-row">
        {/* Left sidebar */}
        <aside className="w-full lg:w-1/5 pr-4 mb-4 lg:mb-0 flex flex-col">
          <Card className="bg-gray-800 mb-4">
            <CardContent className="p-4">
              <div className="flex items-center mb-4">
                <Image src="https://i.pravatar.cc/100" alt="Profile" width={50} height={50} className="rounded-full mr-2" />
                <div>
                  <h2 className="font-bold">Rossenburg</h2>
                  <p className="text-sm text-gray-400">3.54 XBoosts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 flex-grow">
            <CardContent className="p-4">
              <nav className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <span className="mr-2"><GamepadIcon /></span> Matches
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <span className="mr-2"><Tv2Icon /></span> Streaming
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <span className="mr-2"><TicketCheckIcon /></span>My Wagers
                </Button>
                {/* Add more navigation items */}
              </nav>
            </CardContent>
          </Card>
        </aside>

        {/* Main content */}
        <main className="w-full lg:w-3/5 px-4">
          <VideoPlayer />
          <Card className="bg-gray-800 mt-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <button className="text-gray-400 hover:text-white text-sm">
                  ← Back to streams
                </button>
              </div>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-xl font-bold">Pumping account go brothers!</h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Image src="https://i.pravatar.cc/24" alt="Jacob Jones" width={24} height={24} className="rounded-full" />
                    <span>GameWorx</span>
                    <span>CS:GO</span>
                    <span>EDUCATION</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="flex items-center"><span className="text-green-500 mr-1">●</span> 1406</span>
                  <span className="flex items-center"><span className="text-red-500 mr-1">●</span> 23</span>
                  <Button variant="outline" className="bg-red-500 text-white">Like</Button>
                  <Button variant="outline">Report</Button>
                  <Button variant="outline">💬</Button>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex space-x-4">
                <div className="flex-1 bg-blue-900 rounded-lg p-4">
                  <div className="flex items-center">
                    <Image src="https://images.hdqwalls.com/download/super-bowl-lviii-2024-fd-1912x1075.jpg" alt="SWAT Logo" width={40} height={40} className="mr-4" />
                    <div className="flex-grow">
                      <h3 className="font-bold">SWAT</h3>
                      <p className="text-sm">1 / 2</p>
                    </div>
                    <div className="text-xl font-bold">1.4x</div>
                  </div>
                </div>
                <div className="flex-1 bg-orange-900 rounded-lg p-4">
                  <div className="flex items-center">
                    <Image src="https://images.hdqwalls.com/download/roman-reigns-4k-bd-1912x1075.jpg" alt="Terrorists Logo" width={40} height={40} className="mr-4" />
                    <div className="flex-grow">
                      <h3 className="font-bold">Terrorists</h3>
                      <p className="text-sm">8 / 16</p>
                    </div>
                    <div className="text-xl font-bold">4.4x</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Right sidebar */}
        <aside className="w-full lg:w-1/5 pl-4 mt-4 lg:mt-0 flex flex-col">
          <Card className="bg-gray-800 mb-4">
            <CardHeader>
              <CardTitle>My Bets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Winner: SWAT</span>
                  <span>1.7x</span>
                </div>
                <Input type="number" placeholder="Amount" className="bg-gray-700" />
                <div className="grid grid-cols-4 gap-2">
                  {[1, 5, 10, 25].map((value) => (
                    <Button key={value} variant="outline" size="sm">{value}</Button>
                  ))}
                </div>
                <div className="flex justify-between text-sm">
                  <span>Overall coefficient</span>
                  <span>2.7x</span>
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">Confirm</Button>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 flex-grow flex flex-col">
            <CardHeader>
              <CardTitle>Chat</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-grow flex flex-col">
              <ChatSection />
            </CardContent>
          </Card>
        </aside>
      </div>
      <div className="container mx-auto px-4 py-2">
        <h2 className="text-xl font-bold mb-4">Recommended for you</h2>
        <RecommendedStreams />
      </div>
    </div>
  );
}