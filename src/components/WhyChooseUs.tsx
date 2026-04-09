import { Truck, ShieldCheck, Palette, Clock, IndianRupee, Headphones } from "lucide-react";

const features = [
  { icon: Truck, title: "Free Delivery", desc: "Free shipping on bulk orders across India", color: "text-blue-500 bg-blue-500/10" },
  { icon: ShieldCheck, title: "Quality Guaranteed", desc: "Premium materials with 100% satisfaction guarantee", color: "text-emerald-500 bg-emerald-500/10" },
  { icon: Palette, title: "Custom Designs", desc: "Upload yours or let our experts design for you", color: "text-purple-500 bg-purple-500/10" },
  { icon: Clock, title: "Quick Turnaround", desc: "Most orders shipped within 3-5 business days", color: "text-orange-500 bg-orange-500/10" },
  { icon: IndianRupee, title: "Bulk Discounts", desc: "Save more when you order more — up to 40% off", color: "text-rose-500 bg-rose-500/10" },
  { icon: Headphones, title: "WhatsApp Support", desc: "Direct support via WhatsApp for all queries", color: "text-amber-500 bg-amber-500/10" },
];

const WhyChooseUs = () => {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-10 animate-slide-up">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Why Choose PrintShop?</h2>
        <p className="text-muted-foreground max-w-md mx-auto">We combine premium quality with affordable pricing to deliver the best printing experience</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="group p-6 rounded-2xl bg-card border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <f.icon className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseUs;
