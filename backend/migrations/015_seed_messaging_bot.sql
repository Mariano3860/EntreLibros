INSERT INTO users (name, email, password, role)
VALUES (
  'Bot de EntreLibros',
  'bot@entrelibros.local',
  'disabled-bot-account',
  'bot'
)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    role = EXCLUDED.role;
