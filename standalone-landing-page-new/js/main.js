// Market Genie Landing Page JavaScript

// Features data
const features = [
  {
    icon: 'User',
    title: 'Lead Capture & Management',
    description: 'Automatically capture leads from multiple sources and organize them in a unified dashboard for easy management and follow-up.'
  },
  {
    icon: 'MessageSquare',
    title: 'AI-Powered Conversations',
    description: 'Engage prospects with intelligent chat automation that learns from interactions and provides personalized responses.'
  },
  {
    icon: 'TrendingUp',
    title: 'Performance Analytics',
    description: 'Track conversion rates, engagement metrics, and ROI with detailed analytics and reporting tools.'
  },
  {
    icon: 'Target',
    title: 'Smart Targeting',
    description: 'Use advanced algorithms to identify and target your ideal customers based on behavior and demographics.'
  },
  {
    icon: 'Zap',
    title: 'Workflow Automation',
    description: 'Streamline your sales process with automated workflows that nurture leads and close deals faster.'
  },
  {
    icon: 'Shield',
    title: 'Data Security',
    description: 'Enterprise-grade security ensures your customer data is protected with encryption and compliance standards.'
  },
  {
    icon: 'Clock',
    title: '24/7 Support',
    description: 'Round-the-clock customer support to help you maximize your results and resolve any issues quickly.'
  },
  {
    icon: 'Smartphone',
    title: 'Mobile Optimization',
    description: 'Access all features on any device with our fully responsive design and native mobile applications.'
  },
  {
    icon: 'BarChart3',
    title: 'Real-time Insights',
    description: 'Monitor campaign performance and lead activity in real-time with live dashboards and instant notifications.'
  }
];

// Pricing plans data with correct Stripe URLs
const pricingPlans = [
  {
    name: 'Professional',
    price: '$79',
    period: 'per month',
    description: 'Ideal for growing businesses',
    popular: true,
    features: [
      'Up to 10,000 leads per month',
      'Advanced AI conversations',
      'Priority support',
      'Advanced analytics & reporting',
      'Custom integrations',
      'Unlimited team members',
      'A/B testing tools',
      'Lead scoring'
    ],
    buttonText: 'Buy Now - $79/mo',
    buttonClass: 'gradient-bg text-white hover:opacity-90',
    buttonLink: 'https://buy.stripe.com/4gM00j7zj17eeSwdGdaVa0v'
  },
  {
    name: 'Lifetime',
    price: '$300',
    period: 'one-time payment',
    description: 'One-time payment, yours forever',
    popular: false,
    features: [
      'Unlimited contacts',
      'Unlimited emails',
      'White-label solution',
      'Multi-tenant management',
      'Custom AI training',
      'Advanced web scraping',
      'Dedicated account manager',
      'Custom integrations',
      'Lifetime updates'
    ],
    buttonText: 'Get Lifetime Access',
    buttonClass: 'bg-green-600 hover:bg-green-700 text-white',
    buttonLink: 'https://buy.stripe.com/5kQeVd4n74jq39O1XvaVa0v'
  },
  {
    name: 'Free Starter',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out the platform',
    popular: false,
    features: [
      'Up to 100 leads per month',
      'Basic chat automation',
      'Email support',
      'Standard analytics',
      'Mobile app access',
      'Community support'
    ],
    buttonText: 'Start Free',
    buttonClass: 'bg-gray-700 hover:bg-gray-600',
    buttonLink: 'https://market-genie-f2d41.web.app/free-signup'
  }
];

// Testimonials data
const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Marketing Director',
    company: 'Digital Growth Co.',
    avatar: 'SJ',
    text: 'Market Genie increased our lead generation by 400% and cut our marketing costs in half. The AI automation is incredible!'
  },
  {
    name: 'Michael Chen',
    role: 'CEO',
    company: 'TechStart Solutions',
    avatar: 'MC',
    text: 'The 3D analytics alone are worth the price. We can see our funnel performance like never before.'
  },
  {
    name: 'Emily Rodriguez',
    role: 'Agency Owner',
    company: 'Scale Marketing Agency',
    avatar: 'ER',
    text: 'We manage 50+ client campaigns with Market Genie. The white-label features are perfect for agencies.'
  }
];

// Icon mapping for Lucide icons
const iconMap = {
  'User': 'users',
  'MessageSquare': 'message-square',
  'TrendingUp': 'trending-up',
  'Target': 'target',
  'Zap': 'zap',
  'Shield': 'shield',
  'Clock': 'clock',
  'Smartphone': 'smartphone',
  'BarChart3': 'bar-chart-3'
};

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  populateFeatures();
  populatePricing();
  populateTestimonials();
});

