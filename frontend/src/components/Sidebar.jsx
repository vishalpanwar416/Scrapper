import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu, X, Globe, Package, History, Home, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/websites', label: 'Websites', icon: Globe },
    { href: '/products', label: 'Products', icon: Package },
    { href: '/logs', label: 'Logs', icon: History },
  ];

  const isActive = (href) => router.pathname === href;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar - Fixed on mobile, relative on desktop */}
      <aside className={`w-64 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6 flex flex-col shrink-0 transform transition-transform duration-300 ${
        // Desktop: relative positioning with flex display
        'relative hidden md:flex md:translate-x-0 md:z-auto'
      } ${
        // Mobile: fixed positioning with toggle
        'fixed md:relative left-0 top-0 z-40 md:left-auto md:top-auto'
      } ${
        // Mobile toggle state
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Logo */}
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              S
            </div>
            <div>
              <h1 className="text-xl font-bold">Scrapper</h1>
              <p className="text-xs text-gray-400">Web Scraping</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 mb-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-6 left-6 right-6">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 mb-3"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            <span className="font-medium">{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
          </button>

          {/* Footer Info */}
          <div className="pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-400">Version 2.0</p>
            <p className="text-xs text-gray-500">Built with Next.js</p>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
