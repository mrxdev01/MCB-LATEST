import { Link } from "@tanstack/react-router";
import { MessageCircle, Mail, MapPin, Phone } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { genericEnquiryUrl } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="border-t border-border bg-brand-secondary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">


        <div>
          <h3 className="text-lg font-bold">{BRAND.name}</h3>
          <p className="mt-2 text-sm opacity-80">{BRAND.tagline}</p>
          <p className="mt-4 text-xs opacity-70">GST: {BRAND.gst}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide opacity-80">Shop</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/bedsheets" className="opacity-80 hover:opacity-100">Bedsheets</Link></li>
            <li><Link to="/men-shirts" className="opacity-80 hover:opacity-100">Men Shirts</Link></li>
            <li><Link to="/nighty" className="opacity-80 hover:opacity-100">Nighty</Link></li>
            <li><Link to="/products" className="opacity-80 hover:opacity-100">All Products</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide opacity-80">Company</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/about" className="opacity-80 hover:opacity-100">About</Link></li>
            <li><Link to="/blog" className="opacity-80 hover:opacity-100">Blog</Link></li>
            <li><Link to="/faq" className="opacity-80 hover:opacity-100">FAQ</Link></li>
            <li><Link to="/contact" className="opacity-80 hover:opacity-100">Contact</Link></li>
            <li>
              <a href={BRAND.indiamartUrl} target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100">
                IndiaMART Store
              </a>
            </li>
          </ul>
          <h4 className="mt-6 text-sm font-semibold uppercase tracking-wide opacity-80">Policies</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/shipping-policy" className="opacity-80 hover:opacity-100">Shipping Policy</Link></li>
            <li><Link to="/return-refund" className="opacity-80 hover:opacity-100">Return & Refund</Link></li>
            <li><Link to="/terms" className="opacity-80 hover:opacity-100">Terms & Conditions</Link></li>
            <li><Link to="/privacy" className="opacity-80 hover:opacity-100">Privacy Policy</Link></li>
            <li><Link to="/trust" className="opacity-80 hover:opacity-100">Trust & Security</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide opacity-80">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 opacity-70" />
              <span className="opacity-80">{BRAND.address}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 opacity-70" />
              <a href={`tel:${BRAND.phone}`} className="opacity-80 hover:opacity-100">{BRAND.whatsappDisplay}</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 opacity-70" />
              <a href={`mailto:${BRAND.email}`} className="opacity-80 hover:opacity-100">{BRAND.email}</a>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 opacity-70" />
              <a href={genericEnquiryUrl()} target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100">
                WhatsApp us
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-4 text-xs opacity-70 sm:px-6">
          <span>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}

