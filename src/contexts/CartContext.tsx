import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  selected_color: string | null;
  selected_size: string | null;
  customization_data: any;
  quantity_breakdown: any;
  products: {
    id: string;
    name: string;
    base_price: number;
    slug: string;
    images: any;
    pricing_slabs: any;
    design_fee: number;
  };
}

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  addToCart: (item: {
    product_id: string;
    quantity: number;
    selected_color?: string;
    selected_size?: string;
    customization_data?: any;
    quantity_breakdown?: any;
  }) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface PricingSlab {
  min: number;
  max: number;
  price: number;
}

const getSlabPrice = (slabs: PricingSlab[] | null, quantity: number, basePrice: number): number => {
  if (!slabs || slabs.length === 0) return basePrice;
  const slab = slabs.find((s) => quantity >= s.min && quantity <= s.max);
  if (slab) return slab.price;
  const last = slabs[slabs.length - 1];
  if (quantity > last.max) return last.price;
  return basePrice;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("cart_items")
        .select("*, products(id, name, base_price, slug, images, pricing_slabs, design_fee)")
        .eq("user_id", user.id);
      if (error) throw error;
      return data as unknown as CartItem[];
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async (item: any) => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase.from("cart_items").insert({
        user_id: user.id,
        ...item,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart!");
    },
    onError: () => toast.error("Failed to add to cart"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cart_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Removed from cart");
    },
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase.from("cart_items").delete().eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const cartTotal = items.reduce((sum, item) => {
    const slabs = item.products?.pricing_slabs as unknown as PricingSlab[] | null;
    const price = getSlabPrice(slabs, item.quantity, item.products?.base_price || 0);
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        addToCart: (item) => addMutation.mutate(item),
        updateQuantity: (id, quantity) => updateMutation.mutate({ id, quantity }),
        removeFromCart: (id) => removeMutation.mutate(id),
        clearCart: () => clearMutation.mutate(),
        totalItems,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
