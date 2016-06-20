CREATE TABLE users(
userID serial Primary Key,
username VARCHAR(64),
password VARCHAR(60),   /*The password digests will only be 60 chars, this can be changed*/
email VARCHAR(64),
first_name VARCHAR(32),
last_name VARCHAR(32),
address VARCHAR(64)
);

CREATE TABLE product_types(
product_type VARCHAR(64) Primary Key);

CREATE TABLE products(
productID serial Primary Key,
product_name VARCHAR(64),
product_description VARCHAR(2048),
product_type VARCHAR(64),
price INT,
CONSTANT fk_producttype FOREIGN KEY (product_type) REFERENCES product_type(product_type);
);
