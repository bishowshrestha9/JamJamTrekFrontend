'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { login } from '@/lib/api';

export default function AdminLogin() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Call the backend API for authentication
            const data = await login(formData.email, formData.password);

            if (data.status && data.token) {
                // Store admin session and token
                localStorage.setItem('isAdminLoggedIn', 'true');
                localStorage.setItem('adminEmail', formData.email);
                localStorage.setItem('authToken', data.token);

                // Redirect to admin dashboard
                router.push('/admin/dashboard');
            } else {
                setError(data.message || 'Invalid email or password');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen bg-[#1a2332] flex items-center justify-center px-4 py-8 relative">
            {/* Back to Homepage Button */}
            <Link
                href="/"
                className="absolute top-6 left-6 flex items-center gap-2 text-white hover:text-cyan-400 transition-colors duration-200"
            >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back to Homepage</span>
            </Link>

            <div className="w-full max-w-sm">
                {/* Logo and Header */}
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <Image
                            src="/logo.png"
                            alt="JamJam Trek"
                            width={150}
                            height={50}
                            className="object-contain"
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-1">Admin Login</h1>
                    <p className="text-gray-400 text-sm">Sign in to manage your content</p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-xl shadow-xl p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-gray-700 font-medium mb-1.5 text-sm">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="admin@jamjamtrek.com"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-gray-700 font-medium mb-1.5 text-sm">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-cyan-400 hover:bg-cyan-500 text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>

                        {/* Demo Info */}
                        <p className="text-center text-gray-500 text-xs mt-3">
                            Demo: Use any email and password to login
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
