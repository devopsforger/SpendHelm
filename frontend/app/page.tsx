import Navigation from '../components/Navigation';
import HeroSection from '../components/HeroSection';
import ValueSection from '../components/ValueSection';
import ProductPreview from '../components/ProductPreview';
import TrustSection from '../components/TrustSection';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <ValueSection />
      <ProductPreview />
      <TrustSection />
      <CTASection />
      <Footer />
    </div>
  );
}