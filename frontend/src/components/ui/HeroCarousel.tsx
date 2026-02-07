import { useState, useEffect } from 'react';

interface HeroSlide {
  id: string;
  title?: string;
  description?: string;
  image?: string;
  content?: React.ReactNode;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showArrows?: boolean;
  showDots?: boolean;
}

export function HeroCarousel({
  slides,
  autoPlay = true,
  autoPlayInterval = 5000,
  showArrows = true,
  showDots = true,
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-play
  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
        setIsTransitioning(false);
      }, 300);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, slides.length]);

  const goToSlide = (index: number) => {
    if (index === currentIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 150);
  };

  const goToPrevious = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
      setIsTransitioning(false);
    }, 150);
  };

  const goToNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
      setIsTransitioning(false);
    }, 150);
  };

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Slide Content */}
      <div className="relative w-full h-full">
        {currentSlide.image ? (
          <div
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 ${
              isTransitioning ? 'opacity-50' : 'opacity-100'
            }`}
            style={{ backgroundImage: `url(${currentSlide.image})` }}
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br from-green-500 via-emerald-600 to-green-700 transition-opacity duration-500 ${
            isTransitioning ? 'opacity-50' : 'opacity-100'
          }`} />
        )}
        <div className={`relative z-10 flex items-center justify-center h-full p-8 transition-opacity duration-300 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}>
          {currentSlide.content || (
            <div className="text-center text-white px-4">
              {currentSlide.title && (
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  {currentSlide.title}
                </h2>
              )}
              {currentSlide.description && (
                <p className="text-lg md:text-xl lg:text-2xl max-w-2xl mx-auto leading-relaxed">
                  {currentSlide.description}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Slide anterior"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Próximo slide"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicators - Centralizados no meio */}
      {showDots && slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-2 px-4 py-2 bg-black bg-opacity-20 rounded-full backdrop-blur-sm">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'w-8 h-3 bg-white shadow-lg'
                  : 'w-3 h-3 bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
