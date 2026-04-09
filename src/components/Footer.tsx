import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background/80 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">P</span>
              </div>
              <span className="font-bold text-lg text-background">PrintShop</span>
            </div>
            <p className="text-sm text-background/60">
              Premium printing solutions delivered to your door. Quality prints at affordable prices.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-background mb-3">Products</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/category/business-cards" className="hover:text-background transition-colors">Business Cards</Link></li>
              <li><Link to="/category/t-shirts" className="hover:text-background transition-colors">T-Shirts</Link></li>
              <li><Link to="/category/banners-posters" className="hover:text-background transition-colors">Banners & Posters</Link></li>
              <li><Link to="/category/mugs" className="hover:text-background transition-colors">Mugs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-background mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-background transition-colors">Home</Link></li>
              <li><Link to="/" className="hover:text-background transition-colors">About Us</Link></li>
              <li><Link to="/" className="hover:text-background transition-colors">Contact</Link></li>
              <li><Link to="/" className="hover:text-background transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-background mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 89629 30650</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> nazarprints@gmail.com</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Kishanganj, Bihar</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-8 pt-6 text-center text-sm text-background/40">
          © {new Date().getFullYear()} PrintShop. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
