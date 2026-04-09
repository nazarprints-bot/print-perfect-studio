import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle, MapPin, Tag } from "lucide-react";

const CheckoutPage = () => {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({ name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" });
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [loading, setLoading] = useState(false);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", couponCode.toUpperCase())
      .eq("is_active", true)
      .single();

    if (error || !data) {
      toast.error("Invalid coupon code");
      return;
    }

    const now = new Date();
    if (data.start_date && new Date(data.start_date) > now) {
      toast.error("This coupon is not active yet");
      return;
    }
    if (data.end_date && new Date(data.end_date) < now) {
      toast.error("This coupon has expired");
      return;
    }
    if (data.max_uses && data.current_uses >= data.max_uses) {
      toast.error("This coupon has reached its usage limit");
      return;
    }
    if (cartTotal < data.min_order_amount) {
      toast.error(`Minimum order amount is ₹${data.min_order_amount}`);
      return;
    }

    let discountAmt = 0;
    if (data.discount_type === "percentage") {
      discountAmt = (cartTotal * data.discount_value) / 100;
    } else {
      discountAmt = data.discount_value;
    }
    setDiscount(discountAmt);
    setAppliedCoupon(data.code);
    toast.success(`Coupon applied! You save ₹${discountAmt}`);
  };

  const finalTotal = Math.max(0, cartTotal - discount);

  const handlePlaceOrder = async () => {
    if (!address.name || !address.phone || !address.line1 || !address.city || !address.state || !address.pincode) {
      toast.error("Please fill in all address fields");
      return;
    }
    if (!user) return;

    setLoading(true);

    const itemsSnapshot = items.map((item) => ({
      product_id: item.product_id,
      name: item.products?.name,
      quantity: item.quantity,
      price: item.products?.base_price,
      selected_color: item.selected_color,
      selected_size: item.selected_size,
    }));

    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      total_amount: finalTotal,
      items_snapshot: itemsSnapshot,
      shipping_address: address,
      coupon_code: appliedCoupon || null,
      discount_amount: discount,
      tracking_history: [{ status: "ordered", timestamp: new Date().toISOString() }],
    });

    if (error) {
      toast.error("Failed to place order");
      setLoading(false);
      return;
    }

    clearCart();
    toast.success("Order placed successfully! 🎉");
    navigate("/orders");
    setLoading(false);
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 animate-slide-up">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6 animate-slide-up">
            {/* Shipping Address */}
            <div className="bg-card rounded-2xl border p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> Shipping Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    placeholder="Your name"
                    value={address.name}
                    onChange={(e) => setAddress({ ...address, name: e.target.value })}
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    placeholder="+91 XXXXX XXXXX"
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Address Line 1</Label>
                  <Input
                    placeholder="House no, Street, Area"
                    value={address.line1}
                    onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Address Line 2 (Optional)</Label>
                  <Input
                    placeholder="Landmark"
                    value={address.line2}
                    onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    placeholder="City"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    placeholder="State"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>PIN Code</Label>
                  <Input
                    placeholder="XXXXXX"
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                    className="rounded-xl"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Coupon */}
            <div className="bg-card rounded-2xl border p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" /> Coupon Code
              </h2>
              <div className="flex gap-3">
                <Input
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="rounded-xl"
                  disabled={!!appliedCoupon}
                />
                <Button
                  onClick={applyCoupon}
                  variant={appliedCoupon ? "secondary" : "default"}
                  className="rounded-xl px-6"
                  disabled={!!appliedCoupon}
                >
                  {appliedCoupon ? "Applied ✓" : "Apply"}
                </Button>
              </div>
              {appliedCoupon && (
                <p className="text-sm text-primary mt-2 flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" /> Coupon "{appliedCoupon}" applied — You save ₹{discount}
                </p>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="bg-card rounded-2xl border p-6 sticky top-20">
              <h2 className="font-bold text-lg mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-muted-foreground line-clamp-1 flex-1">{item.products?.name} × {item.quantity}</span>
                    <span className="font-medium ml-2">₹{((item.products?.base_price || 0) * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-primary">Free</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-base">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-primary text-lg">₹{finalTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <Button
                onClick={handlePlaceOrder}
                className="w-full rounded-xl mt-6 h-12 text-base shadow-lg shadow-primary/20"
                disabled={loading}
              >
                {loading ? "Placing Order..." : `Place Order — ₹${finalTotal.toLocaleString("en-IN")}`}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Payment will be collected on delivery (COD)
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
