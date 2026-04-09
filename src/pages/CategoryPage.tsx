import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface PricingSlab {
  min: number;
  max: number;
  price: number;
}

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [sort, setSort] = useState("default");

  const { data: category } = useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["category-products", slug, sort],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*")
        .eq("is_active", true);

      if (category?.id) {
        query = query.eq("category_id", category.id);
      }

      if (sort === "price-low") query = query.order("base_price", { ascending: true });
      else if (sort === "price-high") query = query.order("base_price", { ascending: false });
      else query = query.order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!category?.id,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{category?.name || "Products"}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {products?.length || 0} products available
            </p>
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-44 rounded-xl">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Newest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products?.map((product) => {
              const images = product.images as string[] | null;
              const slabs = product.pricing_slabs as PricingSlab[] | null;
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
                    {product.is_customizable && (
                      <Badge variant="secondary" className="absolute top-3 right-3 text-xs rounded-lg">
                        Customizable
                      </Badge>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-foreground text-lg mb-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {product.description}
                    </p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-bold text-primary">₹{product.base_price}</span>
                      {hasBulk && (
                        <span className="text-xs text-muted-foreground">onwards</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;
