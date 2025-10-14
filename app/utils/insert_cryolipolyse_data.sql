-- SQL INSERT statements for Cryolipolyse category and services

-- Insert MenuCategory for 'Cryolipolyse'
-- IMPORTANT: If you already have a category named 'Cryolipolyse', or if you have an existing category with ID 1,
-- you might need to adjust the ID or omit it and let the database auto-increment if 'id' is auto-incrementing.
-- If 'Cryolipolyse' already exists, you can skip this INSERT statement.
INSERT IGNORE INTO `menu_categories` (`id`, `name`) VALUES
(1, 'Cryolipolyse');

-- Insert MenuItem entries for 'Cryolipolyse' services
-- IMPORTANT: Ensure the `category_id` matches the ID of your 'Cryolipolyse' category.
-- If your `menu_items` table has existing data, you might need to adjust the `id` values or omit them
-- and let the database auto-increment if 'id' is auto-incrementing.
INSERT INTO `menu_items` (`id`, `name`, `description`, `price`, `duration`, `category_id`, `created_at`) VALUES
(1, 'Séance Cryolipolyse - 1 Zone', 'Traitement de cryolipolyse pour une zone spécifique.', 150, 60, 1, NOW()),
(2, 'Séance Cryolipolyse - 2 Zones', 'Traitement de cryolipolyse pour deux zones spécifiques.', 250, 90, 1, NOW()),
(3, 'Séance Cryolipolyse - 3 Zones', 'Traitement de cryolipolyse pour trois zones spécifiques.', 350, 120, 1, NOW());
