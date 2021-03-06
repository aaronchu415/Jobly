-- Create a table for companies, each company should have a:

-- handle: a primary key that is text
-- name: a non-nullable column that is text and unique
-- num_employees: a column that is an integer
-- description: a column that is text
-- logo_url: a column that is text

CREATE TABLE companies (
    handle Text PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    num_employees INTEGER,
    description TEXT,
    logo_url TEXT
);

-- seed data 
INSERT INTO companies
VALUES ('amzn',
        'Amazon',
        1000,
        'Ecommerce company',
        'https://pmcvariety.files.wordpress.com/2018/01/amazon-logo.jpg?w=1000&h=562&crop=1');

INSERT INTO companies
VALUES ('aapl',
        'Apple',
        2000,
        'Hardware company',
        'https://banner2.kisspng.com/20180515/hhq/kisspng-apple-logo-company-5afb1f7493fcc9.9811145215264070286062.jpg');

INSERT INTO companies
VALUES ('fb',
        'Facebook',
        3000,
        'Social Network company',
        'https://cdn0.tnwcdn.com/wp-content/blogs.dir/1/files/2015/07/sdffdsafsdf-1200x604.png');


-- Create a table for jobs, each job should have an:

-- id: a primary key that is an auto incrementing integer
-- title: a non-nullable column
-- salary a non-nullable floating point column
-- equity: a non-nullable column that is a float. For example, 0.5 equity represents 50% in a company. 
--   -Ensure that you have a constraint that does not allow for equity to be greater than 1 when created.
-- company_handle: a column which is a foreign key to the handle column
-- date_posted: a datetime column that defaults to whenever the row is created

CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    salary FLOAT NOT NULL,
    equity FLOAT NOT NULL CHECK (equity < 1 AND equity > 0),
    company_handle TEXT REFERENCES companies ON DELETE CASCADE,
    date_posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);


    


-- Create a table for users, each user should have a:

-- username: a primary key that is text
-- password: a non-nullable column
-- first_name: a non-nullable column
-- last_name: a non-nullable column
-- email: a non-nullable column that is and unique
-- photo_url: a column that is text
-- is_admin: a column that is not null, boolean and defaults to false

CREATE TABLE users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    photo_url TEXT,
    is_admin boolean NOT NULL DEFAULT false
);
