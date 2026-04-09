import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Package, ShoppingBag } from "lucide-react";

const statusColors: Record<string, string> = {
  ordered: "bg-blue-100 text-blue-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  design_pending: "bg-amber-100 text-amber-700",
  awaiting_approval: "bg-purple-100 text-purple-700",
  in_production: "bg-orange-100 text-orange-700",
  shipped: "bg-cyan-100 text-cyan-700",
  out_for_delivery: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  ordered: "Order Placed",
  confirmed: "Confirmed",
  design_pending: "Design Pending",
  awaiting_approval: "Awaiting Approval",
  in_production: "In Production",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const OrdersPage = () => {
  const { user } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16 text-center animate-slide-up">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Please Sign In</h1>
          <p className="text-muted-foreground mb-6">Sign in to view your orders</p>
          <Button asChild className="rounded-xl"><Link to="/auth">Sign In</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 animate-slide-up">My Orders</h1>

        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">Loading orders...</div>
        ) : !orders || orders.length === 0 ? (
          <div className="text-center py-16 animate-slide-up">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Orders Yet</h2>
            <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
            <Button asChild className="rounded-xl"><Link to="/">Browse Products</Link></Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const items = order.items_snapshot as any[];
              const address = order.shipping_address as any;
              return (
                <div
                  key={order.id}
                  className="bg-card rounded-2xl border p-6 animate-slide-up hover:shadow-md transition-shadow"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <Badge className={`${statusColors[order.status] || "bg-secondary"} rounded-lg text-xs`}>
                      {statusLabels[order.status] || order.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    {items?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.name} × {item.quantity}
                          {item.selected_color && ` (${item.selected_color})`}
                          {item.selected_size && ` - ${item.selected_size}`}
                        </span>
                        <span className="font-medium">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center border-t pt-3">
                    <div className="text-xs text-muted-foreground">
                      {address?.city && `Shipping to: ${address.city}, ${address.state}`}
                    </div>
                    <span className="font-bold text-primary text-lg">₹{Number(order.total_amount).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default OrdersPage;
