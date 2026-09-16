const isGithubActions = process.env.GITHUB_ACTIONS || false;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: isGithubActions ? "/AgriSmart_SIH_2026" : "",
  assetPrefix: isGithubActions ? "/AgriSmart_SIH_2026" : "",
};

export default nextConfig;
