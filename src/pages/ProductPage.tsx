import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageUploadWithDPI from "@/components/ImageUploadWithDPI";
import BulkOrderMatrix from "@/components/BulkOrderMatrix";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Truck, Shield, Palette } from "lucide-react";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface PricingSlab { min: number; max: number; price: number; }
interface VariantMatrix { sizes?: string[]; colors?: string[]; }

const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [designForMe, setDesignForMe] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

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
            <div className="space-y-4"><Skeleton className="h-8 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-20 w-full" /></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images as string[] | null;
  const slabs = product.pricing_slabs as unknown as PricingSlab[] | null;
  const variants = product.variant_matrix as unknown as VariantMatrix | null;
  const imgUrl = images?.[0] || "/placeholder.svg";
  const hasBulkMatrix = variants?.sizes && variants.sizes.length > 0 && variants?.colors && variants.colors.length > 0;

  const getCurrentPrice = () => {
    if (!slabs || slabs.length === 0) return product.base_price;
    const slab = slabs.find((s) => quantity >= s.min && quantity <= s.max);
    if (slab) return slab.price;
    const last = slabs[slabs.length - 1];
    if (quantity > last.max) return last.price;
    return product.base_price;
  };

  const currentPrice = getCurrentPrice();
  const designFee = designForMe ? product.design_fee : 0;
  const totalPrice = currentPrice * quantity + designFee;

  const colorHex: Record<string, string> = {
    White: "#FFFFFF", Black: "#1a1a1a", Red: "#EF4444", Blue: "#3B82F6",
    "Navy Blue": "#1E3A5F", Green: "#22C55E", Grey: "#9CA3AF",
  };

  const handleAddToCart = () => {
    if (!user) { navigate("/auth"); toast.error("Please sign in to add items"); return; }
    if (variants?.colors && !selectedColor) { toast.error("Please select a color"); return; }
    if (variants?.sizes && !selectedSize) { toast.error("Please select a size"); return; }

    addToCart({
      product_id: product.id,
      quantity,
      selected_color: selectedColor || undefined,
      selected_size: selectedSize || undefined,
      customization_data: { design_for_me: designForMe, has_uploaded_file: !!uploadedFile },
    });
  };

  const handleBulkAdd = (breakdown: Record<string, Record<string, number>>, totalQty: number) => {
    if (!user) { navigate("/auth"); toast.error("Please sign in to add items"); return; }
    addToCart({
      product_id: product.id,
      quantity: totalQty,
      quantity_breakdown: breakdown,
      customization_data: { design_for_me: designForMe, has_uploaded_file: !!uploadedFile },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="space-y-4 animate-slide-up">
            <div className="rounded-2xl overflow-hidden bg-secondary aspect-square">
              <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Details */}
          <div className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <p className="text-sm text-muted-foreground mb-1">{(product as any).categories?.name}</p>
            <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold text-primary">₹{currentPrice}</span>
              {slabs && slabs.length > 1 && currentPrice < product.base_price && (
                <span className="text-lg text-muted-foreground line-through">₹{product.base_price}</span>
              )}
              <span className="text-sm text-muted-foreground">per unit</span>
            </div>

            <p className="text-muted-foreground mb-6">{product.description}</p>

            {/* Color swatches (only if no bulk matrix) */}
            {!hasBulkMatrix && variants?.colors && variants.colors.length > 0 && (
              <div className="mb-5">
                <label className="text-sm font-medium text-foreground mb-2 block">Color</label>
                <div className="flex gap-2">
                  {variants.colors.map((color) => (
                    <button key={color} onClick={() => setSelectedColor(color)} title={color}
                      className={`w-9 h-9 rounded-full border-2 transition-all ${selectedColor === color ? "border-primary scale-110 ring-2 ring-primary/30" : "border-border hover:scale-105"}`}
                      style={{ backgroundColor: colorHex[color] || "#ccc" }} />
                  ))}
                </div>
                {selectedColor && <p className="text-xs text-muted-foreground mt-1">{selectedColor}</p>}
              </div>
            )}

            {/* Size selector (only if no bulk matrix) */}
            {!hasBulkMatrix && variants?.sizes && variants.sizes.length > 0 && (
              <div className="mb-5">
                <label className="text-sm font-medium text-foreground mb-2 block">Size</label>
                <div className="flex gap-2 flex-wrap">
                  {variants.sizes.map((size) => (
                    <button key={size} onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${selectedSize === size ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/50"}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bulk Order Matrix */}
            {hasBulkMatrix && (
              <div className="mb-6">
                <BulkOrderMatrix
                  sizes={variants!.sizes!}
                  colors={variants!.colors!}
                  onAddToCart={handleBulkAdd}
                />
              </div>
            )}

            {/* Quantity (only if no bulk matrix) */}
            {!hasBulkMatrix && (
              <div className="mb-5">
                <label className="text-sm font-medium text-foreground mb-2 block">Quantity</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center font-bold hover:bg-accent transition-colors">−</button>
                  <input type="number" value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 h-10 text-center rounded-xl bg-secondary border-0 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <button onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center font-bold hover:bg-accent transition-colors">+</button>
                </div>
              </div>
            )}

            {/* Image Upload with DPI Check */}
            {product.is_customizable && (
              <div className="mb-6">
                <ImageUploadWithDPI
                  onImageUpload={(file, _preview, _dpi) => setUploadedFile(file)}
                />
              </div>
            )}

            {/* Design for Me toggle */}
            {product.is_customizable && (
              <div className="mb-5">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setDesignForMe(!designForMe)}
                    className={`w-12 h-7 rounded-full transition-colors duration-200 relative cursor-pointer ${designForMe ? "bg-primary" : "bg-secondary"}`}
                  >
                    <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-card shadow transition-transform duration-200 ${designForMe ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">Design for Me</span>
                    <span className="text-xs text-muted-foreground block">Our expert will design for you — ₹{product.design_fee}</span>
                  </div>
                </label>
              </div>
            )}

            {/* Total */}
            <div className="bg-secondary rounded-2xl p-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-muted-foreground text-sm">Total</span>
                  {designForMe && <p className="text-xs text-muted-foreground">incl. ₹{product.design_fee} design fee</p>}
                </div>
                <span className="text-2xl font-bold text-primary">₹{totalPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {!hasBulkMatrix && (
              <Button size="lg" className="w-full rounded-xl text-base mb-4 group shadow-lg shadow-primary/20" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
              </Button>
            )}

            {/* Info badges */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Truck className="h-4 w-4 text-primary" /> Free delivery on bulk</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Shield className="h-4 w-4 text-primary" /> Quality guaranteed</div>
            </div>

            {/* Pricing slabs */}
            {slabs && slabs.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold text-foreground mb-3">Bulk Pricing</h3>
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary">
                        <TableHead className="font-semibold">Quantity</TableHead>
                        <TableHead className="font-semibold">Price/Unit</TableHead>
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
                              {slab.min}–{slab.max}
                              {isActive && <Badge className="ml-2 bg-primary/10 text-primary text-[10px] rounded-md">Current</Badge>}
                            </TableCell>
                            <TableCell className="font-semibold">₹{slab.price}</TableCell>
                            <TableCell className="text-primary font-medium">
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
