CREATE DATABASE IF NOT EXISTS job_board
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE job_board;

DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS advertisements;
DROP TABLE IF EXISTS people;
DROP TABLE IF EXISTS companies;

CREATE TABLE companies (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(150) NOT NULL,
sector VARCHAR(100),
city VARCHAR(100),
website VARCHAR(255),
description TEXT,
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE people (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(30),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM ('admin' , 'user') NOT NULL DEFAULT 'user',
    company_id INT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);

CREATE TABLE advertisements(
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    short_description VARCHAR(255) NOT NULL,
    full_description TEXT,
    company_id INT NOT NULL,
    contact_id INT NULL,
    location VARCHAR(100),
    contract_type VARCHAR(100),
    working_time VARCHAR(100),
    salary VARCHAR(100),
    remote ENUM ('no' , 'partial' , 'full') NOT NULL DEFAULT 'no',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_id) REFERENCES people(id) ON DELETE SET NULL
);

CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ad_id INT NOT NULL,
    person_id INT,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    message TEXT NOT NULL,
    status ENUM ('sent' , 'read') NOT NULL DEFAULT 'sent',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ad_id) REFERENCES advertisements(id) ON DELETE CASCADE,
    FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE SET NULL
    );