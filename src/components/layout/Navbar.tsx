import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";

export default function Navbar() {
  const { cart, user, logout, darkMode, toggleDark } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-8 h-[70px] transition-colors">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2 no-underline">
        <svg viewBox="0 0 44 44" width="44" height="44">
          <path
            d="M22 38 C22 38 6 27 6 16 C6 10.477 10.477 6 16 6 C18.9 6 21.5 7.3 22 8 C22.5 7.3 25.1 6 28 6 C33.523 6 38 10.477 38 16 C38 27 22 38 22 38Z"
            fill="#1a1a2e"
          />
          <text
            x="22"
            y="21"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="10"
            fontWeight="800"
            fontFamily="system-ui"
          >
            RW
          </text>
        </svg>
        <div className="flex flex-col leading-tight">
          <span className="text-base font-bold text-gray-900 dark:text-white">
            Enjoy
          </span>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Rwanda
          </span>
        </div>
      </Link>

      {/* Hamburger */}
      <button
        className="md:hidden text-2xl text-gray-800 dark:text-gray-200 border-none bg-transparent"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        &#9776;
      </button>

      {/* Mobile actions inside menu */}
      <ul
        className={`${menuOpen ? "flex" : "hidden"} md:flex flex-col md:flex-row absolute md:static top-[70px] left-0 right-0 bg-white dark:bg-gray-900 md:bg-transparent md:dark:bg-transparent border-b md:border-0 border-gray-200 dark:border-gray-700 shadow-md md:shadow-none list-none m-0 p-0 gap-0 md:gap-8 z-40`}
      >
        {[
          ["Shop", "/shops"],
          ["Restaurants", "/restaurants"],
          ["About", "/about"],
        ].map(([label, path]) => (
          <li key={label}>
            <Link
              to={path}
              onClick={() => setMenuOpen(false)}
              className="block px-8 md:px-0 py-3 md:py-0 text-[0.95rem] font-medium text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border-b md:border-0 border-gray-100 dark:border-gray-700 transition-colors"
            >
              {label}
            </Link>
          </li>
        ))}
        {(user?.role === "vendor" || user?.role === "manager") && (
          <li>
            <Link
              to="/vendor"
              onClick={() => setMenuOpen(false)}
              className="block px-8 md:px-0 py-3 md:py-0 text-[0.95rem] font-medium text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Dashboard
            </Link>
          </li>
        )}
        {user?.role === "admin" && (
          <li>
            <Link
              to="/admin"
              onClick={() => setMenuOpen(false)}
              className="block px-8 md:px-0 py-3 md:py-0 text-[0.95rem] font-medium text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Admin
            </Link>
          </li>
        )}
        {/* Mobile-only actions */}
        <li className="md:hidden flex items-center gap-3 px-8 py-3 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={toggleDark}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-none bg-transparent"
          >
            {darkMode ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
          <Link
            to="/cart"
            onClick={() => setMenuOpen(false)}
            className="relative flex items-center justify-center p-2 rounded-lg text-gray-700 dark:text-gray-300"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#1a1a2e] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <button
              onClick={() => {
                logout();
                navigate("/");
                setMenuOpen(false);
              }}
              className="bg-[#1a1a2e] !text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              Sign Out
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="bg-[#1a1a2e] !text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              Sign In
            </Link>
          )}
        </li>
      </ul>

      {/* Actions */}
      <div className="hidden md:flex items-center gap-3">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-none bg-transparent"
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        <Link
          to="/cart"
          className="relative flex items-center justify-center p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-[#1a1a2e] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>

        {user ? (
          <>
            <button className="flex items-center justify-center p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-none bg-transparent">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="bg-[#1a1a2e] !text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#2d2d4e] transition-colors border-none"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="flex items-center justify-center p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
            <Link
              to="/login"
              className="bg-[#1a1a2e] !text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#2d2d4e] transition-colors"
            >
              Sign In
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
