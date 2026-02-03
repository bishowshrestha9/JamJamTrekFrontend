'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mountain, Activity, FileText, MessageSquare, LogOut, Star, X, Plus } from 'lucide-react';
import { verifyAuth as verifyAuthAPI, createTrek, createBlog, updateTrek, deleteTrek } from '@/lib/api';
import toast from 'react-hot-toast';

type Tab = 'overview' | 'treks' | 'blogs' | 'reviews';

export default function AdminDashboard() {
    const router = useRouter();
    const [adminEmail, setAdminEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    useEffect(() => {
        verifyAuth();
    }, []);

    const verifyAuth = async () => {
        const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
        const token = localStorage.getItem('authToken');
        const email = localStorage.getItem('adminEmail');

        if (!isLoggedIn || !token) {
            router.push('/admin/login');
            return;
        }

        try {
            const data = await verifyAuthAPI(token);
            if (data.status && data.role === 'admin') {
                setAdminEmail(email || '');
                setLoading(false);
            } else {
                handleLogout();
            }
        } catch (error) {
            console.error('Auth verification error:', error);
            handleLogout();
        }
    };

    const handleLogout = async () => {
        const token = localStorage.getItem('authToken');

        if (token) {
            try {
                await fetch('http://161.97.167.73:8001/api/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
            } catch (error) {
                console.error('Logout error:', error);
            }
        }

        localStorage.removeItem('isAdminLoggedIn');
        localStorage.removeItem('adminEmail');
        localStorage.removeItem('authToken');
        router.push('/admin/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
                    <p className="mt-4 text-gray-600">Verifying authentication...</p>
                </div>
            </div>
        );
    }

    const tabs: { id: Tab; label: string }[] = [
        { id: 'overview', label: 'Overview' },
        { id: 'treks', label: 'Treks' },
        { id: 'blogs', label: 'Blogs' },
        { id: 'reviews', label: 'Reviews' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-[#1e3a5f] text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Mountain className="w-8 h-8 text-cyan-400" />
                                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                            </div>
                            <p className="text-gray-300 text-sm">Manage your content and monitor performance</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 font-medium text-sm transition-colors duration-200 border-b-2 ${activeTab === tab.id
                                    ? 'text-cyan-500 border-cyan-500'
                                    : 'text-gray-600 border-transparent hover:text-gray-900'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {activeTab === 'overview' && <OverviewTab />}
                {activeTab === 'treks' && <TreksTab />}
                {activeTab === 'blogs' && <BlogsTab />}
                {activeTab === 'reviews' && <ReviewsTab />}
            </main>
        </div>
    );
}

// Overview Tab Component
function OverviewTab() {
    const [stats, setStats] = useState({
        treks: 0,
        blogs: 0,
        reviews: 0,
        avgRating: 0,
        approvedReviews: 0,
        pendingReviews: 0,
        featuredTreks: 0,
        publishedBlogs: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            };

            // Fetch all data in parallel
            const [treksRes, blogsRes, reviewsRes] = await Promise.all([
                fetch('http://161.97.167.73:8001/api/treks', { headers }),
                fetch('http://161.97.167.73:8001/api/blogs', { headers }),
                fetch('http://161.97.167.73:8001/api/reviews', { headers })
            ]);

            const treksData = await treksRes.json();
            const blogsData = await blogsRes.json();
            const reviewsData = await reviewsRes.json();

            // Extract data from responses - handle API format: {success: true, data: {treks: [...], pagination: {...}}}
            let treks = [];
            if (treksData.success && treksData.data && Array.isArray(treksData.data.treks)) {
                treks = treksData.data.treks;
            } else if (Array.isArray(treksData)) {
                treks = treksData;
            } else if (treksData && Array.isArray(treksData.data)) {
                treks = treksData.data;
            } else if (treksData && typeof treksData === 'object') {
                treks = treksData.treks || treksData.items || [];
            }

            let blogs = [];
            if (blogsData.success && blogsData.data && Array.isArray(blogsData.data)) {
                blogs = blogsData.data;
            } else if (Array.isArray(blogsData)) {
                blogs = blogsData;
            } else if (blogsData && Array.isArray(blogsData.data)) {
                blogs = blogsData.data;
            } else if (blogsData && typeof blogsData === 'object') {
                blogs = blogsData.blogs || blogsData.items || [];
            }

            let reviews = [];
            if (reviewsData.success && reviewsData.data && Array.isArray(reviewsData.data)) {
                reviews = reviewsData.data;
            } else if (Array.isArray(reviewsData)) {
                reviews = reviewsData;
            } else if (reviewsData && Array.isArray(reviewsData.data)) {
                reviews = reviewsData.data;
            } else if (reviewsData && typeof reviewsData === 'object') {
                reviews = reviewsData.reviews || reviewsData.items || [];
            }

            // Calculate stats
            const featuredTreks = treks.filter((t: any) => t.is_featured).length;
            const publishedBlogs = blogs.filter((b: any) => b.is_active).length;
            const approvedReviews = reviews.filter((r: any) => r.status === true || r.status === 1).length;
            const pendingReviews = reviews.filter((r: any) => r.status === false || r.status === 0).length;

            // Calculate average rating
            const validReviews = reviews.filter((r: any) => r.rating);
            const avgRating = validReviews.length > 0
                ? validReviews.reduce((sum: number, r: any) => sum + Number(r.rating), 0) / validReviews.length
                : 0;

            setStats({
                treks: treks.length,
                blogs: blogs.length,
                reviews: reviews.length,
                avgRating: Math.round(avgRating * 10) / 10,
                approvedReviews,
                pendingReviews,
                featuredTreks,
                publishedBlogs
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon={Mountain} label="Total Treks" value={stats.treks.toString()} color="text-cyan-500" bgColor="bg-cyan-50" />
                <StatCard icon={FileText} label="Blog Posts" value={stats.blogs.toString()} color="text-teal-500" bgColor="bg-teal-50" />
                <StatCard icon={MessageSquare} label="Reviews" value={stats.reviews.toString()} color="text-purple-500" bgColor="bg-purple-50" />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Review Statistics */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <h3 className="text-lg font-bold text-gray-900">Review Statistics</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">Average Rating</span>
                            <span className="font-semibold text-gray-900">{stats.avgRating.toFixed(1)} / 5.0</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">Approved Reviews</span>
                            <span className="font-semibold text-gray-900">{stats.approvedReviews}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">Pending Review</span>
                            <span className="font-semibold text-gray-900">{stats.pendingReviews}</span>
                        </div>
                    </div>
                </div>

                {/* Content Breakdown */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-teal-500" />
                        <h3 className="text-lg font-bold text-gray-900">Content Breakdown</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">Featured Treks</span>
                            <span className="font-semibold text-gray-900">{stats.featuredTreks}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">Published Blogs</span>
                            <span className="font-semibold text-gray-900">{stats.publishedBlogs}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Modal Components
interface ModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

function CreateTrekModal({ onClose, onSuccess }: ModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        data_type: 'trek',
        location: '',
        price: '',
        currency: 'USD',
        duration: '',
        difficulty: 'Moderate',
        type: 'trek',
        distance_km: '',
        description: '',
        is_featured: false,
        is_active: true
    });
    const [images, setImages] = useState<File[]>([]);
    const [trekDays, setTrekDays] = useState<string[]>(['Day 1: ']);
    const [submitting, setSubmitting] = useState(false);

    const addTrekDay = () => {
        setTrekDays([...trekDays, `Day ${trekDays.length + 1}: `]);
    };

    const removeTrekDay = (index: number) => {
        setTrekDays(trekDays.filter((_, i) => i !== index));
    };

    const updateTrekDay = (index: number, value: string) => {
        const updated = [...trekDays];
        updated[index] = value;
        setTrekDays(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                toast.error('Authentication required. Please log in again.');
                return;
            }

            const formDataToSend = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                // Convert booleans to 1 or 0 for backend
                if (typeof value === 'boolean') {
                    formDataToSend.append(key, value ? '1' : '0');
                } else {
                    formDataToSend.append(key, value.toString());
                }
            });

            // Add trek_days as JSON array
            formDataToSend.append('trek_days', JSON.stringify(trekDays));

            // Add multiple images
            images.forEach((image) => {
                formDataToSend.append('images[]', image);
            });

            await createTrek(token, formDataToSend);
            toast.success('Trek created successfully!');
            onSuccess();
        } catch (error: any) {
            console.error('Error creating trek:', error);
            toast.error(error.message || 'An error occurred while creating the trek');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="sticky top-0 bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-5 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Mountain className="w-6 h-6" />
                        Create New Trek
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1 transition-all duration-200"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 outline-none"
                                    placeholder="Enter trek title"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 outline-none"
                                    placeholder="e.g., Everest Base Camp"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                                <select
                                    value={formData.currency}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                >
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="NPR">NPR</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., 10 Days"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                                <select
                                    value={formData.difficulty}
                                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Moderate">Moderate</option>
                                    <option value="Challenging">Challenging</option>
                                    <option value="Difficult">Difficult</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
                                <input
                                    type="number"
                                    value={formData.distance_km}
                                    onChange={(e) => setFormData({ ...formData, distance_km: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                            <textarea
                                required
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Images {images.length > 0 && <span className="text-green-600 text-xs">(✓ {images.length} image{images.length > 1 ? 's' : ''} selected)</span>}
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                    if (e.target.files) {
                                        setImages(Array.from(e.target.files));
                                    }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            />
                            {images.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                            <span className="truncate flex-1">{img.name}</span>
                                            <span className="text-gray-500 ml-2">{(img.size / 1024).toFixed(1)} KB</span>
                                            <button
                                                type="button"
                                                onClick={() => setImages(images.filter((_, i) => i !== idx))}
                                                className="ml-2 text-red-500 hover:text-red-700"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.is_featured}
                                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                    className="w-4 h-4 text-cyan-500 border-gray-300 rounded focus:ring-cyan-500"
                                />
                                <span className="text-sm text-gray-700">Featured Trek</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4 text-cyan-500 border-gray-300 rounded focus:ring-cyan-500"
                                />
                                <span className="text-sm text-gray-700">Active</span>
                            </label>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-6 py-3 rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </span>
                                ) : 'Create Trek'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// Edit Trek Modal
interface EditTrekModalProps {
    trek: any;
    onClose: () => void;
    onSuccess: () => void;
}

function EditTrekModal({ trek, onClose, onSuccess }: EditTrekModalProps) {
    const [formData, setFormData] = useState({
        title: trek.title || '',
        location: trek.location || '',
        price: trek.price?.toString() || '',
        currency: trek.currency || 'USD',
        duration: trek.duration || '',
        difficulty: trek.difficulty || 'Moderate',
        type: trek.type || 'trek',
        distance_km: trek.distance_km?.toString() || '',
        data_type: trek.data_type || 'trek',
        description: trek.description || '',
        is_featured: trek.is_featured || false,
        is_active: trek.is_active !== undefined ? trek.is_active : true
    });
    const [featuredImage, setFeaturedImage] = useState<File | null>(null);
    const [images, setImages] = useState<File[]>([]);

    // Parse trek_days - handle if it comes as a string or array with multiple layers of escaping
    const parseTrekDays = (days: any): string[] => {
        if (!days) return ['Day 1: '];

        // If it's already an array, return it
        if (Array.isArray(days)) return days.length > 0 ? days : ['Day 1: '];

        // If it's a string, try to parse it recursively (might be over-escaped JSON)
        if (typeof days === 'string') {
            let current = days;
            let maxAttempts = 10; // Prevent infinite loops

            while (maxAttempts > 0 && typeof current === 'string') {
                try {
                    const parsed = JSON.parse(current);
                    if (Array.isArray(parsed)) {
                        // If we got an array, return it
                        return parsed.length > 0 ? parsed : ['Day 1: '];
                    }
                    // If parsed but not an array, continue parsing
                    current = parsed;
                    maxAttempts--;
                } catch (e) {
                    // If parsing fails, return what we have
                    if (typeof current === 'string' && current.trim()) {
                        return [current];
                    }
                    return ['Day 1: '];
                }
            }

            // If we exhausted attempts or got something weird
            return Array.isArray(current) ? current : ['Day 1: '];
        }

        return ['Day 1: '];
    };

    const [trekDays, setTrekDays] = useState<string[]>(parseTrekDays(trek.trek_days));
    const [submitting, setSubmitting] = useState(false);

    const addTrekDay = () => {
        setTrekDays([...trekDays, `Day ${trekDays.length + 1}: `]);
    };

    const removeTrekDay = (index: number) => {
        setTrekDays(trekDays.filter((_, i) => i !== index));
    };

    const updateTrekDay = (index: number, value: string) => {
        const updated = [...trekDays];
        updated[index] = value;
        setTrekDays(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                toast.error('Authentication required. Please log in again.');
                return;
            }

            const formDataToSend = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                if (typeof value === 'boolean') {
                    formDataToSend.append(key, value ? '1' : '0');
                } else {
                    formDataToSend.append(key, value.toString());
                }
            });

            formDataToSend.append('trek_days', JSON.stringify(trekDays));

            if (featuredImage) {
                formDataToSend.append('featured_image', featuredImage);
            }

            images.forEach((image) => {
                formDataToSend.append('images[]', image);
            });

            await updateTrek(token, trek.id, formDataToSend);
            toast.success('Trek updated successfully!');
            onSuccess();
        } catch (error: any) {
            console.error('Error updating trek:', error);
            toast.error(error.message || 'Failed to update trek. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-zoom-in" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white p-6 rounded-t-2xl z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">Edit Trek</h2>
                            <p className="text-cyan-50 text-sm">Update trek information</p>
                        </div>
                        <button onClick={onClose} className="text-white/90 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Same form fields as Create Trek Modal */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Currency *</label>
                                <select
                                    required
                                    value={formData.currency}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                >
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="NPR">NPR</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., 12 days"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty *</label>
                                <select
                                    required
                                    value={formData.difficulty}
                                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Moderate">Moderate</option>
                                    <option value="Challenging">Challenging</option>
                                    <option value="Difficult">Difficult</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                                <select
                                    required
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                >
                                    <option value="trek">Trekking</option>
                                    <option value="hiking">Hiking</option>
                                    <option value="expedition">Expedition</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.distance_km}
                                    onChange={(e) => setFormData({ ...formData, distance_km: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Trek Days */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">Trek Days *</label>
                                <button
                                    type="button"
                                    onClick={addTrekDay}
                                    className="text-cyan-500 hover:text-cyan-600 text-sm font-medium flex items-center gap-1"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Day
                                </button>
                            </div>
                            <div className="space-y-2">
                                {trekDays.map((day, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            required
                                            value={day}
                                            onChange={(e) => updateTrekDay(index, e.target.value)}
                                            placeholder={`Day ${index + 1}: Description`}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                        />
                                        {trekDays.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeTrekDay(index)}
                                                className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                            <textarea
                                required
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Featured Image {featuredImage && <span className="text-green-600 text-xs">(✓ Selected: {featuredImage.name})</span>}
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFeaturedImage(e.target.files?.[0] || null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            />
                            {featuredImage && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Size: {(featuredImage.size / 1024).toFixed(1)} KB
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Gallery Images {images.length > 0 && <span className="text-green-600 text-xs">(✓ {images.length} image{images.length > 1 ? 's' : ''} selected)</span>}
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                    if (e.target.files) {
                                        setImages(Array.from(e.target.files));
                                    }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            />
                            {images.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                            <span className="truncate flex-1">{img.name}</span>
                                            <span className="text-gray-500 ml-2">{(img.size / 1024).toFixed(1)} KB</span>
                                            <button
                                                type="button"
                                                onClick={() => setImages(images.filter((_, i) => i !== idx))}
                                                className="ml-2 text-red-500 hover:text-red-700"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_featured}
                                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                    className="w-4 h-4 text-cyan-500 rounded focus:ring-2 focus:ring-cyan-500"
                                />
                                <span className="text-sm text-gray-700">Featured Trek</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4 text-cyan-500 rounded focus:ring-2 focus:ring-cyan-500"
                                />
                                <span className="text-sm text-gray-700">Active</span>
                            </label>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update Trek'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function CreateActivityModal({ onClose, onSuccess }: ModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        location: '',
        price: '',
        currency: 'USD',
        duration: '',
        difficulty: 'Moderate',
        category: 'Adventure',
        min_age: '',
        max_participants: '',
        description: '',
        inclusions: '',
        requirements: '',
        season: '',
        is_featured: false,
        is_active: true
    });
    const [featuredImage, setFeaturedImage] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                toast.error('Authentication required. Please log in again.');
                return;
            }

            const formDataToSend = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                // Convert booleans to 1 or 0 for backend
                if (typeof value === 'boolean') {
                    formDataToSend.append(key, value ? '1' : '0');
                } else {
                    formDataToSend.append(key, value.toString());
                }
            });

            if (featuredImage) {
                formDataToSend.append('featured_image', featuredImage);
            }

        } catch (error: any) {
            console.error('Error creating activity:', error);
            toast.error(error.message || 'An error occurred while creating the activity');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Activity className="w-6 h-6" />
                        Create New Activity
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1 transition-all duration-200"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                                <select
                                    value={formData.currency}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="NPR">NPR</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., 3 Hours"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="Adventure">Adventure</option>
                                    <option value="Cultural">Cultural</option>
                                    <option value="Rafting">Rafting</option>
                                    <option value="Paragliding">Paragliding</option>
                                    <option value="Hiking">Hiking</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                                <select
                                    value={formData.difficulty}
                                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Moderate">Moderate</option>
                                    <option value="Challenging">Challenging</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Min Age</label>
                                <input
                                    type="number"
                                    value={formData.min_age}
                                    onChange={(e) => setFormData({ ...formData, min_age: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
                                <input
                                    type="number"
                                    value={formData.max_participants}
                                    onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
                            <input
                                type="text"
                                placeholder="e.g., All Year, Spring-Autumn"
                                value={formData.season}
                                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                            <textarea
                                required
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Inclusions</label>
                            <textarea
                                rows={2}
                                placeholder="Comma-separated items"
                                value={formData.inclusions}
                                onChange={(e) => setFormData({ ...formData, inclusions: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                            <textarea
                                rows={2}
                                placeholder="Comma-separated requirements"
                                value={formData.requirements}
                                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Featured Image {featuredImage && <span className="text-green-600 text-xs">(✓ Selected: {featuredImage.name})</span>}
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFeaturedImage(e.target.files?.[0] || null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                            {featuredImage && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Size: {(featuredImage.size / 1024).toFixed(1)} KB
                                </p>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.is_featured}
                                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <span className="text-sm text-gray-700">Featured Activity</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <span className="text-sm text-gray-700">Active</span>
                            </label>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </span>
                                ) : 'Create Activity'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function CreateBlogModal({ onClose, onSuccess }: ModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        description: '',
        excerpt: '',
        author: '',
        conclusion: '',
        slug: '',
        is_active: true
    });
    const [featuredImage, setFeaturedImage] = useState<File | null>(null);
    const [contentSections, setContentSections] = useState<Array<{ heading: string, paragraph: string }>>([
        { heading: '', paragraph: '' }
    ]);
    const [submitting, setSubmitting] = useState(false);

    const addContentSection = () => {
        setContentSections([...contentSections, { heading: '', paragraph: '' }]);
    };

    const removeContentSection = (index: number) => {
        setContentSections(contentSections.filter((_, i) => i !== index));
    };

    const updateContentSection = (index: number, field: 'heading' | 'paragraph', value: string) => {
        const updated = [...contentSections];
        updated[index][field] = value;
        setContentSections(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                toast.error('Authentication required. Please log in again.');
                return;
            }

            const formDataToSend = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                // Convert booleans to 1 or 0 for backend
                if (typeof value === 'boolean') {
                    formDataToSend.append(key, value ? '1' : '0');
                } else {
                    formDataToSend.append(key, value.toString());
                }
            });

            formDataToSend.append('content', JSON.stringify(contentSections));

            if (featuredImage) {
                formDataToSend.append('image', featuredImage);
            }

            await createBlog(token, formDataToSend);
            toast.success('Blog post created successfully!');
            onSuccess();
        } catch (error: any) {
            console.error('Error creating blog:', error);
            toast.error(error.message || 'An error occurred while creating the blog');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="sticky top-0 bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-5 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <FileText className="w-6 h-6" />
                        Create New Blog Post
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1 transition-all duration-200"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                            <input
                                type="text"
                                value={formData.subtitle}
                                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.author}
                                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="url-friendly-slug"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt *</label>
                            <textarea
                                required
                                rows={2}
                                value={formData.excerpt}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                            <textarea
                                required
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Content Sections</label>
                                <button
                                    type="button"
                                    onClick={addContentSection}
                                    className="text-sm text-teal-500 hover:text-teal-600 flex items-center gap-1"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Section
                                </button>
                            </div>
                            <div className="space-y-3">
                                {contentSections.map((section, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-600">Section {index + 1}</span>
                                            {contentSections.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeContentSection(index)}
                                                    className="text-red-500 hover:text-red-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Heading"
                                            value={section.heading}
                                            onChange={(e) => updateContentSection(index, 'heading', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                                        />
                                        <textarea
                                            rows={3}
                                            placeholder="Paragraph"
                                            value={section.paragraph}
                                            onChange={(e) => updateContentSection(index, 'paragraph', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Conclusion</label>
                            <textarea
                                rows={3}
                                value={formData.conclusion}
                                onChange={(e) => setFormData({ ...formData, conclusion: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Featured Image {featuredImage && <span className="text-green-600 text-xs">(✓ Selected: {featuredImage.name})</span>}
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFeaturedImage(e.target.files?.[0] || null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                            {featuredImage && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Size: {(featuredImage.size / 1024).toFixed(1)} KB
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4 text-teal-500 border-gray-300 rounded focus:ring-teal-500"
                                />
                                <span className="text-sm text-gray-700">Active</span>
                            </label>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-6 py-3 rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </span>
                                ) : 'Create Blog Post'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, color, bgColor }: {
    icon: any;
    label: string;
    value: string;
    color: string;
    bgColor: string;
}) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className={`${bgColor} ${color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="text-gray-600 text-sm mb-1">{label}</div>
            <div className="text-3xl font-bold text-gray-900">{value}</div>
        </div>
    );
}

// Treks Tab Component
function TreksTab() {
    const [treks, setTreks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTrek, setEditingTrek] = useState<any | null>(null);

    useEffect(() => {
        fetchTreks();
    }, []);

    const fetchTreks = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://161.97.167.73:8001/api/treks', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                console.error('Trek fetch failed with status:', response.status);
                const errorText = await response.text();
                console.error('Error response:', errorText);
                setTreks([]);
                setLoading(false);
                return;
            }

            const data = await response.json();
            console.log('Treks response:', data); // Debug log

            // Handle API response structure: {success: true, data: {treks: [...], pagination: {...}}}
            let treksData = [];
            if (data.success && data.data && Array.isArray(data.data.treks)) {
                treksData = data.data.treks;
            } else if (Array.isArray(data)) {
                treksData = data;
            } else if (data && Array.isArray(data.data)) {
                treksData = data.data;
            } else if (data && typeof data === 'object') {
                // Fallback: try to get array from common property names
                treksData = data.treks || data.items || [];
            }
            setTreks(treksData);
        } catch (error) {
            console.error('Error fetching treks:', error);
            setTreks([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTrek = async (trekId: number, trekTitle: string) => {
        if (!confirm(`Are you sure you want to delete "${trekTitle}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                toast.error('Authentication required. Please log in again.');
                return;
            }

            await deleteTrek(token, trekId);
            toast.success('Trek deleted successfully!');
            fetchTreks(); // Refresh the list
        } catch (error: any) {
            console.error('Error deleting trek:', error);
            toast.error(error.message || 'Failed to delete trek. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Manage Treks</h2>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-2.5 rounded-lg transition-colors duration-200 text-sm font-medium flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add New Trek
                </button>
            </div>

            {showCreateModal && (
                <CreateTrekModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchTreks();
                    }}
                />
            )}

            {editingTrek && (
                <EditTrekModal
                    trek={editingTrek}
                    onClose={() => setEditingTrek(null)}
                    onSuccess={() => {
                        setEditingTrek(null);
                        fetchTreks();
                    }}
                />
            )}

            <div className="space-y-4">
                {treks.map((trek) => (
                    <div key={trek.id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{trek.title}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span>{trek.location}</span>
                                    <span>•</span>
                                    <span>${trek.price} {trek.currency}</span>
                                    <span>•</span>
                                    <span className={`font-medium ${trek.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                                        {trek.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditingTrek(trek)}
                                    className="px-4 py-2 bg-white border border-cyan-500 text-cyan-500 hover:bg-cyan-50 rounded-lg transition-colors duration-200 text-sm font-medium shadow-sm"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteTrek(trek.id, trek.title)}
                                    className="px-4 py-2 bg-white border border-red-500 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 text-sm font-medium shadow-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Activities Tab Component
function ActivitiesTab() {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://161.97.167.73:8001/api/activities', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                console.error('Activities fetch failed with status:', response.status);
                const errorText = await response.text();
                console.error('Error response:', errorText);
                setActivities([]);
                setLoading(false);
                return;
            }

            const data = await response.json();
            console.log('Activities response:', data); // Debug log

            // Handle API response structure: {success: true, data: {activities: [...], pagination: {...}}}
            let activitiesData = [];
            if (data.success && data.data && Array.isArray(data.data.activities)) {
                activitiesData = data.data.activities;
            } else if (Array.isArray(data)) {
                activitiesData = data;
            } else if (data && Array.isArray(data.data)) {
                activitiesData = data.data;
            } else if (data && typeof data === 'object') {
                // Fallback: try to get array from common property names
                activitiesData = data.activities || data.items || [];
            }
            setActivities(activitiesData);
        } catch (error) {
            console.error('Error fetching activities:', error);
            setActivities([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Manage Activities</h2>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg transition-colors duration-200 text-sm font-medium flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add New Activity
                </button>
            </div>

            {showCreateModal && (
                <CreateActivityModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchActivities();
                    }}
                />
            )}

            <div className="space-y-4">
                {activities.map((activity) => (
                    <div key={activity.id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{activity.title}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span>{activity.location}</span>
                                    <span>•</span>
                                    <span>${activity.price} {activity.currency}</span>
                                    <span>•</span>
                                    <span>{activity.category}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-white border border-orange-500 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors duration-200 text-sm font-medium shadow-sm">
                                    Edit
                                </button>
                                <button className="px-4 py-2 bg-white border border-red-500 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 text-sm font-medium shadow-sm">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Blogs Tab Component
function BlogsTab() {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://161.97.167.73:8001/api/blogs', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            // Handle various response formats
            let blogsData = [];
            if (Array.isArray(data)) {
                blogsData = data;
            } else if (data && Array.isArray(data.data)) {
                blogsData = data.data;
            } else if (data && typeof data === 'object') {
                blogsData = data.blogs || data.items || [];
            }
            setBlogs(blogsData);
        } catch (error) {
            console.error('Error fetching blogs:', error);
            setBlogs([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Manage Blog Posts</h2>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-lg transition-colors duration-200 text-sm font-medium flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Create New Post
                </button>
            </div>

            {showCreateModal && (
                <CreateBlogModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchBlogs();
                    }}
                />
            )}

            <div className="space-y-4">
                {blogs.map((blog) => (
                    <div key={blog.id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{blog.title}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span>{blog.author || 'Admin'}</span>
                                    <span>•</span>
                                    <span>{formatDate(blog.created_at)}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-white border border-teal-500 text-teal-500 hover:bg-teal-50 rounded-lg transition-colors duration-200 text-sm font-medium shadow-sm">
                                    Edit
                                </button>
                                <button className="px-4 py-2 bg-white border border-red-500 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 text-sm font-medium shadow-sm">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Reviews Tab Component
function ReviewsTab() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://161.97.167.73:8001/api/reviews', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            // Handle various response formats
            let reviewsData = [];
            if (Array.isArray(data)) {
                reviewsData = data;
            } else if (data && Array.isArray(data.data)) {
                reviewsData = data.data;
            } else if (data && typeof data === 'object') {
                reviewsData = data.reviews || data.items || [];
            }
            setReviews(reviewsData);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (reviewId: number) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://161.97.167.73:8001/api/reviews/${reviewId}/approve`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                // Refresh reviews list
                fetchReviews();
            }
        } catch (error) {
            console.error('Error approving review:', error);
        }
    };

    const handleDelete = async (reviewId: number) => {
        if (!confirm('Are you sure you want to delete this review?')) {
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://161.97.167.73:8001/api/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                // Refresh reviews list
                fetchReviews();
            }
        } catch (error) {
            console.error('Error deleting review:', error);
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Manage Reviews</h2>
            </div>

            <div className="space-y-4">
                {reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">{review.name}</h3>
                                {renderStars(review.rating)}
                            </div>
                            <span className={`px-3 py-1 rounded text-xs font-medium ${review.status === true || review.status === 1
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {review.status === true || review.status === 1 ? 'Approved' : 'Pending'}
                            </span>
                        </div>
                        <p className="text-gray-700 text-sm mb-4">{review.review || review.comment || 'No review text'}</p>
                        <div className="flex gap-2">
                            {(review.status === false || review.status === 0) && (
                                <button
                                    onClick={() => handleApprove(review.id)}
                                    className="px-4 py-2 bg-white border border-green-500 text-green-500 hover:bg-green-50 rounded-lg transition-colors duration-200 text-sm font-medium shadow-sm"
                                >
                                    Approve
                                </button>
                            )}
                            <button
                                onClick={() => handleDelete(review.id)}
                                className="px-4 py-2 bg-white border border-red-500 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 text-sm font-medium shadow-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
