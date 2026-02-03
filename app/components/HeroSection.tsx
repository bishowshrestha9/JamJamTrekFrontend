import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection() {
    return (
        <section className="relative h-screen w-full">
            <Image
                src="/hero.jpg"
                alt="Himalayan Mountains"
                fill
                className="object-cover"
                priority
            />
            <div className="absolute inset-0 bg-black/30" />

            <div className="relative z-10 max-w-7xl mx-auto px-8 sm:px-10 lg:px-6 h-full flex flex-col justify-center">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 max-w-4xl">
                    Discover the Himalayas
                </h1>
                <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl">
                    Embark on unforgettable trekking adventures in Nepal. Experience
                    breathtaking landscapes, rich culture, and the thrill of the mountains.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        href="/treks"
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 text-center"
                    >
                        Explore Treks
                    </Link>
                    <Link
                        href="/treks"
                        className="bg-white/90 hover:bg-white text-green-600 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105 text-center"
                    >
                        View Packages
                    </Link>
                </div>
            </div>
        </section>
    );
}
