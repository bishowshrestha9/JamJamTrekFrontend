'use client';

import { useState, useEffect } from 'react';
import { getBlogs, type Blog } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Calendar, User, ImageIcon } from 'lucide-react';

export default function BlogPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await getBlogs({ is_published: true });
                // Handle multiple response formats
                let blogData = [];
                if (Array.isArray(response)) {
                    blogData = response;
                } else if (response && Array.isArray(response.data)) {
                    blogData = response.data;
                } else if (response && response.data && typeof response.data === 'object') {
                    blogData = response.data.blogs || response.data.items || [];
                }

                setBlogs(blogData);
            } catch (error) {
                console.error('Error fetching blogs:', error);
                setBlogs([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Navbar />
            {/* Hero Section */}
            <section className="bg-green-600 text-white py-16 mt-20">
                <div className="max-w-7xl mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-bold mb-3">Travel Blog</h1>
                    <p className="text-lg">Stories, guides, and insights from the Himalayas</p>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="py-8">
                <div className="max-w-7xl mx-auto px-6">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                        </div>
                    ) : blogs.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-xl text-gray-600">No blog posts available at the moment.</p>
                            <p className="text-gray-500 mt-2">Check back soon for stories and guides!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {blogs.map((blog) => (
                                <Link
                                    key={blog.id}
                                    href={`/blog/${blog.slug}`}
                                    className="card-neumorphic overflow-hidden hover:shadow-none transition-all duration-300 cursor-pointer block"
                                >
                                    {/* Image */}
                                    <div className="relative h-64 pt-2">
                                        {blog.image_url ? (
                                            <Image
                                                src={blog.image_url}
                                                alt={blog.title}
                                                fill
                                                className="object-contain"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                                <ImageIcon className="w-16 h-16" strokeWidth={1.5} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        {/* Meta Info */}
                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                            {blog.author && (
                                                <div className="flex items-center gap-1">
                                                    <User className="w-4 h-4" />
                                                    <span>{blog.author}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>{formatDate(blog.created_at)}</span>
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                                            {blog.title}
                                        </h3>

                                        {/* Excerpt */}
                                        {blog.excerpt && (
                                            <p className="text-gray-600 mb-4 line-clamp-3">
                                                {blog.excerpt}
                                            </p>
                                        )}

                                        {/* Description */}
                                        {blog.description && (
                                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                                {blog.description}
                                            </p>
                                        )}

                                        {/* Read More Link */}
                                        <span className="text-green-700 font-medium hover:text-green-800 transition-colors duration-200 flex items-center gap-2 group">
                                            Read More
                                            <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
            <Footer />
        </div>
    );
}
