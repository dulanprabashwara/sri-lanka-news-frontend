import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.dailymirror.lk" },
      { protocol: "https", hostname: "static.dailymirror.lk" },
      { protocol: "https", hostname: "cdn.dailymirror.lk" },
      { protocol: "https", hostname: "www.newsfirst.lk" },
      { protocol: "https", hostname: "cdn.newsfirst.lk" },
      { protocol: "https", hostname: "www.hirunews.lk" },
      { protocol: "https", hostname: "cdn.hirunews.lk" },
      { protocol: "https", hostname: "island.lk" },
      { protocol: "https", hostname: "www.island.lk" },
      { protocol: "https", hostname: "www.lankadeepa.lk" },
      { protocol: "https", hostname: "cdn.lankadeepa.lk" },
      { protocol: "https", hostname: "bmkltsly13vb.compat.objectstorage.ap-mumbai-1.oraclecloud.com" },
      { protocol: "https", hostname: "divaina.lk" },
      { protocol: "https", hostname: "www.divaina.lk" },
    ],
  },
};

export default nextConfig;
