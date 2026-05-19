# SQL Cheat Sheet Guide

> Quick reference for SQL — from basic SELECT queries to joins, aggregations, window functions, CTEs, and DDL.

📋 **Quick reference:** [SQL Cheat Sheet](/cheatsheets/sql) — use this alongside the guide for fast syntax lookup while you read.

---

## Querying

### SELECT
Retrieve specific columns from a table.
```sql
SELECT first_name, last_name, email
FROM customers;
```

### SELECT *
Retrieve all columns from a table. Avoid in production — always name your columns explicitly.
```sql
SELECT *
FROM customers;
```

### SELECT DISTINCT
Return only unique values — removes duplicate rows.
```sql
SELECT DISTINCT country
FROM customers;
```

### AS (alias)
Rename a column or expression in the result set.
```sql
SELECT
    first_name AS name,
    annual_salary * 1.1 AS adjusted_salary
FROM employees;
```

### LIMIT
Restrict the number of rows returned. Use `TOP` in SQL Server.
```sql
-- PostgreSQL / MySQL
SELECT * FROM orders
LIMIT 10;

-- SQL Server
SELECT TOP 10 * FROM orders;
```

### OFFSET
Skip a number of rows before returning results. Used with `LIMIT` for pagination.
```sql
SELECT * FROM orders
ORDER BY order_date DESC
LIMIT 10 OFFSET 20;  -- rows 21–30
```

### ORDER BY
Sort the result set by one or more columns. Default is ascending (`ASC`).
```sql
SELECT product_name, price
FROM products
ORDER BY price DESC;
```

### ORDER BY multiple
Sort by more than one column — secondary sort applies when the first column has ties.
```sql
SELECT last_name, first_name, department
FROM employees
ORDER BY department ASC, last_name ASC;
```

---

## Filtering

### WHERE
Filter rows based on a condition. Applied before aggregation.
```sql
SELECT * FROM orders
WHERE status = 'shipped';
```

### Comparison operators
Standard operators for comparing values.
```sql
=     -- equal
<>    -- not equal (also !=)
>     -- greater than
<     -- less than
>=    -- greater than or equal
<=    -- less than or equal
```
```sql
SELECT * FROM products
WHERE price >= 50;
```

### AND / OR
Combine multiple conditions. AND requires both to be true; OR requires at least one.
```sql
SELECT * FROM orders
WHERE status = 'shipped'
  AND total_amount > 100;

SELECT * FROM products
WHERE category = 'Electronics'
   OR category = 'Accessories';
```

### NOT
Negate a condition.
```sql
SELECT * FROM customers
WHERE NOT country = 'USA';
```

### IN
Match against a list of values — shorthand for multiple OR conditions.
```sql
SELECT * FROM orders
WHERE status IN ('pending', 'processing', 'shipped');
```

### NOT IN
Exclude rows that match a list of values.
```sql
SELECT * FROM employees
WHERE department_id NOT IN (3, 7, 12);
```

### BETWEEN
Filter for values within an inclusive range. Works for numbers, dates, and strings.
```sql
SELECT * FROM orders
WHERE order_date BETWEEN '2024-01-01' AND '2024-12-31';

SELECT * FROM products
WHERE price BETWEEN 20 AND 100;
```

### LIKE
Filter using a pattern. `%` matches any sequence of characters. `_` matches exactly one character.
```sql
SELECT * FROM customers
WHERE email LIKE '%@gmail.com';

SELECT * FROM products
WHERE product_code LIKE 'SKU_001%';
```

### NOT LIKE
Exclude rows matching a pattern.
```sql
SELECT * FROM customers
WHERE email NOT LIKE '%test%';
```

### ILIKE
Case-insensitive pattern matching. Available in PostgreSQL.
```sql
SELECT * FROM products
WHERE product_name ILIKE '%laptop%';
```

### IS NULL
Check for missing values. Cannot use `= NULL` — it will not work.
```sql
SELECT * FROM orders
WHERE shipped_date IS NULL;
```

### IS NOT NULL
Check that a value exists.
```sql
SELECT * FROM customers
WHERE phone IS NOT NULL;
```

