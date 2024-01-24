'use client';

import Navbar from '@/components/Navbar';
import Link from 'next/link';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import ChatHistory from './components/ChatHistory';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <div>
      <Navbar />
      <div className="mt-20">
        <div style={{ height: 'calc(100vh - 5rem)' }}>
          <header className="flex items-center justify-between px-8 h-16 bg-gray-800 text-white">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
              <h1 className="text-lg font-semibold">AI Dashboard</h1>
              <nav className="flex gap-4">
                <Link className="hover:underline" href="#">
                  Importer
                </Link>
              </nav>
            </div>
          </header>

          <main className="flex">
            <ResizablePanelGroup direction="horizontal">
              {/* Chat History - Sidebar */}
              <ResizablePanel defaultSize={20} minSize={10} maxSize={20}>
                <ChatHistory />
              </ResizablePanel>

              <ResizableHandle />
              {/* Main Content Area */}
              <ResizablePanel defaultSize={80} minSize={20}>
                {children}
              </ResizablePanel>
            </ResizablePanelGroup>
          </main>
        </div>
      </div>
    </div>
  );
}
