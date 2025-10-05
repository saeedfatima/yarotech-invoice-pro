-- Create customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create sales table
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  sale_date TIMESTAMPTZ DEFAULT now(),
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  issuer_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create sale_items table
CREATE TABLE public.sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  total DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * price) STORED,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers
CREATE POLICY "Anyone can view customers"
  ON public.customers FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert customers"
  ON public.customers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update customers"
  ON public.customers FOR UPDATE
  USING (true);

-- RLS Policies for products
CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert products"
  ON public.products FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update products"
  ON public.products FOR UPDATE
  USING (true);

-- RLS Policies for sales
CREATE POLICY "Anyone can view sales"
  ON public.sales FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert sales"
  ON public.sales FOR INSERT
  WITH CHECK (true);

-- RLS Policies for sale_items
CREATE POLICY "Anyone can view sale_items"
  ON public.sale_items FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert sale_items"
  ON public.sale_items FOR INSERT
  WITH CHECK (true);

-- Insert sample data
INSERT INTO public.customers (name, email, phone, address) VALUES
  ('John Doe', 'john@example.com', '+234-800-1234', 'Lagos, Nigeria'),
  ('Jane Smith', 'jane@example.com', '+234-800-5678', 'Abuja, Nigeria');

INSERT INTO public.products (name, price, description) VALUES
  ('Laptop', 350000.00, 'High-performance laptop'),
  ('Mouse', 5000.00, 'Wireless mouse'),
  ('Keyboard', 15000.00, 'Mechanical keyboard'),
  ('Monitor', 75000.00, '24-inch LED monitor'),
  ('Headphones', 25000.00, 'Noise-cancelling headphones');