### EXISTS
Return rows where a correlated subquery returns at least one result.
```sql
SELECT customer_id, name
FROM customers c
WHERE EXISTS (
    SELECT 1 FROM orders o
    WHERE o.customer_id = c.customer_id
);
```

---

## Aggregation

### COUNT
Count rows or non-null values in a column.
```sql
SELECT COUNT(*) AS total_orders FROM orders;

SELECT COUNT(shipped_date) AS shipped_orders FROM orders;
-- Only counts rows where shipped_date is not null
```

### SUM
Total all values in a numeric column.
```sql
SELECT SUM(total_amount) AS revenue
FROM orders
WHERE status = 'completed';
```

### AVG
Calculate the average of a numeric column.
```sql
SELECT AVG(salary) AS avg_salary
FROM employees
WHERE department = 'Engineering';
```

### MIN / MAX
Return the smallest or largest value in a column.
```sql
SELECT
    MIN(order_date) AS first_order,
    MAX(order_date) AS latest_order
FROM orders;
```

### GROUP BY
Group rows sharing the same value and apply an aggregate to each group.
```sql
SELECT department, COUNT(*) AS headcount
FROM employees
GROUP BY department;
```

### HAVING
Filter groups after aggregation. WHERE filters rows; HAVING filters groups.
```sql
SELECT department, COUNT(*) AS headcount
FROM employees
GROUP BY department
HAVING COUNT(*) > 10;
```

### GROUP BY multiple
Group by more than one column for nested groupings.
```sql
SELECT department, job_title, AVG(salary) AS avg_salary
FROM employees
GROUP BY department, job_title
ORDER BY department, avg_salary DESC;
```

### COUNT DISTINCT
Count unique non-null values.
```sql
SELECT COUNT(DISTINCT customer_id) AS unique_customers
FROM orders;
```

---

## Joins

### INNER JOIN
Return only rows that have a match in both tables.
```sql
SELECT o.order_id, c.name, o.total_amount
FROM orders o
INNER JOIN customers c ON o.customer_id = c.customer_id;
```

### LEFT JOIN
Return all rows from the left table and matched rows from the right. Unmatched right-side rows appear as NULL.
```sql
SELECT c.name, o.order_id, o.total_amount
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id;
-- Customers with no orders will appear with NULL order fields
```

### RIGHT JOIN
Return all rows from the right table and matched rows from the left. Less common — usually rewritten as a LEFT JOIN.
```sql
SELECT c.name, o.order_id
FROM orders o
RIGHT JOIN customers c ON o.customer_id = c.customer_id;
```

### FULL OUTER JOIN
Return all rows from both tables. Unmatched rows on either side appear as NULL.
```sql
SELECT c.name, o.order_id
FROM customers c
FULL OUTER JOIN orders o ON c.customer_id = o.customer_id;
```

### CROSS JOIN
Return the Cartesian product — every row from the left paired with every row from the right. Use carefully.
```sql
SELECT p.product_name, s.store_name
FROM products p
CROSS JOIN stores s;
-- Returns every product × every store combination
```

### SELF JOIN
Join a table to itself. Useful for hierarchical data and comparisons within the same table.
```sql
SELECT
    e.name AS employee,
    m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.employee_id;
```

### Multiple joins
Chain joins to bring in data from several tables.
```sql
SELECT
    o.order_id,
    c.name AS customer,
    p.product_name,
    oi.quantity
FROM orders o
INNER JOIN customers c   ON o.customer_id  = c.customer_id
INNER JOIN order_items oi ON o.order_id     = oi.order_id
INNER JOIN products p    ON oi.product_id  = p.product_id;
```

---

## Subqueries

### Subquery (WHERE)
Use a query result as a filter condition.
```sql
SELECT name, salary
FROM employees
WHERE salary > (
    SELECT AVG(salary) FROM employees
);
```

### Subquery (FROM)
Use a query result as a derived table. Must be aliased.
```sql
SELECT department, avg_salary
FROM (
    SELECT department, AVG(salary) AS avg_salary
    FROM employees
    GROUP BY department
) dept_averages
WHERE avg_salary > 70000;
```

