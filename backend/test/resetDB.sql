DROP TABLE spots, users, reports, revokedTokens, ranges, schedule;

CREATE TABLE spots(
  ID SERIAL PRIMARY KEY,
  NAME TEXT,
  OWNER_EMAIL TEXT,
  INUSE BOOLEAN,
  CURRENT_EMAIL TEXT
);

CREATE TABLE users(
  EMAIL TEXT PRIMARY KEY,
  ACCESS INT,
  NAME TEXT,
  LICENSE_PlATE TEXT
);

CREATE TABLE reports(
  ID SERIAL PRIMARY KEY,
  AUTHOR_EMAIL TEXT,
  NOTE TEXT,
  SPOT_ID TEXT,
  LICENSE_PlATE TEXT,
  CREATION_DATE TEXT
);

CREATE TABLE revokedTokens(
  TOKEN_HASH TEXT PRIMARY KEY
);

CREATE TABLE ranges(
  EMAIL TEXT PRIMARY KEY,
  RANGE TEXT
);

CREATE TABLE schedule(
  ID SERIAL PRIMARY KEY,
  EMAIL TEXT,
  SID TEXT,
  ACTION TEXT,
  DAY TEXT
);

INSERT INTO spots (NAME, OWNER_EMAIL, INUSE, CURRENT_EMAIL) VALUES ('AM 1', 'jonescal@bentonvillek12.org', true, 'jonescal@bentonvillek12.org');
INSERT INTO users VALUES ('jonescal@bentonvillek12.org', 3, 'Caleb Jones', '123ABC');
INSERT INTO users VALUES ('abc@bentonvillek12.org', 2, 'ABC Jones', '124ABC');