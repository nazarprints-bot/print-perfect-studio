import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";

interface PricingSlab {
  min: number;
  max: number;
  price: number;
}

const CartPage = () => {
  const { items, isLoading, updateQuantity, removeFromCart, cartTotal, totalItems } = useCart();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16 text-center animate-slide-up">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Please Sign In</h1>
          <p className="text-muted-foreground mb-6">You need to sign in to view your cart</p>
          <Button asChild className="rounded-xl">
            <Link to="/auth">Sign In</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16 text-center">
          <div className="animate-pulse text-muted-foreground">Loading cart...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16 text-center animate-slide-up">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-6">Start shopping to add items to your cart</p>
          <Button asChild className="rounded-xl">
            <Link to="/">Browse Products</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 animate-slide-up">Shopping Cart ({totalItems})</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => {
              const images = item.products?.images as string[] | null;
              const imgUrl = images?.[0] || "/placeholder.svg";
              const slabs = item.products?.pricing_slabs as unknown as PricingSlab[] | null;
              let unitPrice = item.products?.base_price || 0;
              if (slabs && slabs.length > 0) {
                const slab = slabs.find((s) => item.quantity >= s.min && item.quantity <= s.max);
                if (slab) unitPrice = slab.price;
                else if (item.quantity > slabs[slabs.length - 1].max) unitPrice = slabs[slabs.length - 1].price;
              }

              return (
                <div
                  key={item.id}
                  className="flex gap-4 bg-card rounded-2xl border p-4 animate-slide-up hover:shadow-md transition-shadow"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Link to={`/product/${item.products?.slug}`} className="flex-shrink-0">
                    <img
                      src={imgUrl}
                      alt={item.products?.name}
                      className="w-24 h-24 rounded-xl object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.products?.slug}`}>
                      <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
                        {item.products?.name}
                      </h3>
                    </Link>
                    {(item.selected_color || item.selected_size) && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.selected_color && `Color: ${item.selected_color}`}
                        {item.selected_color && item.selected_size && " · "}
                        {item.selected_size && `Size: ${item.selected_size}`}
                      </p>
                    )}
                    <p className="text-primary font-bold mt-1">₹{unitPrice} × {item.quantity}</p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-accent transition-colors"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-accent transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">₹{(unitPrice * item.quantity).toLocaleString("en-IN")}</span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order summary */}
          <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="bg-card rounded-2xl border p-6 sticky top-20">
              <h2 className="font-bold text-lg mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
                  <span className="font-medium">₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-primary">Free</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-base">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-primary text-lg">₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <Button asChild className="w-full rounded-xl mt-6 h-12 text-base group shadow-lg shadow-primary/20">
                <Link to="/checkout">
                  Proceed to Checkout <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Link to="/" className="block text-center text-sm text-primary mt-3 hover:underline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;
