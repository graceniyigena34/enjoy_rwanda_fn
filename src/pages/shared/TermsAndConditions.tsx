import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const TERMS_ACCEPTANCE_KEY = "enjoy-rwanda.termsAccepted.v1";

const sections = [
  {
    title: "1. Definitions",
    items: [
      '"Platform" refers to Enjoy Rwanda website and services.',
      '"User" refers to anyone accessing or using the platform.',
      '"Vendor" refers to restaurants or shops listing products, menus, or reservations.',
      '"Customer" refers to users placing orders or booking tables.',
    ],
  },
  {
    title: "2. Use of the Platform",
    intro: "You agree to:",
    items: [
      "Provide accurate and complete information.",
      "Use the platform only for lawful purposes.",
      "Not misuse, disrupt, or interfere with the platform.",
    ],
    outro:
      "We reserve the right to suspend or terminate accounts that violate these Terms.",
  },
  {
    title: "3. Vendor Responsibilities",
    intro: "Vendors are responsible for:",
    items: [
      "Ensuring accuracy of menus, prices, product descriptions, and availability.",
      "Honoring reservations and orders made through the platform.",
      "Complying with all applicable laws and regulations in Rwanda.",
    ],
    outro:
      "Enjoy Rwanda is not responsible for errors in listings or failure of vendors to fulfill orders.",
  },
  {
    title: "4. Orders and Reservations",
    items: [
      "Customers can place orders or reserve tables through the platform.",
      "Orders and reservations are subject to vendor acceptance.",
      "Vendors may cancel or reject orders due to availability or other reasons.",
    ],
    outro:
      "Enjoy Rwanda does not guarantee availability of any product or reservation.",
  },
  {
    title: "5. Payments",
    items: [
      "Payments may be processed through third-party payment providers.",
      "Enjoy Rwanda is not responsible for payment processing errors or failures.",
      "Refund policies are determined by the vendor unless otherwise stated.",
    ],
  },
  {
    title: "6. Cancellations and Refunds",
    items: [
      "Cancellation policies vary by vendor.",
      "Customers should review vendor-specific terms before confirming orders or bookings.",
      "Enjoy Rwanda is not liable for disputes regarding refunds.",
    ],
  },
  {
    title: "7. User Accounts",
    items: [
      "You are responsible for maintaining the confidentiality of your account.",
      "You must notify us immediately of unauthorized use.",
      "We reserve the right to suspend or terminate accounts at our discretion.",
    ],
  },
  {
    title: "8. Intellectual Property",
    body: "All content on Enjoy Rwanda, including logos, design, and software, is owned by or licensed to us and protected by intellectual property laws. You may not copy, reproduce, or distribute content without permission.",
  },
  {
    title: "9. Limitation of Liability",
    intro: "To the maximum extent permitted by law, Enjoy Rwanda shall not be liable for:",
    items: [
      "Any indirect, incidental, or consequential damages.",
      "Losses resulting from vendor actions or service failures.",
      "Errors, interruptions, or unavailability of the platform.",
    ],
  },
  {
    title: "10. Dispute Resolution",
    body: "Any disputes arising from the use of the platform should first be resolved between the customer and the vendor. If unresolved, disputes will be handled in accordance with the laws of Rwanda.",
  },
  {
    title: "11. Changes to Terms",
    body: "We may update these Terms at any time. Changes will be posted on this page with an updated effective date. Continued use of the platform means you accept the revised Terms.",
  },
  {
    title: "12. Contact Us",
    items: [
      "Email: support@enjoyrwanda.rw",
      "Phone: +250 700 000 000",
    ],
  },
];

export default function TermsAndConditions() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);

  const effectiveDate = useMemo(
    () =>
      new Date().toLocaleDateString("en-RW", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [],
  );

  const nextPath = searchParams.get("next")?.trim() || "/";

  const handleAgreeAndContinue = () => {
    if (!agreed) return;
    window.sessionStorage.setItem(TERMS_ACCEPTANCE_KEY, "accepted");
    navigate(nextPath);
  };

  const handleDecline = () => {
    window.sessionStorage.removeItem(TERMS_ACCEPTANCE_KEY);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(148,163,184,0.2),transparent_45%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-10">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <header className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-[0_12px_35px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Enjoy Rwanda
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">
            Terms and Conditions
          </h1>
          <p className="mt-2 text-sm text-slate-600">Effective Date: {effectiveDate}</p>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Welcome to Enjoy Rwanda. These Terms and Conditions govern your use
            of our platform, including our website and services that allow
            restaurants and shops to list products, menus, and table
            reservations, and allow customers to place orders and make bookings.
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-700">
            By accessing or using Enjoy Rwanda, you agree to be bound by these Terms.
          </p>
        </header>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.08)]">
          {sections.map((section) => (
            <article key={section.title} className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
              <h2 className="text-lg font-bold text-slate-900">{section.title}</h2>
              {section.body && (
                <p className="mt-2 text-sm leading-6 text-slate-600">{section.body}</p>
              )}
              {section.intro && (
                <p className="mt-2 text-sm leading-6 text-slate-600">{section.intro}</p>
              )}
              {section.items && (
                <ul className="mt-2 list-disc space-y-1 pl-6 text-sm leading-6 text-slate-600">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {section.outro && (
                <p className="mt-2 text-sm leading-6 text-slate-600">{section.outro}</p>
              )}
            </article>
          ))}

          <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
            By using Enjoy Rwanda, you acknowledge that you have read,
            understood, and agreed to these Terms and Conditions.
          </p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-[0_12px_35px_rgba(15,23,42,0.08)]">
          <label className="flex items-start gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-[#1a1a2e] focus:ring-[#1a1a2e]"
            />
            <span>
              I have read and agree to the Terms and Conditions of Enjoy Rwanda.
            </span>
          </label>

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to Home
            </Link>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDecline}
                className="rounded-xl border border-rose-300 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
              >
                I Do Not Agree
              </button>
              <button
                type="button"
                onClick={handleAgreeAndContinue}
                disabled={!agreed}
                className="rounded-xl bg-[#1a1a2e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2d2d4e] disabled:cursor-not-allowed disabled:opacity-55"
              >
                I Agree and Continue
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
