-- Seed Data for Plannily Destination Brain

-- 1. Paris, France (Romance, City, Culture)
WITH paris AS (
  INSERT INTO public.destinations (name, country, region, type, tags, best_months, description, image_url)
  VALUES (
    'Paris', 
    'France', 
    'Europe', 
    'City', 
    ARRAY['romance', 'art', 'food', 'shopping', 'history'], 
    ARRAY['Apr', 'May', 'Jun', 'Sep', 'Oct'], 
    'The City of Light draws millions with its magnificent art, architecture, culture, and cuisine. Ideal for romantic getaways and art lovers.', 
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34'
  ) RETURNING id
)
INSERT INTO public.experiences (destination_id, name, type, difficulty, cost_range, tags)
VALUES 
  ((SELECT id FROM paris), 'Eiffel Tower at Night', 'Sightseeing', 'Easy', '$$', ARRAY['iconic', 'view', 'romantic']),
  ((SELECT id FROM paris), 'Louvre Museum Tour', 'Culture', 'Moderate', '$$', ARRAY['art', 'history', 'indoor']),
  ((SELECT id FROM paris), 'Seine River Cruise', 'Relaxation', 'Easy', '$$', ARRAY['view', 'romantic', 'evening']);

-- 2. Kyoto, Japan (Culture, Nature, History)
WITH kyoto AS (
  INSERT INTO public.destinations (name, country, region, type, tags, best_months, description, image_url)
  VALUES (
    'Kyoto', 
    'Japan', 
    'Asia', 
    'Nature', 
    ARRAY['culture', 'history', 'nature', 'temples', 'food'], 
    ARRAY['Mar', 'Apr', 'Oct', 'Nov'], 
    'Kyoto is famous for its classical Buddhist temples, as well as gardens, imperial palaces, Shinto shrines and traditional wooden houses.', 
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e'
  ) RETURNING id
)
INSERT INTO public.experiences (destination_id, name, type, difficulty, cost_range, tags)
VALUES 
  ((SELECT id FROM kyoto), 'Fushimi Inari Shrine Hike', 'Active', 'Moderate', 'Free', ARRAY['hiking', 'photo', 'iconic']),
  ((SELECT id FROM kyoto), 'Tea Ceremony', 'Culture', 'Easy', '$$', ARRAY['traditional', 'indoor', 'relaxing']),
  ((SELECT id FROM kyoto), 'Arashiyama Bamboo Grove', 'Nature', 'Easy', 'Free', ARRAY['nature', 'photo', 'morning']);

-- 3. Bali, Indonesia (Beach, Relaxation, Party)
WITH bali AS (
  INSERT INTO public.destinations (name, country, region, type, tags, best_months, description, image_url)
  VALUES (
    'Bali', 
    'Indonesia', 
    'Asia', 
    'Beach', 
    ARRAY['beach', 'party', 'yoga', 'nature', 'budget-friendly'], 
    ARRAY['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'], 
    'An Indonesian paradise known for its forested volcanic mountains, iconic rice paddies, beaches and coral reefs.', 
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4'
  ) RETURNING id
)
INSERT INTO public.experiences (destination_id, name, type, difficulty, cost_range, tags)
VALUES 
  ((SELECT id FROM bali), 'Ubud Swing & Rice Terrace', 'Adventure', 'Easy', '$$', ARRAY['photo', 'nature', 'iconic']),
  ((SELECT id FROM bali), 'Uluwatu Temple Sunset', 'Culture', 'Easy', '$', ARRAY['view', 'sunset', 'culture']),
  ((SELECT id FROM bali), 'Seminyak Beach Club', 'Party', 'Easy', '$$$', ARRAY['party', 'beach', 'music']);

-- 4. Dubai, UAE (Luxury, City, Desert)
WITH dubai AS (
  INSERT INTO public.destinations (name, country, region, type, tags, best_months, description, image_url)
  VALUES (
    'Dubai', 
    'UAE', 
    'Middle East', 
    'Luxury', 
    ARRAY['luxury', 'shopping', 'architecture', 'desert', 'modern'], 
    ARRAY['Nov', 'Dec', 'Jan', 'Feb', 'Mar'], 
    'Known for luxury shopping, ultramodern architecture and a lively nightlife scene. Burj Khalifa dominates the skyscraper-filled skyline.', 
    'https://images.unsplash.com/photo-1512453979798-5ea932a23644'
  ) RETURNING id
)
INSERT INTO public.experiences (destination_id, name, type, difficulty, cost_range, tags)
VALUES 
  ((SELECT id FROM dubai), 'Desert Safari & BBQ', 'Adventure', 'Moderate', '$$', ARRAY['desert', 'food', 'active']),
  ((SELECT id FROM dubai), 'Burj Khalifa Top View', 'Sightseeing', 'Easy', '$$$', ARRAY['view', 'iconic', 'luxury']),
  ((SELECT id FROM dubai), 'Dubai Mall Shopping', 'Shopping', 'Easy', '$$$', ARRAY['shopping', 'indoor', 'huge']);

-- 5. Queenstown, New Zealand (Adventure, Nature, Snow)
WITH queenstown AS (
  INSERT INTO public.destinations (name, country, region, type, tags, best_months, description, image_url)
  VALUES (
    'Queenstown', 
    'New Zealand', 
    'Oceania', 
    'Adventure', 
    ARRAY['adventure', 'snow', 'nature', 'hiking', 'scenic'], 
    ARRAY['Dec', 'Jan', 'Feb', 'Jun', 'Jul', 'Aug'], 
    'The adventure capital of the world. Sat on the shores of the South Island’s Lake Wakatipu, set against the dramatic Southern Alps.', 
    'https://images.unsplash.com/photo-1507699622177-388898d9903d'
  ) RETURNING id
)
INSERT INTO public.experiences (destination_id, name, type, difficulty, cost_range, tags)
VALUES 
  ((SELECT id FROM queenstown), 'Bungy Jumping', 'Adventure', 'Hard', '$$$', ARRAY['adrenaline', 'iconic', 'scary']),
  ((SELECT id FROM queenstown), 'Milford Sound Cruise', 'Nature', 'Easy', '$$', ARRAY['scenic', 'nature', 'daytrip']),
  ((SELECT id FROM queenstown), 'Skyline Gondola', 'Sightseeing', 'Easy', '$$', ARRAY['view', 'relaxing', 'family']);