### Correlated subquery
A subquery that references the outer query. Executes once per row of the outer query.
```sql
SELECT e.name, e.salary, e.department
FROM employees e
WHERE e.salary = (
    SELECT MAX(salary)
    FROM employees
    WHERE department = e.department
);
-- Returns the highest earner in each department
```

### Scalar subquery
A subquery that returns exactly one value. Can be used in SELECT.
```sql
SELECT
    name,
    salary,
    (SELECT AVG(salary) FROM employees) AS company_avg
FROM employees;
```

---

## CTEs

### WITH (CTE)
Define a named temporary result set that can be referenced in the main query. Improves readability over nested subqueries.
```sql
WITH monthly_sales AS (
    SELECT
        DATE_TRUNC('month', order_date) AS month,
        SUM(total_amount) AS revenue
    FROM orders
    GROUP BY DATE_TRUNC('month', order_date)
)
SELECT month, revenue
FROM monthly_sales
ORDER BY month DESC;
```

### Multiple CTEs
Chain multiple CTEs in one statement, separated by commas.
```sql
WITH
    active_customers AS (
        SELECT customer_id
        FROM customers
        WHERE status = 'active'
    ),
    recent_orders AS (
        SELECT customer_id, COUNT(*) AS order_count
        FROM orders
        WHERE order_date >= CURRENT_DATE - INTERVAL '90 days'
        GROUP BY customer_id
    )
SELECT
    ac.customer_id,
    COALESCE(ro.order_count, 0) AS orders_last_90_days
FROM active_customers ac
LEFT JOIN recent_orders ro ON ac.customer_id = ro.customer_id;
```

### Recursive CTE
A CTE that references itself. Used for hierarchical data — org charts, folder structures, bill of materials.
```sql
WITH RECURSIVE org_chart AS (
    -- Anchor: start with the CEO (no manager)
    SELECT employee_id, name, manager_id, 1 AS level
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    -- Recursive: find direct reports of each row already in the CTE
    SELECT e.employee_id, e.name, e.manager_id, oc.level + 1
    FROM employees e
    INNER JOIN org_chart oc ON e.manager_id = oc.employee_id
)
SELECT * FROM org_chart
ORDER BY level, name;
```

---

## Window Functions

Window functions perform calculations across a related set of rows without collapsing them. They use the `OVER` clause.

### ROW_NUMBER
Assign a unique sequential integer to each row within a partition.
```sql
SELECT
    order_id,
    customer_id,
    order_date,
    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC) AS order_rank
FROM orders;
-- Row 1 = most recent order per customer
```

### RANK
Assign a rank with gaps for ties. Two rows tied for rank 1 both get rank 1; the next row gets rank 3.
```sql
SELECT
    product_name,
    sales_total,
    RANK() OVER (ORDER BY sales_total DESC) AS sales_rank
FROM product_sales;
```

### DENSE_RANK
Assign a rank without gaps for ties. Two rows tied for rank 1 both get rank 1; the next row gets rank 2.
```sql
SELECT
    product_name,
    sales_total,
    DENSE_RANK() OVER (ORDER BY sales_total DESC) AS sales_rank
FROM product_sales;
```

### PARTITION BY
Divide rows into groups (partitions) before the window function is applied. Each partition is calculated independently.
```sql
SELECT
    department,
    name,
    salary,
    AVG(salary) OVER (PARTITION BY department) AS dept_avg_salary
FROM employees;
```

### SUM (running total)
Accumulate a running total using `ROWS UNBOUNDED PRECEDING`.
```sql
SELECT
    order_date,
    daily_revenue,
    SUM(daily_revenue) OVER (
        ORDER BY order_date
        ROWS UNBOUNDED PRECEDING
    ) AS running_total
FROM daily_sales;
```

### LAG
Access the value from a previous row within the partition.
```sql
SELECT
    month,
    revenue,
    LAG(revenue, 1) OVER (ORDER BY month) AS prev_month_revenue,
    revenue - LAG(revenue, 1) OVER (ORDER BY month) AS month_over_month_change
FROM monthly_sales;
```

