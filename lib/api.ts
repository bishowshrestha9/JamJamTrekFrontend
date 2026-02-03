const API_BASE_URL = 'http://161.97.167.73:8001/api';

export interface Trek {
    id: number;
    title: string;
    data_type: 'trek' | 'package';
    location: string;
    price: number;
    currency: string;
    duration: string;
    difficulty: string;
    type: string;
    distance_km: number;
    description?: string;
    images?: string[];
    is_featured: boolean;
    is_active: boolean;
    trek_days: string[];
    created_at: string;
    updated_at: string;
}

export interface Activity {
    id: number;
    title: string;
    location: string;
    price: number;
    currency: string;
    duration: string;
    difficulty: string;
    category: string;
    min_age?: number;
    max_participants?: number;
    description?: string;
    inclusions?: string;
    requirements?: string;
    featured_image?: string;
    featured_image_url?: string;
    is_featured: boolean;
    is_active: boolean;
    season?: string;
    created_at: string;
    updated_at: string;
}

export interface Review {
    id: number;
    name: string;
    email: string;
    review: string;
    comment?: string;
    rating: number;
    status: boolean;
    trek?: string;
    trek_name?: string;
    activity_name?: string;
    created_at: string;
}

export interface Blog {
    id: number;
    title: string;
    subtitle?: string;
    description: string;
    excerpt?: string;
    author?: string;
    slug: string;
    is_active: boolean;
    image?: string;
    image_url?: string;
    content?: Array<{ heading: string; paragraph: string }>;
    conclusion?: string;
    created_at: string;
    updated_at: string;
}

// Treks API
export const getTreks = async (params?: { data_type?: 'trek' | 'package'; is_active?: boolean; is_featured?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.data_type) queryParams.append('data_type', params.data_type);
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active ? '1' : '0');
    if (params?.is_featured !== undefined) queryParams.append('is_featured', params.is_featured ? '1' : '0');

    const url = `${API_BASE_URL}/treks${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch treks');
    const data = await response.json();

    // Return the treks array from the nested structure
    if (data.success && data.data && Array.isArray(data.data.treks)) {
        return data.data.treks;
    }
    return data;
};

export const getTrek = async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/treks/${id}`);
    if (!response.ok) throw new Error('Failed to fetch trek');
    return response.json();
};

// Activities API
export const getActivities = async (params?: { category?: string; is_active?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active ? '1' : '0');

    const url = `${API_BASE_URL}/activities${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch activities');
    const data = await response.json();

    // Return the activities array from the nested structure
    if (data.success && data.data && Array.isArray(data.data.activities)) {
        return data.data.activities;
    }
    return data;
};

export const getActivity = async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/activities/${id}`);
    if (!response.ok) throw new Error('Failed to fetch activity');
    return response.json();
};

// Reviews API
export const getLatestReviews = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/reviews/latest`);
        if (!response.ok) {
            console.warn('Latest reviews API returned error status:', response.status);
            return { data: [] };
        }
        return response.json();
    } catch (error) {
        console.warn('Failed to fetch latest reviews:', error);
        return { data: [] };
    }
};

export const getPublishableReviews = async (perPage: number = 8) => {
    try {
        const response = await fetch(`${API_BASE_URL}/reviews/publishable?per_page=${perPage}`);
        if (!response.ok) {
            console.warn('Reviews API returned error status:', response.status);
            return { data: [] };
        }
        return response.json();
    } catch (error) {
        console.warn('Failed to fetch publishable reviews:', error);
        return { data: [] };
    }
};

export const submitReview = async (data: {
    name: string;
    email: string;
    review: string;
    rating: number;
    status?: boolean;
}) => {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to submit review');
    return response.json();
};

export const getReviewStats = async () => {
    const response = await fetch(`${API_BASE_URL}/reviews/stats`);
    if (!response.ok) throw new Error('Failed to fetch review stats');
    return response.json();
};

// Blogs API
export const getBlogs = async (params?: { is_published?: boolean; per_page?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.is_published !== undefined) queryParams.append('is_published', String(params.is_published));
    if (params?.per_page) queryParams.append('per_page', String(params.per_page));

    const url = `${API_BASE_URL}/blogs${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch blogs');
    return response.json();
};

export const getBlog = async (slug: string) => {
    const response = await fetch(`${API_BASE_URL}/blogs/${slug}`);
    if (!response.ok) throw new Error('Failed to fetch blog');
    return response.json();
};

export const getTotalBlogs = async () => {
    const response = await fetch(`${API_BASE_URL}/blogs/total`);
    if (!response.ok) throw new Error('Failed to fetch total blogs');
    return response.json();
};

// Authentication APIs
export const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Login failed');
    }

    return data;
};

export const logout = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Logout failed');
    }

    return response.json();
};

export const verifyAuth = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/me`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Authentication verification failed');
    }

    return response.json();
};

// Create Functions
export const createTrek = async (token: string, formData: FormData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/treks`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create trek');
        }

        return data;
    } catch (error) {
        console.error('Error creating trek:', error);
        throw error;
    }
};

export const updateTrek = async (token: string, id: number, formData: FormData) => {
    try {
        // Laravel requires _method field for PUT with FormData
        formData.append('_method', 'PUT');

        const response = await fetch(`${API_BASE_URL}/treks/${id}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update trek');
        }

        return data;
    } catch (error) {
        console.error('Error updating trek:', error);
        throw error;
    }
};

export const deleteTrek = async (token: string, id: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/treks/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete trek');
        }

        return data;
    } catch (error) {
        console.error('Error deleting trek:', error);
        throw error;
    }
};



export const createBlog = async (token: string, formData: FormData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/blogs`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create blog');
        }

        return data;
    } catch (error) {
        console.error('Error creating blog:', error);
        throw error;
    }
};
