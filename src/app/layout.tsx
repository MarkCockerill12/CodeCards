import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CosmeticProvider } from '@/components/layout/CosmeticProvider';
import { ConsentBanner } from '@/components/layout/ConsentBanner';
import { RewardOverlay } from '@/components/game/RewardOverlay';
import { Nav } from '@/components/layout/Nav';
import { ServiceWorker } from '@/components/layout/ServiceWorker';

export const metadata: Metadata = {
  title: 'CodeCards — the ultimate engineering study deck',
  description:
    'Spaced-repetition flashcards for everything in software engineering: languages, algorithms, systems, security, cloud, game dev and process. Offline, private, gamified.',
  applicationName: 'CodeCards',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-syntax="default">
      <body className="min-h-screen">
        <CosmeticProvider>
          <div className="relative z-10 flex min-h-screen flex-col">
            <Nav />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-6 md:pb-10">
              {children}
            </main>
          </div>
          <ConsentBanner />
          <RewardOverlay />
          <ServiceWorker />
        </CosmeticProvider>
      </body>
    </html>
  );
}
