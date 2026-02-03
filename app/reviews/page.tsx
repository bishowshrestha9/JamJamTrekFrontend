'use client';

import { useState, useEffect } from 'react';
import { getPublishableReviews, submitReview, type Review } from '@/lib/api';
import Navbar from '../components/Navbar';
import { Star, Send } from 'lucide-react';
import Footer from '../components/Footer';

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        rating: 5,
        comment: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const response = await getPublishableReviews();
            // Handle multiple response formats
            let reviewData = [];
            if (Array.isArray(response)) {
                reviewData = response;
            } else if (response && Array.isArray(response.data)) {
                reviewData = response.data;
            } else if (response && response.data && typeof response.data === 'object') {
                reviewData = response.data.reviews || response.data.items || [];
            }

            setReviews(reviewData);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitMessage(null);

        try {
            await submitReview({
                name: formData.name,
                email: formData.email,
                rating: formData.rating,
                review: formData.comment
            });

            setSubmitMessage({
                type: 'success',
                text: 'Review submitted successfully! It will be published after approval.'
            });

            // Reset form
            setFormData({
                name: '',
                email: '',
                rating: 5,
                comment: ''
            });

            // Refresh reviews
            setTimeout(() => {
                fetchReviews();
            }, 1000);
        } catch (error) {
            setSubmitMessage({
                type: 'error',
                text: 'Failed to submit review. Please try again.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (rating: number, interactive: boolean = false, onRatingChange?: (rating: number) => void) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-6 h-6 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
                        onClick={() => interactive && onRatingChange?.(star)}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Navbar />
            {/* Hero Section */}
            <section className="bg-green-600 text-white py-16 pt-20">
                <div className="max-w-7xl mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-bold mb-3">Reviews & Testimonials</h1>
                    <p className="text-lg">Read what our travelers have to say about their adventures</p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-8">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Reviews List - Left Side */}
                        <div className="lg:col-span-2">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>

                            {loading ? (
                                <div className="text-center py-20">
                                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                                </div>
                            ) : reviews.length === 0 ? (
                                <div className="text-center py-20 card-neumorphic">
                                    <p className="text-xl text-gray-600">No reviews available yet.</p>
                                    <p className="text-gray-500 mt-2">Be the first to share your experience!</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {reviews.map((review) => (
                                        <div
                                            key={review.id}
                                            className="card-neumorphic p-6 hover:shadow-none transition-shadow duration-200"
                                        >
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{review.name}</h3>
                                                    {renderStars(review.rating)}
                                                </div>
                                                <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
                                            </div>

                                            {/* Review Text */}
                                            <p className="text-gray-700 mb-4">{review.comment || review.review}</p>

                                            {/* Trek/Activity Badge */}
                                            {review.trek_name && (
                                                <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded text-sm border border-green-200">
                                                    Trek: {review.trek_name}
                                                </div>
                                            )}
                                            {review.activity_name && (
                                                <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded text-sm border border-green-200">
                                                    Activity: {review.activity_name}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submit Review Form - Right Side (Sticky) */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-20 card-neumorphic p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Share Your Experience</h2>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Your name"
                                            className="w-full px-4 py-2 border border-green-200 bg-gray-100 text-gray-900 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="your@email.com"
                                            className="w-full px-4 py-2 border border-green-200 bg-gray-100 text-gray-900 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Rating */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Rating <span className="text-red-500">*</span>
                                        </label>
                                        {renderStars(formData.rating, true, (rating) => setFormData({ ...formData, rating }))}
                                    </div>

                                    {/* Review */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Your Review <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            required
                                            value={formData.comment}
                                            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                            placeholder="Share your experience..."
                                            rows={6}
                                            className="w-full px-4 py-2 border border-green-200 bg-gray-100 text-gray-900 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none"
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-green-500"
                                    >
                                        <Send className="w-5 h-5" />
                                        {submitting ? 'Submitting...' : 'Submit Review'}
                                    </button>

                                    {/* Submit Message */}
                                    {submitMessage && (
                                        <div
                                            className={`p-3 rounded-lg text-sm ${submitMessage.type === 'success'
                                                ? 'bg-green-50 text-green-700 border border-green-200'
                                                : 'bg-red-50 text-red-700 border border-red-200'
                                                }`}
                                        >
                                            {submitMessage.text}
                                        </div>
                                    )}

                                    {/* Disclaimer */}
                                    <p className="text-xs text-gray-500 text-center">
                                        Reviews are moderated and will be published after approval
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
}
