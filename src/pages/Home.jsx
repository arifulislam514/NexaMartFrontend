import React from 'react';
import HeroCarousel from '../components/Home/Carousel/HeroCarousel';
import Features from '../components/Home/Features';
import CategoryList from '../components/Home/Categories/CategoryList';
import DiscountSection from '../components/Home/Discount/DiscountSection';
import LatestProducts from '../components/Home/LatestProducts';

/**
 * Home Page Component
 * Main landing page strictly replicating nexamart_app.tsx design:
 * 1. Hero Banner / Carousel
 * 2. Value Propositions (Features)
 * 3. Shop by Category Grid
 * 4. Promotional Flash Sale / Discount Banner
 * 5. Trending / Latest Products Showcase
 */
const Home = () => {
  return (
    <div className="animate-fade-in">
      {/* 1. Hero Banner Slider */}
      <HeroCarousel />

      {/* 2. Value Propositions / Trust Badges */}
      <Features />

      {/* 3. Categories Grid */}
      <CategoryList title="Shop by Category" />

      {/* 4. Promotional Flash Sale Banner with Countdown */}
      <DiscountSection />

      {/* 5. Trending Now Products */}
      <LatestProducts
        title="Trending Now"
        subtitle="Our most popular products this week."
        limit={8}
      />
    </div>
  );
};

export default Home;
