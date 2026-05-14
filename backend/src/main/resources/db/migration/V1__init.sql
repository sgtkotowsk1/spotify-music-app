CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    yandex_id   VARCHAR(255) NOT NULL,
    email       VARCHAR(255),
    display_name VARCHAR(255),
    login       VARCHAR(255) NOT NULL,
    avatar_url  VARCHAR(1024),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_users_yandex_id UNIQUE (yandex_id)
);

CREATE TABLE oauth_tokens (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    access_token  TEXT         NOT NULL,
    refresh_token TEXT,
    token_type    VARCHAR(50)  DEFAULT 'bearer',
    expires_at    TIMESTAMPTZ,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_oauth_tokens_user_id UNIQUE (user_id)
);

CREATE INDEX idx_users_yandex_id    ON users(yandex_id);
CREATE INDEX idx_oauth_tokens_uid   ON oauth_tokens(user_id);
