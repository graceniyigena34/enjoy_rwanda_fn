import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto transition-colors">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 px-8 py-14">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <svg viewBox="0 0 44 44" width="44" height="44">
              <path d="M22 38 C22 38 6 27 6 16 C6 10.477 10.477 6 16 6 C18.9 6 21.5 7.3 22 8 C22.5 7.3 25.1 6 28 6 C33.523 6 38 10.477 38 16 C38 27 22 38 22 38Z" fill="#1a1a2e"/>
              <text x="22" y="21" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10" fontWeight="800" fontFamily="system-ui">RW</text>
            </svg>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold text-gray-900 dark:text-white">Enjoy</span>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Rwanda</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-[240px]">Your gateway to authentic Rwandan experiences. Shop local crafts and discover the best restaurants.</p>
        </div>

        {/* Shop */}
        <div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Shop</h4>
          <ul className="space-y-2.5">
            {["Imigongo Art","Agaseke Baskets","Coffee & Tea","Jewelry"].map(item => (
              <li key={item}><Link to="/shops" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">{item}</Link></li>
            ))}
          </ul>
        </div>

        {/* Restaurants */}
        <div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Restaurants</h4>
          <ul className="space-y-2.5">
            {["Kigali","Musanze","Rubavu","Huye"].map(city => (
              <li key={city}><Link to="/restaurants" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">{city}</Link></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Contact</h4>
          <ul className="space-y-3">
            {[
              { icon: <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>, extra: <polyline points="22,6 12,13 2,6"/>, text: "hello@enjoyrwanda.com" },
              { icon: <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>, extra: null, text: "+250 788 000 000" },
              { icon: <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>, extra: <circle cx="12" cy="10" r="3"/>, text: "Kigali, Rwanda" },
            ].map(({ icon, extra, text }) => (
              <li key={text} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-gray-400">{icon}{extra}</svg>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 max-w-6xl mx-auto px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-400">
        <span>© {new Date().getFullYear()} Enjoy Rwanda. All rights reserved.</span>
        <span>Made with ♥ in Rwanda</span>
      </div>
    </footer>
  );
}
