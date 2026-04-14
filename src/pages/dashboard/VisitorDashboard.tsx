// import { Link } from "react-router-dom";
// import { useApp } from "../../context/AppContext";

// const favoriteSpots = [
//   { id: 1, name: "Kigali Serena Restaurant", type: "Restaurant" },
//   { id: 2, name: "Inzozi Fashion", type: "Shop" },
//   { id: 3, name: "Rwanda Coffee Corner", type: "Shop" },
// ];

// const recommended = [
//   { id: 1, name: "Mountain View Restaurant", note: "Top rated Rwandan cuisine" },
//   { id: 2, name: "Akagera Craft Shop", note: "Local souvenirs and gifts" },
//   { id: 3, name: "Lake Kivu Lodge", note: "Relaxing stay and dining" },
// ];

// export default function VisitorDashboard() {
//   const { user, cart, cartTotal, orders } = useApp();
//   if (!user || user.role !== "visitor") {
//     return (
//       <div className="min-h-[calc(100vh-70px)] bg-slate-50 py-16">
//         <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-10 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
//           <p className="text-lg font-semibold text-slate-900">Access denied.</p>
//           <Link to="/login" className="mt-6 inline-flex rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">Login as visitor</Link>
//         </div>
//       </div>
//     );
//   }

//   const orderCount = orders.length;
//   const cartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
//   const recentOrders = orders.slice(-3).reverse();

//   return (
//     <div className="min-h-[calc(100vh-70px)] bg-slate-50 py-16">
//       <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
//         <section className="rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
//           <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <h1 className="text-3xl font-black text-slate-900">Visitor Dashboard</h1>
//               <p className="mt-2 text-slate-600">Welcome back, {user.name}. Track your plans, orders, and favorites in one place.</p>
//             </div>
//             <div className="flex flex-wrap gap-3">
//               <Link to="/restaurants" className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">Restaurants</Link>
//               <Link to="/shops" className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">Shops</Link>
//             </div>
//           </div>
//         </section>

//         <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
//           {[
//             { label: "Orders placed", value: orderCount },
//             { label: "Items in cart", value: cartItems },
//             { label: "Saved places", value: favoriteSpots.length },
//             { label: "Recommended spots", value: recommended.length },
//           ].map((stat) => (
//             <div key={stat.label} className="rounded-[2rem] bg-white p-6 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
//               <p className="text-4xl font-black text-slate-900">{stat.value}</p>
//               <p className="mt-2 text-sm text-slate-500">{stat.label}</p>
//             </div>
//           ))}
//         </section>

//         <section className="rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
//           <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <h3 className="text-2xl font-semibold text-slate-900">Quick actions</h3>
//               <p className="mt-2 text-slate-600">Move faster through your visitor experience.</p>
//             </div>
//             <div className="flex flex-wrap gap-3">
//               <Link to="/restaurants" className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">Browse Restaurants</Link>
//               <Link to="/shops" className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">Browse Shops</Link>
//               <Link to="/orders" className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">View Orders</Link>
//             </div>
//           </div>
//           <ul className="mt-6 space-y-3 text-slate-600">
//             <li>🛒 Continue shopping from your cart</li>
//             <li>📍 Explore more restaurants and shops near you</li>
//             <li>⭐ Review your latest visit or favorite a new place</li>
//           </ul>
//         </section>

//         <section className="rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
//           <h3 className="text-2xl font-semibold text-slate-900">Recent Orders</h3>
//           {recentOrders.length === 0 ? (
//             <div className="mt-6 rounded-[1.5rem] bg-slate-50 p-8 text-center text-slate-600">
//               <div className="text-4xl">📦</div>
//               <h4 className="mt-4 text-xl font-semibold text-slate-900">No recent orders yet</h4>
//               <p className="mt-2">Order now from local restaurants and shops.</p>
//             </div>
//           ) : (
//             <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200">
//               <table className="w-full min-w-[700px] border-collapse text-left">
//                 <thead className="bg-slate-100 text-sm uppercase tracking-[0.2em] text-slate-500">
//                   <tr>
//                     <th className="px-6 py-4">Order</th>
//                     <th className="px-6 py-4">Date</th>
//                     <th className="px-6 py-4">Vendor</th>
//                     <th className="px-6 py-4">Status</th>
//                     <th className="px-6 py-4">Total</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {recentOrders.map((order) => (
//                     <tr key={order.id} className="border-t border-slate-200 bg-white">
//                       <td className="px-6 py-4 text-slate-900">{order.id}</td>
//                       <td className="px-6 py-4 text-slate-600">{order.date}</td>
//                       <td className="px-6 py-4 text-slate-600">{order.vendor}</td>
//                       <td className="px-6 py-4">
//                         <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{order.status}</span>
//                       </td>
//                       <td className="px-6 py-4 text-slate-900">{order.total.toLocaleString()} RWF</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </section>

//         <section className="rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
//           <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <h3 className="text-2xl font-semibold text-slate-900">Saved favorites</h3>
//               <p className="text-sm text-slate-500">Personalized for you</p>
//             </div>
//           </div>
//           <div className="mt-6 grid gap-4 sm:grid-cols-2">
//             {favoriteSpots.map((spot) => (
//               <div key={spot.id} className="flex items-center justify-between rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
//                 <div>
//                   <p className="font-semibold text-slate-900">{spot.name}</p>
//                   <p className="text-sm text-slate-500">{spot.type}</p>
//                 </div>
//                 <span>{spot.type === "Restaurant" ? "🍽️" : "🛍️"}</span>
//               </div>
//             ))}
//           </div>
//         </section>

//         <section className="rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
//           <h3 className="text-2xl font-semibold text-slate-900">Recommended for you</h3>
//           <div className="mt-6 grid gap-4 md:grid-cols-3">
//             {recommended.map((spot) => (
//               <div key={spot.id} className="rounded-[1.5rem] border border-slate-200 p-5">
//                 <h4 className="font-semibold text-slate-900">{spot.name}</h4>
//                 <p className="mt-2 text-sm text-slate-600">{spot.note}</p>
//               </div>
//             ))}
//           </div>
//         </section>

//         <section className="rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
//           <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <h3 className="text-2xl font-semibold text-slate-900">Cart summary</h3>
//               <p className="text-sm text-slate-500">Total cart value and quick access</p>
//             </div>
//             <Link to="/cart" className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">Go to cart</Link>
//           </div>
//           <div className="mt-6 flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 sm:flex-row sm:justify-between sm:items-center">
//             <div>
//               <p className="text-2xl font-black text-slate-900">{cartItems} items</p>
//               <p className="text-sm text-slate-600">Total {cartTotal.toLocaleString()} RWF</p>
//             </div>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }
