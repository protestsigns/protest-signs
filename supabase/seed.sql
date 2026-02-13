-- Seed data for Protest Signs
-- Run this AFTER setting up your schema and creating an admin user

-- =====================================================
-- INSERT TAGS
-- =====================================================
INSERT INTO tags (name, slug, show_on_homepage, homepage_order) VALUES
  ('Popular', 'popular', true, 1),
  ('Seasonal', 'seasonal', true, 2),
  ('Environment', 'environment', false, null),
  ('Women''s Rights', 'womens-rights', false, null),
  ('LGBTQ+', 'lgbtq', false, null),
  ('Climate', 'climate', false, null),
  ('Social Justice', 'social', false, null),
  ('Democracy', 'democracy', false, null);

-- Get tag IDs for reference (you'll need to update these after running the above)
-- SELECT id, name FROM tags;

-- =====================================================
-- INSERT EXAMPLE SIGNS
-- =====================================================
-- Note: Replace the tag IDs below with actual IDs from your database
-- You can use the sign images from your /signs folder

-- Example Sign 1: Epstein Cover Up
INSERT INTO signs (title, description, price, quantity_available, images, sizes) VALUES
  (
    'The Epstein Cover Up Continues',
    'Bold statement sign calling out corruption and demanding accountability. High-quality print on durable material.',
    2500, -- $25.00 in cents
    50,
    ARRAY['/signs/one.png'],
    '12x18, 18x24, 24x36'
  );

-- Example Sign 2: Democracy For Sale
INSERT INTO signs (title, description, price, quantity_available, images, sizes) VALUES
  (
    'Democracy For Sale By Owner',
    'Satirical sign highlighting political corruption. Perfect for demonstrations and rallies.',
    2000, -- $20.00 in cents
    30,
    ARRAY['/signs/two.png'],
    '12x18, 18x24'
  );

-- Example Sign 3: Generic placeholder
INSERT INTO signs (title, description, price, quantity_available, images, sizes) VALUES
  (
    'Climate Action Now',
    'Urgent call for environmental action. Made with eco-friendly materials.',
    2200, -- $22.00 in cents
    40,
    ARRAY['https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800'],
    '12x18, 18x24, 24x36'
  );

INSERT INTO signs (title, description, price, quantity_available, images, sizes) VALUES
  (
    'Women''s Rights Are Human Rights',
    'Classic feminist statement sign. Powerful message for marches and protests.',
    2000, -- $20.00 in cents
    60,
    ARRAY['https://images.unsplash.com/photo-1515169067868-5387ec356754?w=800'],
    '12x18, 18x24'
  );

INSERT INTO signs (title, description, price, quantity_available, images, sizes) VALUES
  (
    'Love Is Love',
    'LGBTQ+ pride sign celebrating love and equality. Vibrant design.',
    2200, -- $22.00 in cents
    45,
    ARRAY['https://images.unsplash.com/photo-1514672013381-c6d0df1c8b18?w=800'],
    '12x18, 18x24'
  );

-- =====================================================
-- LINK SIGNS TO TAGS
-- =====================================================
-- You'll need to manually link signs to tags after inserting them
-- Use the sign IDs and tag IDs from your database

-- Example queries (update with your actual IDs):
-- 
-- -- Link "Epstein Cover Up" to Popular (display_order: 1), Social Justice (display_order: 1)
-- INSERT INTO sign_tags (sign_id, tag_id, display_order) VALUES
--   ('sign-id-here', 'popular-tag-id', 1),
--   ('sign-id-here', 'social-tag-id', 1);
--
-- -- Link "Democracy For Sale" to Popular (display_order: 2), Democracy (display_order: 1), Seasonal (display_order: 1)
-- INSERT INTO sign_tags (sign_id, tag_id, display_order) VALUES
--   ('sign-id-here', 'popular-tag-id', 2),
--   ('sign-id-here', 'democracy-tag-id', 1),
--   ('sign-id-here', 'seasonal-tag-id', 1);

-- =====================================================
-- HELPER QUERY TO GET IDS FOR MANUAL LINKING
-- =====================================================
-- Run these queries to get the IDs you need:
-- 
-- SELECT id, title FROM signs ORDER BY created_at;
-- SELECT id, name FROM tags ORDER BY name;
--
-- Then manually create INSERT statements for sign_tags

-- =====================================================
-- MAKE YOURSELF AN ADMIN
-- =====================================================
-- After signing up through the app, run this query with your user ID:
-- 
-- UPDATE profiles SET is_admin = true WHERE email = 'your-email@example.com';
