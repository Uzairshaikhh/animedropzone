import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { StorePage } from "./pages/Store";
import { ToastProvider } from "./contexts/ToastContext";
import { CartProvider } from "./contexts/CartContext";
import { Favicon } from "./components/Favicon";

export default function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <Router>
          <Favicon />
          <Routes>
            <Route
              path="/"
              element={
                <Suspense fallback={<div style={{ padding: "20px", color: "#fff" }}>Loading store...</div>}>
                  <StorePage />
                </Suspense>
              }
            />
          </Routes>
        </Router>
      </CartProvider>
    </ToastProvider>
  );
}
