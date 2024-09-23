"use client"
// components/VideoPlayer.tsx
import React, { useState } from 'react';
import Image from 'next/image';

const VideoPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative w-full" style={{ paddingTop: '56.25%' }}> {/* 16:9 Aspect Ratio */}
      <Image
         src="https://images.hdqwalls.com/download/fragpunk-2024-ps-1908x1074.jpg"
         alt="Game Stream"
        layout="fill"
        objectFit="cover"
      />
      {!isPlaying && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <button 
            className="bg-red-500 text-white px-4 py-2 rounded-full"
            onClick={() => setIsPlaying(true)}
          >
            Watch
          </button>
        </div>
      )}
      {isPlaying && (
        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black to-transparent">
          <div className="flex items-center justify-between">
            <button className="text-white">Pause</button>
            <input type="range" className="w-full mx-4" />
            <button className="text-white">Fullscreen</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;