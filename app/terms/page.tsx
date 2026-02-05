import Link from 'next/link'

export default function TermsOfServicePage() {
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
                    <h1 className="text-4xl font-bold text-[#0B3D6F] mb-4">Terms of Service</h1>
                    <p className="text-gray-600 mb-8">Last updated: February 5, 2026</p>

                    <div className="prose prose-blue max-w-none space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold text-[#0B3D6F] mb-4">1. Agreement to Terms</h2>
                            <p className="text-gray-700 leading-relaxed">
                                By accessing or using DARLINK's platform, you agree to be bound by these Terms of Service and all
                                applicable laws and regulations. If you do not agree with any of these terms, you are prohibited
                                from using or accessing this platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#0B3D6F] mb-4">2. Use License</h2>
                            <p className="text-gray-700 leading-relaxed mb-3">
                                Permission is granted to temporarily access and use DARLINK for personal, non-commercial purposes.
                                This license does not include:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                <li>Modifying or copying the materials</li>
                                <li>Using the materials for commercial purposes</li>
                                <li>Attempting to reverse engineer any software</li>
                                <li>Removing copyright or proprietary notations</li>
                                <li>Transferring the materials to another person</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#0B3D6F] mb-4">3. User Accounts</h2>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Account Creation</h3>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                To use certain features, you must create an account. You agree to:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                <li>Provide accurate, current, and complete information</li>
                                <li>Maintain and update your information</li>
                                <li>Maintain the security of your password</li>
                                <li>Accept responsibility for all activities under your account</li>
                                <li>Notify us immediately of any unauthorized use</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Account Termination</h3>
                            <p className="text-gray-700 leading-relaxed">
                                We reserve the right to suspend or terminate your account if you violate these Terms of Service
                                or engage in fraudulent, illegal, or harmful activities.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#0B3D6F] mb-4">4. Bookings and Payments</h2>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">For Guests</h3>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                                <li>Booking requests are subject to host acceptance</li>
                                <li>Payment is processed only after host confirmation</li>
                                <li>Cancellation policies vary by property</li>
                                <li>Service fees are non-refundable unless otherwise stated</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-900 mb-3">For Hosts</h3>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                <li>You must accurately represent your property</li>
                                <li>You are responsible for property maintenance and safety</li>
                                <li>Payments are released 24 hours after guest check-in</li>
                                <li>Platform fees apply to all confirmed bookings</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#0B3D6F] mb-4">5. Content Standards</h2>
                            <p className="text-gray-700 leading-relaxed mb-3">
                                Users must not post content that:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                <li>Is false, misleading, or fraudulent</li>
                                <li>Violates intellectual property rights</li>
                                <li>Contains hate speech, harassment, or discrimination</li>
                                <li>Promotes illegal activities</li>
                                <li>Contains malware or harmful code</li>
                                <li>Violates privacy rights of others</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#0B3D6F] mb-4">6. Intellectual Property</h2>
                            <p className="text-gray-700 leading-relaxed">
                                All content on DARLINK, including text, graphics, logos, images, and software, is the property of
                                DARLINK or its content suppliers and is protected by international copyright laws. User-generated
                                content remains the property of the user, but you grant us a license to use it on our platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#0B3D6F] mb-4">7. Limitation of Liability</h2>
                            <p className="text-gray-700 leading-relaxed">
                                DARLINK acts as a marketplace connecting hosts and guests. We are not responsible for:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-3">
                                <li>The condition, safety, or legality of properties listed</li>
                                <li>The accuracy of listings or user profiles</li>
                                <li>The performance or conduct of hosts or guests</li>
                                <li>Any damages or losses incurred during stays</li>
                            </ul>
                            <p className="text-gray-700 leading-relaxed mt-4">
                                Our total liability shall not exceed the amount of fees paid by you in the 12 months prior to
                                the event giving rise to liability.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#0B3D6F] mb-4">8. Dispute Resolution</h2>
                            <p className="text-gray-700 leading-relaxed">
                                In the event of a dispute between users, we encourage direct communication. If unresolved,
                                disputes shall be settled through binding arbitration in accordance with Tunisian law.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#0B3D6F] mb-4">9. Modifications</h2>
                            <p className="text-gray-700 leading-relaxed">
                                We reserve the right to modify these Terms of Service at any time. Changes will be effective
                                immediately upon posting. Your continued use of the platform constitutes acceptance of the
                                modified terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#0B3D6F] mb-4">10. Governing Law</h2>
                            <p className="text-gray-700 leading-relaxed">
                                These Terms of Service are governed by and construed in accordance with the laws of Tunisia,
                                and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#0B3D6F] mb-4">11. Contact Information</h2>
                            <p className="text-gray-700 leading-relaxed">
                                For questions about these Terms of Service, please contact us:
                            </p>
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                <p className="text-gray-700"><strong>Email:</strong> legal@darlink.tn</p>
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
