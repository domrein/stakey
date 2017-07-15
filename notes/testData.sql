-- populate users (all passwords are "password")
INSERT INTO `users` (`id`,`firstName`,`lastName`,`email`,`level`, `isSecretary`,`passwordHash`,`salt`,`created`) VALUES
(1,'Moses','Egyptus','stakepres@stakey.paulmilham.com',3,0,'627b2fb279487777b64583b3cb53f7c47c166de164f9e6b54e12a4a655cb7113009f304f35363da9ba7dda25331878360f074f5611e2dd4371eabc123bceaa73','r2cllp6qizf10topq718jj2mu4f0fgqn',NOW()),
(2,'Mohonrai','Moriancumr','firstcounselor@stakey.paulmilham.com',3,0,'0ab9f0d1e16946cad45ed9a42c7389766cf8ba968384edbf38489957610cbc670b6fed7b12718ea7243e77a8ffe0f8ac97f8cdacfcc59636f4f374c7ad8f03b3','fd7u44v662v6uk5lbmx9t4gu5edfxywk',NOW()),
(3,'Porter','Rockwell','secondcounselor@stakey.paulmilham.com',3,0,'e33859e0faf412edd539e306a1b0ea110c5c297d21a28edb727a7cc0efc32a4b427395bc4a1a483ca88dfb461a24da5d175d699f15f3dc74b5b399a2df68a6d8','76pdv2rtee93f6vltig6zv5g9q7x3c2k',NOW()),
(4,'Zeezrom','Lamanitus','highcouncil1@stakey.paulmilham.com',2,0,'a5604273b30d103b0ef07e09e2769db8b1659e07c94f959332c6d26e9ec6b8d79505de6de5521949e0752e393c9a1c8ecc5b622d195dc27b87593a1881fbe99d','bisj18coxa070w5cqex0uqnuixs02evw',NOW()),
(5,'Hyrum','Smith','highcouncil2@stakey.paulmilham.com',2,0,'9819e8607604a145a4882467d96cdaf4695afe88b25695c55708388faa1009f931fb11ba682f7312d32182d8f44f284b24a9e12b8901ebafb9abf96038ca7984','qiighbxvkntj4bdk5cthiahlq1zh4npr',NOW()),
(6,'Emma','Smith','highcouncil3@stakey.paulmilham.com',2,0,'8353bd86eaa44a52dcb3b0c76da6deb851faf0cdb43b68915bf6d02713eb9ab25af2d98ab53fc5fe01ed0914688b41857a90108aae08ba4ff8c846d667251f70','lp7lyygaljs9otm075kmbx8ks7xyc8rc',NOW()),
(7,'Nephi','Nephiticus','highcouncil4@stakey.paulmilham.com',2,0,'c59e769926822362997c879503a020b10d80b9fe28f5159ce359733e454649b6330a3eeaf0a5a39c028782260a6e2d5aec3d12f477f745c16985aa8c3a4a6b1a','5murseqb1l0z5nkm3aghzhria531vs0v',NOW()),
(8,'Teancum','Mahorian','secretary@stakey.paulmilham.com',3,1,'bccb780f68a62987013b7ee43cc22f74aeaadd62410a9e71352e353b1d4380c54248fcf8c8012b41a3909a168b0a8b2b4cf198375b0b4c8863f44248dea047c6','2xr7d89cp472t071ojln8rshwajin4ou',NOW()),
(9,'Sariah','Shelahah','wardbishop1@stakey.paulmilham.com',1,0,'40047ee375c2e50ba0e59276894aa8f71a6cce28f1b264e9d9522af192ba3b60a40fabe037497e395c190879fb4998333284b53eee3c7cd1a3fb5d9b95f1e7d1','2eowflidi7etgsrce5mj4qvo6a8qsqhe',NOW());

-- sample test calling
INSERT INTO `callings` (`id`,`firstName`,`middleName`,`lastName`,`position`,`reason`,`templeWorthy`,`ward`,`currentCalling`,`phoneNumber`,`bishopConsulted`,`councilRepConsulted`,`created`,`state`) VALUES
(1,'Paul','Timothy','Milham','Stakey Cookie Tester','His sense of taste is impeccable. His knowledge of cookies is expansive. Big win for the stake here.',1,'mb2','None','555-5555',1,1,NOW(),0);
INSERT INTO `approvals` (`id`,`callingId`, `state`,`approverId`,`approved`,`linkCode`,`created`) VALUES
(1,1,0,1,NULL,'r9jssrl4nfqm560j',NOW()),
(2,1,0,2,NULL,'6yxqop2s724v48nw',NOW()),
(3,1,0,3,NULL,'vuegmkuq07y6jbrq',NOW()),
(4,1,0,8,NULL,'rlyi7skbmtrjo9n2',NOW());
-- Approve: http://localhost:3000/approval/r9jssrl4nfqm560j?approved=true Discuss: http://localhost:3000/approval/r9jssrl4nfqm560j?approved=false
-- Approve: http://localhost:3000/approval/6yxqop2s724v48nw?approved=true Discuss: http://localhost:3000/approval/6yxqop2s724v48nw?approved=false
-- Approve: http://localhost:3000/approval/vuegmkuq07y6jbrq?approved=true Discuss: http://localhost:3000/approval/vuegmkuq07y6jbrq?approved=false
-- Approve: http://localhost:3000/approval/rlyi7skbmtrjo9n2?approved=true Discuss: http://localhost:3000/approval/rlyi7skbmtrjo9n2?approved=false
