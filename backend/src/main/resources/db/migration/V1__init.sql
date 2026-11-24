CREATE TABLE admin_user (
    id            BIGSERIAL PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    display_name  VARCHAR(50)  NOT NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE news (
    id            BIGSERIAL PRIMARY KEY,
    title         VARCHAR(60)  NOT NULL,
    summary       VARCHAR(100),
    content       TEXT         NOT NULL,
    thumbnail_url VARCHAR(500),
    source_name   VARCHAR(100),
    source_url    VARCHAR(1000),
    published     BOOLEAN      NOT NULL DEFAULT TRUE,
    publish_date  DATE         NOT NULL,
    created_by    VARCHAR(50)  NOT NULL,
    created_at    TIMESTAMP    NOT NULL,
    updated_at    TIMESTAMP    NOT NULL
);

CREATE INDEX idx_news_publish ON news (published, publish_date DESC, id DESC);

CREATE TABLE inquiry (
    id          BIGSERIAL PRIMARY KEY,
    receipt_no  VARCHAR(30)  NOT NULL UNIQUE,
    category    VARCHAR(20)  NOT NULL,
    company     VARCHAR(100) NOT NULL,
    name        VARCHAR(50)  NOT NULL,
    email       VARCHAR(200) NOT NULL,
    phone       VARCHAR(30)  NOT NULL,
    content     TEXT         NOT NULL,
    created_at  TIMESTAMP    NOT NULL
);

CREATE INDEX idx_inquiry_created ON inquiry (created_at);
