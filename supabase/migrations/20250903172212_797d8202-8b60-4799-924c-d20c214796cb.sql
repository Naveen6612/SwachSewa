-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('citizen', 'waste_worker', 'green_champion', 'admin');

-- Create waste types enum
CREATE TYPE public.waste_type AS ENUM ('dry', 'wet', 'hazardous');

-- Create training status enum
CREATE TYPE public.training_status AS ENUM ('not_started', 'in_progress', 'completed');

-- Create facility types enum
CREATE TYPE public.facility_type AS ENUM ('biomethanization', 'waste_to_energy', 'recycling', 'scrap_collection');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  role user_role DEFAULT 'citizen',
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create training modules table
CREATE TABLE public.training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  target_role user_role NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  is_mandatory BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create training progress table
CREATE TABLE public.training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES public.training_modules(id) ON DELETE CASCADE NOT NULL,
  status training_status DEFAULT 'not_started',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  score INTEGER,
  UNIQUE(user_id, module_id)
);

-- Create waste facilities table
CREATE TABLE public.waste_facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type facility_type NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  capacity_tons INTEGER,
  contact_person TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create waste reports table
CREATE TABLE public.waste_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  photo_url TEXT,
  status TEXT DEFAULT 'reported',
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create incentives table
CREATE TABLE public.incentives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  points INTEGER DEFAULT 0,
  reason TEXT,
  awarded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create green champions table
CREATE TABLE public.green_champions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  area_assigned TEXT NOT NULL,
  responsibilities TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  appointed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incentives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.green_champions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for training modules (everyone can read)
CREATE POLICY "Everyone can view training modules" ON public.training_modules
  FOR SELECT USING (true);

-- RLS Policies for training progress
CREATE POLICY "Users can view their own training progress" ON public.training_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own training progress" ON public.training_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training progress" ON public.training_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for waste facilities (everyone can read)
CREATE POLICY "Everyone can view waste facilities" ON public.waste_facilities
  FOR SELECT USING (true);

-- RLS Policies for waste reports
CREATE POLICY "Users can view their own reports" ON public.waste_reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports" ON public.waste_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- RLS Policies for incentives
CREATE POLICY "Users can view their own incentives" ON public.incentives
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for green champions
CREATE POLICY "Green champions can view their assignments" ON public.green_champions
  FOR SELECT USING (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    'citizen'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample training modules
INSERT INTO public.training_modules (title, description, target_role, duration_minutes) VALUES
('Waste Segregation Basics', 'Learn how to properly segregate waste into dry, wet, and hazardous categories', 'citizen', 45),
('Home Composting Guide', 'Step-by-step guide to create compost at home', 'citizen', 60),
('Plastic Reuse Techniques', 'Creative ways to reuse plastic items in daily life', 'citizen', 30),
('Safety Protocols for Waste Workers', 'Essential safety measures and protective equipment usage', 'waste_worker', 90),
('Waste Collection Best Practices', 'Efficient and safe waste collection methods', 'waste_worker', 75),
('Community Monitoring Techniques', 'How to effectively monitor waste management in your area', 'green_champion', 120);

-- Insert sample waste facilities
INSERT INTO public.waste_facilities (name, type, address, city, capacity_tons) VALUES
('City Biomethanization Plant', 'biomethanization', '123 Green Street', 'Mumbai', 500),
('Metro Recycling Center', 'recycling', '456 Recycle Road', 'Delhi', 300),
('EcoWaste Processing Unit', 'waste_to_energy', '789 Energy Avenue', 'Bangalore', 1000),
('Local Scrap Collection Hub', 'scrap_collection', '321 Collection Lane', 'Chennai', 100);