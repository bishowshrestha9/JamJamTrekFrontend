import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import StatsSection from './components/StatsSection';
import FeaturedTreks from './components/FeaturedTreks';
import WhyChooseUs from './components/WhyChooseUs';
import Testimonials from './components/Testimonials';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        <StatsSection />
        <FeaturedTreks />
        <WhyChooseUs />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