// Populate features section
function populateFeatures() {
  const featuresGrid = document.getElementById('features-grid');
  if (!featuresGrid) return;

  featuresGrid.innerHTML = features.map((feature, index) => `
    <div class="bg-white/15 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105" 
         data-aos="fade-up" data-aos-delay="${index * 100}">
      <div class="w-12 h-12 text-cyan-400 mb-4">
        <i data-lucide="${iconMap[feature.icon] || 'star'}"></i>
      </div>
      <h3 class="text-xl font-semibold text-white mb-2">${feature.title}</h3>
      <p class="text-gray-300">${feature.description}</p>
    </div>
  `).join('');

  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// Populate pricing section
function populatePricing() {
  const pricingGrid = document.getElementById('pricing-grid');
  if (!pricingGrid) return;

  pricingGrid.innerHTML = pricingPlans.map((plan, index) => `
    <div class="relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border ${plan.popular ? 'border-yellow-400/50 ring-2 ring-yellow-400/30' : 'border-white/20'} hover:border-cyan-500/50 transition-all duration-300" 
         data-aos="fade-up" data-aos-delay="${index * 200}">
      ${plan.popular ? `
      <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <span class="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-4 py-2 rounded-full text-sm font-bold">
          MOST POPULAR
        </span>
      </div>
      ` : ''}
      
      <div class="text-center mb-8">
        <h3 class="text-2xl font-bold text-white mb-2">${plan.name}</h3>
        <p class="text-gray-300 mb-4">${plan.description}</p>
        <div class="mb-4">
          <span class="text-5xl font-bold text-white">${plan.price}</span>
          <span class="text-gray-300"> ${plan.period}</span>
        </div>
      </div>

      <ul class="space-y-3 mb-8">
        ${plan.features.map(feature => `
          <li class="flex items-center text-gray-200">
            <span class="w-5 h-5 text-green-400 mr-3 flex-shrink-0">✓</span>
            ${feature}
          </li>
        `).join('')}
      </ul>

      <a href="${plan.buttonLink}" 
         class="w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center ${plan.buttonClass} ${plan.popular ? 'shadow-lg shadow-yellow-400/25' : ''}">
        ${plan.buttonText}
      </a>
    </div>
  `).join('');
}

// Populate testimonials section
function populateTestimonials() {
  const testimonialsGrid = document.getElementById('testimonials-grid');
  if (!testimonialsGrid) return;

  testimonialsGrid.innerHTML = testimonials.map((testimonial, index) => `
    <div class="bg-white/8 backdrop-blur-lg rounded-xl p-6 border border-white/12" 
         data-aos="fade-up" data-aos-delay="${index * 200}">
      <div class="flex items-center mb-4">
        ${[...Array(5)].map(() => '<span class="w-5 h-5 text-yellow-400">⭐</span>').join('')}
      </div>
      <p class="text-gray-300 mb-6">"${testimonial.text}"</p>
      <div class="flex items-center">
        <div class="w-12 h-12 bg-gradient-to-r from-emerald-400 to-yellow-400 rounded-full flex items-center justify-center text-white font-semibold mr-4">
          ${testimonial.avatar}
        </div>
        <div>
          <h4 class="text-white font-semibold">${testimonial.name}</h4>
          <p class="text-gray-400">${testimonial.role}, ${testimonial.company}</p>
        </div>
      </div>
    </div>
  `).join('');
}

// Smooth scrolling for navigation links
document.addEventListener('click', function(e) {
  if (e.target.matches('a[href^="#"]')) {
    e.preventDefault();
    const target = document.querySelector(e.target.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
});

// Scroll to pricing function
function scrollToPricing() {
  const pricingSection = document.getElementById('pricing');
  if (pricingSection) {
    pricingSection.scrollIntoView({ behavior: 'smooth' });
  }
}

// Add some interactive effects
document.addEventListener('mousemove', function(e) {
  const cursor = document.querySelector('.cursor');
  if (cursor) {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  }
});

// Add navbar background on scroll
window.addEventListener('scroll', function() {
  const navbar = document.querySelector('nav');
  if (window.scrollY > 100) {
    navbar.classList.add('bg-black/50');
  } else {
    navbar.classList.remove('bg-black/50');
  }
});

// Lazy load images
function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', lazyLoadImages);

// Performance tracking
function trackPageLoad() {
  window.addEventListener('load', function() {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    console.log('Page loaded in', loadTime, 'ms');
  });
}

trackPageLoad();