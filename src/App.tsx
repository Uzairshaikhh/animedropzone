import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
                <div style={{ padding: "20px", fontSize: "24px", color: "#fff" }}>
                  🚀 Website is loading... If you see this, React is working!
                </div>
              }
            />
          </Routes>
        </Router>
      </CartProvider>
    </ToastProvider>
  );
}
