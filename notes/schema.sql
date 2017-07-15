CREATE DATABASE `stakey` /*!40100 DEFAULT CHARACTER SET utf8 COLLATE utf8_bin */;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `firstName` varchar(45) COLLATE utf8_bin DEFAULT NULL,
  `lastName` varchar(45) COLLATE utf8_bin DEFAULT NULL,
  `email` varchar(45) COLLATE utf8_bin DEFAULT NULL,
  `level` tinyint(3) unsigned NOT NULL DEFAULT '0',
  `isSecretary` tinyint(3) NOT NULL DEFAULT '0',
  `passwordHash` varchar(128) COLLATE utf8_bin DEFAULT NULL,
  `salt` varchar(32) COLLATE utf8_bin DEFAULT NULL,
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- isSecretary - this user is notified when callings need to be actioned
--   user should also be notified when stake president is assigned something

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
  `deleted` tinyint(3) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- state enums:
-- 0 = pending stake presidency approval
-- 1 = pending high council approval
-- 2 = pending interview
-- 3 = pending sustaining
-- 4 = pending setting apart
-- 5 = complete

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
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expiration` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

DROP TABLE IF EXISTS `assignments`;
CREATE TABLE `assignments` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `linkCode` varchar(16) COLLATE utf8_bin NOT NULL,
  `callingId` int(10) unsigned NOT NULL,
  `callingState` tinyint(3) unsigned NOT NULL,
  `completed` tinyint(3) unsigned NOT NULL DEFAULT '0',
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
