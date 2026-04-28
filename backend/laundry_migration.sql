CREATE TABLE IF NOT EXISTS laundry_bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    booking_date DATE NOT NULL,
    slot_time VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'booked',
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_laundry_slot (booking_date, slot_time)
);
