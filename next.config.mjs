/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.statorium.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
<<<<<<< HEAD
=======
      {
        protocol: 'https',
        hostname: 'b.fssta.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
>>>>>>> 0fced7fac57a646d79d15a5adebe45adaee32fbd
    ],
  },
}

export default nextConfig
