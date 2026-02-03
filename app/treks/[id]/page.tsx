'use client';

import { useState, useEffect, use } from 'react';
import { getTreks, type Trek } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { MapPin, Calendar, ArrowLeft, ChevronLeft, ChevronRight, X, Phone, Mail, MessageCircle, Mountain } from 'lucide-react';

export default function TrekDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [trek, setTrek] = useState<Trek | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showContactModal, setShowContactModal] = useState(false);

    useEffect(() => {
        const fetchTrek = async () => {
            try {
                const response = await getTreks({ is_active: true });
                // Handle API response structure
                let trekData = [];
                if (Array.isArray(response)) {
                    trekData = response;
                } else if (response && Array.isArray(response.data)) {
                    trekData = response.data;
                } else if (response && response.data && typeof response.data === 'object') {
                    trekData = response.data.treks || response.data.items || [];
                }

                // Find the specific trek by ID
                const foundTrek = trekData.find((t: Trek) => t.id === parseInt(resolvedParams.id));

                // Parse trek_days if it's a string (handle multiple layers of escaping)
                if (foundTrek && foundTrek.trek_days) {
                    if (typeof foundTrek.trek_days === 'string') {
                        let current: any = foundTrek.trek_days;
                        let maxAttempts = 10; // Prevent infinite loops
                        
                        while (maxAttempts > 0 && typeof current === 'string') {
                            try {
                                const parsed = JSON.parse(current);
                                if (Array.isArray(parsed)) {
                                    foundTrek.trek_days = parsed;
                                    break;
                                }
                                current = parsed;
                                maxAttempts--;
                            } catch (e) {
                                console.error('Error parsing trek_days:', e);
                                foundTrek.trek_days = [];
                                break;
                            }
                        }
                        
                        if (maxAttempts === 0) {
                            console.warn('Trek days parsing exhausted max attempts');
                            foundTrek.trek_days = [];
                        }
                    }
                }

                setTrek(foundTrek || null);
            } catch (error) {
                console.error('Error fetching trek:', error);
                setTrek(null);
            } finally {
                setLoading(false);
            }
        };

        fetchTrek();
    }, [resolvedParams.id]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const getDifficultyColor = (difficulty: string) => {
        const lower = difficulty.toLowerCase();
        if (lower.includes('easy')) return 'bg-green-100 text-green-700';
        if (lower.includes('moderate')) return 'bg-yellow-100 text-yellow-700';
        if (lower.includes('challenging') || lower.includes('hard')) return 'bg-red-100 text-red-700';
        return 'bg-gray-100 text-gray-700';
    };

    const nextImage = () => {
        const totalImages = trek?.images?.length || 0;
        if (totalImages > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % totalImages);
        }
    };

    const prevImage = () => {
        const totalImages = trek?.images?.length || 0;
        if (totalImages > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
        }
    };

    // Get all images
    const getAllImages = () => {
        const imageUrls: string[] = trek?.images ? [...trek.images] : [];
        console.log('Trek ID:', trek?.id);
        console.log('Images array:', trek?.images);
        console.log('All images combined:', imageUrls);
        return imageUrls;
    };

    const allImages = trek ? getAllImages() : [];
    const hasMultipleImages = allImages.length > 1;

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Navbar />

            {loading ? (
                <div className="text-center py-40 mt-20">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
            ) : !trek ? (
                <div className="text-center py-40 mt-20">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Trek Not Found</h1>
                    <p className="text-gray-600 mb-8">The trek you&apos;re looking for doesn&apos;t exist.</p>
                    <Link href="/treks" className="text-green-700 hover:text-green-800 font-medium">
                        ← Back to Treks
                    </Link>
                </div>
            ) : (
                <>
                    {/* Header */}
                    <div className="bg-white border-b border-green-200 mt-20">
                        <div className="max-w-7xl mx-auto px-6 py-6">
                            <Link
                                href="/treks"
                                className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium mb-6 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Treks
                            </Link>

                            <div className="flex items-start justify-between gap-6 flex-wrap">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${trek.data_type === 'trek' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {trek.data_type}
                                        </span>
                                        <span className={`px-3 py-1 rounded text-xs font-medium ${getDifficultyColor(trek.difficulty)}`}>
                                            {trek.difficulty}
                                        </span>
                                    </div>

                                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                        {trek.title}
                                    </h1>

                                    <div className="flex items-center gap-6 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            <span>{trek.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>{trek.duration}</span>
                                        </div>
                                        {trek.distance_km && (
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">{trek.distance_km} km</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-sm text-gray-500 mb-1">From</div>
                                    <div className="text-3xl font-bold text-green-700">
                                        {trek.price}
                                    </div>
                                    <div className="text-sm text-gray-500">{trek.currency} per person</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image Slider */}
                    {allImages.length > 0 ? (
                        <div className="relative bg-gray-900">
                            <div className="relative h-[500px] max-w-7xl mx-auto">
                                {allImages.map((imageUrl, index) => (
                                    <div
                                        key={index}
                                        className={`absolute inset-0 transition-opacity duration-500 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                                            }`}
                                    >
                                        <Image
                                            src={imageUrl}
                                            alt={`${trek.title} - Image ${index + 1}`}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>
                                ))}

                                {/* Navigation Arrows */}
                                {hasMultipleImages && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 z-10"
                                            aria-label="Previous image"
                                        >
                                            <ChevronLeft className="w-6 h-6 text-gray-900" />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 z-10"
                                            aria-label="Next image"
                                        >
                                            <ChevronRight className="w-6 h-6 text-gray-900" />
                                        </button>
                                    </>
                                )}

                                {/* Dots Indicator */}
                                {hasMultipleImages && (
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                        {allImages.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentImageIndex(index)}
                                                className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentImageIndex
                                                    ? 'bg-white w-8'
                                                    : 'bg-white/50 hover:bg-white/75'
                                                    }`}
                                                aria-label={`Go to image ${index + 1}`}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Image Counter */}
                                {hasMultipleImages && (
                                    <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-10">
                                        {currentImageIndex + 1} / {allImages.length}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="relative bg-gradient-to-br from-gray-900 to-gray-800">
                            <div className="relative h-[500px] max-w-7xl mx-auto flex items-center justify-center">
                                <div className="text-center text-white">
                                    <Mountain className="w-24 h-24 mx-auto mb-4 opacity-50" />
                                    <p className="text-xl font-semibold">No images available</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <article className="max-w-7xl mx-auto px-6 py-12">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Description */}
                                {trek.description && (
                                    <div className="card-neumorphic p-6">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
                                        <p className="text-gray-700 leading-relaxed">
                                            {trek.description}
                                        </p>
                                    </div>
                                )}

                                {/* Trek Days Itinerary */}
                                {trek.trek_days && Array.isArray(trek.trek_days) && trek.trek_days.length > 0 && (
                                    <div className="card-neumorphic p-6">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Itinerary</h2>
                                        <div className="space-y-3">
                                            {trek.trek_days.map((day, index: number) => (
                                                <div key={index} className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-semibold text-sm">
                                                        {index + 1}
                                                    </div>
                                                    <p className="text-gray-700 pt-1">{day}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar */}
                            <div className="lg:col-span-1">
                                <div className="card-neumorphic p-6 sticky top-24">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Trek Details</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-sm text-gray-500 mb-1">Duration</div>
                                            <div className="font-semibold text-gray-900">{trek.duration}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500 mb-1">Difficulty</div>
                                            <div className="font-semibold text-gray-900">{trek.difficulty}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500 mb-1">Location</div>
                                            <div className="font-semibold text-gray-900">{trek.location}</div>
                                        </div>
                                        {trek.distance_km && (
                                            <div>
                                                <div className="text-sm text-gray-500 mb-1">Distance</div>
                                                <div className="font-semibold text-gray-900">{trek.distance_km} km</div>
                                            </div>
                                        )}
                                        <div className="pt-4 border-t">
                                            <div className="text-sm text-gray-500 mb-1">Price</div>
                                            <div className="text-2xl font-bold text-green-700">
                                                {trek.price}
                                            </div>
                                            <div className="text-sm text-gray-500">{trek.currency} per person</div>
                                        </div>
                                        <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors duration-200 mt-4" onClick={() => setShowContactModal(true)}>
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </article>
                </>
            )}

            {/* Contact Modal */}
            {showContactModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowContactModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-zoom-in" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="bg-green-600 text-white p-6 rounded-t-2xl relative">
                            <button
                                onClick={() => setShowContactModal(false)}
                                className="absolute top-4 right-4 text-white/90 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <h2 className="text-2xl font-bold mb-2">Contact Us</h2>
                            <p className="text-green-50 text-sm">Get in touch to book your adventure</p>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            <div className="text-center pb-4 border-b">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Book?</h3>
                                <p className="text-gray-600 text-sm">Reach out to us through any of these channels</p>
                            </div>

                            <div className="space-y-4">
                                {/* Phone */}
                                <a
                                    href="tel:+9779851234567"
                                    className="flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all duration-200 group"
                                >
                                    <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-600 transition-colors">
                                        <Phone className="w-6 h-6 text-green-700 group-hover:text-white" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">Call Us</div>
                                        <div className="text-gray-600 text-sm">+977 985-1234567</div>
                                    </div>
                                </a>

                                {/* Email */}
                                <a
                                    href="mailto:info@jamjamtrek.com"
                                    className="flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all duration-200 group"
                                >
                                    <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-600 transition-colors">
                                        <Mail className="w-6 h-6 text-green-700 group-hover:text-white" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">Email Us</div>
                                        <div className="text-gray-600 text-sm">info@jamjamtrek.com</div>
                                    </div>
                                </a>

                                {/* WhatsApp */}
                                <a
                                    href="https://wa.me/9779851234567"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all duration-200 group"
                                >
                                    <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-500 transition-colors">
                                        <MessageCircle className="w-6 h-6 text-green-600 group-hover:text-white" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">WhatsApp</div>
                                        <div className="text-gray-600 text-sm">Chat with us instantly</div>
                                    </div>
                                </a>
                            </div>

                            <div className="pt-4 border-t">
                                <p className="text-xs text-gray-500 text-center">
                                    We typically respond within 24 hours
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
