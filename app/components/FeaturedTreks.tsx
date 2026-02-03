'use client';

import { Clock, DollarSign, MapPin, ImageIcon } from 'lucide-react';
import { getTreks, type Trek } from '@/lib/api';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function FeaturedTreks() {
    const [treks, setTreks] = useState<Trek[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTreks = async () => {
            try {
                // Fetch featured and active treks from the API
                const response = await getTreks({ is_active: true, is_featured: true });
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

                // Limit to 3 featured treks for homepage display
                setTreks(trekData.slice(0, 3));
                console.log('Featured Treks loaded:', trekData.slice(0, 3));
                console.log('Image URLs:', trekData.slice(0, 3).map((t: Trek) => ({
                    id: t.id,
                    featured: t.featured_image_url,
                    images: t.image_urls
                })));
            } catch (error) {
                console.error('Error fetching treks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTreks();
    }, []);

    return (
        <section className="py-20 bg-[var(--background)]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Featured Treks
                    </h2>
                    <p className="text-lg text-gray-600">
                        Discover our most popular trekking adventures in the Himalayas
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {treks.map((trek) => {
                                // Get the first available image
                                const imageUrl = trek.featured_image_url ||
                                    (trek.image_urls && trek.image_urls.length > 0 ? trek.image_urls[0] : null);

                                // Get difficulty badge color
                                const getDifficultyColor = (difficulty: string) => {
                                    const lower = difficulty.toLowerCase();
                                    if (lower.includes('easy') || lower.includes('moderate')) return 'bg-green-100 text-green-800';
                                    if (lower.includes('challenging') || lower.includes('difficult')) return 'bg-amber-100 text-amber-800';
                                    if (lower.includes('strenuous') || lower.includes('hard')) return 'bg-red-100 text-red-800';
                                    return 'bg-gray-100 text-gray-800';
                                };

                                return (
                                    <div
                                        key={trek.id}
                                        className="card-neumorphic overflow-hidden group"
                                    >
                                        <div className="relative h-64 bg-green-100 overflow-hidden">
                                            {imageUrl ? (
                                                <Image
                                                    src={imageUrl}
                                                    alt={trek.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                                    <ImageIcon className="w-20 h-20" strokeWidth={1.5} />
                                                </div>
                                            )}
                                            <div className="absolute top-4 right-4">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize border border-white/50 ${getDifficultyColor(trek.difficulty)}`}>
                                                    {trek.difficulty}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{trek.title}</h3>
                                            
                                            <div className="flex items-center gap-1 text-gray-600 mb-3">
                                                <MapPin className="w-4 h-4" />
                                                <span className="text-sm">{trek.location}</span>
                                            </div>

                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                                {trek.short_description || trek.description}
                                            </p>

                                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{trek.duration}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <DollarSign className="w-4 h-4" />
                                                    <span className="font-semibold text-green-700">{trek.price}</span>
                                                </div>
                                            </div>

                                            <Link
                                                href={`/treks/${trek.id}`}
                                                className="block w-full bg-green-600 hover:bg-green-700 text-white text-center px-6 py-3 rounded-xl font-medium transition-all duration-200 border-2 border-green-500"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="text-center mt-12">
                            <Link 
                                href="/treks"
                                className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 border-2 border-green-500 hover:scale-105"
                            >
                                View All Treks
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
