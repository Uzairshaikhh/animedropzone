import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { StorePage } from "./pages/Store";
import { AdminPage } from "./pages/Admin";
import { TrackOrderPage } from "./pages/TrackOrder";
import { ProductPage } from "./pages/ProductPage";
import { CategoryPage } from "./pages/CategoryPage";
import { MyOrdersPage } from "./pages/MyOrders";
import { MyProfilePage } from "./pages/MyProfileEnhanced";
import { ApproveQuote } from "./pages/ApproveQuote";
import { TestQuoteEmail } from "./pages/TestQuoteEmail";
import { ForgotPasswordPage } from "./pages/ForgotPassword";
import { ResetPasswordPage } from "./pages/ResetPassword";
import { ServerTestPage } from "./pages/ServerTest";
import { EmailTestPage } from "./pages/EmailTest";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicy";
import { TermsOfServicePage } from "./pages/TermsOfService";
import { ToastProvider } from "./contexts/ToastContext";
import { Favicon } from "./components/Favicon";
import { ErrorBoundary } from "./components/ErrorBoundary";

export default function App() {
  return (
    <ToastProvider>
      <Favicon />
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <div
                style={{
                  minHeight: "100vh",
                  backgroundColor: "#0000ff",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "48px",
                  fontWeight: "bold",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#333",
                    padding: "40px",
                    borderRadius: "10px",
                    border: "5px solid #ffff00",
                  }}
                >
                  <h1 style={{ color: "#ff0000", marginBottom: "20px" }}>MAIN PAGE TEST</h1>
                  <p style={{ color: "#ffffff" }}>If you see this BLUE background, the app is working.</p>
                  <p style={{ color: "#00ff00", marginTop: "20px" }}>Time: {new Date().toLocaleString()}</p>
                </div>
              </div>
            }
          />
          <Route
            path="/secret-admin-panel-7b2cbf"
            element={
              <div
                style={{
                  minHeight: "100vh",
                  backgroundColor: "#ff0000",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "48px",
                  fontWeight: "bold",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#333",
                    padding: "40px",
                    borderRadius: "10px",
                    border: "5px solid #00ff00",
                  }}
                >
                  <h1 style={{ color: "#ffff00", marginBottom: "20px" }}>ADMIN ROUTE WORKING!</h1>
                  <p style={{ color: "#ffffff" }}>
                    If you see this RED background with this message, routing is working.
                  </p>
                  <p style={{ color: "#ff00ff", marginTop: "20px" }}>Time: {new Date().toLocaleString()}</p>
                </div>
              </div>
            }
          />
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
