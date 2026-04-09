import { ArrowRight, Sparkles, Zap, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-secondary mx-4 mt-4">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-accent/20 rounded-full blur-2xl animate-float" style={{ animationDelay: "0.8s" }} />
      </div>

      <div className="relative container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-2xl animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-bounce-subtle">
            <Sparkles className="h-4 w-4" />
            Trusted by 10,000+ businesses
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground leading-tight mb-4">
            Premium Printing,{" "}
            <span className="text-primary relative">
              Delivered
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                <path d="M1 5.5C47 2 153 2 199 5.5" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" className="animate-fade-in" style={{ animationDelay: "0.8s" }} />
              </svg>
            </span>{" "}
            to Your Door
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-lg animate-fade-in" style={{ animationDelay: "0.3s" }}>
            Business cards, t-shirts, banners, mugs & more. Upload your design or let us create one for you. Bulk discounts available!
          </p>
          <div className="flex flex-wrap gap-3 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <Button size="lg" className="rounded-xl text-base px-8 group shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5" asChild>
              <Link to="/category/business-cards">
                Start Designing <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="rounded-xl text-base px-8 hover:-translate-y-0.5 transition-all duration-300" asChild>
              <Link to="/category/t-shirts">Browse Products</Link>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center gap-6 mt-10 animate-fade-in" style={{ animationDelay: "0.7s" }}>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-primary" />
              <span>Fast Delivery</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4 text-primary fill-primary" />
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Premium Quality</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