### LEAD
Access the value from a following row within the partition.
```sql
SELECT
    month,
    revenue,
    LEAD(revenue, 1) OVER (ORDER BY month) AS next_month_revenue
FROM monthly_sales;
```

### FIRST_VALUE
Return the first value in the window frame.
```sql
SELECT
    department,
    name,
    salary,
    FIRST_VALUE(name) OVER (
        PARTITION BY department
        ORDER BY salary DESC
    ) AS top_earner
FROM employees;
```

### LAST_VALUE
Return the last value in the window frame. Requires explicit frame definition to work as expected.
```sql
SELECT
    department,
    name,
    salary,
    LAST_VALUE(name) OVER (
        PARTITION BY department
        ORDER BY salary DESC
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS lowest_earner
FROM employees;
```

### NTILE
Divide rows into N equal buckets and assign a bucket number to each row.
```sql
SELECT
    name,
    salary,
    NTILE(4) OVER (ORDER BY salary DESC) AS salary_quartile
FROM employees;
-- 1 = top 25%, 4 = bottom 25%
```

---

## Set Operations

### UNION
Combine results from two queries and remove duplicates. Column count and types must match.
```sql
SELECT name FROM customers_us
UNION
SELECT name FROM customers_eu;
```

### UNION ALL
Combine results from two queries and keep all duplicates. Faster than UNION — no deduplication step.
```sql
SELECT order_id, total FROM orders_2023
UNION ALL
SELECT order_id, total FROM orders_2024;
```

### INTERSECT
Return only rows that appear in both query results.
```sql
SELECT customer_id FROM orders_2023
INTERSECT
SELECT customer_id FROM orders_2024;
-- Customers who ordered in both years
```

### EXCEPT
Return rows from the first query that do not appear in the second. `MINUS` in Oracle.
```sql
SELECT customer_id FROM customers
EXCEPT
SELECT customer_id FROM orders;
-- Customers who have never ordered
```

---

## Insert, Update, Delete

### INSERT
Add a single row to a table.
```sql
INSERT INTO customers (first_name, last_name, email)
VALUES ('Alex', 'Mensah', 'alex@fttgsolutions.com');
```

### INSERT multiple
Add several rows in one statement.
```sql
INSERT INTO products (product_name, price, category)
VALUES
    ('Wireless Mouse', 29.99, 'Accessories'),
    ('USB-C Hub', 49.99, 'Accessories'),
    ('Mechanical Keyboard', 89.99, 'Peripherals');
```

### INSERT SELECT
Insert the result of a query into a table.
```sql
INSERT INTO archive_orders (order_id, customer_id, total_amount, order_date)
SELECT order_id, customer_id, total_amount, order_date
FROM orders
WHERE order_date < '2023-01-01';
```

### UPDATE
Modify existing rows. Always use a WHERE clause unless updating every row is intentional.
```sql
UPDATE customers
SET email = 'new@email.com', updated_at = NOW()
WHERE customer_id = 42;
```

### UPDATE multiple cols
Update several columns in one statement.
```sql
UPDATE products
SET
    price = price * 1.05,
    updated_at = NOW(),
    status = 'repriced'
WHERE category = 'Electronics';
```

### DELETE
Remove rows from a table. Always use a WHERE clause.
```sql
DELETE FROM orders
WHERE status = 'cancelled'
  AND order_date < '2023-01-01';
```

### TRUNCATE
Remove all rows from a table instantly. Faster than DELETE with no WHERE. Cannot be rolled back in most databases.
```sql
TRUNCATE TABLE staging_events;
```

---

## Table DDL

### CREATE TABLE
Define a new table with columns and data types.
```sql
CREATE TABLE employees (
    employee_id   INT             PRIMARY KEY,
    first_name    VARCHAR(100)    NOT NULL,
    last_name     VARCHAR(100)    NOT NULL,
    email         VARCHAR(255)    UNIQUE,
    hire_date     DATE,
    salary        DECIMAL(12, 2),
    department_id INT
);
```

### DROP TABLE
Remove a table and all its data permanently.
```sql
DROP TABLE staging_events;
```

### DROP IF EXISTS
Drop a table only if it exists — prevents an error if it does not.
```sql
DROP TABLE IF EXISTS staging_events;
```

