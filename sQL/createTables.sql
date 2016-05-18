CREATE TABLE users(
userID serial Primary Key, 
username VARCHAR(64), 
password VARCHAR(64),
email VARCHAR(64),
first_name VARCHAR(32),
last_name VARCHAR(32),
address VARCHAR(64)
);

CREATE TABLE products(
productID serial Primary Key,
product_name VARCHAR(64),
product_description VARCHAR(2048),
price INT
);
