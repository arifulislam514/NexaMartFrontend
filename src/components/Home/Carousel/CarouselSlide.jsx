import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

/**
 * CarouselSlide Component
 * Individual banner slide strictly based on nexamart_app.tsx Hero design.
 *
 * @param {Object} props
 * @param {Object} props.slide
 * @param {boolean} props.isActive
 */
const CarouselSlide = ({ slide, isActive }) => {
  if (!slide) return null;

  return (
    <div
      className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
        isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
      }`}
    >
      {/* Background Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${
          slide.bgGradient || 'from-indigo-950 via-indigo-900 to-indigo-700'
        } opacity-95 z-0`}
      ></div>

      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white opacity-5 blur-3xl z-0 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-500 opacity-10 blur-3xl z-0 pointer-events-none"></div>

      {/* Slide Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full flex flex-col justify-center items-center text-center py-20 lg:py-28">
        {/* Top Tag Badge */}
        {slide.tag && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-800/60 border border-indigo-400/30 text-amber-300 text-xs sm:text-sm font-semibold mb-6 backdrop-blur-md shadow-xs animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{slide.tag}</span>
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 max-w-4xl leading-tight">
          {slide.title}
        </h1>

        {/* Subtitle Description */}
        <p className="text-base sm:text-xl text-indigo-100 max-w-2xl mb-10 leading-relaxed font-normal">
          {slide.subtitle}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {slide.primaryButtonText && (
            <Link
              to={slide.primaryButtonLink || '/products'}
              className="bg-white text-indigo-900 px-8 py-4 rounded-full font-bold text-base sm:text-lg hover:bg-indigo-50 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
            >
              <span>{slide.primaryButtonText}</span>
              <ArrowRight className="w-5 h-5 text-indigo-600" />
            </Link>
          )}

          {slide.secondaryButtonText && (
            <Link
              to={slide.secondaryButtonLink || '/products'}
              className="bg-indigo-700/50 text-white border border-indigo-400/50 backdrop-blur-md px-8 py-4 rounded-full font-bold text-base sm:text-lg hover:bg-indigo-700 shadow-lg transition-all inline-flex items-center justify-center"
            >
              {slide.secondaryButtonText}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarouselSlide;