### ALTER — add column
Add a new column to an existing table.
```sql
ALTER TABLE employees
ADD COLUMN phone VARCHAR(20);
```

### ALTER — drop column
Remove a column from a table.
```sql
ALTER TABLE employees
DROP COLUMN phone;
```

### ALTER — rename column
Rename an existing column.
```sql
-- PostgreSQL
ALTER TABLE employees
RENAME COLUMN hire_date TO start_date;
```

### RENAME TABLE
Rename an entire table.
```sql
-- PostgreSQL / MySQL
ALTER TABLE old_name RENAME TO new_name;

-- SQL Server
EXEC sp_rename 'old_name', 'new_name';
```

### CREATE INDEX
Create an index to speed up queries on a column. Adds overhead to writes.
```sql
CREATE INDEX idx_orders_customer
ON orders (customer_id);
```

### CREATE UNIQUE INDEX
Create an index that also enforces uniqueness on the column(s).
```sql
CREATE UNIQUE INDEX idx_customers_email
ON customers (email);
```

---

## Constraints

### PRIMARY KEY
Uniquely identifies each row. Cannot be NULL. Each table has at most one.
```sql
CREATE TABLE products (
    product_id INT PRIMARY KEY,
    product_name VARCHAR(200) NOT NULL
);
```

### FOREIGN KEY
Enforces a relationship between two tables. The value must exist in the referenced table.
```sql
CREATE TABLE orders (
    order_id    INT PRIMARY KEY,
    customer_id INT,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);
```

### UNIQUE
Ensures all values in a column are distinct.
```sql
CREATE TABLE users (
    user_id  INT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email    VARCHAR(255) UNIQUE
);
```

### NOT NULL
Prevents a column from accepting NULL values.
```sql
CREATE TABLE employees (
    employee_id INT PRIMARY KEY,
    last_name   VARCHAR(100) NOT NULL,
    first_name  VARCHAR(100) NOT NULL
);
```

### DEFAULT
Set a default value if no value is provided on insert.
```sql
CREATE TABLE orders (
    order_id   INT PRIMARY KEY,
    status     VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP   DEFAULT NOW()
);
```

### CHECK
Enforce a custom condition on column values.
```sql
CREATE TABLE products (
    product_id INT PRIMARY KEY,
    price      DECIMAL(10,2) CHECK (price >= 0),
    stock      INT           CHECK (stock >= 0)
);
```

---

## Conditional & NULL

### CASE WHEN
Evaluate conditions and return a value for the first match. The SQL equivalent of if/else.
```sql
SELECT
    order_id,
    total_amount,
    CASE
        WHEN total_amount >= 1000 THEN 'High Value'
        WHEN total_amount >= 500  THEN 'Mid Value'
        ELSE 'Standard'
    END AS order_tier
FROM orders;
```

### CASE (simple)
Compare a single expression against multiple values.
```sql
SELECT
    product_id,
    CASE status
        WHEN 'A' THEN 'Active'
        WHEN 'D' THEN 'Discontinued'
        WHEN 'P' THEN 'Pending'
        ELSE 'Unknown'
    END AS status_label
FROM products;
```

### COALESCE
Return the first non-NULL value from a list of expressions. Use for default fallback values.
```sql
SELECT
    name,
    COALESCE(phone, mobile, email, 'No contact info') AS contact
FROM customers;
```

### NULLIF
Return NULL if two expressions are equal; otherwise return the first expression. Useful for avoiding division-by-zero.
```sql
SELECT
    sales,
    target,
    sales / NULLIF(target, 0) AS attainment_rate
FROM store_kpis;
-- Returns NULL instead of error when target = 0
```

### IIF / IF
Inline conditional — shorthand for a simple CASE WHEN.
```sql
-- SQL Server
SELECT
    product_name,
    IIF(stock > 0, 'In Stock', 'Out of Stock') AS availability
FROM products;

-- MySQL
SELECT
    product_name,
    IF(stock > 0, 'In Stock', 'Out of Stock') AS availability
FROM products;
```

---

## String Functions

