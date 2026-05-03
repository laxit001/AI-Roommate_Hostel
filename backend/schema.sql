-- ============================================================
-- HOSTEL SUPER APP — COMPLETE DATABASE SCHEMA
-- Run this ONCE on a fresh database: roommate_matching
-- ============================================================

CREATE DATABASE IF NOT EXISTS roommate_matching CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE roommate_matching;

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    user_id         INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150)    NOT NULL DEFAULT 'Student',
    email           VARCHAR(255)    UNIQUE NOT NULL,
    google_id       VARCHAR(255)    UNIQUE,
    is_verified     BOOLEAN         DEFAULT FALSE,

    -- Personality traits (0–10 scale, default 5)
    cleanliness     FLOAT           NOT NULL DEFAULT 5.0,
    discipline      FLOAT           NOT NULL DEFAULT 5.0,
    social          FLOAT           NOT NULL DEFAULT 5.0,
    noise           FLOAT           NOT NULL DEFAULT 5.0,
    sleep           FLOAT           NOT NULL DEFAULT 5.0,
    emotional       FLOAT           NOT NULL DEFAULT 5.0,

    -- Trust & behavioral scoring
    trust_score     FLOAT           NOT NULL DEFAULT 100.0,
    confidence_score FLOAT          DEFAULT 1.0,
    complaints_count INT            DEFAULT 0,
    penalty_level   INT             DEFAULT 0,

    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- OTP VERIFICATION TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS otp_codes (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    email           VARCHAR(255)    NOT NULL,
    hashed_otp      VARCHAR(255)    NOT NULL,
    expires_at      TIMESTAMP       NOT NULL,
    used            BOOLEAN         DEFAULT FALSE,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- ============================================================
-- COMPLAINTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS complaints (
    complaint_id    INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT             NOT NULL,
    roommate_id     INT             NOT NULL,
    message         TEXT            NOT NULL,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)     REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (roommate_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================================
-- MESS MENU TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS mess_menu (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    day_of_week     VARCHAR(20)     NOT NULL,
    meal_type       VARCHAR(20)     NOT NULL,
    items           TEXT            NOT NULL,
    UNIQUE KEY unique_day_meal (day_of_week, meal_type)
);

-- ============================================================
-- MESS BOOKINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS mess_bookings (
    booking_id      INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT             NOT NULL,
    booking_date    DATE            NOT NULL,
    meal_type       VARCHAR(20)     NOT NULL,
    booked_at       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_meal (user_id, booking_date, meal_type),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================================
-- LAUNDRY BOOKINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS laundry_bookings (
    booking_id      INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT             NOT NULL,
    booking_date    DATE            NOT NULL,
    slot_time       VARCHAR(20)     NOT NULL,
    status          VARCHAR(20)     DEFAULT 'booked',
    booked_at       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_laundry_slot (booking_date, slot_time),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================================
-- SEED: Weekly Mess Menu
-- ============================================================
INSERT IGNORE INTO mess_menu (day_of_week, meal_type, items) VALUES
('Monday',    'Breakfast', 'Idli, Sambar, Coconut Chutney, Filter Coffee'),
('Monday',    'Lunch',     'Rice, Dal Tadka, Aloo Gobi, Salad, Papad'),
('Monday',    'Dinner',    'Chapati, Paneer Butter Masala, Jeera Rice, Raita'),
('Tuesday',   'Breakfast', 'Poha, Boiled Eggs, Banana, Masala Chai'),
('Tuesday',   'Lunch',     'Curd Rice, Rajma, Roti, Mixed Veg, Pickle'),
('Tuesday',   'Dinner',    'Fried Rice, Chilli Chicken, Soup, Ice Cream'),
('Wednesday', 'Breakfast', 'Paratha, Curd, Pickle, Green Chutney'),
('Wednesday', 'Lunch',     'Veg Biryani, Raita, Salan, Papad, Lassi'),
('Wednesday', 'Dinner',    'Roti, Dal Makhani, Aloo Jeera, Sweet Lassi'),
('Thursday',  'Breakfast', 'Upma, Peanut Chutney, Vada, Masala Chai'),
('Thursday',  'Lunch',     'Rice, Sambar, Rasam, Kootu, Appalam'),
('Thursday',  'Dinner',    'Chapati, Egg Curry, Pulao, Green Salad'),
('Friday',    'Breakfast', 'Dosa, Sambar, Tomato Chutney, Coffee'),
('Friday',    'Lunch',     'Biryani, Mirchi Ka Salan, Raita, Kheer'),
('Friday',    'Dinner',    'Noodles, Manchurian, Spring Rolls, Soup'),
('Saturday',  'Breakfast', 'Puri Bhaji, Lassi, Seasonal Fruits'),
('Saturday',  'Lunch',     'Special Thali: Dal, Sabzi, Rice, Roti, Dessert'),
('Saturday',  'Dinner',    'Pizza, Pasta, Garlic Bread, Cold Drink'),
('Sunday',    'Breakfast', 'Chole Bhature, Sweet Chai, Jalebi'),
('Sunday',    'Lunch',     'Paneer, Dal, Rice, Salad, Ice Cream'),
('Sunday',    'Dinner',    'Biryani, Raita, Kebabs, Cold Drink');
