import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StorePage } from './pages/Store';
import { AdminPage } from './pages/Admin';
import { TrackOrderPage } from './pages/TrackOrder';
import { ProductPage } from './pages/ProductPage';
import { CategoryPage } from './pages/CategoryPage';
import { MyOrdersPage } from './pages/MyOrders';
import { MyProfilePage } from './pages/MyProfileEnhanced';
import { ApproveQuote } from './pages/ApproveQuote';
import { TestQuoteEmail } from './pages/TestQuoteEmail';
import { ForgotPasswordPage } from './pages/ForgotPassword';
import { ResetPasswordPage } from './pages/ResetPassword';
import { ServerTestPage } from './pages/ServerTest';
import { EmailTestPage } from './pages/EmailTest';
import { PrivacyPolicyPage } from './pages/PrivacyPolicy';
import { TermsOfServicePage } from './pages/TermsOfService';
import { ToastProvider } from './contexts/ToastContext';
import { Favicon } from './components/Favicon';

export default function App() {
  return (
    <ToastProvider>
      <Favicon />
      <Router>
        <Routes>
          <Route path="/" element={<StorePage />} />
          <Route path="/secret-admin-panel-7b2cbf" element={<AdminPage />} />
          {/* Redirect old admin route to home */}
          <Route path="/admin" element={<StorePage />} />
          <Route path="/track-order" element={<TrackOrderPage />} />
          <Route path="/my-orders" element={<MyOrdersPage />} />
          <Route path="/my-profile" element={<MyProfilePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route path="/approve-quote/:id" element={<ApproveQuote />} />
          <Route path="/test-quote-email" element={<TestQuoteEmail />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/server-test" element={<ServerTestPage />} />
          <Route path="/email-test" element={<EmailTestPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}