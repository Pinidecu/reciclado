import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import { setAuthTokenGetter } from "@workspace/api-client-react";

import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import RegisterMerchantPage from "@/pages/register-merchant";
import RegisterBuyerPage from "@/pages/register-buyer";
import ProductsPage from "@/pages/products";
import ProductDetailPage from "@/pages/product-detail";
import NearbyPage from "@/pages/nearby";
import OrderSuccessPage from "@/pages/order-success";
import MyOrdersPage from "@/pages/my-orders";
import BuyerProfilePage from "@/pages/buyer/profile";

import MerchantDashboard from "@/pages/merchant/dashboard";
import MerchantProductsPage from "@/pages/merchant/products";
import ProductFormPage from "@/pages/merchant/product-form";
import MerchantOrdersPage from "@/pages/merchant/orders";
import ScanQRPage from "@/pages/merchant/scan-qr";
import MerchantProfilePage from "@/pages/merchant/profile";

import NotFoundPage from "@/pages/not-found";

// Configure auth token getter so all API calls include JWT
setAuthTokenGetter(() => localStorage.getItem("ra_token"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/register/merchant" component={RegisterMerchantPage} />
      <Route path="/register/buyer" component={RegisterBuyerPage} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/products/:id" component={ProductDetailPage} />
      <Route path="/nearby" component={NearbyPage} />

      {/* Buyer */}
      <Route path="/orders/:id/success" component={OrderSuccessPage} />
      <Route path="/my-orders" component={MyOrdersPage} />
      <Route path="/buyer" component={BuyerProfilePage} />
      <Route path="/buyer/profile" component={BuyerProfilePage} />

      {/* Merchant */}
      <Route path="/merchant" component={MerchantDashboard} />
      <Route path="/merchant/products" component={MerchantProductsPage} />
      <Route path="/merchant/products/new" component={ProductFormPage} />
      <Route path="/merchant/products/:id/edit" component={ProductFormPage} />
      <Route path="/merchant/orders" component={MerchantOrdersPage} />
      <Route path="/merchant/orders/scan" component={ScanQRPage} />
      <Route path="/merchant/profile" component={MerchantProfilePage} />

      <Route component={NotFoundPage} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
