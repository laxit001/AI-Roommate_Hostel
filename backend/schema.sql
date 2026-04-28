CREATE DATABASE IF NOT EXISTS roommate_matching;
USE roommate_matching;

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    cleanliness FLOAT NOT NULL,
    discipline FLOAT NOT NULL,
    social FLOAT NOT NULL,
    noise FLOAT NOT NULL,
    sleep FLOAT NOT NULL,
    emotional FLOAT NOT NULL,
    trust_score FLOAT NOT NULL,
    confidence_score FLOAT DEFAULT 1.0,
    complaints_count INT DEFAULT 0,
    penalty_level INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mess_menu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day_of_week VARCHAR(20) NOT NULL,
    meal_type VARCHAR(20) NOT NULL,
    items TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mess_bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    booking_date DATE NOT NULL,
    meal_type VARCHAR(20) NOT NULL,
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_meal (user_id, booking_date, meal_type)
);

CREATE TABLE IF NOT EXISTS laundry_bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    booking_date DATE NOT NULL,
    slot_time VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'booked',
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_laundry_slot (booking_date, slot_time)
);
