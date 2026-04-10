import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Users, IndianRupee } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, users: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [prodRes, orderRes] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("total_amount"),
      ]);
      const orders = orderRes.data || [];
      const revenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
      setStats({
        products: prodRes.count || 0,
        orders: orders.length,
        revenue,
        users: 0,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Total Products", value: stats.products, icon: Package, color: "text-blue-500" },
    { label: "Total Orders", value: stats.orders, icon: ShoppingCart, color: "text-green-500" },
    { label: "Revenue", value: `₹${stats.revenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-amber-500" },
  ];

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((c) => (
          <Card key={c.label} className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
