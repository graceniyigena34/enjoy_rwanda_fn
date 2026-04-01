import { Link } from "react-router-dom";

const offers = [
  { icon: "🍽️", title: "Restaurant Booking", desc: "Browse restaurants, view menus, select tables, and make reservations online." },
  { icon: "🛍️", title: "Shop & Order", desc: "Explore local shops, browse products, and order authentic Rwandan goods." },
  { icon: "💳", title: "Secure Payments", desc: "Pay via card, MTN Mobile Money, Airtel Money, or PayPal — safely and securely." },
  { icon: "💬", title: "Live Chat", desc: "Chat directly with vendors for inquiries, special requests, or support." },
];

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-gray-900 mb-3">About Enjoy Rwanda</h1>
        <p className="text-gray-500 text-lg">Connecting visitors with the best of Rwanda's restaurants and shops since 2025.</p>
      </div>

      <div className="space-y-10">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">Enjoy Rwanda is a digital platform designed to simplify how visitors explore services in Rwanda. We connect tourists and locals with restaurants, shops, and local vendors — making it easy to browse, book, and order from one convenient platform.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-5">What We Offer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {offers.map(o => (
              <div key={o.title} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{o.icon}</div>
                <h4 className="font-bold text-gray-900 mb-1">{o.title}</h4>
                <p className="text-sm text-gray-500">{o.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Team</h2>
          <p className="text-gray-600 leading-relaxed">We are a passionate team based in Kigali, Rwanda, dedicated to supporting local businesses and improving the visitor experience through technology.</p>
        </section>

        <div className="bg-[#1a1a2e] rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-2">Ready to explore Rwanda?</h3>
          <p className="text-white/70 mb-6">Discover the best restaurants and shops Rwanda has to offer.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/restaurants" className="bg-white text-[#1a1a2e] px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-100 transition-colors">Browse Restaurants</Link>
            <Link to="/shops" className="border border-white/40 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-white/10 transition-colors">Explore Shops</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
