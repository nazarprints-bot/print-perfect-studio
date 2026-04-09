
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  phone TEXT,
  whatsapp_notifications BOOLEAN NOT NULL DEFAULT true,
  saved_addresses JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create cart_items table
CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  selected_color TEXT,
  selected_size TEXT,
  customization_data JSONB DEFAULT '{}'::jsonb,
  quantity_breakdown JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cart" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to their own cart" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cart" ON public.cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete from their own cart" ON public.cart_items FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ordered' CHECK (status IN ('ordered','confirmed','design_pending','awaiting_approval','in_production','shipped','out_for_delivery','delivered','cancelled')),
  items_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
  shipping_address JSONB DEFAULT '{}'::jsonb,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','success','failed','refunded')),
  payment_id TEXT,
  coupon_code TEXT,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  design_fee_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  tracking_history JSONB DEFAULT '[]'::jsonb,
  whatsapp_notified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create coupons table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage','fixed')),
  discount_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_order_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active coupons are viewable" ON public.coupons FOR SELECT USING (is_active = true);

-- Indexes
CREATE INDEX idx_cart_items_user ON public.cart_items(user_id);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_coupons_code ON public.coupons(code);
