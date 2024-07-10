/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT NOT NULL;


INSERT INTO "User" (id, name, email, password) VALUES
('clyfmbjf70000t6mqrzuk8cyp', 'user1', 'user1@mail.com', '$2b$10$PEpi278Hgspl7SKDhfZHvOO2hMrr/Vi0gopYsmJ0vSSV8ZnK1gXBi'),
('clyfmbjf70000d6mqrzuk8clo', 'user2', 'user2@mail.com', '$2b$10$PEpi278Hgspl7SKDhfZHvOO2hMrr/Vi0gopYsmJ0vSSV8ZnK1gXBi');

INSERT INTO "Chat" (id) VALUES ('clyfmises0003t6mqwjyzg5ga');
INSERT INTO "UserChat" ("userId", "chatId") VALUES ('clyfmbjf70000t6mqrzuk8cyp', 'clyfmises0003t6mqwjyzg5ga');



