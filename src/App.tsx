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
                <div style={{ padding: "40px", color: "#fff", textAlign: "center" }}>
                  <h1>🎌 AnimeDropZone Store</h1>
                  <p>Store page is loading...</p>
                  <p>If you see this, the app is working!</p>
                  <p>We're rebuilding the store page to fix technical issues.</p>
                  <p>Please check back soon!</p>
                </div>
              }
            />
          </Routes>
        </Router>
      </CartProvider>
    </ToastProvider>
  );
}
}
