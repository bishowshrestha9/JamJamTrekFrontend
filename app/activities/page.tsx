'use client';

import { useState, useEffect } from 'react';
import { getActivities, type Activity } from '@/lib/api';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import { MapPin, Clock, Users, ImageIcon, Filter } from 'lucide-react';
import Footer from '../components/Footer';

export default function ActivitiesPage() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'duration'>('price-low');

    // Get unique categories from activities
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const response = await getActivities({ is_active: true });
                // Handle multiple response formats
                let activityData = [];
                if (Array.isArray(response)) {
                    activityData = response;
                } else if (response && Array.isArray(response.data)) {
                    activityData = response.data;
                } else if (response && response.data && typeof response.data === 'object') {
                    activityData = response.data.activities || response.data.items || [];
                }

                setActivities(activityData);
                setFilteredActivities(activityData);

                // Extract unique categories
                const uniqueCategories = [...new Set(activityData.map((a: Activity) => a.category))] as string[];
                setCategories(uniqueCategories);
            } catch (error) {
                console.error('Error fetching activities:', error);
                setActivities([]);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, []);

    useEffect(() => {
        let filtered = [...activities];

        // Apply category filter
        if (filterCategory !== 'all') {
            filtered = filtered.filter(activity => activity.category === filterCategory);
        }

        // Apply sorting
        if (sortBy === 'price-low') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high') {
            filtered.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'duration') {
            filtered.sort((a, b) => {
                const aHours = parseInt(a.duration) || 0;
                const bHours = parseInt(b.duration) || 0;
                return aHours - bHours;
            });
        }

        setFilteredActivities(filtered);
    }, [filterCategory, sortBy, activities]);

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
            <section className="bg-green-600 text-white py-16 pt-24">
                <div className="max-w-7xl mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-bold mb-3">Adventure Activities</h1>
                    <p className="text-lg">Experience thrilling adventures beyond trekking - from paragliding to white water rafting</p>
                </div>
            </section>

            {/* Filter & Sort Section */}
            <section className="bg-white border-b border-green-200">
                <div className="max-w-7xl mx-auto px-6 py-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Filter className="w-4 h-4 text-gray-600" />
                        <h2 className="text-base font-semibold text-gray-900">Filters & Sorting</h2>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 md:items-end">
                        {/* Category Filter */}
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-2">Category</label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setFilterCategory('all')}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${filterCategory === 'all'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    All
                                </button>
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setFilterCategory(category)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${filterCategory === category
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sort By */}
                        <div className="md:w-56">
                            <label className="block text-xs font-medium text-gray-600 mb-2">Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'price-low' | 'price-high' | 'duration')}
                                className="w-full px-3 py-1.5 text-sm border border-green-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent cursor-pointer"
                            >
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="duration">Duration</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-3 text-xs text-gray-500">
                        Showing <span className="font-semibold text-gray-700">{filteredActivities.length}</span> activities
                    </div>
                </div>
            </section>

            {/* Activities Grid */}
            <section className="py-8">
                <div className="max-w-7xl mx-auto px-6">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                        </div>
                    ) : filteredActivities.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-xl text-gray-600">No activities found matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredActivities.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="card-neumorphic overflow-hidden hover:shadow-none transition-all duration-300 cursor-pointer"
                                >
                                    {/* Image */}
                                    <div className="relative h-48 bg-green-100">
                                        {activity.featured_image_url ? (
                                            <Image
                                                src={activity.featured_image_url}
                                                alt={activity.title}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                                <ImageIcon className="w-12 h-12" strokeWidth={1.5} />
                                            </div>
                                        )}

                                        {/* Category badge on top right */}
                                        <div className="absolute top-3 right-3">
                                            <span className="bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold">
                                                {activity.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <h3 className="text-base font-bold text-gray-900 mb-3 line-clamp-1">
                                            {activity.title}
                                        </h3>

                                        {/* Location & Duration */}
                                        <div className="space-y-1.5 text-xs text-gray-600 mb-3">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                                <span>{activity.location}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                                                <span>{activity.duration}</span>
                                            </div>
                                            {activity.max_participants && (
                                                <div className="flex items-center gap-1.5">
                                                    <Users className="w-3.5 h-3.5 flex-shrink-0" />
                                                    <span>Max {activity.max_participants} people</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Description */}
                                        {activity.description && (
                                            <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                                                {activity.description}
                                            </p>
                                        )}

                                        {/* Price & Difficulty */}
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <div>
                                                <span className="text-xl font-bold text-green-700">
                                                    {activity.price}
                                                </span>
                                                <span className="text-xs text-gray-500"> /person</span>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded text-xs font-medium ${getDifficultyColor(activity.difficulty)}`}>
                                                {activity.difficulty}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
            <Footer />
        </div>
    );
}
