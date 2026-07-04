import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  //standalone output keeps the docker image small
  output: "standalone",
};

export default nextConfig;
