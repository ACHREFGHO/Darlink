import Link from 'next/link'

export default function PrivacyPolicyPage() {
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

            <main className="container mx-auto px-6 py-16 max-w-4xl">
                <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100">
                    <h1 className="text-4xl font-bold text-[#0B3D6F] mb-4">Privacy Policy</h1>
                    <p className="text-gray-600 mb-8">Last updated: February 5, 2026</p>

                    <div className="prose prose-blue max-w-none space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold text-[#0B3D6F] mb-4">1. Introduction</h2>
                            <p className="text-gray-700 leading-relaxed">
                                Welcome to DARLINK ("we," "our," or "us"). We are committed to protecting your personal information
                                and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard
                                your information when you use our vacation rental marketplace platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#0B3D6F] mb-4">2. Information We Collect</h2>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Information</h3>
                            <p className="text-gray-700 leading-relaxed mb-3">
                                We collect personal information that you voluntarily provide to us when you:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                <li>Register for an account</li>
                                <li>Make a booking or list a property</li>
                                <li>Contact our customer support</li>
                                <li>Subscribe to our newsletter</li>
                            </ul>
                            <p className="text-gray-700 leading-relaxed mt-4">
                                This information may include: name, email address, phone number, payment information,
                                government-issued ID, and profile photo.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Automatically Collected Information</h3>
                            <p className="text-gray-700 leading-relaxed">
                                When you visit our platform, we automatically collect certain information about your device,
                                including IP address, browser type, operating system, and browsing behavior.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#0B3D6F] mb-4">3. How We Use Your Information</h2>
                            <p className="text-gray-700 leading-relaxed mb-3">We use your information to:</p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                <li>Process your bookings and payments</li>
                                <li>Verify your identity and prevent fraud</li>
                                <li>Communicate with you about your account and bookings</li>
                                <li>Improve our services and user experience</li>
                                <li>Send you marketing communications (with your consent)</li>
                                <li>Comply with legal obligations</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#0B3D6F] mb-4">4. Information Sharing</h2>
                            <p className="text-gray-700 leading-relaxed mb-3">
                                We may share your information with:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                <li><strong>Property Hosts:</strong> When you make a booking, we share necessary information with the host</li>
                                <li><strong>Service Providers:</strong> Third-party companies that help us operate our platform (payment processors, hosting services)</li>
                                <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
                                <li><strong>Business Transfers:</strong> In connection with a merger, sale, or acquisition</li>
                            </ul>
                            <p className="text-gray-700 leading-relaxed mt-4">
                                We do not sell your personal information to third parties.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#0B3D6F] mb-4">5. Data Security</h2>
                            <p className="text-gray-700 leading-relaxed">
                                We implement appropriate technical and organizational security measures to protect your personal
                                information. However, no method of transmission over the internet is 100% secure, and we cannot
                                guarantee absolute security.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#0B3D6F] mb-4">6. Your Rights</h2>
                            <p className="text-gray-700 leading-relaxed mb-3">You have the right to:</p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                <li>Access and receive a copy of your personal data</li>
                                <li>Correct inaccurate or incomplete information</li>
                                <li>Request deletion of your personal data</li>
                                <li>Object to or restrict processing of your data</li>
                                <li>Withdraw consent at any time</li>
                                <li>Lodge a complaint with a data protection authority</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#0B3D6F] mb-4">7. Cookies</h2>
                            <p className="text-gray-700 leading-relaxed">
                                We use cookies and similar tracking technologies to enhance your experience on our platform.
                                You can control cookie preferences through your browser settings.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#0B3D6F] mb-4">8. Children's Privacy</h2>
                            <p className="text-gray-700 leading-relaxed">
                                Our services are not intended for individuals under the age of 18. We do not knowingly collect
                                personal information from children.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#0B3D6F] mb-4">9. Changes to This Policy</h2>
                            <p className="text-gray-700 leading-relaxed">
                                We may update this Privacy Policy from time to time. We will notify you of any changes by posting
                                the new policy on this page and updating the "Last updated" date.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#0B3D6F] mb-4">10. Contact Us</h2>
                            <p className="text-gray-700 leading-relaxed">
                                If you have any questions about this Privacy Policy, please contact us at:
                            </p>
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                <p className="text-gray-700"><strong>Email:</strong> privacy@darlink.tn</p>
                                <p className="text-gray-700"><strong>Address:</strong> Tunis, Tunisia</p>
                            </div>
                        </section>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link href="/" className="text-[#0B3D6F] hover:text-[#F17720] font-semibold">
                        ← Back to Home
                    </Link>
                </div>
            </main>
        </div>
    )
}
