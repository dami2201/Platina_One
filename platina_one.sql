-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2025. Máj 12. 06:13
-- Kiszolgáló verziója: 10.4.32-MariaDB
-- PHP verzió: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `platina_one`
--

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `loops`
--

CREATE TABLE `loops` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `file_url` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `loops`
--

INSERT INTO `loops` (`id`, `title`, `description`, `file_url`, `user_id`, `created_at`) VALUES
(7, 'asd', 'asd', '229223d19c3f7d6f6fa3c46f9b598dcc', 3, '2025-05-12 04:19:06'),
(8, 'asd', 'asd', '77cfacda389a552ab32bde11ffbfceba', 1, '2025-05-12 04:39:53'),
(9, 'asd', 'asd', 'b1151bec918e3fa0d5809a0a1fb70748', 1, '2025-05-12 05:26:23');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `message` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `messages`
--

INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `created_at`) VALUES
(1, 1, 1, 'asd', '2025-05-10 23:55:54'),
(2, 1, 1, 'asd', '2025-05-10 23:55:58'),
(3, 1, 1, 'asd', '2025-05-10 23:59:24'),
(4, 1, 1, 'asd', '2025-05-11 00:59:24'),
(5, 2, 1, 'szia', '2025-05-11 23:10:51');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `public_messages`
--

CREATE TABLE `public_messages` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `public_messages`
--

INSERT INTO `public_messages` (`id`, `sender_id`, `message`, `created_at`) VALUES
(1, 1, 'asd', '2025-05-10 23:25:19'),
(2, 1, 'asdads', '2025-05-11 21:10:24'),
(3, 2, 'asd', '2025-05-11 21:10:46'),
(4, 1, 'asdads', '2025-05-11 21:43:17'),
(5, 1, 'asdasd', '2025-05-11 21:43:35'),
(6, 1, 'erw', '2025-05-11 23:29:15');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `ratings`
--

CREATE TABLE `ratings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `loop_id` int(11) NOT NULL,
  `rating` tinyint(4) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `ratings`
--

INSERT INTO `ratings` (`id`, `user_id`, `loop_id`, `rating`, `comment`, `created_at`) VALUES
(4, 1, 7, 1, NULL, '2025-05-12 05:12:50'),
(5, 1, 8, 1, NULL, '2025-05-12 05:26:26');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rank` enum('standard','gold','diamond','platina') DEFAULT 'standard',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `rank`, `created_at`) VALUES
(1, 'asd', 'asd@gmail.com', '$2b$10$GNw3ijEb114RyMnWtzopD.u8s6MyRVC/u2/XaP9npuuS8bSmK5ODC', 'standard', '2025-04-29 19:59:23'),
(2, 'danika', 'danika@gmail.com', '$2b$10$pAdn9Zazq.rFETztLgybGOuqCeUxgl5f.TtRv6IuS5/OI6E2DqiXu', 'standard', '2025-05-11 23:10:35'),
(3, 'dsf', 'asd1@gmail.com', '$2b$10$zkd1lwWLfR6lDajpNUP.B.xov7F.DQskobAHT.HqXwFuGtQStNqyu', 'standard', '2025-05-12 02:00:30');

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `loops`
--
ALTER TABLE `loops`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- A tábla indexei `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `receiver_id` (`receiver_id`);

--
-- A tábla indexei `public_messages`
--
ALTER TABLE `public_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender_id` (`sender_id`);

--
-- A tábla indexei `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `loop_id` (`loop_id`);

--
-- A tábla indexei `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `loops`
--
ALTER TABLE `loops`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT a táblához `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT a táblához `public_messages`
--
ALTER TABLE `public_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT a táblához `ratings`
--
ALTER TABLE `ratings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT a táblához `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `loops`
--
ALTER TABLE `loops`
  ADD CONSTRAINT `loops_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `public_messages`
--
ALTER TABLE `public_messages`
  ADD CONSTRAINT `public_messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `ratings`
--
ALTER TABLE `ratings`
  ADD CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`loop_id`) REFERENCES `loops` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
