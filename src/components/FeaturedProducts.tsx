import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface PricingSlab {
  min: number;
  max: number;
  price: number;
}

const FeaturedProducts = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("is_active", true)
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Featured Products</h2>
        <Link to="/category/business-cards" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
          View All <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {products?.map((product) => {
          const images = product.images as string[] | null;
          const slabs = product.pricing_slabs as unknown as PricingSlab[] | null;
          const hasBulk = slabs && slabs.length > 1;
          const imgUrl = images?.[0] || "/placeholder.svg";

          return (
            <Link
              key={product.id}
              to={`/product/${product.slug}`}
              className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 border"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                <img
                  src={imgUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {hasBulk && (
                  <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs rounded-lg">
                    Bulk Discount
                  </Badge>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  {(product as any).categories?.name}
                </p>
                <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                  {product.name}
                </h3>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-primary">₹{product.base_price}</span>
                  {hasBulk && (
                    <span className="text-xs text-muted-foreground">onwards</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturedProducts;
