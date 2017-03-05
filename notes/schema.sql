CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `firstName` varchar(45) COLLATE utf8_bin DEFAULT NULL,
  `lastName` varchar(45) COLLATE utf8_bin DEFAULT NULL,
  `email` varchar(45) COLLATE utf8_bin DEFAULT NULL,
  `level` tinyint(3) unsigned NOT NULL DEFAULT '0', -- 0 high council, 1 stake presidency, 2 admin
  `passwordHash` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `salt` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin

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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin

CREATE TABLE `approvals` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `callingId` int(10) unsigned NOT NULL,
  `approverId` int(10) unsigned NOT NULL,
  `approved` tinyint(3) unsigned DEFAULT NULL,
  `linkCode` varchar(16) COLLATE utf8_bin NOT NULL,
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `approverId_idx` (`approverId`),
  KEY `callingId_idx` (`callingId`),
  CONSTRAINT `approvalsApproverId` FOREIGN KEY (`approverId`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `approvalsCallingId` FOREIGN KEY (`callingId`) REFERENCES `callings` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin
