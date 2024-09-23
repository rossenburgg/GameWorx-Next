/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
             protocol: 'https',
             hostname: 'picsum.photos',
           
            },
            {
                protocol: 'https',
                hostname: 'images.hdqwalls.com',
              },
              {
                protocol: 'https',
                hostname: 'rare-gallery.com',
              },
              {
                protocol: 'https',
                hostname: 'via.placeholder.com',
              },
              {
                protocol: 'https',
                hostname: 'cdn.openart.ai',
              },
              {
                protocol: 'https',
                hostname: 'i.pravatar.cc',
              },
         ],
         
    },
  }
  
  export default nextConfig;
