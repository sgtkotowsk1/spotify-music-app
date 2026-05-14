ALTER TABLE users RENAME COLUMN yandex_id TO spotify_id;
ALTER TABLE users DROP CONSTRAINT uk_users_yandex_id;
ALTER TABLE users ADD CONSTRAINT uk_users_spotify_id UNIQUE (spotify_id);
DROP INDEX idx_users_yandex_id;
CREATE INDEX idx_users_spotify_id ON users(spotify_id);
