import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">Market Genie</span>
            </Link>
            <Link 
              to="/" 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Effective Date:</strong> January 15, 2025
            </p>

            <p className="mb-6">
              These Terms of Service ("Terms") govern your use of Market Genie's lead generation and marketing automation platform ("Service") operated by Market Genie ("us," "we," or "our"). By accessing or using our Service, you agree to be bound by these Terms.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            
            <p className="mb-4">
              By creating an account, accessing, or using Market Genie, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not use our Service.
            </p>

            <p className="mb-4">
              These Terms constitute a legally binding agreement between you and Market Genie. We may modify these Terms at any time by posting updated Terms on our website. Your continued use of the Service after such modifications constitutes acceptance of the updated Terms.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Description of Service</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.1 Platform Features</h3>
            <p className="mb-4">Market Genie provides a comprehensive marketing automation platform including:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Lead generation and contact management</li>
              <li>Email campaign creation and automation</li>
              <li>Marketing funnel builder and optimization</li>
              <li>Analytics and performance tracking</li>
              <li>CRM integration and data management</li>
              <li>White-label reseller capabilities (premium plans)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.2 Service Availability</h3>
            <p className="mb-4">
              We strive to provide 99.9% uptime but do not guarantee uninterrupted service. We may temporarily suspend service for maintenance, updates, or due to circumstances beyond our control.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Account Registration and Eligibility</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.1 Eligibility Requirements</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>You must be at least 18 years old</li>
              <li>You must provide accurate and complete registration information</li>
              <li>You must have the authority to enter into this agreement</li>
              <li>You must comply with all applicable laws in your jurisdiction</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.2 Account Security</h3>
            <p className="mb-4">You are responsible for:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access</li>
              <li>Using strong, unique passwords and enabling two-factor authentication</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Subscription Plans and Billing</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.1 Plan Types</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Free Plan:</strong> Limited features (75 contacts, 300 emails/month, 3 campaigns)</li>
              <li><strong>Pro Plan:</strong> $20/month - Enhanced features and higher limits</li>
              <li><strong>Lifetime Plan:</strong> $300 one-time - Lifetime access to Pro features</li>
              <li><strong>White Label Plan:</strong> $497 one-time - Full white-label reseller rights</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.2 Billing and Payment</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Subscription fees are billed monthly in advance</li>
              <li>All payments are processed securely through Stripe</li>
              <li>Prices are subject to change with 30 days' notice</li>
              <li>Failed payments may result in service suspension</li>
              <li>Refunds are provided according to our refund policy (Section 5)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.3 Usage Limits</h3>
            <p className="mb-4">
              Each plan includes specific usage limits. Exceeding these limits may result in service restrictions or upgrade requirements. We monitor usage to ensure fair use and platform stability.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Refund and Cancellation Policy</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.1 Monthly Subscriptions</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>30-day money-back guarantee for new subscribers</li>
              <li>Cancel anytime with effect from the next billing cycle</li>
              <li>No refunds for partial months</li>
              <li>Access continues until the end of the paid period</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.2 Lifetime and White Label Plans</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>60-day money-back guarantee from purchase date</li>
              <li>Refunds subject to usage verification (no abuse)</li>
              <li>White label refunds require return of any reseller materials</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.3 Refund Process</h3>
            <p className="mb-4">
              To request a refund, contact Help@dubdproducts.com with your account details and reason. Approved refunds are processed within 5-10 business days to the original payment method.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Acceptable Use Policy</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">6.1 Permitted Uses</h3>
            <p className="mb-4">You may use Market Genie for legitimate business purposes including:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Lead generation and customer outreach</li>
              <li>Email marketing campaigns</li>
              <li>CRM and contact management</li>
              <li>Marketing automation and analytics</li>
              <li>White-label reselling (if licensed)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">6.2 Prohibited Activities</h3>
            <p className="mb-4">You may NOT use our Service for:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Spam:</strong> Sending unsolicited emails or violating CAN-SPAM Act</li>
              <li><strong>Illegal Content:</strong> Promoting illegal activities or content</li>
              <li><strong>Harassment:</strong> Abusive, threatening, or discriminatory communications</li>
              <li><strong>Fraud:</strong> Deceptive, misleading, or fraudulent practices</li>
              <li><strong>Malware:</strong> Distributing viruses, malware, or harmful code</li>
              <li><strong>Data Scraping:</strong> Unauthorized data collection or reverse engineering</li>
              <li><strong>System Abuse:</strong> Attempting to disrupt or overload our systems</li>
              <li><strong>Adult Content:</strong> Sexually explicit or adult-oriented material</li>
              <li><strong>Hate Speech:</strong> Content promoting hatred or violence</li>
              <li><strong>Copyright Infringement:</strong> Using copyrighted material without permission</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">6.3 Email Marketing Compliance</h3>
            <p className="mb-4">When using our email features, you must:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Obtain proper consent before adding contacts</li>
              <li>Include clear unsubscribe mechanisms</li>
              <li>Honor unsubscribe requests promptly</li>
              <li>Comply with CAN-SPAM, GDPR, and other applicable laws</li>
              <li>Use accurate sender information</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Content and Data Ownership</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">7.1 Your Content</h3>
            <p className="mb-4">You retain ownership of all content you upload, create, or generate using our Service, including:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Contact lists and lead data</li>
              <li>Email templates and campaign content</li>
              <li>Marketing funnels and landing pages</li>
              <li>Custom integrations and automations</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">7.2 License to Market Genie</h3>
            <p className="mb-4">
              By using our Service, you grant us a limited, non-exclusive license to host, store, process, and transmit your content solely for the purpose of providing our Service. This license ends when you delete your content or terminate your account.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">7.3 Market Genie Intellectual Property</h3>
            <p className="mb-4">
              Our platform, software, algorithms, and related intellectual property remain our exclusive property. You may not copy, modify, or create derivative works without explicit written permission.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">7.4 White Label Rights</h3>
            <p className="mb-4">
              White Label plan subscribers receive specific rights to rebrand and resell our platform. These rights are detailed in the separate White Label Agreement and do not include source code or core intellectual property.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Privacy and Data Protection</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">8.1 Data Processing</h3>
            <p className="mb-4">
              We process your data in accordance with our Privacy Policy and applicable data protection laws including GDPR, CCPA, and CAN-SPAM. You are responsible for ensuring you have proper consent for any personal data you upload.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">8.2 Data Security</h3>
            <p className="mb-4">
              We implement industry-standard security measures including encryption, access controls, and regular security audits. However, no system is 100% secure, and you acknowledge the inherent risks of internet-based services.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">8.3 Data Portability</h3>
            <p className="mb-4">
              You may export your data at any time in standard formats. Upon account termination, we will retain your data for 30 days before permanent deletion, unless longer retention is required by law.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Account Suspension and Termination</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">9.1 Termination by You</h3>
            <p className="mb-4">
              You may terminate your account at any time by:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Canceling your subscription in account settings</li>
              <li>Contacting our support team</li>
              <li>Following our account deletion process</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">9.2 Termination by Market Genie</h3>
            <p className="mb-4">We may suspend or terminate your account if you:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Violate these Terms or our Acceptable Use Policy</li>
              <li>Fail to pay subscription fees</li>
              <li>Engage in fraudulent or abusive behavior</li>
              <li>Pose a security risk to our platform or users</li>
              <li>Use our Service for illegal activities</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">9.3 Effect of Termination</h3>
            <p className="mb-4">Upon termination:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Your access to the Service will be immediately disabled</li>
              <li>Your data will be available for export for 30 days</li>
              <li>Recurring charges will cease (for voluntary cancellations)</li>
              <li>Certain provisions of these Terms will survive termination</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Disclaimers and Limitations of Liability</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">10.1 Service Disclaimers</h3>
            <p className="mb-4">
              OUR SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">10.2 Performance Disclaimers</h3>
            <p className="mb-4">We do not guarantee:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Specific marketing results or lead generation outcomes</li>
              <li>Email deliverability rates or campaign performance</li>
              <li>Compatibility with all third-party services</li>
              <li>Uninterrupted or error-free operation</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">10.3 Limitation of Liability</h3>
            <p className="mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR LIABILITY FOR ANY CLAIMS ARISING FROM OR RELATED TO YOUR USE OF OUR SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM.
            </p>

            <p className="mb-4">
              WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, DATA LOSS, OR BUSINESS INTERRUPTION.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Indemnification</h2>
            
            <p className="mb-4">
              You agree to defend, indemnify, and hold harmless Market Genie, its officers, directors, employees, and agents from and against any claims, damages, obligations, losses, liabilities, costs, or debt arising from:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Your use of our Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Your content or data uploaded to our platform</li>
              <li>Your marketing campaigns or communications</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Governing Law and Dispute Resolution</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">12.1 Governing Law</h3>
            <p className="mb-4">
              These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law principles.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">12.2 Dispute Resolution</h3>
            <p className="mb-4">
              Before filing any formal legal action, you agree to first contact us at Help@dubdproducts.com to seek an informal resolution. Most disputes can be resolved quickly through direct communication.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">12.3 Arbitration</h3>
            <p className="mb-4">
              If informal resolution fails, any disputes will be resolved through binding arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules. The arbitration will be conducted in Delaware or remotely.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">12.4 Class Action Waiver</h3>
            <p className="mb-4">
              You agree that any arbitration or legal proceeding will be conducted only on an individual basis and not as part of a class, consolidated, or representative action.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">13. Third-Party Integrations</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">13.1 Integration Availability</h3>
            <p className="mb-4">
              Our platform may integrate with third-party services such as CRM systems, email providers, and analytics tools. These integrations are subject to the availability and terms of the third-party providers.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">13.2 Third-Party Terms</h3>
            <p className="mb-4">
              Your use of third-party integrations is subject to their respective terms of service and privacy policies. We are not responsible for the practices or policies of third-party providers.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">14. Force Majeure</h2>
            
            <p className="mb-4">
              We shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including acts of God, natural disasters, war, terrorism, labor disputes, or government actions.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">15. Severability</h2>
            
            <p className="mb-4">
              If any provision of these Terms is found to be unenforceable or invalid, the remaining provisions will continue in full force and effect. The unenforceable provision will be replaced with an enforceable provision that most closely reflects our intent.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">16. Entire Agreement</h2>
            
            <p className="mb-4">
              These Terms, together with our Privacy Policy and any additional agreements you may have with us, constitute the entire agreement between you and Market Genie regarding your use of our Service.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">17. Contact Information</h2>
            
            <p className="mb-4">
              For questions about these Terms of Service, please contact us:
            </p>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Market Genie Support</h3>
              <p className="mb-2"><strong>Email:</strong> Help@dubdproducts.com</p>
              <p className="mb-2"><strong>Legal:</strong> legal@dubdproducts.com</p>
              <p className="mb-2"><strong>Response Time:</strong> We typically respond within 24 hours</p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Address</h3>
              <p className="text-blue-800">Market Genie<br />c/o DUBD Products<br />Legal Department<br />United States</p>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600 italic">
                By using Market Genie, you acknowledge that you have read these Terms of Service and agree to be bound by them. These Terms are effective as of the date stated above and will remain in effect until modified or terminated in accordance with the provisions herein.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;