import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, Shirt, HardHat, Image, Coffee, Sticker } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  "business-cards": <CreditCard className="h-8 w-8" />,
  "t-shirts": <Shirt className="h-8 w-8" />,
  "caps-hats": <HardHat className="h-8 w-8" />,
  "banners-posters": <Image className="h-8 w-8" />,
  "mugs": <Coffee className="h-8 w-8" />,
  "stickers-labels": <Sticker className="h-8 w-8" />,
};

const colorMap: Record<string, string> = {
  "business-cards": "from-blue-500/20 to-blue-600/10 text-blue-600",
  "t-shirts": "from-purple-500/20 to-purple-600/10 text-purple-600",
  "caps-hats": "from-orange-500/20 to-orange-600/10 text-orange-600",
  "banners-posters": "from-green-500/20 to-green-600/10 text-green-600",
  "mugs": "from-rose-500/20 to-rose-600/10 text-rose-600",
  "stickers-labels": "from-amber-500/20 to-amber-600/10 text-amber-600",
};

const CategoryGrid = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories?.map((cat) => (
          <Link
            key={cat.id}
            to={`/category/${cat.slug}`}
            className={`group flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-gradient-to-br ${colorMap[cat.slug] || "from-primary/10 to-primary/5 text-primary"} hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md`}
          >
            <div className="transition-transform group-hover:-translate-y-1">
              {iconMap[cat.slug] || <Image className="h-8 w-8" />}
            </div>
            <span className="text-sm font-semibold text-foreground text-center">{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
