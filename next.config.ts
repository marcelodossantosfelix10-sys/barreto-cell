import type { NextConfig } from 'next';
import path from 'path';
import fs from 'fs';

const projectRoot = process.cwd();
const dotNext = path.resolve(projectRoot, '.next');

// Guarantee that essential manifests exist so DevServer with standalone mode never fails with ENOENT
try {
  if (!fs.existsSync(dotNext)) {
    fs.mkdirSync(dotNext, { recursive: true });
  }

  // Create symlink at root /.next if running in Cloud Build container where root is resolved
  try {
    if (!fs.existsSync('/.next')) {
      fs.symlinkSync(dotNext, '/.next');
    }
  } catch {
    // ignore
  }

  const prerenderPath = path.join(dotNext, 'prerender-manifest.json');
  if (!fs.existsSync(prerenderPath)) {
    fs.writeFileSync(
      prerenderPath,
      JSON.stringify({
        version: 4,
        routes: {},
        dynamicRoutes: {},
        notFoundRoutes: [],
        preview: {
          previewModeId: '',
          previewModeSigningKey: '',
          previewModeEncryptionKey: '',
        },
      }),
      'utf8'
    );
  }

  const routesPath = path.join(dotNext, 'routes-manifest.json');
  if (!fs.existsSync(routesPath)) {
    fs.writeFileSync(
      routesPath,
      JSON.stringify({
        version: 3,
        pages404: true,
        caseSensitive: false,
        basePath: '',
        redirects: [],
        headers: [],
        dynamicRoutes: [],
        staticRoutes: [],
        dataRoutes: [],
        rsc: {
          header: 'RSC',
          varyHeader: 'RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch',
          prefetchHeader: 'Next-Router-Prefetch',
          didPostponeHeader: 'x-nextjs-postponed',
          contentTypeHeader: 'text/x-component',
        },
        rewrites: [],
      }),
      'utf8'
    );
  }
} catch {
  // ignore
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  output: 'standalone',
  outputFileTracingRoot: projectRoot,
  transpilePackages: ['motion'],
  webpack: (config, { dev }) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
