'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (path: string) => {
        return pathname === path;
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-green-800 border-b border-green-900">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                <Link href="/" className="flex items-center">
                    <div className="relative w-16 h-16">
                        <Image
                            src="/logo.png"
                            alt="JamJam Trek Logo"
                            fill
                            className="object-contain scale-260"
                        />
                    </div>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <Link
                        href="/"
                        className={`hover:text-white/90 transition-colors cursor-pointer text-white ${isActive('/') ? 'text-white font-semibold' : ''}`}
                    >
                        Home
                    </Link>
                    <Link
                        href="/treks"
                        className={`hover:text-white/90 transition-colors cursor-pointer text-white ${isActive('/treks') ? 'text-white font-semibold' : ''}`}
                    >
                        Treks
                    </Link>
                    <Link
                        href="/blog"
                        className={`hover:text-white/90 transition-colors cursor-pointer text-white ${isActive('/blog') ? 'text-white font-semibold' : ''}`}
                    >
                        Blog
                    </Link>
                    <Link
                        href="/reviews"
                        className={`hover:text-white/90 transition-colors cursor-pointer text-white ${isActive('/reviews') ? 'text-white font-semibold' : ''}`}
                    >
                        Reviews
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center gap-4">
                    <button
                        onClick={toggleMenu}
                        className="text-white hover:text-white/90 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-green-800 border-t border-green-900">
                    <div className="px-6 py-4 space-y-3">
                        <Link
                            href="/"
                            onClick={closeMenu}
                            className={`block py-2 hover:text-white/90 transition-colors text-white ${isActive('/') ? 'text-white font-semibold' : ''}`}
                        >
                            Home
                        </Link>
                        <Link
                            href="/treks"
                            onClick={closeMenu}
                            className={`block py-2 hover:text-white/90 transition-colors text-white ${isActive('/treks') ? 'text-white font-semibold' : ''}`}
                        >
                            Treks
                        </Link>
                        <Link
                            href="/blog"
                            onClick={closeMenu}
                            className={`block py-2 hover:text-white/90 transition-colors text-white ${isActive('/blog') ? 'text-white font-semibold' : ''}`}
                        >
                            Blog
                        </Link>
                        <Link
                            href="/reviews"
                            onClick={closeMenu}
                            className={`block py-2 hover:text-white/90 transition-colors text-white ${isActive('/reviews') ? 'text-white font-semibold' : ''}`}
                        >
                            Reviews
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
