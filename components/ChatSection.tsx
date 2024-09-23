// components/ChatSection.tsx
import React from 'react';
import Image from 'next/image';

const ChatSection = () => {
  const messages = [
    { id: 1, user: 'Alice', avatar: 'https://i.pravatar.cc/40?img=1', message: 'Great stream!' },
    { id: 2, user: 'Bob', avatar: 'https://i.pravatar.cc/40?img=2', message: 'Who do you think will win?' },
    { id: 3, user: 'Charlie', avatar: 'https://i.pravatar.cc/40?img=3', message: 'SWAT looks strong today!' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto space-y-4 mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-start space-x-2">
            <Image src={msg.avatar} alt={msg.user} width={24} height={24} className="rounded-full" />
            <div>
              <p className="font-bold text-sm">{msg.user}</p>
              <p className="text-sm">{msg.message}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex space-x-2">
        <input type="text" placeholder="Type a message" className="flex-grow bg-gray-700 rounded px-2 py-1 text-sm" />
        <button className="bg-blue-500 text-white px-4 py-1 rounded text-sm">Send</button>
      </div>
    </div>
  );
};

export default ChatSection;