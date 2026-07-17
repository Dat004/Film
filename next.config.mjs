import os from "node:os";

/** LAN IPv4 hosts so Network URL (http://192.168.x.x:3000) can load /_next assets in dev. */
function getLanHosts() {
  const hosts = [];
  for (const list of Object.values(os.networkInterfaces())) {
    for (const iface of list ?? []) {
      const family = iface.family;
      const isV4 = family === "IPv4" || family === 4;
      if (isV4 && !iface.internal) hosts.push(iface.address);
    }
  }
  return hosts;
}

const extraOrigins =
  process.env["ALLOWED_DEV_ORIGINS"]?.split(",")
    .map((s) => s.trim())
    .filter(Boolean) ?? [];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow development access from localhost and LAN addresses.
  allowedDevOrigins: ["127.0.0.1", "localhost", ...getLanHosts(), ...extraOrigins],

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "phimimg.com" },
      { protocol: "https", hostname: "img.phimapi.com" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer-when-downgrade" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
