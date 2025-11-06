import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Effective Date:</strong> January 15, 2025
            </p>

            <p className="mb-6">
              Market Genie ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our lead generation and marketing automation platform.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">1.1 Personal Information</h3>
            <p className="mb-4">We collect information that identifies, relates to, or could reasonably be linked with you, including:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Name, email address, and contact information</li>
              <li>Account credentials and authentication information</li>
              <li>Payment and billing information</li>
              <li>Professional information (company name, job title, industry)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">1.2 Lead and Campaign Data</h3>
            <p className="mb-4">When you use our platform, we collect and process:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Lead contact information you upload or generate</li>
              <li>Email campaign content and performance metrics</li>
              <li>Website interaction data and analytics</li>
              <li>Campaign automation settings and preferences</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">1.3 Technical Information</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>IP address, device information, and browser type</li>
              <li>Usage patterns and platform interaction data</li>
              <li>Performance metrics and error logs</li>
              <li>Location data (general geographic region)</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.1 Platform Services</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide lead generation and marketing automation services</li>
              <li>Process and send email campaigns on your behalf</li>
              <li>Generate analytics and performance reports</li>
              <li>Maintain and improve platform functionality</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.2 Account Management</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Create and manage your account</li>
              <li>Process payments and billing</li>
              <li>Provide customer support</li>
              <li>Send important account notifications</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.3 Legal and Security</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Comply with legal obligations</li>
              <li>Protect against fraud and abuse</li>
              <li>Enforce our Terms of Service</li>
              <li>Maintain platform security and integrity</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Information Sharing and Disclosure</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.1 Service Providers</h3>
            <p className="mb-4">We may share information with trusted third-party service providers who assist us in:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Cloud hosting and data storage (Firebase/Google Cloud)</li>
              <li>Payment processing (Stripe)</li>
              <li>Email delivery services</li>
              <li>Analytics and performance monitoring</li>
              <li>Customer support tools</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.2 Lead Data Processing</h3>
            <p className="mb-4">
              When you use our lead generation features, we may access publicly available information or work with data partners to enhance lead profiles. This includes professional contact information from business directories, social media platforms, and other public sources.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.3 Legal Requirements</h3>
            <p className="mb-4">We may disclose information when required by law or to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Respond to legal requests or court orders</li>
              <li>Protect our rights, property, or safety</li>
              <li>Investigate potential violations of our Terms</li>
              <li>Prevent fraud or security threats</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Data Security</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.1 Security Measures</h3>
            <p className="mb-4">We implement robust security measures to protect your information:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Encryption in transit and at rest</li>
              <li>Multi-factor authentication options</li>
              <li>Regular security audits and monitoring</li>
              <li>Access controls and permission management</li>
              <li>Secure cloud infrastructure (Google Cloud Platform)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.2 Data Breach Response</h3>
            <p className="mb-4">
              In the event of a data breach, we will promptly notify affected users and regulatory authorities as required by applicable law. We maintain an incident response plan to minimize the impact of any security incidents.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Data Retention</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.1 Retention Periods</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Account Data:</strong> Retained while your account is active and for 3 years after closure</li>
              <li><strong>Lead Data:</strong> Retained as long as campaigns are active or for 2 years after last use</li>
              <li><strong>Campaign Data:</strong> Retained for 5 years for analytics and compliance purposes</li>
              <li><strong>Payment Data:</strong> Retained for 7 years for tax and audit purposes</li>
              <li><strong>Support Data:</strong> Retained for 3 years from last interaction</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.2 Data Deletion</h3>
            <p className="mb-4">
              You may request deletion of your personal data at any time by contacting us at Help@dubdproducts.com. We will delete your data within 30 days, subject to legal and regulatory retention requirements.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Your Rights and Choices</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">6.1 Access and Control</h3>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Access and review your personal information</li>
              <li>Update or correct inaccurate data</li>
              <li>Delete your account and associated data</li>
              <li>Export your data in a portable format</li>
              <li>Opt-out of marketing communications</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">6.2 Communication Preferences</h3>
            <p className="mb-4">
              You can manage your communication preferences in your account settings or by clicking unsubscribe links in our emails. Note that we may still send essential account-related notifications.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">6.3 Cookie Management</h3>
            <p className="mb-4">
              You can control cookie settings through your browser preferences. Note that disabling certain cookies may affect platform functionality.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. International Data Transfers</h2>
            
            <p className="mb-4">
              Our services are primarily hosted in the United States. If you access our platform from outside the US, your information may be transferred to, stored, and processed in the United States and other countries where our service providers operate.
            </p>

            <p className="mb-4">
              We ensure appropriate safeguards are in place for international transfers, including standard contractual clauses and adequacy decisions where applicable.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Children's Privacy</h2>
            
            <p className="mb-4">
              Our platform is designed for business use and is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children under 18. If we become aware that we have collected such information, we will promptly delete it.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Third-Party Integrations</h2>
            
            <p className="mb-4">
              Our platform may integrate with third-party services (CRM systems, email providers, analytics tools). These integrations are governed by the privacy policies of those third parties. We encourage you to review their privacy practices.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. California Privacy Rights</h2>
            
            <p className="mb-4">
              California residents have additional rights under the California Consumer Privacy Act (CCPA), including:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Right to know what personal information is collected</li>
              <li>Right to delete personal information</li>
              <li>Right to opt-out of the sale of personal information</li>
              <li>Right to non-discrimination for exercising privacy rights</li>
            </ul>

            <p className="mb-4">
              <strong>Note:</strong> We do not sell personal information to third parties.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Updates to This Policy</h2>
            
            <p className="mb-4">
              We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. We will notify you of material changes by:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Posting the updated policy on our website</li>
              <li>Sending email notification to registered users</li>
              <li>Displaying a notice in your account dashboard</li>
            </ul>

            <p className="mb-4">
              Your continued use of our platform after the effective date of updates constitutes acceptance of the revised policy.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Contact Information</h2>
            
            <p className="mb-4">
              For questions about this Privacy Policy or to exercise your privacy rights, please contact us:
            </p>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Privacy Officer</h3>
              <p className="mb-2"><strong>Email:</strong> privacy@dubdproducts.com</p>
              <p className="mb-2"><strong>Support:</strong> Help@dubdproducts.com</p>
              <p className="mb-2"><strong>Response Time:</strong> We will respond to privacy requests within 30 days</p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Data Protection Officer (EU/UK)</h3>
              <p className="text-blue-800">For EU and UK residents, you may also contact our Data Protection Officer at dpo@dubdproducts.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;