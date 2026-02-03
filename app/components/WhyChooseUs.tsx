'use client';

import { Shield, Users, Award, Globe, Heart, Map } from 'lucide-react';

export default function WhyChooseUs() {
    const features = [
        {
            icon: Shield,
            title: 'Safety First',
            description: 'Your safety is our top priority with experienced guides and comprehensive insurance coverage.',
            color: 'text-green-700',
            bgColor: 'bg-green-50'
        },
        {
            icon: Users,
            title: 'Expert Guides',
            description: 'Local experts with years of experience ensuring you get the most authentic trekking experience.',
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            icon: Award,
            title: 'Best Value',
            description: 'Competitive pricing without compromising on quality. Get the best bang for your buck.',
            color: 'text-green-700',
            bgColor: 'bg-green-50'
        },
        {
            icon: Globe,
            title: 'Local Knowledge',
            description: 'Deep understanding of local culture, terrain, and hidden gems off the beaten path.',
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            icon: Heart,
            title: 'Personalized Service',
            description: 'Small group sizes and customized itineraries tailored to your preferences and fitness level.',
            color: 'text-green-700',
            bgColor: 'bg-green-50'
        },
        {
            icon: Map,
            title: 'Proven Track Record',
            description: 'Hundreds of successful treks and satisfied adventurers from around the world.',
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        }
    ];

    return (
        <section className="py-20 bg-[var(--background)]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Why Choose Us
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        We&apos;re committed to providing unforgettable adventures with the highest standards of safety and service
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="card-neumorphic p-6 group"
                        >
                            <div className={`${feature.bgColor} w-14 h-14 rounded-xl flex items-center justify-center mb-4 border border-green-200 group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon className={`w-7 h-7 ${feature.color}`} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
