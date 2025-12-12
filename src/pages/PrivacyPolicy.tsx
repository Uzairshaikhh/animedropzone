import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function PrivacyPolicyPage() {
  const navigate = useNavigate();
  const [customContent, setCustomContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchCustomContent();
  }, []);

  const fetchCustomContent = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/legal-content`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success && data.privacy) {
        setCustomContent(data.privacy);
      }
    } catch (error) {
      console.error('Error fetching custom privacy policy:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      );
    }

    if (customContent) {
      return (
        <div 
          className="space-y-8 text-gray-300 prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: customContent }}
        />
      );
    }

    // Default content
    return (
      <div className="space-y-8 text-gray-300">
        <section>
          <h2 className="text-2xl text-purple-300 mb-4">1. Introduction</h2>
          <p className="leading-relaxed">
            Welcome to animedropzone.com ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-purple-300 mb-4">2. Information We Collect</h2>
          <p className="leading-relaxed mb-4">We collect information that you provide directly to us, including:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Personal Information:</strong> Name, email address, phone number, shipping address</li>
            <li><strong>Payment Information:</strong> Payment method details (processed securely through our payment partners)</li>
            <li><strong>Order Information:</strong> Purchase history, product preferences, cart contents</li>
            <li><strong>Account Information:</strong> Username, password (encrypted), profile details</li>
            <li><strong>Communication Data:</strong> Support tickets, reviews, feedback, and correspondence</li>
            <li><strong>Technical Data:</strong> IP address, browser type, device information, cookies</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl text-purple-300 mb-4">3. How We Use Your Information</h2>
          <p className="leading-relaxed mb-4">We use the information we collect to:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Process and fulfill your orders</li>
            <li>Send order confirmations, shipping updates, and delivery notifications</li>
            <li>Provide customer support and respond to your inquiries</li>
            <li>Send promotional emails about new products, special offers, and updates (with your consent)</li>
            <li>Improve our website, products, and services</li>
            <li>Prevent fraud and enhance security</li>
            <li>Comply with legal obligations</li>
            <li>Manage our loyalty program and rewards</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl text-purple-300 mb-4">4. Information Sharing</h2>
          <p className="leading-relaxed mb-4">We may share your information with:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Payment Processors:</strong> Razorpay, PayTM for secure payment processing</li>
            <li><strong>Shipping Partners:</strong> Courier services for order delivery</li>
            <li><strong>Email Service Providers:</strong> For sending transactional and promotional emails</li>
            <li><strong>WhatsApp Business API:</strong> For order notifications and updates (via Twilio)</li>
            <li><strong>Analytics Providers:</strong> To understand website usage and improve our services</li>
            <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
          </ul>
          <p className="leading-relaxed mt-4">
            <strong>We do NOT sell your personal information to third parties.</strong>
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-purple-300 mb-4">5. Data Security</h2>
          <p className="leading-relaxed">
            We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-purple-300 mb-4">6. Cookies and Tracking Technologies</h2>
          <p className="leading-relaxed">
            We use cookies and similar tracking technologies to enhance your browsing experience, analyze website traffic, and personalize content. You can control cookie preferences through your browser settings. However, disabling cookies may limit some website functionality.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-purple-300 mb-4">7. Your Privacy Rights</h2>
          <p className="leading-relaxed mb-4">You have the right to:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Access:</strong> Request a copy of your personal information</li>
            <li><strong>Correction:</strong> Update or correct inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your account and personal data</li>
            <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
            <li><strong>Data Portability:</strong> Request your data in a portable format</li>
            <li><strong>Object:</strong> Object to processing of your personal information</li>
          </ul>
          <p className="leading-relaxed mt-4">
            To exercise these rights, please contact us at <strong className="text-purple-400">anime.drop.zone.00@gmail.com</strong>
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-purple-300 mb-4">8. Data Retention</h2>
          <p className="leading-relaxed">
            We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law. Order information is typically retained for 7 years for accounting and tax purposes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-purple-300 mb-4">9. Children's Privacy</h2>
          <p className="leading-relaxed">
            Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-purple-300 mb-4">10. International Data Transfers</h2>
          <p className="leading-relaxed">
            Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-purple-300 mb-4">11. Changes to This Policy</h2>
          <p className="leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-purple-300 mb-4">12. Contact Us</h2>
          <p className="leading-relaxed mb-4">
            If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:
          </p>
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6">
            <p className="mb-2"><strong>animedropzone.com</strong></p>
            <p className="mb-2">Email: <a href="mailto:anime.drop.zone.00@gmail.com" className="text-purple-400 hover:text-purple-300">anime.drop.zone.00@gmail.com</a></p>
            <p>Website: <a href="/" className="text-purple-400 hover:text-purple-300">animedropzone.com</a></p>
          </div>
        </section>

        <section className="border-t border-purple-500/30 pt-8 mt-8">
          <p className="text-gray-400 text-sm">
            By using AnimeDropZone, you acknowledge that you have read and understood this Privacy Policy and agree to its terms. 
            If you do not agree with this policy, please do not use our website or services.
          </p>
        </section>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white">
      {/* Header */}
      <nav className="bg-black/50 backdrop-blur-md border-b border-purple-900/30 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Home
              </button>
            </div>
            <Logo />
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 rounded-xl p-8 md:p-12"
        >
          <h1 className="text-4xl md:text-5xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Privacy Policy
          </h1>
          
          <p className="text-gray-400 mb-8">
            Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          {renderContent()}
        </motion.div>
      </main>
    </div>
  );
}