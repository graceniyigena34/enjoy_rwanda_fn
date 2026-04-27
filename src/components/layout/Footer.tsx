import { Link } from "react-router-dom";

const links = {
  Explore: [
    { label: "Restaurants", to: "/restaurants" },
    { label: "Shops", to: "/shops" },
    { label: "About Us", to: "/about" },
    { label: "Cart", to: "/cart" },
  ],
  Destinations: [
    { label: "Kigali", to: "/restaurants" },
    { label: "Musanze", to: "/restaurants" },
    { label: "Rubavu", to: "/restaurants" },
    { label: "Huye", to: "/restaurants" },
  ],
  Account: [
    { label: "Login", to: "/login" },
    { label: "Register", to: "/register" },
    { label: "My Orders", to: "/orders" },
    { label: "Vendor Portal", to: "/vendor" },
  ],
};

const socials = [
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "Twitter / X",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#0f0f1a] text-white">
      {/* Top wave divider */}
      <div className="w-full overflow-hidden leading-none">
        <svg viewBox="0 0 1440 60" className="w-full h-12 fill-white dark:fill-gray-900" preserveAspectRatio="none">
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,0 L0,0 Z" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-4 pb-14">
        {/* Main grid */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.8fr_1fr_1fr_1fr]">

          {/* Brand column */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                <svg viewBox="0 0 44 44" width="28" height="28">
                  <path d="M22 38 C22 38 6 27 6 16 C6 10.477 10.477 6 16 6 C18.9 6 21.5 7.3 22 8 C22.5 7.3 25.1 6 28 6 C33.523 6 38 10.477 38 16 C38 27 22 38 22 38Z" fill="white" />
                  <text x="22" y="21" textAnchor="middle" dominantBaseline="middle" fill="#1a1a2e" fontSize="10" fontWeight="800" fontFamily="system-ui">RW</text>
                </svg>
              </div>
              <div className="leading-tight">
                <p className="text-lg font-bold text-white">Enjoy Rwanda</p>
                <p className="text-xs text-white/50 uppercase tracking-widest">Discover · Taste · Shop</p>
              </div>
            </div>

            <p className="text-sm leading-7 text-white/60 max-w-xs">
              Your gateway to authentic Rwandan experiences. Explore the finest restaurants, discover local crafts, and support Rwandan businesses.
            </p>

            {/* Socials */}
            <div className="mt-6 flex items-center gap-3">
              {socials.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/50 transition hover:border-white/40 hover:text-white hover:bg-white/10"
                >
                  {icon}
                </a>
              ))}
            </div>

            {/* Newsletter */}
            <div className="mt-8">
              <p className="text-xs uppercase tracking-widest text-white/40 mb-3">Stay in the loop</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 rounded-full bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none border border-white/10 focus:border-white/30 transition"
                />
                <button
                  type="button"
                  className="rounded-full bg-white px-4 py-2.5 text-xs font-bold text-[#1a1a2e] transition hover:bg-white/90"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.25em] text-white/40">{title}</h4>
              <ul className="space-y-3">
                {items.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="group flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
                    >
                      <span className="h-px w-3 bg-white/20 transition-all group-hover:w-5 group-hover:bg-white" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact bar */}
        <div className="mt-14 grid gap-4 rounded-2xl border border-white/10 bg-white/5 px-6 py-5 sm:grid-cols-3">
          {[
            { icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22,6 12,13 2,6", label: "Email", value: "hello@enjoyrwanda.com" },
            { icon: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z", label: "Phone", value: "+250 788 000 000" },
            { icon: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12,10 a3,3 0 1,0 0.001,0", label: "Location", value: "Kigali, Rwanda" },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={icon} />
                </svg>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/30">{label}</p>
                <p className="text-sm text-white/70">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Enjoy Rwanda. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="text-xs text-white/30 transition hover:text-white/70">Privacy Policy</Link>
            <Link to="/terms-and-conditions" className="text-xs text-white/30 transition hover:text-white/70">Terms of Service</Link>
            <Link to="/cookie-policy" className="text-xs text-white/30 transition hover:text-white/70">Cookie Policy</Link>
          </div>
          <p className="text-xs text-white/30">Made with <span className="text-rose-400">♥</span> in Rwanda</p>
        </div>
      </div>
    </footer>
  );
}
