import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import PhoneNumberInput from "../../components/forms/PhoneNumberInput";
import { getShopById } from "../../utils/shopCatalog";
import { decrementShopProductStock } from "../../utils/shopStockStorage";
import {
  decrementVendorShopStock,
  getVendorShopById,
} from "../../utils/vendorShopStorage";

type Method = "card" | "mtn" | "airtel" | "paypal";
type BookingPayMode = "reservation-only" | "reservation-and-menu";

type BookingMenuItem = {
  name: string;
  price: number;
};

type BookingPaymentContext = {
  bookingId: number;
  email: string;
  restaurantName: string;
  reservationAmount: number;
  menuItems: BookingMenuItem[];
  menuTotal: number;
  numberOfPeople?: number;
  date?: string;
  time?: string;
};

type GuestOrder = {
  id: string;
  date: string;
  items: string[];
  total: number;
  status: string;
  vendor: string;
  paymentScope?: "reservation-only" | "reservation+menu" | "cart";
  payLaterTotal?: number;
  payLaterItems?: string[];
};

const PAYMENT_CONTEXT_KEY = "enjoy-rwanda.paymentContext";

function readBookingPaymentContext(): BookingPaymentContext | null {
  const raw = localStorage.getItem(PAYMENT_CONTEXT_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<BookingPaymentContext>;
    if (!parsed || typeof parsed !== "object") return null;
    if (!Number.isFinite(Number(parsed.bookingId))) return null;

    const menuItems = Array.isArray(parsed.menuItems)
      ? parsed.menuItems
          .filter(
            (item): item is BookingMenuItem =>
              typeof item?.name === "string" &&
              Number.isFinite(Number(item?.price)),
          )
          .map((item) => ({
            name: item.name,
            price: Number(item.price),
          }))
      : [];

    const menuTotalFromItems = menuItems.reduce(
      (sum, item) => sum + item.price,
      0,
    );
    const reservationAmount = Number(parsed.reservationAmount || 0);

    return {
      bookingId: Number(parsed.bookingId),
      email: typeof parsed.email === "string" ? parsed.email : "",
      restaurantName:
        typeof parsed.restaurantName === "string" &&
        parsed.restaurantName.trim().length > 0
          ? parsed.restaurantName
          : "Restaurant",
      reservationAmount:
        Number.isFinite(reservationAmount) && reservationAmount > 0
          ? reservationAmount
          : 0,
      menuItems,
      menuTotal:
        Number.isFinite(Number(parsed.menuTotal)) &&
        Number(parsed.menuTotal) > 0
          ? Number(parsed.menuTotal)
          : menuTotalFromItems,
      numberOfPeople: Number(parsed.numberOfPeople || 0) || undefined,
      date: typeof parsed.date === "string" ? parsed.date : "",
      time: typeof parsed.time === "string" ? parsed.time : "",
    };
  } catch {
    return null;
  }
}

