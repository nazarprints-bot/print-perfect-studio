import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, Shirt, HardHat, Image, Coffee, Sticker, ArrowUpRight } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  "business-cards": <CreditCard className="h-7 w-7" />,
  "t-shirts": <Shirt className="h-7 w-7" />,
  "caps-hats": <HardHat className="h-7 w-7" />,
  "banners-posters": <Image className="h-7 w-7" />,
  "mugs": <Coffee className="h-7 w-7" />,
  "stickers-labels": <Sticker className="h-7 w-7" />,
};

const colorMap: Record<string, { bg: string; icon: string; hover: string }> = {
  "business-cards": { bg: "from-blue-500/15 to-blue-600/5", icon: "text-blue-500", hover: "hover:shadow-blue-500/20" },
  "t-shirts": { bg: "from-purple-500/15 to-purple-600/5", icon: "text-purple-500", hover: "hover:shadow-purple-500/20" },
  "caps-hats": { bg: "from-orange-500/15 to-orange-600/5", icon: "text-orange-500", hover: "hover:shadow-orange-500/20" },
  "banners-posters": { bg: "from-emerald-500/15 to-emerald-600/5", icon: "text-emerald-500", hover: "hover:shadow-emerald-500/20" },
  "mugs": { bg: "from-rose-500/15 to-rose-600/5", icon: "text-rose-500", hover: "hover:shadow-rose-500/20" },
  "stickers-labels": { bg: "from-amber-500/15 to-amber-600/5", icon: "text-amber-500", hover: "hover:shadow-amber-500/20" },
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
      <div className="animate-slide-up">
        <h2 className="text-2xl font-bold mb-2">Shop by Category</h2>
        <p className="text-muted-foreground text-sm mb-6">Choose from our wide range of printing products</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories?.map((cat, index) => {
          const colors = colorMap[cat.slug] || { bg: "from-primary/10 to-primary/5", icon: "text-primary", hover: "hover:shadow-primary/20" };
          return (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className={`group relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-gradient-to-br ${colors.bg} hover:scale-105 hover:shadow-xl ${colors.hover} transition-all duration-300 shadow-sm animate-slide-up overflow-hidden`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-primary/5 group-hover:to-primary/10 transition-all duration-300 rounded-2xl" />
              
              {/* Arrow indicator */}
              <ArrowUpRight className="absolute top-3 right-3 h-3.5 w-3.5 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />

              <div className={`${colors.icon} transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110 relative z-10`}>
                {iconMap[cat.slug] || <Image className="h-7 w-7" />}
              </div>
              <span className="text-sm font-semibold text-foreground text-center relative z-10">{cat.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryGrid;
