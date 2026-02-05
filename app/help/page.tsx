import Link from 'next/link'
import { HelpCircle, BookOpen, MessageCircle, Search, ChevronRight } from 'lucide-react'

export default function HelpCenterPage() {
    const faqs = [
        {
            category: "Getting Started",
            questions: [
                { q: "How do I create an account?", a: "Click 'Sign Up' in the top right corner and follow the registration process." },
                { q: "How do I list my property?", a: "After signing up, click 'Become a Host' and follow our step-by-step property listing wizard." },
                { q: "Is DARLINK free to use?", a: "Creating an account and browsing is free. We charge a service fee on completed bookings." }
            ]
        },
        {
            category: "Booking & Payments",
            questions: [
                { q: "How do I book a property?", a: "Select your dates, choose a room, and click 'Request to Book'. The host has 24 hours to accept." },
                { q: "When will I be charged?", a: "You're only charged after the host accepts your booking request." },
                { q: "What payment methods do you accept?", a: "We accept all major credit cards, debit cards, and local payment methods." }
            ]
        },
        {
            category: "For Hosts",
            questions: [
                { q: "How do I get paid?", a: "Payments are released 24 hours after guest check-in to your registered bank account." },
                { q: "Can I set my own prices?", a: "Yes, you have full control over your pricing and availability." },
                { q: "What if I need to cancel?", a: "Hosts can cancel, but frequent cancellations may affect your listing status." }
            ]
        }
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b">
                <div className="container mx-auto px-6 py-4">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <img src="/images/logo_darlink.png" alt="DARLINK" className="h-10" />
                        <div className="flex items-baseline">
                            <span className="font-extrabold text-2xl text-[#0B3D6F]">DAR</span>
                            <span className="font-bold text-2xl text-[#F17720]">LINK</span>
                            <span className="text-sm font-medium text-[#0B3D6F] opacity-60">.tn</span>
                        </div>
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-6 py-16 max-w-5xl">
                <div className="text-center mb-12">
                    <div className="inline-flex p-4 bg-blue-50 rounded-full mb-6">
                        <HelpCircle className="w-12 h-12 text-[#0B3D6F]" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#0B3D6F] mb-4">Help Center</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                        Find answers to common questions and get the help you need.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search for help..."
                                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#0B3D6F] text-lg"
                            />
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    <Link href="/contact" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                        <div className="p-3 bg-blue-50 rounded-lg w-fit mb-4">
                            <MessageCircle className="w-6 h-6 text-[#0B3D6F]" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-[#0B3D6F] transition-colors">Contact Support</h3>
                        <p className="text-gray-600 text-sm">Get in touch with our support team</p>
                    </Link>

                    <Link href="/trust-safety" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                        <div className="p-3 bg-green-50 rounded-lg w-fit mb-4">
                            <BookOpen className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-[#0B3D6F] transition-colors">Trust & Safety</h3>
                        <p className="text-gray-600 text-sm">Learn about our safety measures</p>
                    </Link>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer">
                        <div className="p-3 bg-orange-50 rounded-lg w-fit mb-4">
                            <HelpCircle className="w-6 h-6 text-[#F17720]" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-[#0B3D6F] transition-colors">Community Guidelines</h3>
                        <p className="text-gray-600 text-sm">Read our community standards</p>
                    </div>
                </div>

                {/* FAQs */}
                <div className="space-y-8">
                    <h2 className="text-3xl font-bold text-[#0B3D6F] text-center mb-8">Frequently Asked Questions</h2>

                    {faqs.map((section, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <h3 className="text-2xl font-bold text-[#0B3D6F] mb-6">{section.category}</h3>
                            <div className="space-y-4">
                                {section.questions.map((item, qIdx) => (
                                    <details key={qIdx} className="group">
                                        <summary className="flex items-center justify-between cursor-pointer p-4 rounded-lg hover:bg-gray-50 transition-colors">
                                            <span className="font-semibold text-gray-900">{item.q}</span>
                                            <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
                                        </summary>
                                        <div className="px-4 py-3 text-gray-600 leading-relaxed">
                                            {item.a}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Still Need Help */}
                <div className="mt-16 bg-gradient-to-br from-blue-50 to-orange-50 rounded-2xl p-8 text-center border border-blue-100">
                    <h3 className="text-2xl font-bold text-[#0B3D6F] mb-3">Still need help?</h3>
                    <p className="text-gray-600 mb-6">Our support team is here to assist you with any questions.</p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 bg-[#F17720] hover:bg-[#d1661b] text-white px-8 py-4 rounded-lg font-semibold transition-colors"
                    >
                        Contact Us
                        <ChevronRight className="w-5 h-5" />
                    </Link>
                </div>
            </main>
        </div>
    )
}
