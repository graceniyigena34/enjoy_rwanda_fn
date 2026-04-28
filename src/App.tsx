import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/home/Home";
import Restaurants from "./pages/restaurants/Restaurants";
import RestaurantDetail from "./pages/restaurants/RestaurantDetail";
import Shops from "./pages/shops/Shops";
import ShopDetail from "./pages/shops/ShopDetail";
import Cart from "./pages/shared/Cart";
import Payment from "./pages/shared/Payment";
import Chat from "./pages/shared/Chat";
import Orders from "./pages/shared/Orders";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VendorDashboard from "./pages/dashboard/VendorDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import About from "./pages/shared/About";
import TermsAndConditions from "./pages/shared/TermsAndConditions";
import BookingConfirming from "./pages/restaurants/BookingConfirming";
import BookingUnavailable from "./pages/restaurants/BookingUnavailable";

function Layout() {
  const location = useLocation();
  const { darkMode } = useApp();
  const isDashboard =
    location.pathname === "/admin" || location.pathname === "/vendor";

  return (
    <div
      className={`${darkMode ? "dark" : ""} flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors`}
    >
      {!isDashboard && <Navbar />}
      <main className="flex-1 w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/restaurants/:id" element={<RestaurantDetail />} />
          <Route path="/shops" element={<Shops />} />
          <Route path="/shops/:id" element={<ShopDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/chat/:id" element={<Chat />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/vendor" element={<VendorDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/terms-and-conditions"
            element={<TermsAndConditions />}
          />
          <Route path="/booking-confirming" element={<BookingConfirming />} />
          <Route path="/booking-unavailable" element={<BookingUnavailable />} />
        </Routes>
      </main>
      {!isDashboard && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
