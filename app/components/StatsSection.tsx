import { TrendingUp, Users, Trophy, Star } from 'lucide-react';

export default function StatsSection() {
    const stats = [
        { icon: TrendingUp, value: '500+', label: 'Successful Treks' },
        { icon: Users, value: '2000+', label: 'Happy Travelers' },
        { icon: Trophy, value: '15+', label: 'Years Experience' },
        { icon: Star, value: '4.9', label: 'Average Rating' },
    ];

    return (
        <section className="bg-green-600 py-16">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, index) => {
                        const IconComponent = stat.icon;
                        return (
                            <div key={index} className="flex flex-col items-center p-6 rounded-2xl bg-green-500 border border-green-400 hover:bg-green-400 transition-all duration-300 hover:scale-105">
                                <IconComponent className="w-12 h-12 mb-3 text-white" strokeWidth={1.5} />
                                <div className="text-3xl md:text-4xl font-bold mb-1 text-white">{stat.value}</div>
                                <div className="text-sm md:text-base text-white/90">{stat.label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
