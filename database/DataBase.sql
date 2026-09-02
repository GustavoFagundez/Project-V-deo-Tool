-- =========================================================
-- VideoTool — schema.sql
-- =========================================================

CREATE DATABASE IF NOT EXISTS videotool
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE videotool;

-- ---------------------------------------------------------
-- users
-- ---------------------------------------------------------
CREATE TABLE users (
  id            VARCHAR(36)  PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  tokens        INT          NOT NULL DEFAULT 0,
  plan_id       VARCHAR(20)  NOT NULL DEFAULT 'free',
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- plans
-- ---------------------------------------------------------
CREATE TABLE plans (
  id               VARCHAR(20)  PRIMARY KEY,
  name             VARCHAR(60)  NOT NULL,
  price            DECIMAL(10,2) NOT NULL DEFAULT 0,
  tokens_included  INT          NOT NULL DEFAULT 0
);

CREATE TABLE plan_features (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  plan_id  VARCHAR(20) NOT NULL,
  feature  VARCHAR(160) NOT NULL,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- tools
-- ---------------------------------------------------------
CREATE TABLE tools (
  id          VARCHAR(40)  PRIMARY KEY,
  name        VARCHAR(80)  NOT NULL,
  page        VARCHAR(160) NOT NULL,
  token_cost  INT          NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------
-- history
-- ---------------------------------------------------------
CREATE TABLE history (
  id          VARCHAR(36) PRIMARY KEY,
  user_id     VARCHAR(36) NOT NULL,
  tool_id     VARCHAR(40) NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'pending',
  result_url  VARCHAR(500),
  created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE RESTRICT
);

-- ---------------------------------------------------------
-- images / videos (resultados salvos no Estúdio)
-- ---------------------------------------------------------
CREATE TABLE images (
  id          VARCHAR(36) PRIMARY KEY,
  user_id     VARCHAR(36) NOT NULL,
  url         VARCHAR(500) NOT NULL,
  created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE videos (
  id          VARCHAR(36) PRIMARY KEY,
  user_id     VARCHAR(36) NOT NULL,
  url         VARCHAR(500) NOT NULL,
  created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- Dados de exemplo (os mesmos do database.json)
-- ---------------------------------------------------------
INSERT INTO plans (id, name, price, tokens_included) VALUES
  ('free', 'Gratuito', 0, 50),
  ('pro', 'Pro', 29, 1000),
  ('premium', 'Premium', 79, 5000);

INSERT INTO plan_features (plan_id, feature) VALUES
  ('free', 'Geração de imagens (limitada)'),
  ('free', 'Marca d''água nos resultados'),
  ('pro', 'Todas as ferramentas de imagem'),
  ('pro', 'Texto para vídeo'),
  ('pro', 'Sem marca d''água'),
  ('premium', 'Tudo do Pro'),
  ('premium', 'Fila de processamento prioritária'),
  ('premium', 'Suporte prioritário');

INSERT INTO tools (id, name, page, token_cost) VALUES
  ('generate-image', 'Gerar imagem', 'Tools/generate_image.html', 5),
  ('better-images', 'Melhorar imagem', 'Tools/better_images.html', 5),
  ('expanded-images', 'Expandir imagem', 'Tools/expanded_images.html', 5),
  ('remove-background', 'Remover fundo', 'Tools/remove_background.html', 3),
  ('image-to-video', 'Imagem para vídeo', 'Tools/image_to_video.html', 15),
  ('text-to-video', 'Texto para vídeo', 'Tools/text_to_video.html', 20);

INSERT INTO users (id, name, email, password_hash, tokens, plan_id) VALUES
  ('usr_001', 'Usuário Exemplo', 'usuario@exemplo.com', 'TODO_hash_da_senha', 120, 'free');