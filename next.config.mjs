/** @type {import('next').NextConfig} */
import bundleAnalyzer from "@next/bundle-analyzer";
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});
const nextConfig = {
  env: {
    WIELDY_IMAGE_PATH: "/assets/images",
  },
  images: {
    localPatterns: [
      {
        pathname: "/assets/images/**",
        search: "",
      },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