export default function Payment() {
  const { cartTotal, clearCart, cart } = useApp();
  const navigate = useNavigate();

  const bookingContext = useMemo(() => readBookingPaymentContext(), []);
  const isBookingFlow = !!bookingContext;
  const hasMenuInBooking =
    (bookingContext?.menuItems.length ?? 0) > 0 &&
    (bookingContext?.menuTotal ?? 0) > 0;

  const [bookingPayMode, setBookingPayMode] = useState<BookingPayMode>(
    hasMenuInBooking ? "reservation-and-menu" : "reservation-only",
  );
  const [method, setMethod] = useState<Method>("card");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [phone, setPhone] = useState("");
  const [stockError, setStockError] = useState<string | null>(null);

  const reservationAmount = bookingContext?.reservationAmount ?? 0;
  const bookingMenuTotal = bookingContext?.menuTotal ?? 0;
  const payableMenuTotal =
    isBookingFlow && bookingPayMode === "reservation-and-menu"
      ? bookingMenuTotal
      : 0;
  const subtotal = isBookingFlow
    ? reservationAmount + payableMenuTotal
    : cartTotal;
  const total = subtotal;

  const validateShopStock = () => {
    const grouped = new Map<
      string,
      { shopId: number; productId: number; qty: number }
    >();
    for (const item of cart) {
      if (typeof item.shopId !== "number") continue;
      const key = `${item.shopId}:${item.id}`;
      const existing = grouped.get(key);
      grouped.set(key, {
        shopId: item.shopId,
        productId: item.id,
        qty: (existing?.qty ?? 0) + item.quantity,
      });
    }
    for (const entry of grouped.values()) {
      const vendorShop = getVendorShopById(entry.shopId);
      const shop = getShopById(entry.shopId);
      const product =
        shop?.products.find((p) => p.id === entry.productId) ?? null;
      const currentStock = vendorShop
        ? (vendorShop.products.find((p) => p.id === entry.productId)?.stock ??
          0)
        : (product?.stock ?? 0);
      if (currentStock < entry.qty) {
        return `Not enough stock for product #${entry.productId}. Available: ${currentStock}, requested: ${entry.qty}.`;
      }
    }
    return null;
  };

  const finalizeShopPurchase = () => {
    const grouped = new Map<
      string,
      { shopId: number; productId: number; qty: number }
    >();
    for (const item of cart) {
      if (typeof item.shopId !== "number") continue;
      const key = `${item.shopId}:${item.id}`;
      const existing = grouped.get(key);
      grouped.set(key, {
        shopId: item.shopId,
        productId: item.id,
        qty: (existing?.qty ?? 0) + item.quantity,
      });
    }
    for (const entry of grouped.values()) {
      const vendorShop = getVendorShopById(entry.shopId);
      if (vendorShop) {
        const result = decrementVendorShopStock(
          entry.shopId,
          entry.productId,
          entry.qty,
        );
        if (!result.ok) return false;
        continue;
      }
      const shop = getShopById(entry.shopId);
      const product =
        shop?.products.find((p) => p.id === entry.productId) ?? null;
      const fallbackStock = product?.stock ?? 0;
      const result = decrementShopProductStock(
        entry.shopId,
        entry.productId,
        entry.qty,
        fallbackStock,
      );
      if (!result.ok) return false;
    }
    return true;
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isBookingFlow) {
      const stockIssue = validateShopStock();
      setStockError(stockIssue);
      if (stockIssue) return;
    }

    setProcessing(true);
    setTimeout(() => {
      if (!isBookingFlow) {
        const ok = finalizeShopPurchase();
        if (!ok) {
          setProcessing(false);
          setStockError(
            "Stock changed before payment completed. Please review your cart.",
          );
          return;
        }
      }

      const existing = JSON.parse(
        localStorage.getItem("enjoy-rwanda.guestOrders") ?? "[]",
      ) as GuestOrder[];

      let newOrder: GuestOrder;
      if (isBookingFlow && bookingContext) {
        const paidMenuNow = bookingPayMode === "reservation-and-menu";
        const paidItems = [
          `Reservation (${reservationAmount.toLocaleString()} RWF)`,
          ...(paidMenuNow
            ? bookingContext.menuItems.map((item) => item.name)
            : []),
        ];

        newOrder = {
          id: `ORD-${Date.now()}`,
          date: new Date().toISOString().split("T")[0],
          items: paidItems,
          total,
          status: "confirmed",
          vendor: bookingContext.restaurantName,
          paymentScope: paidMenuNow ? "reservation+menu" : "reservation-only",
          payLaterTotal: paidMenuNow ? 0 : bookingMenuTotal,
          payLaterItems: paidMenuNow
            ? []
            : bookingContext.menuItems.map((item) => item.name),
        };

        localStorage.removeItem(PAYMENT_CONTEXT_KEY);
        localStorage.removeItem("enjoy-rwanda.pendingBookingContext");
      } else {
        newOrder = {
          id: `ORD-${Date.now()}`,
          date: new Date().toISOString().split("T")[0],
          items: cart.map((item) => item.name),
          total,
          status: "confirmed",
          vendor: cart[0]?.vendorName ?? "Enjoy Rwanda",
          paymentScope: "cart",
        };

        clearCart();
      }

      localStorage.setItem(
        "enjoy-rwanda.guestOrders",
        JSON.stringify([newOrder, ...existing]),
      );

      setProcessing(false);
      setDone(true);
    }, 2000);
  };

  if (!isBookingFlow && cart.length === 0 && !done)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">No items to pay for.</p>
        <Link
          to="/restaurants"
          className="bg-[#1a1a2e] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#2d2d4e] transition-colors"
        >
          Browse Restaurants
        </Link>
      </div>
    );

  if (done)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-6xl">✅</div>
        <h2 className="text-2xl font-bold text-gray-900">
          Payment Successful!
        </h2>
        <p className="text-gray-500 text-center">
          Your order has been confirmed. A receipt has been sent to your email.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/orders")}
            className="bg-[#1a1a2e] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#2d2d4e] transition-colors"
          >
            View My Orders
          </button>
          <Link
            to="/"
            className="border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-semibold hover:border-gray-800 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );

  const methods = [
    { id: "card", label: "💳 Card" },
    { id: "mtn", label: "📱 MTN MoMo" },
    { id: "airtel", label: "📱 Airtel Money" },
    { id: "paypal", label: "🅿️ PayPal" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-black text-gray-900 mb-8">Secure Payment</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">
            Choose Payment Method
          </h3>

          {isBookingFlow && (
            <div className="mb-5 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3">
              <p className="text-sm font-semibold text-sky-900">
                Reservation payment is mandatory
              </p>
              <p className="text-xs text-sky-700 mt-1">
                You can pay menu items now, or leave them to pay at the
                restaurant.
              </p>
              <div className="grid sm:grid-cols-2 gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setBookingPayMode("reservation-only")}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                    bookingPayMode === "reservation-only"
                      ? "bg-[#1a1a2e] text-white border-[#1a1a2e]"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
                  }`}
                >
                  Reservation only
                </button>
                <button
                  type="button"
                  disabled={!hasMenuInBooking}
                  onClick={() => setBookingPayMode("reservation-and-menu")}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                    bookingPayMode === "reservation-and-menu"
                      ? "bg-[#1a1a2e] text-white border-[#1a1a2e]"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
                  } ${!hasMenuInBooking ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  Reservation + menu
                </button>
              </div>
              {!hasMenuInBooking && (
                <p className="text-xs text-sky-700 mt-2">
                  No menu items were selected during booking.
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mb-6">
            {methods.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id as Method)}
                className={`py-2.5 px-4 rounded-xl text-sm font-medium border transition-all ${method === m.id ? "bg-[#1a1a2e] text-white border-[#1a1a2e]" : "border-gray-200 text-gray-600 hover:border-gray-400"}`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {stockError && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {stockError}
            </div>
          )}

          <form onSubmit={handlePay} className="space-y-4">
            {method === "card" && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    value={cardNum}
                    onChange={(e) =>
                      setCardNum(
                        e.target.value
                          .replace(/\D/g, "")
                          .replace(/(.{4})/g, "$1 ")
                          .trim(),
                      )
                    }
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Expiry
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      placeholder="***"
                      maxLength={3}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400"
                    />
                  </div>
                </div>
              </>
            )}
            {(method === "mtn" || method === "airtel") && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  {method === "mtn" ? "MTN" : "Airtel"} Mobile Number
                </label>
                <PhoneNumberInput
                  value={phone}
                  onChange={setPhone}
                  required
                  defaultCountryIso2="RW"
                  placeholder="7XXXXXXXX"
                />
                <p className="text-xs text-gray-400 mt-1">
                  You will receive a prompt on your phone to confirm payment.
                </p>
              </div>
            )}
            {method === "paypal" && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  PayPal Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400"
                />
                <p className="text-xs text-gray-400 mt-1">
                  You will be redirected to PayPal to complete payment.
                </p>
              </div>
            )}
            <button
              type="submit"
              disabled={processing}
              className="w-full bg-[#1a1a2e] text-white py-3 rounded-xl font-semibold hover:bg-[#2d2d4e] transition-colors disabled:opacity-60"
            >
              {processing
                ? "Processing..."
                : `Pay ${total.toLocaleString()} RWF`}
            </button>
          </form>
        </div>

        <div className="lg:w-80 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm h-fit">
          <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-2 mb-4 text-sm">
            {isBookingFlow && bookingContext ? (
              <>
                <div className="flex justify-between text-gray-700 font-medium">
                  <span>Reservation Deposit</span>
                  <span>{reservationAmount.toLocaleString()} RWF</span>
                </div>
                {bookingContext.menuItems.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="flex justify-between text-gray-600"
                  >
                    <span>{item.name}</span>
                    <span>{item.price.toLocaleString()} RWF</span>
                  </div>
                ))}
                {hasMenuInBooking && bookingPayMode === "reservation-only" && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    Menu total {bookingMenuTotal.toLocaleString()} RWF will be
                    paid at the restaurant.
                  </div>
                )}
                <div className="border-t border-gray-100 pt-2 flex justify-between text-gray-600"></div>
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Total To Pay Now</span>
                  <span>{total.toLocaleString()} RWF</span>
                </div>
                <div className="text-xs text-gray-400 pt-1">
                  Booking ID: {bookingContext.bookingId}
                </div>
              </>
            ) : (
              <>
                {cart.map((item) => (
                  <div
                    key={item.lineId}
                    className="flex justify-between text-gray-600"
                  >
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span>
                      {(item.price * item.quantity).toLocaleString()} RWF
                    </span>
                  </div>
                ))}

                <div className="flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span>{total.toLocaleString()} RWF</span>
                </div>
              </>
            )}
          </div>
          <div className="text-center text-xs text-gray-400 mt-4">
            Secured by SSL Encryption
          </div>
        </div>
      </div>
    </div>
  );
}
