CREATE TABLE IF NOT EXISTS mess_menu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day_of_week VARCHAR(20) NOT NULL,
    meal_type VARCHAR(20) NOT NULL,
    items TEXT NOT NULL
);

INSERT INTO mess_menu (day_of_week, meal_type, items) VALUES 
('Monday', 'Breakfast', 'Pancakes, Oats, Coffee'),
('Monday', 'Lunch', 'Grilled Chicken, Rice, Salads'),
('Monday', 'Dinner', 'Pasta Bake, Garlic Bread'),
('Tuesday', 'Breakfast', 'Eggs, Toast, Juice'),
('Tuesday', 'Lunch', 'Tacos, Fries, Soda'),
('Tuesday', 'Dinner', 'Steak, Mashed Potatoes');

CREATE TABLE IF NOT EXISTS mess_bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    booking_date DATE NOT NULL,
    meal_type VARCHAR(20) NOT NULL,
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_meal (user_id, booking_date, meal_type)
);
