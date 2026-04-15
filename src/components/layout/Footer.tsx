import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-[#1a1a2e] to-gray-900 text-white mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <svg viewBox="0 0 48 48" width="48" height="48" className="drop-shadow-lg">
                <path d="M24 42 C24 42 6 29 6 16 C6 9.373 11.373 4 18 4 C21.3 4 24.2 5.5 24 6 C23.8 5.5 26.7 4 30 4 C36.627 4 42 9.373 42 16 C42 29 24 42 24 42Z" fill="#1a1a2e"/>
                <text x="24" y="22" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="12" fontWeight="900" fontFamily="system-ui">RW</text>
              </svg>
              <div className="flex flex-col leading-tight">
                <span className="text-2xl font-black tracking-tight">Enjoy Rwanda</span>
                <span className="text-sm text-gray-400 font-medium">Experience Authentic Rwanda</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Your gateway to authentic Rwandan experiences. Discover local crafts, book the finest restaurants, and support local businesses.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {[
                { name: 'Facebook', icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
                { name: 'Twitter', icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
                { name: 'Instagram', icon: 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01' },
                { name: 'LinkedIn', icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z' }
              ].map(social => (
                <a key={social.name} href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110" aria-label={social.name}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-bold mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'About Us', path: '/about' },
                { label: 'How It Works', path: '/about' },
                { label: 'Become a Vendor', path: '/register' },
                { label: 'Partner Hotels', path: '/about' },
                { label: 'FAQs', path: '/about' },
                { label: 'Contact Us', path: '/about' }
              ].map(link => (
                <li key={link.label}>
                  <Link to={link.path} className="text-sm text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-base font-bold mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
              Explore
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Restaurants in Kigali', path: '/restaurants' },
                { label: 'Local Shops', path: '/shops' },
                { label: 'Agaseke Baskets', path: '/shops' },
                { label: 'Imigongo Art', path: '/shops' },
                { label: 'Rwandan Coffee', path: '/shops' },
                { label: 'Traditional Jewelry', path: '/shops' }
              ].map(link => (
                <li key={link.label}>
                  <Link to={link.path} className="text-sm text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-base font-bold mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
              Get In Touch
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5 text-blue-500">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>KG 11 Ave, Kigali<br/>Rwanda, East Africa</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-blue-500">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <a href="mailto:info@enjoyrwanda.com" className="hover:text-white transition-colors">info@enjoyrwanda.com</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-blue-500">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-8.12-8.12 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
                <a href="tel:+250788000000" className="hover:text-white transition-colors">+250 788 000 000</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-blue-500">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>Mon - Sun: 8:00 AM - 10:00 PM</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h5 className="text-lg font-bold mb-1">Stay Updated</h5>
              <p className="text-sm text-gray-400">Subscribe to get special offers and updates</p>
            </div>
            <form className="flex gap-2 w-full md:w-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors w-full md:w-80"
              />
              <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span>© {currentYear} Enjoy Rwanda.</span>
              <span className="hidden sm:inline">All rights reserved.</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Made with</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#ef4444" className="animate-pulse">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
              <span>in Rwanda</span>
            </div>
            <div className="flex gap-6">
              <Link to="/about" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/about" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
