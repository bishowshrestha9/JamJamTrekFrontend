import Link from 'next/link';

export default function CTASection() {
    return (
        <section className="bg-green-600 py-20">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Ready for Your Adventure?
                </h2>
                <p className="text-xl text-white/90 mb-8">
                    Join thousands of travelers who have discovered the magic of the Himalayas with us
                </p>
                <Link 
                    href="/treks"
                    className="inline-block bg-white hover:bg-gray-100 text-green-600 px-8 py-4 rounded-xl text-lg font-bold transition-all duration-200 border-2 border-white hover:scale-105"
                >
                    Start Planning Your Trek
                </Link>
            </div>
        </section>
    );
}
