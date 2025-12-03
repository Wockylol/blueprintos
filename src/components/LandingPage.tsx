import { ArrowRight, PlayCircle, Award, Users, TrendingUp, Star, Quote } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase, Testimonial } from '../lib/supabase';
import { ThemeToggle } from './ThemeToggle';

export function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      setTestimonials(data);
    }
  };

  useEffect(() => {
    if (testimonials.length > 1) {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [testimonials.length]);

  return (
    <div className="min-h-screen bg-gradient-luxury">
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-b border-light-300 dark:border-dark-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-blue rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">BlueprintOS</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
              Features
            </a>
            <a href="#testimonials" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
              Coaches
            </a>
            <a href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
              Pricing
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <button
              onClick={onGetStarted}
              className="btn-primary"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center animate-fade-in">
            <div className="inline-block mb-6 px-6 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full">
              <span className="text-primary-400 font-semibold">White-Label Coaching Platform</span>
            </div>
            <h1 className="mb-6">
              <span className="block text-white">Launch Your Own</span>
              <span className="block gradient-text">Coaching Platform in Minutes</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto" style={{ lineHeight: '1.5' }}>
              Structured transformation. Client progress tracking. Full branding control.
              <br />
              Everything you need to scale your coaching business — all in one platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button onClick={onGetStarted} className="btn-primary flex items-center space-x-2">
                <span>Start Your Coaching Business</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="btn-secondary flex items-center space-x-2">
                <PlayCircle className="w-5 h-5" />
                <span>See How It Works</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="card-glass text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-blue rounded-full mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold gradient-text mb-2">$2M+</div>
                <div className="text-gray-400">Revenue Processed</div>
              </div>
              <div className="card-glass text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-violet rounded-full mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold gradient-text mb-2">500+</div>
                <div className="text-gray-400">Active Coaches</div>
              </div>
              <div className="card-glass text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-blue rounded-full mb-4">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold gradient-text mb-2">95%</div>
                <div className="text-gray-400">Client Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-6 bg-dark-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="mb-4 text-white">Why BlueprintOS?</h2>
            <p className="text-xl text-gray-400">The only platform built for coaches who want to scale</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-glass text-center hover:shadow-glow-blue transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-blue rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6">
                1
              </div>
              <h3 className="text-2xl mb-4 text-white">Your Branded Workspace</h3>
              <p className="text-gray-400" style={{ lineHeight: '1.5' }}>
                Launch with your own subdomain, logo, and colors. White-label everything. Clients see only your brand.
              </p>
            </div>
            <div className="card-glass text-center hover:shadow-glow-violet transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-violet rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6">
                2
              </div>
              <h3 className="text-2xl mb-4 text-white">Built-In Client Tracking</h3>
              <p className="text-gray-400" style={{ lineHeight: '1.5' }}>
                Track transformation with milestones, progress bars, streaks, and visual dashboards. No external tools needed.
              </p>
            </div>
            <div className="card-glass text-center hover:shadow-glow-blue transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-blue rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6">
                3
              </div>
              <h3 className="text-2xl mb-4 text-white">Payments Built-In</h3>
              <p className="text-gray-400" style={{ lineHeight: '1.5' }}>
                Stripe Connect integration. Accept payments, manage subscriptions, track revenue — all from your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section id="testimonials" className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="mb-4 text-white">Coaches Love BlueprintOS</h2>
              <p className="text-xl text-gray-400">Join hundreds of coaches growing their businesses</p>
            </div>
            <div className="relative">
              <div className="card-glass max-w-3xl mx-auto">
                <Quote className="w-12 h-12 text-primary-500/30 mb-6" />
                <p className="text-xl text-gray-300 mb-6" style={{ lineHeight: '1.5' }}>
                  {testimonials[currentTestimonial]?.testimonial_text}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white text-lg">
                      {testimonials[currentTestimonial]?.client_name}
                    </div>
                    <div className="text-gray-400">
                      {testimonials[currentTestimonial]?.client_title}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: testimonials[currentTestimonial]?.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary-500 text-primary-500" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-center space-x-2 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentTestimonial
                        ? 'bg-primary-500 w-8'
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section id="pricing" className="py-20 px-6 bg-dark-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="mb-4 text-white">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-400">Choose the plan that fits your coaching business</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="card-glass hover:scale-105 transition-all duration-300">
              <div className="text-sm text-primary-400 font-semibold mb-2">STARTER</div>
              <div className="text-4xl font-bold text-white mb-4">$97</div>
              <div className="text-gray-400 mb-6">per month</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs text-white">✓</span>
                  </div>
                  <span className="text-gray-300">Up to 10 clients</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs text-white">✓</span>
                  </div>
                  <span className="text-gray-300">Branded subdomain</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs text-white">✓</span>
                  </div>
                  <span className="text-gray-300">Client dashboards</span>
                </li>
              </ul>
              <button onClick={onGetStarted} className="btn-secondary w-full">
                Get Started
              </button>
            </div>

            <div className="card-glass hover:scale-105 transition-all duration-300 border-2 border-primary-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-blue px-4 py-1 rounded-full text-sm font-semibold text-white">
                MOST POPULAR
              </div>
              <div className="text-sm text-primary-400 font-semibold mb-2">PRO</div>
              <div className="text-4xl font-bold text-white mb-4">$197</div>
              <div className="text-gray-400 mb-6">per month</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs text-white">✓</span>
                  </div>
                  <span className="text-gray-300">Up to 50 clients</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs text-white">✓</span>
                  </div>
                  <span className="text-gray-300">Custom domain</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs text-white">✓</span>
                  </div>
                  <span className="text-gray-300">AI landing page builder</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs text-white">✓</span>
                  </div>
                  <span className="text-gray-300">White-label branding</span>
                </li>
              </ul>
              <button onClick={onGetStarted} className="btn-primary w-full">
                Start Free Trial
              </button>
            </div>

            <div className="card-glass hover:scale-105 transition-all duration-300">
              <div className="text-sm text-primary-400 font-semibold mb-2">ENTERPRISE</div>
              <div className="text-4xl font-bold text-white mb-4">$497</div>
              <div className="text-gray-400 mb-6">per month</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs text-white">✓</span>
                  </div>
                  <span className="text-gray-300">Unlimited clients</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs text-white">✓</span>
                  </div>
                  <span className="text-gray-300">Everything in Pro</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs text-white">✓</span>
                  </div>
                  <span className="text-gray-300">Team member access</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs text-white">✓</span>
                  </div>
                  <span className="text-gray-300">API access</span>
                </li>
              </ul>
              <button onClick={onGetStarted} className="btn-secondary w-full">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="mb-6 text-white">Ready to Scale Your Coaching Business?</h2>
          <p className="text-xl text-gray-400 mb-8" style={{ lineHeight: '1.5' }}>
            Join hundreds of coaches who've launched their branded platforms. Start your 14-day free trial today.
          </p>
          <button onClick={onGetStarted} className="btn-primary flex items-center space-x-2 mx-auto">
            <span>Start Your Journey</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <footer className="border-t border-dark-700 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-blue rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">BlueprintOS</span>
              </div>
              <p className="text-gray-400">
                The white-label coaching platform built for scale.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">Privacy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-dark-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 BlueprintOS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
