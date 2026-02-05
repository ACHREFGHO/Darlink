import Link from 'next/link'
import { Shield, Lock, Eye, UserCheck, AlertCircle, CheckCircle } from 'lucide-react'

export default function TrustSafetyPage() {
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
                    <div className="inline-flex p-4 bg-green-50 rounded-full mb-6">
                        <Shield className="w-12 h-12 text-green-600" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#0B3D6F] mb-4">Trust & Safety</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Your security and peace of mind are our top priorities. Learn how we keep our community safe.
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Verification */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <UserCheck className="w-6 h-6 text-[#0B3D6F]" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-[#0B3D6F] mb-3">Identity Verification</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    All hosts on DARLINK undergo a comprehensive identity verification process. We verify government-issued IDs,
                                    phone numbers, and email addresses to ensure authenticity and build trust within our community.
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2 text-gray-700">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        Government ID verification
                                    </li>
                                    <li className="flex items-center gap-2 text-gray-700">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        Phone and email confirmation
                                    </li>
                                    <li className="flex items-center gap-2 text-gray-700">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        Property ownership verification
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Secure Payments */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <Lock className="w-6 h-6 text-[#0B3D6F]" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-[#0B3D6F] mb-3">Secure Payment Processing</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    Your financial information is protected with bank-level encryption. We never share your payment details
                                    with hosts, and all transactions are processed through secure, industry-standard payment gateways.
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2 text-gray-700">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        256-bit SSL encryption
                                    </li>
                                    <li className="flex items-center gap-2 text-gray-700">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        PCI DSS compliant
                                    </li>
                                    <li className="flex items-center gap-2 text-gray-700">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        Fraud detection systems
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Privacy Protection */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <Eye className="w-6 h-6 text-[#0B3D6F]" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-[#0B3D6F] mb-3">Privacy Protection</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    We respect your privacy and protect your personal information. Your contact details are only shared
                                    with confirmed booking parties, and you have full control over your data.
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2 text-gray-700">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        GDPR compliant data handling
                                    </li>
                                    <li className="flex items-center gap-2 text-gray-700">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        Secure data storage
                                    </li>
                                    <li className="flex items-center gap-2 text-gray-700">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        Right to data deletion
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Report Issues */}
                    <div className="bg-gradient-to-br from-orange-50 to-blue-50 rounded-2xl p-8 border border-orange-100">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white rounded-lg shadow-sm">
                                <AlertCircle className="w-6 h-6 text-[#F17720]" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-[#0B3D6F] mb-3">Report Safety Concerns</h2>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    If you encounter any suspicious activity or safety concerns, please report it immediately.
                                    Our team is available 24/7 to address your concerns.
                                </p>
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center gap-2 bg-[#F17720] hover:bg-[#d1661b] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                                >
                                    Report an Issue
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
