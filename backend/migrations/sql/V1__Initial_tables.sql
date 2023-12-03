CREATE TABLE users (
  id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name  varchar(100) NOT NULL
);

CREATE TABLE messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   uuid REFERENCES users(id) NOT NULL,
  receiver_id uuid REFERENCES users(id) NOT NULL,
  content     text NOT NULL,
  created_at  timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE attachments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id  uuid REFERENCES messages(id) NOT NULL
);
