import { useState, useEffect } from 'react';
import { Testimonial, LandingPageConfig } from '../../lib/supabase';
import { Quote, Star } from 'lucide-react';

type TestimonialsSectionProps = {
  testimonials: Testimonial[];
  config?: LandingPageConfig['testimonials'];
};

export function TestimonialsSection({ testimonials, config }: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const layout = config?.layout || 'slider';
  const maxVisible = config?.max_visible || 3;
  const rotationEnabled = config?.rotation_enabled !== false;

  useEffect(() => {
    if (rotationEnabled && layout === 'slider' && testimonials.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [rotationEnabled, layout, testimonials.length]);

  if (layout === 'slider') {
    return (
      <section id="testimonials" className="py-20 px-6 bg-dark-800/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="mb-4 text-white">What Clients Say</h2>
          </div>
          <div className="relative">
            <div className="card-glass max-w-3xl mx-auto">
              <Quote className="w-12 h-12 text-primary-500/30 mb-6" />
              <p className="text-xl text-gray-300 mb-6" style={{ lineHeight: '1.5' }}>
                {testimonials[currentIndex]?.testimonial_text}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white text-lg">
                    {testimonials[currentIndex]?.client_name}
                  </div>
                  <div className="text-gray-400">
                    {testimonials[currentIndex]?.client_title}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: testimonials[currentIndex]?.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary-500 text-primary-500" />
                  ))}
                </div>
              </div>
            </div>
            {testimonials.length > 1 && (
              <div className="flex justify-center space-x-2 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentIndex
                        ? 'bg-primary-500 w-8'
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className="py-20 px-6 bg-dark-800/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="mb-4 text-white">What Clients Say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.slice(0, maxVisible).map((testimonial) => (
            <div key={testimonial.id} className="card-glass">
              <Quote className="w-8 h-8 text-primary-500/30 mb-4" />
              <p className="text-gray-300 mb-4" style={{ lineHeight: '1.5' }}>
                {testimonial.testimonial_text}
              </p>
              <div className="border-t border-dark-700 pt-4">
                <div className="font-semibold text-white">{testimonial.client_name}</div>
                <div className="text-sm text-gray-400">{testimonial.client_title}</div>
                <div className="flex items-center space-x-1 mt-2">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary-500 text-primary-500" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
