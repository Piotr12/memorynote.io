import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The site is a static export: the build produces plain HTML, CSS, and JS
  // in out/, and nginx serves them on port 80. There is no server runtime.
  output: "export",
  distDir: "out",
  // Export routes as directories with an index.html, so nginx serves
  // /design-preview/ natively without a custom location block.
  trailingSlash: true,
};

export default nextConfig;
