import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-secondary mx-4 mt-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.12),transparent_60%)]" />
      <div className="relative container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Trusted by 10,000+ businesses
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight mb-4">
            Premium Printing,{" "}
            <span className="text-primary">Delivered</span> to Your Door
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-lg">
            Business cards, t-shirts, banners, mugs & more. Upload your design or let us create one for you. Bulk discounts available!
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" className="rounded-xl text-base px-8" asChild>
              <Link to="/category/business-cards">
                Start Designing <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="rounded-xl text-base px-8" asChild>
              <Link to="/category/t-shirts">Browse Products</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
