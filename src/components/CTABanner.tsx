import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle } from "lucide-react";

const CTABanner = () => {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-8 md:p-12 animate-slide-up">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-foreground/10 rounded-full blur-2xl animate-float" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-primary-foreground/5 rounded-full blur-2xl animate-float" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
              Need a Custom Design?
            </h2>
            <p className="text-primary-foreground/80 max-w-lg">
              Don't have a design? No worries! Our expert designers will create stunning prints for your business. Contact us on WhatsApp for quick assistance.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Button
              size="lg"
              variant="secondary"
              className="rounded-xl text-base group"
              asChild
            >
              <a href="https://wa.me/918962930650" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-5 w-5 group-hover:animate-bounce-subtle" />
                WhatsApp Us
              </a>
            </Button>
            <Button
              size="lg"
              className="rounded-xl text-base bg-primary-foreground text-primary hover:bg-primary-foreground/90 group"
              asChild
            >
              <a href="mailto:nazarprints@gmail.com">
                Get Quote <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
