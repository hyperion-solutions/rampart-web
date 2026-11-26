import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    // Wise Old Man blocks cross-site image loads (Cross-Origin-Resource-Policy),
    // so its icons are fetched and cached by our own image service instead.
    remotePatterns: [
      { protocol: "https", hostname: "wiseoldman.net", pathname: "/img/**" },
      // Discord avatars of signed-in members.
      { protocol: "https", hostname: "cdn.discordapp.com", pathname: "/{avatars,embed/avatars}/**" },
    ],
    qualities: [75, 100],
  },
};

export default config;
