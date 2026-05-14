import { useState } from 'react'
import { Link } from 'react-router-dom'

const navItems = [
  { label: 'Home', href: '/#home' },
  { label: 'Features', href: '/#features' },
  { label: 'About', href: '/#about' },
]

function PublicNavbar() {
  const [isContactOpen, setIsContactOpen] = useState(false)

  const handleContactClick = () => {
    setIsContactOpen(true)
  }

  const closeContact = () => {
    setIsContactOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-slate-50/90 backdrop-blur">
        <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-lg font-semibold tracking-tight text-[#0F172A]">
            SEMS
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-slate-600 transition hover:text-[#1E3A8A]"
              >
                {item.label}
              </a>
            ))}
            <button
              type="button"
              onClick={handleContactClick}
              className="text-sm font-medium text-slate-600 transition hover:text-[#1E3A8A]"
            >
              Contact
            </button>
            <Link to="/login" className="text-sm font-medium text-slate-600 transition hover:text-[#1E3A8A]">
              Login
            </Link>
          </nav>

          <Link
            to="/login"
            className="rounded-lg border border-[#0b5e53] bg-[#0f7669] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#115e59]"
          >
            Get Started
          </Link>
        </div>
      </header>

      {isContactOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeContact}
          onKeyDown={(e) => e.key === 'Escape' && closeContact()}
          role="presentation"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="contact-modal-title"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 id="contact-modal-title" className="text-2xl font-bold text-[#0B278A]">
                Contact Us
              </h2>
              <button
                type="button"
                onClick={closeContact}
                className="text-slate-400 transition hover:text-slate-600"
                aria-label="Close contact modal"
              >
                <i className="ri-close-line text-xl" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-[#EEF2FF]">
                  <i className="ri-phone-line text-lg text-[#0B278A]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-[#EEF2FF]">
                  <i className="ri-mail-line text-lg text-[#0B278A]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">support@sems.edu</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-[#EEF2FF]">
                  <i className="ri-map-pin-line text-lg text-[#0B278A]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Address</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">Academic Boulevard, Campus District, University City, UC 12345</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-[#EEF2FF]">
                  <i className="ri-time-line text-lg text-[#0B278A]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hours</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">Monday - Friday: 9:00 AM - 5:00 PM</p>
                  <p className="text-sm font-medium text-slate-800">Saturday - Sunday: Closed</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={closeContact}
              className="mt-8 w-full rounded-lg bg-[#0B278A] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0a1f5f]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default PublicNavbar