### UPPER / LOWER
Convert text to uppercase or lowercase.
```sql
SELECT UPPER(first_name), LOWER(email)
FROM customers;
```

### LENGTH / LEN
Return the number of characters in a string. `LENGTH` in PostgreSQL/MySQL; `LEN` in SQL Server.
```sql
-- PostgreSQL / MySQL
SELECT product_name, LENGTH(product_name) AS name_length
FROM products;

-- SQL Server
SELECT product_name, LEN(product_name) AS name_length
FROM products;
```

### TRIM
Remove leading and trailing whitespace.
```sql
SELECT TRIM(first_name) AS clean_name
FROM customers;

-- Remove specific characters (PostgreSQL)
SELECT TRIM(BOTH ',' FROM notes)
FROM orders;
```

### SUBSTRING
Extract a portion of a string. `SUBSTR` also works in most databases.
```sql
-- SUBSTRING(string, start, length)
SELECT SUBSTRING(phone, 1, 3) AS area_code
FROM customers;

-- PostgreSQL also supports:
SELECT phone[1:3] AS area_code FROM customers;
```

### CONCAT
Join two or more strings together.
```sql
SELECT CONCAT(first_name, ' ', last_name) AS full_name
FROM employees;

-- SQL Server / PostgreSQL also support the || operator:
SELECT first_name || ' ' || last_name AS full_name
FROM employees;
```

### REPLACE
Substitute all occurrences of a substring with another.
```sql
SELECT REPLACE(phone, '-', '') AS clean_phone
FROM customers;
```

### LIKE pattern
Common patterns for string matching.
```sql
WHERE name LIKE 'A%'      -- starts with A
WHERE name LIKE '%son'    -- ends with son
WHERE name LIKE '%alex%'  -- contains alex
WHERE code LIKE 'SKU_001' -- _ matches exactly one character
```

### POSITION / CHARINDEX
Find the position of a substring within a string.
```sql
-- PostgreSQL / MySQL
SELECT POSITION('@' IN email) AS at_position
FROM customers;

-- SQL Server
SELECT CHARINDEX('@', email) AS at_position
FROM customers;
```

### LEFT / RIGHT
Extract N characters from the left or right of a string.
```sql
SELECT
    LEFT(product_code, 3)  AS category_prefix,
    RIGHT(product_code, 4) AS item_suffix
FROM products;
```

---

## Date Functions

### NOW / GETDATE
Return the current date and time.
```sql
-- PostgreSQL / MySQL
SELECT NOW();

-- SQL Server
SELECT GETDATE();
```

### CURRENT_DATE
Return today's date without the time component.
```sql
SELECT CURRENT_DATE;

-- Filter orders from today
SELECT * FROM orders
WHERE order_date = CURRENT_DATE;
```

### DATE_PART / EXTRACT
Extract a specific component from a date — year, month, day, hour, etc.
```sql
-- PostgreSQL
SELECT
    order_date,
    DATE_PART('year',  order_date) AS order_year,
    DATE_PART('month', order_date) AS order_month,
    DATE_PART('dow',   order_date) AS day_of_week
FROM orders;

-- ANSI standard (works in PostgreSQL, MySQL, Snowflake)
SELECT EXTRACT(MONTH FROM order_date) AS order_month
FROM orders;
```

### DATE_TRUNC
Truncate a date to a specified precision — useful for grouping by month, quarter, or year.
```sql
-- PostgreSQL / Snowflake
SELECT
    DATE_TRUNC('month', order_date) AS month_start,
    SUM(total_amount) AS monthly_revenue
FROM orders
GROUP BY DATE_TRUNC('month', order_date)
ORDER BY month_start;
```

### DATEDIFF
Calculate the difference between two dates.
```sql
-- SQL Server / MySQL
SELECT
    order_id,
    DATEDIFF(day, order_date, shipped_date) AS days_to_ship
FROM orders;

-- PostgreSQL (use subtraction)
SELECT
    order_id,
    shipped_date - order_date AS days_to_ship
FROM orders;
```

