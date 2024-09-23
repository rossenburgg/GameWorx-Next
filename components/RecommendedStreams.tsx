// components/RecommendedStreams.tsx
import React from 'react';
import Image from 'next/image';

const RecommendedStreams = () => {
  const streams = [
    { 
      id: 1, 
      title: 'CS:GO Tournament', 
      viewers: 1200,
      image: 'https://images.hdqwalls.com/download/prestige-battle-lion-leona-qw-1908x1074.jpg'
    },
    { 
      id: 2, 
      title: 'Fortnite Battle', 
      viewers: 980,
      image: 'https://images.hdqwalls.com/download/deadpool-and-wolverine-fortnite-5k-cs-1908x1074.jpg'
    },
    { 
      id: 3, 
      title: 'League of Legends', 
      viewers: 1500,
      image: 'https://images.hdqwalls.com/download/mission-zero-game-9d-1908x1074.jpg'
    },
    { 
        id: 4, 
        title: 'Pubg Mobile Championship', 
        viewers: 1350,
        image: 'https://images.hdqwalls.com/download/pubg-helmet-guy-immortality-ao-1908x1074.jpg'
      },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {streams.map((stream) => (
        <div key={stream.id} className="relative">
          <div className="relative rounded-lg overflow-hidden">
            <Image
              src={stream.image}
              alt={stream.title}
              width={240}
              height={135}
              layout="responsive"
            />
            <div className="absolute top-1 right-1 bg-red-600 text-white px-1 py-0.5 text-xs rounded">
              LIVE
            </div>
          </div>
          <div className="mt-1">
            <h3 className="font-bold text-sm">{stream.title}</h3>
            <p className="text-xs text-gray-400">{stream.viewers} viewers</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecommendedStreams;