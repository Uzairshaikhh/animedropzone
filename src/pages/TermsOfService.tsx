import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function TermsOfServicePage() {
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
      if (data.success && data.terms) {
        setCustomContent(data.terms);
      }
    } catch (error) {
      console.error('Error fetching custom terms of service:', error);
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
          <h2 className="text-2xl text-purple-300 mb-4">1. Acceptance of Terms</h2>
          <p className="leading-relaxed">
            Welcome to animedropzone.com! By accessing or using our website and services, you agree to be bound by these Terms of Service ("Terms"). If you do not agree with these Terms, please do not use our services. We reserve the right to modify these Terms at any time, and your continued use of the website constitutes acceptance of any changes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-purple-300 mb-4">2. Description of Service</h2>
          <p className="leading-relaxed">
            animedropzone.com is an e-commerce platform specializing in anime figures, accessories, posters, clothing, collectibles, and katana. We provide an online marketplace where customers can browse, purchase, and receive anime-related merchandise. We reserve the right to modify, suspend, or discontinue any aspect of our services at any time.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-purple-300 mb-4">3. User Accounts</h2>
          <p className="leading-relaxed mb-4">To make purchases, you must create an account. You agree to:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Provide accurate, current, and complete information during registration</li>
            <li>Maintain and promptly update your account information</li>
            <li>Keep your password confidential and secure</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
            <li>Be responsible for all activities that occur under your account</li>
            <li>Not share your account with others</li>
          </ul>
          <p className="leading-relaxed mt-4">
            You must be at least 18 years old to create an account. We reserve the right to refuse service or terminate accounts at our discretion.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-purple-300 mb-4">4. Orders and Payments</h2>
          <h3 className="text-xl text-purple-200 mb-3 mt-4">4.1 Placing Orders</h3>
          <p className="leading-relaxed">
            When you place an order, you are making an offer to purchase products. We reserve the right to accept or decline your order for any reason, including product availability, pricing errors, or suspected fraudulent activity.
          </p>
          
          <h3 className="text-xl text-purple-200 mb-3 mt-4">4.2 Pricing</h3>
          <p className="leading-relaxed">
            All prices are listed in Indian Rupees (₹) and are subject to change without notice. We make every effort to ensure pricing accuracy, but errors may occur. If a product is listed at an incorrect price, we reserve the right to refuse or cancel orders placed at that price.
          </p>
          
          <h3 className="text-xl text-purple-200 mb-3 mt-4">4.3 Payment Methods</h3>
          <p className="leading-relaxed mb-2">We accept the following payment methods:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>UPI (Google Pay, PhonePe, Paytm, BHIM, etc.)</li>
            <li>Razorpay (Credit/Debit Cards, Net Banking, Wallets)</li>
            <li>PayTM</li>
            <li>Cash on Delivery (COD) - subject to availability</li>
          </ul>
          
          <h3 className="text-xl text-purple-200 mb-3 mt-4">4.4 Shipping Charges</h3>
          <p className="leading-relaxed">
            A flat shipping charge of ₹100 applies to all orders, regardless of order value or location within India.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-purple-300 mb-4">5. Shipping and Delivery</h2>
          <p className="leading-relaxed mb-4">
            We ship products across India. Delivery times may vary based on your location and product availability. You will receive tracking information via email and WhatsApp once your order is shipped.
          </p>
          <p className="leading-relaxed">
            <strong>Important:</strong> Please ensure your shipping address is accurate. We are not responsible for delays or non-delivery due to incorrect addresses provided by customers.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-purple-300 mb-4">6. Returns and Refunds</h2>
          <h3 className="text-xl text-purple-200 mb-3 mt-4">6.1 Return Policy</h3>
          <p className="leading-relaxed mb-4">
            We want you to be completely satisfied with your purchase. Returns are accepted under the following conditions:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Products must be returned within 7 days of delivery</li>
            <li>Items must be unused, in original packaging, and in resellable condition</li>
            <li>Proof of purchase (order ID) must be provided</li>
            <li>Custom clothing orders are non-returnable unless defective</li>
            <li>Collectibles and limited edition items may have special return policies</li>
          </ul>
          
          <h3 className="text-xl text-purple-200 mb-3 mt-4">6.2 Refund Process</h3>
          <p className="leading-relaxed">
            Refunds for online payments (UPI, Razorpay, PayTM) will be processed within 5-7 business days after we receive and inspect the returned item. COD orders are not eligible for cash refunds.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-purple-300 mb-4">7. Order Cancellation</h2>
          <p className="leading-relaxed mb-4">
            You may cancel your order before it is shipped. To cancel an order:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Go to "Track Order" and enter your tracking ID</li>
            <li>Click "Cancel Order" and provide a reason</li>
            <li>You will receive a cancellation confirmation via email and WhatsApp</li>
          </ul>
          <p className="leading-relaxed mt-4">
            Orders cannot be cancelled once they are shipped. In such cases, you must follow the return process after receiving the product.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-purple-300 mb-4">8. Product Descriptions and Images</h2>
          <p className="leading-relaxed">
            We strive to display product colors, images, and descriptions as accurately as possible. However, actual colors may vary slightly due to screen settings. Product images are for illustration purposes and may include accessories or components not included with the purchase.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-purple-300 mb-4">9. Intellectual Property</h2>
          <p className="leading-relaxed mb-4">
            All content on AnimeDropZone, including but not limited to text, graphics, logos, images, and software, is our property or the property of our licensors and is protected by intellectual property laws. You may not:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Reproduce, distribute, or publicly display any content without permission</li>
            <li>Use our brand name, logo, or trademarks without authorization</li>
            <li>Copy or scrape product listings or images</li>
            <li>Reverse engineer or modify any part of our website</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl text-purple-300 mb-4">10. User Conduct</h2>
          <p className="leading-relaxed mb-4">You agree not to:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Use our services for any illegal or unauthorized purpose</li>
            <li>Violate any laws in your jurisdiction</li>
            <li>Transmit any harmful code, viruses, or malware</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Harass, abuse, or harm other users or our staff</li>
            <li>Submit false or misleading information</li>
            <li>Engage in fraudulent activities or payment disputes</li>
            <li>Post inappropriate reviews or content</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl text-purple-300 mb-4">11. Reviews and User Content</h2>
          <p className="leading-relaxed">
            You may submit product reviews and ratings. By submitting content, you grant us a non-exclusive, royalty-free, perpetual license to use, reproduce, modify, and display your content. We reserve the right to remove any content that violates these Terms or is deemed inappropriate.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-purple-300 mb-4">12. Loyalty Program</h2>
          <p className="leading-relaxed">
            Our loyalty program rewards returning customers with points that can be redeemed for discounts. Program terms, point values, and redemption rules are subject to change. Points have no cash value and cannot be transferred.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-purple-300 mb-4">13. Coupons and Promotions</h2>
          <p className="leading-relaxed">
            Coupon codes and promotional offers are subject to specific terms and conditions. Coupons may have expiration dates, minimum order requirements, and usage limits. We reserve the right to cancel or modify promotions at any time.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-purple-300 mb-4">14. Limitation of Liability</h2>
          <p className="leading-relaxed">
            To the fullest extent permitted by law, AnimeDropZone shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services. Our total liability shall not exceed the amount you paid for the product in question.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-purple-300 mb-4">15. Disclaimer of Warranties</h2>
          <p className="leading-relaxed">
            Our services are provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that our website will be uninterrupted, error-free, or secure.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-purple-300 mb-4">16. Indemnification</h2>
          <p className="leading-relaxed">
            You agree to indemnify and hold harmless AnimeDropZone, its officers, directors, employees, and affiliates from any claims, damages, losses, or expenses arising from your violation of these Terms or misuse of our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-purple-300 mb-4">17. Governing Law</h2>
          <p className="leading-relaxed">
            These Terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in [Your City], India.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-purple-300 mb-4">18. Contact Information</h2>
          <p className="leading-relaxed mb-4">
            For questions, concerns, or support regarding these Terms of Service, please contact us:
          </p>
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6">
            <p className="mb-2"><strong>animedropzone.com</strong></p>
            <p className="mb-2">Email: <a href="mailto:anime.drop.zone.00@gmail.com" className="text-purple-400 hover:text-purple-300">anime.drop.zone.00@gmail.com</a></p>
            <p>Website: <a href="/" className="text-purple-400 hover:text-purple-300">animedropzone.com</a></p>
          </div>
        </section>

        <section className="border-t border-purple-500/30 pt-8 mt-8">
          <p className="text-gray-400 text-sm">
            By using AnimeDropZone, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. 
            If you do not agree with these Terms, please discontinue use of our website and services immediately.
          </p>
          <p className="text-gray-400 text-sm mt-4">
            <strong>Thank you for shopping with AnimeDropZone! 🎌💜</strong>
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
            Terms of Service
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