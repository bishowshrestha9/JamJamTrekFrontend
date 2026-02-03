'use client';

import { getLatestReviews, type Review } from '@/lib/api';
import { useEffect, useState } from 'react';

export default function Testimonials() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await getLatestReviews();
                // Handle multiple response formats
                let reviewData = [];
                if (Array.isArray(response)) {
                    reviewData = response;
                } else if (response && Array.isArray(response.data)) {
                    reviewData = response.data;
                } else if (response && response.data && typeof response.data === 'object') {
                    // If data is an object, try to get the array from common property names
                    reviewData = response.data.reviews || response.data.items || [];
                }

                setReviews(reviewData);
            } catch (error) {
                console.error('Error fetching reviews:', error);
                // Set empty array on error to prevent UI breaking
                setReviews([]);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    return (
        <section className="py-20 bg-[var(--background)]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        What Our Travelers Say
                    </h2>
                    <p className="text-xl text-gray-600">
                        Read experiences from thousands of satisfied travelers
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">No reviews available at the moment.</p>
                        <p className="text-gray-500 text-sm mt-2">Check back soon for customer testimonials!</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {reviews.map((review) => (
                                <div
                                    key={review.id}
                                    className="card-neumorphic p-6 group cursor-pointer"
                                >
                                    <div className="flex gap-1 mb-3">
                                        {[...Array(Math.floor(review.rating))].map((_, i) => (
                                            <svg
                                                key={i}
                                                className="w-5 h-5 text-yellow-400 fill-current"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                            </svg>
                                        ))}
                                    </div>

                                    <p className="text-gray-700 mb-4 text-sm leading-relaxed line-clamp-4">
                                        &ldquo;{review.review}&rdquo;
                                    </p>

                                    <div className="border-t border-gray-200 pt-4">
                                        <p className="font-semibold text-gray-900">{review.name}</p>
                                        {review.trek && (
                                            <p className="text-sm text-gray-500">{review.trek}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="text-center mt-12">
                            <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl text-lg font-semibold transition-all duration-200 cursor-pointer border-2 border-green-500 hover:scale-105">
                                Read All Reviews
                            </button>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
