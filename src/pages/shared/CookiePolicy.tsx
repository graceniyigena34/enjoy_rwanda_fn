import { Link } from "react-router-dom";

const sections = [
  {
    title: "1. What Are Cookies",
    body: "Cookies are small text files stored on your device when you visit a website. They help the website remember your preferences and improve your browsing experience.",
  },
  {
    title: "2. Cookies We Use",
    intro: "We use the following types of cookies:",
    items: [
      "Essential cookies — required for the platform to function, such as keeping you logged in.",
      "Preference cookies — remember your settings like dark mode and language.",
      "Analytics cookies — help us understand how visitors use the platform so we can improve it.",
      "Session cookies — temporary cookies that expire when you close your browser.",
    ],
  },
  {
    title: "3. Third-Party Cookies",
    body: "Some features on our platform may use third-party cookies from services such as payment processors or analytics providers. These third parties have their own privacy and cookie policies.",
  },
  {
    title: "4. Managing Cookies",
    intro: "You can control cookies through your browser settings:",
    items: [
      "Most browsers allow you to block or delete cookies.",
      "Disabling essential cookies may affect the functionality of the platform.",
      "You can opt out of analytics cookies without affecting your core experience.",
    ],
  },
  {
    title: "5. Local Storage",
    body: "In addition to cookies, we use browser local storage to save your session preferences such as your cart and booking context. This data stays on your device and is not transmitted to our servers unless you take an action.",
  },
  {
    title: "6. Changes to This Policy",
    body: "We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated effective date.",
  },
  {
    title: "7. Contact Us",
    items: [
      "Email: privacy@enjoyrwanda.rw",
      "Phone: +250 700 000 000",
      "Address: Kigali, Rwanda",
    ],
  },
];

export default function CookiePolicy() {
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
            Cookie Policy
          </h1>
          <p className="mt-2 text-sm text-slate-600">Effective Date: {effectiveDate}</p>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            This Cookie Policy explains how Enjoy Rwanda uses cookies and similar technologies when you visit our platform. By continuing to use our platform, you consent to our use of cookies as described in this policy.
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
            </article>
          ))}
        </section>

        <div className="flex flex-wrap gap-4 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-[0_12px_35px_rgba(15,23,42,0.08)]">
          <Link to="/" className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Back to Home
          </Link>
          <Link to="/privacy-policy" className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Privacy Policy
          </Link>
          <Link to="/terms-and-conditions" className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}
