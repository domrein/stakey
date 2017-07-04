DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `firstName` varchar(45) COLLATE utf8_bin DEFAULT NULL,
  `lastName` varchar(45) COLLATE utf8_bin DEFAULT NULL,
  `email` varchar(45) COLLATE utf8_bin DEFAULT NULL,
  `level` tinyint(3) unsigned NOT NULL DEFAULT '0',
  `passwordHash` varchar(128) COLLATE utf8_bin DEFAULT NULL,
  `salt` varchar(32) COLLATE utf8_bin DEFAULT NULL,
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

DROP TABLE IF EXISTS `callings`;
CREATE TABLE `callings` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `firstName` varchar(45) COLLATE utf8_bin DEFAULT NULL,
  `middleName` varchar(45) COLLATE utf8_bin DEFAULT NULL,
  `lastName` varchar(45) COLLATE utf8_bin DEFAULT NULL,
  `position` varchar(45) COLLATE utf8_bin DEFAULT NULL,
  `reason` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `templeWorthy` tinyint(3) unsigned DEFAULT NULL,
  `ward` varchar(45) COLLATE utf8_bin DEFAULT NULL,
  `currentCalling` varchar(45) COLLATE utf8_bin DEFAULT NULL,
  `phoneNumber` varchar(45) COLLATE utf8_bin DEFAULT NULL,
  `bishopConsulted` tinyint(3) unsigned DEFAULT NULL,
  `councilRepConsulted` tinyint(3) unsigned DEFAULT NULL,
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `state` tinyint(3) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- state enums:
-- 0 = pending stake presidency approval
-- 1 = pending high council approval
-- 2 = pending interview
-- 3 = pending sustaining
-- 4 = pending setting apart
-- 5 = complete
-- 6 = deleted

DROP TABLE IF EXISTS `approvals`;
CREATE TABLE `approvals` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `callingId` int(10) unsigned NOT NULL,
  `state` tinyint(3) unsigned NOT NULL,
  `approverId` int(10) unsigned NOT NULL,
  `approved` tinyint(3) unsigned DEFAULT NULL,
  `linkCode` varchar(16) COLLATE utf8_bin NOT NULL,
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `approverId_idx` (`approverId`),
  KEY `callingId_idx` (`callingId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

DROP TABLE IF EXISTS `registration`;
CREATE TABLE `registration` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(16) COLLATE utf8_bin NOT NULL,
  `level` tinyint(3) unsigned NOT NULL,
  `expiration` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
