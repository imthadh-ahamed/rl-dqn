
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DQN Web App - Interactive Reinforcement Learning',
  description: 'Train and visualize Deep Q-Network agents for CartPole-v1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link href="/" className="flex items-center px-4 text-lg font-medium text-gray-900 hover:text-blue-600">
                  DQN Web App
                </Link>
              </div>
              <div className="flex space-x-8">
                <Link href="/" className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900">
                  Home
                </Link>
                <Link href="/simulation" className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900">
                  Simulation
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
