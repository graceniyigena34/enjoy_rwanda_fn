import { Link } from "react-router-dom";

const sections = [
  {
    title: "1. Information We Collect",
    intro: "We collect the following types of information:",
    items: [
      "Personal details such as name, email address, and phone number when you register or make a booking.",
      "Usage data including pages visited, time spent, and actions taken on the platform.",
      "Device and browser information for security and performance purposes.",
      "Payment-related information processed securely through third-party providers.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    intro: "We use your information to:",
    items: [
      "Process bookings, orders, and reservations.",
      "Send booking confirmations and service-related notifications.",
      "Improve the platform experience and fix technical issues.",
      "Comply with legal obligations under Rwandan law.",
    ],
  },
  {
    title: "3. Sharing of Information",
    intro: "We do not sell your personal data. We may share it with:",
    items: [
      "Vendors to fulfill your bookings or orders.",
      "Payment processors to complete transactions.",
      "Legal authorities when required by law.",
    ],
    outro: "All third parties are required to handle your data securely.",
  },
  {
    title: "4. Data Retention",
    body: "We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your data at any time by contacting us.",
  },
  {
    title: "5. Your Rights",
    intro: "You have the right to:",
    items: [
      "Access the personal data we hold about you.",
      "Request correction of inaccurate data.",
      "Request deletion of your data.",
      "Withdraw consent for data processing at any time.",
    ],
  },
  {
    title: "6. Data Security",
    body: "We implement industry-standard security measures to protect your data from unauthorized access, disclosure, or loss. However, no method of transmission over the internet is 100% secure.",
  },
  {
    title: "7. Children's Privacy",
    body: "Enjoy Rwanda is not intended for users under the age of 13. We do not knowingly collect personal data from children.",
  },
  {
    title: "8. Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date. Continued use of the platform constitutes acceptance of the revised policy.",
  },
  {
    title: "9. Contact Us",
    items: [
      "Email: privacy@enjoyrwanda.rw",
      "Phone: +250 700 000 000",
      "Address: Kigali, Rwanda",
    ],
  },
];

export default function PrivacyPolicy() {
  const effectiveDate = new Date().toLocaleDateString("en-RW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(148,163,184,0.2),transparent_45%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-10">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <header className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-[0_12px_35px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Enjoy Rwanda
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-slate-600">Effective Date: {effectiveDate}</p>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            At Enjoy Rwanda, we are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.
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
        </section>

        <div className="flex flex-wrap gap-4 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-[0_12px_35px_rgba(15,23,42,0.08)]">
          <Link to="/" className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Back to Home
          </Link>
          <Link to="/terms-and-conditions" className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Terms of Service
          </Link>
          <Link to="/cookie-policy" className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Cookie Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
