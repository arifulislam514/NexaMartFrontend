import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CarouselSlide from './CarouselSlide';

/**
 * Default promotional slides matching nexamart_app.tsx
 */
const DEFAULT_SLIDES = [
  {
    id: 1,
    tag: 'Premium Collection',
    title: (
      <>
        Elevate Your Everyday <br className="hidden md:block" />
        <span className="text-amber-400">With Premium Gear</span>
      </>
    ),
    subtitle:
      'Discover our curated collection of top-tier electronics, modern fashion, and essential home goods designed for the modern lifestyle.',
    bgGradient: 'from-indigo-950 via-indigo-900 to-indigo-700',
    primaryButtonText: 'Shop Now',
    primaryButtonLink: '/products',
    secondaryButtonText: 'View Deals',
    secondaryButtonLink: '/products?ordering=-price',
  },
  {
    id: 2,
    tag: 'Next-Gen Tech',
    title: (
      <>
        High-Performance Audio & Gadgets <br className="hidden md:block" />
        <span className="text-amber-400">Built for Creators</span>
      </>
    ),
    subtitle:
      'Active noise cancellation, studio-grade acoustics, and seamless wireless connectivity designed for uncompromised sound.',
    bgGradient: 'from-slate-950 via-indigo-950 to-slate-900',
    primaryButtonText: 'Explore Electronics',
    primaryButtonLink: '/products?category=Electronics',
    secondaryButtonText: 'Top Rated',
    secondaryButtonLink: '/products',
  },
  {
    id: 3,
    tag: 'Trending Styles',
    title: (
      <>
        Modern Minimalism <br className="hidden md:block" />
        <span className="text-amber-400">Everyday Comfort</span>
      </>
    ),
    subtitle:
      'Explore timeless essentials crafted with sustainable, high-grade materials that elevate your daily wardrobe.',
    bgGradient: 'from-indigo-900 via-violet-900 to-indigo-950',
    primaryButtonText: 'Shop Fashion',
    primaryButtonLink: '/products?category=Fashion',
    secondaryButtonText: 'Browse All',
    secondaryButtonLink: '/products',
  },
];

/**
 * HeroCarousel Component
 * Auto-advancing responsive hero slider with manual controls and pause-on-hover.
 *
 * @param {Object} props
 * @param {Array} [props.slides=DEFAULT_SLIDES]
 * @param {number} [props.autoPlayInterval=6000] - Interval in milliseconds
 */
const HeroCarousel = ({
  slides = DEFAULT_SLIDES,
  autoPlayInterval = 6000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const total = slides.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-play timer
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const timer = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(timer);
  }, [isPaused, total, autoPlayInterval, nextSlide]);

  return (
    <section
      className="relative w-full h-[520px] sm:h-[580px] lg:h-[640px] overflow-hidden bg-indigo-950 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Promotional Carousel"
    >
      {/* Slides Deck */}
      {slides.map((slide, idx) => (
        <CarouselSlide
          key={slide.id || idx}
          slide={slide}
          isActive={idx === currentIndex}
        />
      ))}

      {/* Navigation Arrows */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Indicator Dots */}
      {total > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full ${
                idx === currentIndex
                  ? 'w-8 h-2.5 bg-amber-400'
                  : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroCarousel;