### DATE_ADD / INTERVAL
Add or subtract a time interval from a date.
```sql
-- MySQL
SELECT DATE_ADD(order_date, INTERVAL 30 DAY) AS due_date
FROM orders;

-- PostgreSQL / Snowflake
SELECT order_date + INTERVAL '30 days' AS due_date
FROM orders;

-- SQL Server
SELECT DATEADD(day, 30, order_date) AS due_date
FROM orders;
```

### CAST to date
Convert a string or timestamp to a date type.
```sql
SELECT CAST('2024-06-15' AS DATE);

-- SQL Server
SELECT CAST(order_timestamp AS DATE) AS order_date
FROM orders;

-- PostgreSQL
SELECT order_timestamp::DATE AS order_date
FROM orders;
```

### FORMAT date
Format a date as a string for display.
```sql
-- SQL Server
SELECT FORMAT(order_date, 'MMM yyyy') AS formatted_date
FROM orders;

-- PostgreSQL
SELECT TO_CHAR(order_date, 'Mon YYYY') AS formatted_date
FROM orders;

-- MySQL
SELECT DATE_FORMAT(order_date, '%b %Y') AS formatted_date
FROM orders;
```

---

## Numeric Functions

### ROUND
Round a number to a specified number of decimal places.
```sql
SELECT
    ROUND(3.14159, 2) AS two_decimals,     -- 3.14
    ROUND(sales / target * 100, 1) AS pct  -- one decimal
FROM store_kpis;
```

### FLOOR / CEILING
Round down to the nearest integer (FLOOR) or up (CEILING / CEIL).
```sql
SELECT
    FLOOR(4.9)   AS floored,   -- 4
    CEILING(4.1) AS ceilinged  -- 5
FROM dual;
```

### ABS
Return the absolute (non-negative) value.
```sql
SELECT ABS(actual - target) AS variance
FROM kpis;
```

### MOD
Return the remainder after division. `%` operator also works in most databases.
```sql
SELECT MOD(17, 5);  -- 2

-- Find even-numbered rows
SELECT * FROM products
WHERE MOD(product_id, 2) = 0;
```

### POWER
Raise a number to a specified power.
```sql
SELECT POWER(2, 10);  -- 1024
```

### SQRT
Return the square root of a number.
```sql
SELECT SQRT(144);  -- 12
```

### CAST numeric
Convert between numeric types or from string to number.
```sql
SELECT
    CAST('42' AS INT)        AS int_val,
    CAST(price AS DECIMAL(10,2)) AS decimal_price
FROM products;
```

---

## Views & Transactions

### CREATE VIEW
Save a query as a named virtual table. Does not store data — executes the query on each access.
```sql
CREATE VIEW active_customers AS
SELECT customer_id, name, email, country
FROM customers
WHERE status = 'active';

-- Query it like a table
SELECT * FROM active_customers WHERE country = 'USA';
```

### DROP VIEW
Remove a view.
```sql
DROP VIEW IF EXISTS active_customers;
```

### BEGIN
Start a transaction — a group of statements that execute as an atomic unit.
```sql
BEGIN;

UPDATE accounts SET balance = balance - 500 WHERE account_id = 1;
UPDATE accounts SET balance = balance + 500 WHERE account_id = 2;

COMMIT;
```

### COMMIT
Permanently save all changes made since BEGIN.
```sql
BEGIN;
DELETE FROM archive_orders WHERE order_date < '2020-01-01';
COMMIT;
```

### ROLLBACK
Undo all changes made since BEGIN. Used when an error occurs.
```sql
BEGIN;

UPDATE accounts SET balance = balance - 500 WHERE account_id = 1;
-- Something goes wrong...
ROLLBACK;
-- The UPDATE is reversed
```

### SAVEPOINT
Create a named checkpoint within a transaction that you can roll back to without undoing the entire transaction.
```sql
BEGIN;

INSERT INTO orders (...) VALUES (...);
SAVEPOINT after_insert;

UPDATE inventory SET stock = stock - 1 WHERE product_id = 42;
-- Something fails...
ROLLBACK TO after_insert;
-- Only the UPDATE is reversed; the INSERT is preserved

COMMIT;
```

---

*Part of the FTTG Learn Cheat Sheet series — [fttgsolutions.com](https://learn.fttgsolutions.com/cheatsheets)*
