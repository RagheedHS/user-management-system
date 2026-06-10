-- Flyway migration: create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  text VARCHAR(1024),
  is_read BOOLEAN DEFAULT FALSE,
  is_static BOOLEAN DEFAULT FALSE,
  type VARCHAR(255),
  metadata TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id)
);
