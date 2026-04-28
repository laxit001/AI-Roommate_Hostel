# Run this to migrate existing users before starting the server
ALTER TABLE users 
ADD COLUMN confidence_score FLOAT DEFAULT 1.0,
ADD COLUMN complaints_count INT DEFAULT 0,
ADD COLUMN penalty_level INT DEFAULT 0;
