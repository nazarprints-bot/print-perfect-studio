import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Truck, Shield, Palette } from "lucide-react";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PricingSlab {
  min: number;
  max: number;
  price: number;
}

interface VariantMatrix {
  sizes?: string[];
  colors?: string[];
}

const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("slug", slug!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images as string[] | null;
  const slabs = product.pricing_slabs as unknown as PricingSlab[] | null;
  const variants = product.variant_matrix as VariantMatrix | null;
  const imgUrl = images?.[0] || "/placeholder.svg";

  const getCurrentPrice = () => {
    if (!slabs || slabs.length === 0) return product.base_price;
    const slab = slabs.find((s) => quantity >= s.min && quantity <= s.max);
    if (slab) return slab.price;
    const lastSlab = slabs[slabs.length - 1];
    if (quantity > lastSlab.max) return lastSlab.price;
    return product.base_price;
  };

  const currentPrice = getCurrentPrice();
  const totalPrice = currentPrice * quantity;

  const colorHex: Record<string, string> = {
    White: "#FFFFFF",
    Black: "#1a1a1a",
    Red: "#EF4444",
    Blue: "#3B82F6",
    "Navy Blue": "#1E3A5F",
    Green: "#22C55E",
    Grey: "#9CA3AF",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="rounded-2xl overflow-hidden bg-secondary aspect-square">
            <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" />
          </div>

          {/* Details */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              {(product as any).categories?.name}
            </p>
            <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold text-primary">₹{currentPrice}</span>
              {slabs && slabs.length > 1 && currentPrice < product.base_price && (
                <span className="text-lg text-muted-foreground line-through">₹{product.base_price}</span>
              )}
              <span className="text-sm text-muted-foreground">per unit</span>
            </div>

            <p className="text-muted-foreground mb-6">{product.description}</p>

            {/* Color swatches */}
            {variants?.colors && variants.colors.length > 0 && (
              <div className="mb-5">
                <label className="text-sm font-medium text-foreground mb-2 block">Color</label>
                <div className="flex gap-2">
                  {variants.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                      className={`w-9 h-9 rounded-full border-2 transition-all ${selectedColor === color ? "border-primary scale-110 ring-2 ring-primary/30" : "border-border hover:scale-105"}`}
                      style={{ backgroundColor: colorHex[color] || "#ccc" }}
                    />
                  ))}
                </div>
                {selectedColor && <p className="text-xs text-muted-foreground mt-1">{selectedColor}</p>}
              </div>
            )}

            {/* Size selector */}
            {variants?.sizes && variants.sizes.length > 0 && (
              <div className="mb-5">
                <label className="text-sm font-medium text-foreground mb-2 block">Size</label>
                <div className="flex gap-2 flex-wrap">
                  {variants.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${selectedSize === size ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/50"}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-5">
              <label className="text-sm font-medium text-foreground mb-2 block">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center font-bold hover:bg-accent transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 h-10 text-center rounded-xl bg-secondary border-0 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center font-bold hover:bg-accent transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="bg-secondary rounded-2xl p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">₹{totalPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <Button size="lg" className="w-full rounded-xl text-base mb-4">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>

            {product.is_customizable && (
              <Button variant="outline" size="lg" className="w-full rounded-xl text-base mb-6">
                <Palette className="mr-2 h-5 w-5" />
                Design for Me — ₹{product.design_fee}
              </Button>
            )}

            {/* Info badges */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="h-4 w-4 text-primary" /> Free delivery on bulk orders
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" /> Quality guaranteed
              </div>
            </div>

            {/* Pricing slabs table */}
            {slabs && slabs.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold text-foreground mb-3">Bulk Pricing</h3>
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary">
                        <TableHead className="font-semibold">Quantity</TableHead>
                        <TableHead className="font-semibold">Price per Unit</TableHead>
                        <TableHead className="font-semibold">You Save</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {slabs.map((slab, i) => {
                        const savings = product.base_price - slab.price;
                        const isActive = quantity >= slab.min && quantity <= slab.max;
                        return (
                          <TableRow key={i} className={isActive ? "bg-primary/5" : ""}>
                            <TableCell className="font-medium">
                              {slab.min} – {slab.max}
                              {isActive && (
                                <Badge className="ml-2 bg-primary/10 text-primary text-[10px] rounded-md">
                                  Current
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="font-semibold">₹{slab.price}</TableCell>
                            <TableCell className="text-green-600 font-medium">
                              {savings > 0 ? `₹${savings} (${Math.round((savings / product.base_price) * 100)}%)` : "—"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductPage;
