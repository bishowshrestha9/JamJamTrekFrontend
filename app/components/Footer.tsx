import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-green-200 py-12">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Company Info */}
                    <div>
                        <div className="flex items-center mb-4">
                            <div className="relative w-48 h-16">
                                <Image
                                    src="/logo.png"
                                    alt="JamJam Trek Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm">
                            We are the experts in Nepal trekking and adventure activities in Nepal.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-lg mb-4 text-gray-900">Quick Links</h3>
                        <ul className="space-y-2 text-gray-600">
                            <li><Link href="/" className="hover:text-green-600 transition-colors cursor-pointer">Home</Link></li>
                            <li><Link href="/treks" className="hover:text-green-600 transition-colors cursor-pointer">Treks</Link></li>
                            <li><Link href="/activities" className="hover:text-green-600 transition-colors cursor-pointer">Activities</Link></li>
                            <li><Link href="/blog" className="hover:text-green-600 transition-colors cursor-pointer">Blog</Link></li>
                            <li><Link href="/reviews" className="hover:text-green-600 transition-colors cursor-pointer">Reviews</Link></li>
                        </ul>
                    </div>

                    {/* Contact Us */}
                    <div>
                        <h3 className="font-semibold text-lg mb-4 text-gray-900">Contact Us</h3>
                        <ul className="space-y-2 text-gray-600 text-sm">
                            <li className="flex items-start gap-2">
                                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                Kathmandu, Kathmandu, Nepal
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="w-5 h-5 flex-shrink-0" />
                                +977 1234567890
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="w-5 h-5 flex-shrink-0" />
                                info@jamjamtrek.com
                            </li>
                        </ul>
                    </div>

                    {/* Follow Us */}
                    <div>
                        <h3 className="font-semibold text-lg mb-4 text-gray-900">Follow Us</h3>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 bg-gray-200 hover:bg-green-600 text-gray-700 hover:text-white hover:scale-110 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer border border-green-200">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-gray-200 hover:bg-green-600 text-gray-700 hover:text-white hover:scale-110 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer border border-green-200">
                                <Instagram className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-green-200 pt-8 text-center text-gray-600 text-sm">
                    <p>© 2025 JamJam Trek. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
