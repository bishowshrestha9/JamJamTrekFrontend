'use client';

import { MapPin, Clock, ImageIcon } from 'lucide-react';
import { getActivities, type Activity } from '@/lib/api';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Activities() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

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
                    // If data is an object, try to get the array from common property names
                    activityData = response.data.activities || response.data.items || [];
                }

                // Limit to 2 activities for the homepage
                setActivities(activityData.slice(0, 2));
            } catch (error) {
                console.error('Error fetching activities:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, []);

    return (
        <section className="py-20 bg-[var(--background)]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Adventure Activities
                    </h2>
                    <p className="text-xl text-gray-600">
                        Experience thrilling activities beyond legendary trekking
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            {activities.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="card-neumorphic overflow-hidden hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                                >
                                    <div className="relative h-64 bg-green-100">
                                        {activity.featured_image_url ? (
                                            <Image
                                                src={activity.featured_image_url}
                                                alt={activity.title}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                                <ImageIcon className="w-20 h-20" strokeWidth={1.5} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{activity.title}</h3>

                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {activity.location}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {activity.duration}
                                            </div>
                                        </div>

                                        <p className="text-gray-600 mb-4 text-sm">
                                            {activity.description || 'Experience breathtaking views and exhilarating moments in the stunning landscapes of Nepal.'}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <div className="text-2xl font-bold text-green-700">
                                                {activity.price}
                                                <span className="text-sm text-gray-500 font-normal">/person</span>
                                            </div>
                                            <button className="bg-green-600 hover:bg-green-700 hover:scale-105 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer">
                                                Book Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="text-center mt-12">
                            <button className="bg-green-600 hover:bg-green-700 hover:scale-105 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl">
                                View All Activities
                            </button>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
