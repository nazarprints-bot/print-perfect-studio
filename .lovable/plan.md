
# Phase 1: Landing Page + Product Catalog with Real Backend

## Overview
Build a stunning, Vistaprint-style printing e-commerce storefront with the Bento Box UI design, connected to Lovable Cloud (Supabase) for real product data.

## Pages & Components

### 1. Homepage (Bento Grid Layout)
- **Hero Section**: Large banner with organic curved masks, headline like "Premium Printing, Delivered to Your Door"
- **Category Grid (Bento Style)**: Rounded cards (24-32px radius) for categories — Business Cards, T-Shirts, Caps, Banners, Mugs, Stickers, etc.
- **Featured Products**: Product cards with image, name, starting price ("Starting at ₹XX"), and color swatches
- **Color palette**: Electric Blue (#2F69FF) primary, Mint Green (#E8F5E9) background, white cards, soft shadows
- **Font**: Inter (geometric sans-serif)

### 2. Product Listing Page (by Category)
- Grid of product cards with filters (price range, material type)
- Sort options (price low-high, popularity)
- Bulk pricing badge indicator on products

### 3. Product Detail Page (PDP)
- Product images gallery
- **Tiered Pricing Table**: Dynamic "Quantity vs Price" display showing bulk discount slabs
- Size/Color selector (visual swatches)
- "Add to Cart" button (cart functionality is Phase 2, but button will be present)
- Product description, specifications, delivery info

### 4. Navigation & Layout
- **Top navbar**: Logo, search bar, category links, cart icon, login button
- **Mobile responsive**: Hamburger menu, stacked cards
- **Footer**: Contact info, social links, quick links

## Database (Lovable Cloud)
- **categories** table: id, name, slug, image_url, display_order
- **products** table: id, name, slug, description, base_price, category_id, is_customizable, design_fee, pricing_slabs (JSONB), variant_matrix (JSONB), images (JSONB array), stock, is_active
- Seed with ~10-12 sample printing products across categories (Business Cards, T-Shirts, Caps, Banners, Mugs, Stickers)

## What's NOT in Phase 1
- Authentication/login (Phase 2)
- Cart & checkout (Phase 2)
- Product customizer with image upload & DPI check (Phase 2)
- Bulk order matrix grid (Phase 2)
- Admin dashboard (Phase 3)
- Payment gateway / Razorpay (Phase 3)
- WhatsApp integration (Phase 4)
- Print-ready PDF generation (Phase 4)
