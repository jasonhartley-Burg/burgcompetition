-- Adds/restores the Sweet Treats category without changing any existing menu items.
-- It is ordered after Drinks & More and the public display places it directly beneath Drinks.

UPDATE categories
SET active = 1,
    display_order = 40,
    updated_at = CURRENT_TIMESTAMP
WHERE lower(trim(name)) = 'sweet treats';

INSERT INTO categories (name, display_order, active)
SELECT 'Sweet Treats', 40, 1
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE lower(trim(name)) = 'sweet treats'
);
