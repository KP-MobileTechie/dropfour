import type { Metadata } from 'next';
import { Sora } from 'next/font/google';
import './globals.css';

const sora = Sora({ subsets: ['latin'], variable: '--font-sora' });

export const metadata: Metadata = {
  title: 'dropfour — Connect Four vs a Minimax AI',
  description:
    'Connect Four with a minimax + alpha-beta AI (3 difficulties), local 2-player, undo, hints, and stats. No backend.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sora.variable} antialiased`}>{children}</body>
    </html>
  );
}
