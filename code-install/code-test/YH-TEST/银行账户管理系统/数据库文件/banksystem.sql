/*
SQLyog Ultimate v12.09 (64 bit)
MySQL - 5.5.57 : Database - banksystem
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`banksystem` /*!40100 DEFAULT CHARACTER SET utf8 */;

USE `banksystem`;

/*Table structure for table `trader` */

DROP TABLE IF EXISTS `trader`;

CREATE TABLE `trader` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `trade` varchar(50) DEFAULT NULL,
  `balance` int(11) DEFAULT NULL,
  `dataTime` varchar(50) DEFAULT NULL,
  `userNO` varchar(50) DEFAULT NULL,
  `money` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=gb2312;

/*Data for the table `trader` */

insert  into `trader`(`id`,`trade`,`balance`,`dataTime`,`userNO`,`money`) values (1,'存款',1111,'2017-10-18 20:24:58','1508329470158',1111),(2,'存款',1144,'2017-10-18 20:25:01','1508329470158',33),(3,'取款',1133,'2017-10-18 20:25:04','1508329470158',11),(4,'存款',1254,'2017-10-18 20:25:09','1508329470158',121),(5,'取款',820,'2017-10-18 20:25:12','1508329470158',434);

/*Table structure for table `userinfo` */

DROP TABLE IF EXISTS `userinfo`;

CREATE TABLE `userinfo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userName` varchar(50) DEFAULT NULL,
  `userAge` int(11) DEFAULT NULL,
  `idCard` varchar(50) DEFAULT NULL,
  `tel` varchar(50) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `userAddress` varchar(100) DEFAULT NULL,
  `password` varchar(50) DEFAULT NULL,
  `userSex` varchar(50) DEFAULT NULL,
  `userNO` varchar(50) DEFAULT NULL,
  `balance` int(11) DEFAULT NULL,
  `userflag` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=gb2312;

/*Data for the table `userinfo` */

insert  into `userinfo`(`id`,`userName`,`userAge`,`idCard`,`tel`,`city`,`userAddress`,`password`,`userSex`,`userNO`,`balance`,`userflag`) values (1,'小杨',23,'121212121212121212','23','we','we','93279E3308BDBBEED946FC965017F67A','ss','1508329470158',820,0);

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
