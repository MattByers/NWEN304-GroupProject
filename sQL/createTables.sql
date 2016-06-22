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
product_type VARCHAR(64) Primary Key
);

CREATE TABLE products(
productID serial Primary Key,
product_name VARCHAR(64),
product_description VARCHAR(2048),
product_type VARCHAR(64),
price DECIMAL(6,2),
imageURL VARCHAR(256),
CONSTRAINT fk_producttype FOREIGN KEY (product_type) REFERENCES 
product_types(product_type)
);

CREATE TABLE orders(
userid int,
productid int,
quantity int,
CONSTRAINT pk_order PRIMARY KEY(userid, productid),
CONSTRAINT fk_userid FOREIGN KEY (userid) REFERENCES users(userid),
CONSTRAINT fk_productid FOREIGN KEY (productid) REFERENCES products(productid)
);

CREATE TABLE carts(
userid int,
productid int,
quantity int,
CONSTRAINT pk_cart PRIMARY KEY(userid, productid),
CONSTRAINT fk_userid FOREIGN KEY (userid) REFERENCES users(userid),
CONSTRAINT fk_productid FOREIGN KEY (productid) REFERENCES products(productid)
);