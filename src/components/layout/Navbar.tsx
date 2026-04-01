import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";

export default function Navbar() {
  const { cart, user, logout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 flex items-center justify-between px-8 h-[70px]">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2 no-underline">
        <svg viewBox="0 0 44 44" width="44" height="44">
          <path d="M22 38 C22 38 6 27 6 16 C6 10.477 10.477 6 16 6 C18.9 6 21.5 7.3 22 8 C22.5 7.3 25.1 6 28 6 C33.523 6 38 10.477 38 16 C38 27 22 38 22 38Z" fill="#1a1a2e"/>
          <text x="22" y="21" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10" fontWeight="800" fontFamily="system-ui">RW</text>
        </svg>
        <div className="flex flex-col leading-tight">
          <span className="text-base font-bold text-gray-900">Enjoy</span>
          <span className="text-sm font-medium text-gray-500">Rwanda</span>
        </div>
      </Link>

      {/* Hamburger */}
      <button className="md:hidden text-2xl text-gray-800 border-none bg-transparent" onClick={() => setMenuOpen(!menuOpen)}>&#9776;</button>

      {/* Nav links */}
      <ul className={`${menuOpen ? "flex" : "hidden"} md:flex flex-col md:flex-row absolute md:static top-[70px] left-0 right-0 bg-white md:bg-transparent border-b md:border-0 border-gray-200 shadow-md md:shadow-none list-none m-0 p-0 gap-0 md:gap-8 z-40`}>
        {[["Shop", "/shops"], ["Restaurants", "/restaurants"], ["About", "/about"]].map(([label, path]) => (
          <li key={label}>
            <Link to={path} onClick={() => setMenuOpen(false)} className="block px-8 md:px-0 py-3 md:py-0 text-[0.95rem] font-medium text-gray-500 hover:text-gray-900 border-b md:border-0 border-gray-100 transition-colors">
              {label}
            </Link>
          </li>
        ))}
        {user?.role === "vendor" && <li><Link to="/vendor" onClick={() => setMenuOpen(false)} className="block px-8 md:px-0 py-3 md:py-0 text-[0.95rem] font-medium text-gray-500 hover:text-gray-900">Dashboard</Link></li>}
        {user?.role === "admin"  && <li><Link to="/admin"  onClick={() => setMenuOpen(false)} className="block px-8 md:px-0 py-3 md:py-0 text-[0.95rem] font-medium text-gray-500 hover:text-gray-900">Admin</Link></li>}
      </ul>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Link to="/cart" className="relative flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-[#1a1a2e] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
        </Link>

        {user ? (
          <>
            <button className="flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors border-none bg-transparent">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </button>
            <button onClick={() => { logout(); navigate("/"); }} className="bg-[#1a1a2e] !text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#2d2d4e] transition-colors border-none">Sign Out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>
            <Link to="/login" className="bg-[#1a1a2e] !text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#2d2d4e] transition-colors">Sign In</Link>
          </>
        )}
      </div>
    </nav>
  );
}
