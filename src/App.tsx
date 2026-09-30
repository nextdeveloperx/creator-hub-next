import { useState, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/lib/auth";
import { ScrollToTop } from "@/components/ScrollToTop";
import { LoadingScreen } from "@/components/LoadingScreen";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Support from "./pages/Support";
import Membership from "./pages/Membership";
import Shop from "./pages/Shop";
import AI from "./pages/AI";
import AIProductDetail from "./pages/AIProductDetail";
import Dashboard from "./pages/Dashboard";
import { AdminSidebarLayout } from "@/components/admin/AdminSidebarLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminMaterials from "./pages/admin/AdminMaterials";
import AdminShopProducts from "./pages/admin/AdminShopProducts";
import AdminAIProducts from "./pages/admin/AdminAIProducts";
import AdminAppReleases from "./pages/admin/AdminAppReleases";
import AdminPromotions from "./pages/admin/AdminPromotions";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Refund from "./pages/Refund";
import Blog from "./pages/Blog";
import Tutorials from "./pages/Tutorials";
import Docs from "./pages/Docs";
import Services from "./pages/Services";
import Success from "./pages/Success";
import PaymentFailed from "./pages/PaymentFailed";
import ProductDetail from "./pages/ProductDetail";
import ResetPassword from "./pages/ResetPassword";
const queryClient = new QueryClient();

const App = () => {
  const [showLoader, setShowLoader] = useState(true);
  const handleLoaderComplete = useCallback(() => setShowLoader(false), []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AnimatePresence>
              {showLoader && <LoadingScreen onComplete={handleLoaderComplete} />}
            </AnimatePresence>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/support" element={<Support />} />
              <Route path="/membership" element={<Membership />} />
              <Route path="/ai" element={<AI />} />
              <Route path="/ai/:slug" element={<AIProductDetail />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/shop/:id" element={<ProductDetail />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminSidebarLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="materials" element={<AdminMaterials />} />
                <Route path="shop-products" element={<AdminShopProducts />} />
                <Route path="ai-products" element={<AdminAIProducts />} />
                <Route path="app-releases" element={<AdminAppReleases />} />
                <Route path="promotions" element={<AdminPromotions />} />
              </Route>
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/refund" element={<Refund />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/tutorials" element={<Tutorials />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/services" element={<Services />} />
              <Route path="/success" element={<Success />} />
              <Route path="/payment-failed" element={<PaymentFailed />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
