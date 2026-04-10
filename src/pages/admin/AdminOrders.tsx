import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "./AdminLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

const statusOptions = ["ordered", "design_pending", "design_approved", "in_production", "shipped", "delivered", "cancelled"];
const statusColors: Record<string, string> = {
  ordered: "bg-blue-100 text-blue-800",
  design_pending: "bg-yellow-100 text-yellow-800",
  design_approved: "bg-green-100 text-green-800",
  in_production: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Tables<"orders">[]>([]);

  const fetchOrders = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data || []);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) toast.error(error.message);
    else { toast.success(`Status updated to ${status}`); fetchOrders(); }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Orders ({orders.length})</h1>
      <div className="bg-card rounded-2xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Update Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-xs">{o.id.slice(0, 8)}...</TableCell>
                <TableCell>{format(new Date(o.created_at), "dd MMM yyyy")}</TableCell>
                <TableCell className="font-medium">₹{Number(o.total_amount).toLocaleString("en-IN")}</TableCell>
                <TableCell>
                  <Badge className={`${statusColors[o.status] || ""} border-0`}>{o.status.replace("_", " ")}</Badge>
                </TableCell>
                <TableCell>
                  <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                    <SelectTrigger className="w-40 rounded-xl h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No orders yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
