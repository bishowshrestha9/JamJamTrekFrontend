'use client';

import { useState, useEffect } from 'react';
import { getTreks, type Trek } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Calendar, ImageIcon, Filter } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function TreksPage() {
    const [treks, setTreks] = useState<Trek[]>([]);
    const [filteredTreks, setFilteredTreks] = useState<Trek[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<'all' | 'trek' | 'package'>('all');
    const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'duration'>('price-low');

    useEffect(() => {
        const fetchTreks = async () => {
            try {
                const response = await getTreks({ is_active: true });
                // Handle multiple response formats
                let trekData = [];
                if (Array.isArray(response)) {
                    trekData = response;
                } else if (response && Array.isArray(response.data)) {
                    trekData = response.data;
                } else if (response && response.data && typeof response.data === 'object') {
                    // If data is an object, try to get the array from common property names
                    trekData = response.data.treks || response.data.items || [];
                }

                setTreks(trekData);
                setFilteredTreks(trekData);
            } catch (error) {
                console.error('Error fetching treks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTreks();
    }, []);

    useEffect(() => {
        let filtered = [...treks];

        // Apply filter
        if (filterType !== 'all') {
            filtered = filtered.filter(trek => trek.data_type === filterType);
        }

        // Apply sorting
        if (sortBy === 'price-low') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high') {
            filtered.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'duration') {
            filtered.sort((a, b) => {
                const aDays = parseInt(a.duration) || 0;
                const bDays = parseInt(b.duration) || 0;
                return aDays - bDays;
            });
        }

        setFilteredTreks(filtered);
    }, [filterType, sortBy, treks]);

    const getDifficultyColor = (difficulty: string) => {
        const lower = difficulty.toLowerCase();
        if (lower.includes('easy')) return 'bg-green-100 text-green-700';
        if (lower.includes('moderate')) return 'bg-yellow-100 text-yellow-700';
        if (lower.includes('challenging') || lower.includes('hard')) return 'bg-red-100 text-red-700';
        return 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Navbar />
            {/* Hero Section */}
            <section className="bg-green-600 text-white py-16 pt-20">
                <div className="max-w-7xl mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-bold mb-3">Treks & Packages</h1>
                    <p className="text-lg">Discover our curated selection of trekking adventures and cultural tour packages</p>
                </div>
            </section>

            {/* Filter & Sort Section */}
            <section className="bg-white border-b border-green-200">
                <div className="max-w-7xl mx-auto px-6 py-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Filter className="w-4 h-4 text-gray-700" />
                        <h2 className="text-base font-semibold text-gray-900">Filters & Sorting</h2>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 md:items-end">
                        {/* Type Filter */}
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 mb-2">Type</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFilterType('all')}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${filterType === 'all'
                                        ? 'bg-green-600 text-white border-green-500'
                                        : 'bg-gray-200 text-gray-700 border-green-200 hover:bg-gray-300'
                                        }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilterType('trek')}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${filterType === 'trek'
                                        ? 'bg-green-600 text-white border-green-500'
                                        : 'bg-gray-200 text-gray-700 border-green-200 hover:bg-gray-300'
                                        }`}
                                >
                                    Treks
                                </button>
                                <button
                                    onClick={() => setFilterType('package')}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${filterType === 'package'
                                        ? 'bg-green-600 text-white border-green-500'
                                        : 'bg-gray-200 text-gray-700 border-green-200 hover:bg-gray-300'
                                        }`}
                                >
                                    Packages
                                </button>
                            </div>
                        </div>

                        {/* Sort By */}
                        <div className="md:w-56">
                            <label className="block text-xs font-medium text-gray-700 mb-2">Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'price-low' | 'price-high' | 'duration')}
                                className="w-full px-3 py-1.5 text-sm border border-green-200 bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent cursor-pointer text-gray-900"
                            >
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="duration">Duration</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-3 text-xs text-gray-600">
                        Showing <span className="font-semibold text-gray-900">{filteredTreks.length}</span> results
                    </div>
                </div>
            </section>

            {/* Treks Grid */}
            <section className="py-8">
                <div className="max-w-7xl mx-auto px-6">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                        </div>
                    ) : filteredTreks.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-xl text-gray-600">No treks found matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTreks.map((trek) => {
                                // Get the first available image from image_urls array (full URLs from API)
                                const imageUrl = trek.image_urls && trek.image_urls.length > 0 ? trek.image_urls[0] : null;

                                return (
                                    <Link
                                        key={trek.id}
                                        href={`/treks/${trek.id}`}
                                        className="card-neumorphic overflow-hidden hover:shadow-none transition-all duration-300 cursor-pointer block"
                                    >
                                        {/* Image */}
                                        <div className="relative h-48 bg-green-100">
                                            {imageUrl ? (
                                                <Image
                                                    src={imageUrl}
                                                    alt={trek.title}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                                    <ImageIcon className="w-12 h-12" strokeWidth={1.5} />
                                                </div>
                                            )}

                                            {/* Type badge on top right */}
                                            <div className="absolute top-3 right-3">
                                                <span className="bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold capitalize border border-green-500">
                                                    {trek.data_type}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            <h3 className="text-base font-bold text-gray-900 mb-3 line-clamp-1">
                                                {trek.title}
                                            </h3>

                                            {/* Location & Duration */}
                                            <div className="space-y-1.5 text-xs text-gray-600 mb-3">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    <span>{trek.location}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>{trek.duration}</span>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            {trek.description && (
                                                <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                                                    {trek.description}
                                                </p>
                                            )}

                                            {/* Price & Difficulty */}
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                                <div>
                                                    <span className="text-xl font-bold text-green-700">
                                                        {trek.price}
                                                    </span>
                                                    <span className="text-xs text-gray-500"> /person</span>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded text-xs font-medium ${getDifficultyColor(trek.difficulty)}`}>
                                                    {trek.difficulty}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
            <Footer />
        </div>
    );
}
