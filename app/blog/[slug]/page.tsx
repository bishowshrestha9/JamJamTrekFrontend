'use client';

import { useState, useEffect, use } from 'react';
import { getBlog } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Calendar, User, ArrowLeft } from 'lucide-react';

// Extended Blog interface to include image_url from API
interface BlogWithImageUrl {
    id: number;
    title: string;
    subtitle?: string;
    description: string;
    excerpt?: string;
    author?: string;
    slug: string;
    is_active: boolean;
    image?: string;
    image_url?: string; // Full URL from API
    content?: Array<{ heading: string; paragraph: string }>;
    conclusion?: string;
    created_at: string;
    updated_at: string;
}

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = use(params);
    const [blog, setBlog] = useState<BlogWithImageUrl | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await getBlog(resolvedParams.slug);
                // Handle API response structure
                const blogData = response.data || response;
                setBlog(blogData);
            } catch (error) {
                console.error('Error fetching blog:', error);
                setBlog(null);
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
    }, [resolvedParams.slug]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Navbar />

            {loading ? (
                <div className="text-center py-40 pt-20">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
            ) : !blog ? (
                <div className="text-center py-40 mt-20">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Blog Not Found</h1>
                    <p className="text-gray-600 mb-8">The blog post you&apos;re looking for doesn&apos;t exist.</p>
                    <Link href="/blog" className="text-green-700 hover:text-green-800 font-medium">
                        ← Back to Blog
                    </Link>
                </div>
            ) : (
                <>
                    {/* Hero Header with Featured Image */}
                    <div className="relative pt-24 bg-gray-900 overflow-hidden">
                        {/* Background Image with Overlay */}
                        {blog.image_url && (
                            <div className="relative h-96 mb-8 rounded-xl overflow-hidden">
                                <Image
                                    src={blog.image_url}
                                    alt={blog.title}
                                    fill
                                    className="object-cover opacity-30"
                                    unoptimized
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-900/70 to-gray-900"></div>
                            </div>
                        )}

                        {/* Header Content */}
                        <div className="relative max-w-4xl mx-auto px-6 py-16">
                            <Link
                                href="/blog"
                                className="inline-flex items-center gap-2 text-green-300 hover:text-green-200 font-medium mb-8 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Blog
                            </Link>

                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                                {blog.title}
                            </h1>

                            {blog.subtitle && (
                                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                                    {blog.subtitle}
                                </p>
                            )}

                            {/* Meta Info */}
                            <div className="flex items-center gap-6 text-sm text-gray-300">
                                {blog.author && (
                                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                                        <User className="w-4 h-4" />
                                        <span className="font-medium">{blog.author}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(blog.created_at)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Content */}
                    <article className="max-w-4xl mx-auto px-6 py-12">
                        <div className="card-neumorphic p-8 md:p-12">
                            {/* Excerpt/Introduction */}
                            {blog.excerpt && (
                                <div className="bg-green-50 border-l-4 border-green-600 p-6 mb-10 rounded-r-xl">
                                    <p className="text-gray-700 italic leading-relaxed text-lg">
                                        &ldquo;{blog.excerpt}&rdquo;
                                    </p>
                                </div>
                            )}

                            {/* Description */}
                            {blog.description && (
                                <div className="mb-10">
                                    <p className="text-gray-700 leading-relaxed text-lg">
                                        {blog.description}
                                    </p>
                                </div>
                            )}

                            {/* Content Sections */}
                            {blog.content && blog.content.length > 0 && (
                                <div className="space-y-10">
                                    {blog.content
                                        .filter(section => section.heading?.toLowerCase() !== 'conclusion')
                                        .map((section, index) => (
                                            <div key={index} className="space-y-4 scroll-mt-24">
                                                <h2 className="text-3xl font-bold text-gray-900 border-l-4 border-green-600 pl-4">
                                                    {section.heading}
                                                </h2>
                                                <p className="text-gray-700 leading-relaxed text-lg pl-4">
                                                    {section.paragraph}
                                                </p>
                                            </div>
                                        ))}
                                </div>
                            )}

                            {/* Conclusion */}
                            {blog.conclusion && (
                                <div className="mt-12 pt-8 border-t-2 border-green-200">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                        Conclusion
                                    </h2>
                                    <p className="text-gray-700 leading-relaxed text-lg bg-gray-50 p-6 rounded-xl">
                                        {blog.conclusion}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Read More Articles Button */}
                        <div className="mt-12 text-center">
                            <Link
                                href="/blog"
                                className="inline-block bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-xl font-semibold transition-all duration-200 border-2 border-green-500 hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                Read More Articles →
                            </Link>
                        </div>
                    </article>
                </>
            )}

            <Footer />
        </div>
    );
}
