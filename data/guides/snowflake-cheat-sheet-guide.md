# Snowflake Cheat Sheet Guide

> Quick reference for Snowflake — from virtual warehouses and data loading to Time Travel, cloning, streams, tasks, and access control.

📋 **Quick reference:** [Snowflake Cheat Sheet](/cheatsheets/snowflake) — use this alongside the guide for fast syntax lookup while you read.

---

## Virtual Warehouses

A virtual warehouse is Snowflake's compute layer — a cluster of servers that executes SQL queries and DML operations. Storage and compute are completely separated in Snowflake. You pay for storage continuously and for compute only when a warehouse is running. Warehouses auto-suspend after inactivity and resume instantly when a query arrives.

**Warehouse sizes:** X-Small → Small → Medium → Large → X-Large → 2X-Large → ... → 6X-Large. Each size up roughly doubles the compute power and credit consumption rate.

### CREATE WAREHOUSE
Create a new virtual warehouse with size, auto-suspend, and auto-resume settings.
```sql
CREATE WAREHOUSE analytics_wh
    WAREHOUSE_SIZE = 'MEDIUM'
    AUTO_SUSPEND   = 300        -- suspend after 300 seconds (5 min) of inactivity
    AUTO_RESUME    = TRUE       -- resume automatically when a query arrives
    INITIALLY_SUSPENDED = TRUE  -- start in suspended state
    COMMENT = 'Warehouse for analytics team queries';
```

### ALTER WAREHOUSE
Modify an existing warehouse — resize, change suspend settings, or rename.
```sql
-- Resize
ALTER WAREHOUSE analytics_wh SET WAREHOUSE_SIZE = 'LARGE';

-- Change auto-suspend timeout
ALTER WAREHOUSE analytics_wh SET AUTO_SUSPEND = 600;

-- Rename
ALTER WAREHOUSE analytics_wh RENAME TO analytics_wh_prod;

-- Enable multi-cluster (Enterprise edition)
ALTER WAREHOUSE analytics_wh SET
    MIN_CLUSTER_COUNT = 1
    MAX_CLUSTER_COUNT = 3
    SCALING_POLICY = 'ECONOMY';
```

### SUSPEND / RESUME
Manually start or stop a warehouse to control costs.
```sql
-- Suspend immediately (stops billing)
ALTER WAREHOUSE analytics_wh SUSPEND;

-- Resume
ALTER WAREHOUSE analytics_wh RESUME;
```

### USE WAREHOUSE
Set the active warehouse for the current session.
```sql
USE WAREHOUSE analytics_wh;

-- Confirm current warehouse
SELECT CURRENT_WAREHOUSE();
```

### SHOW WAREHOUSES
List all warehouses the current role has access to, with their status and size.
```sql
SHOW WAREHOUSES;

-- Filter by name pattern
SHOW WAREHOUSES LIKE 'analytics%';
```

---

## Databases & Schemas

Snowflake organises objects in a three-level hierarchy: **Database → Schema → Table/View/Stage/etc.**

```
Account
└── Database (e.g. FTTG_PROD)
    ├── Schema: RAW
    │   └── Tables, Stages, Streams
    ├── Schema: STAGING
    │   └── Tables, Views
    └── Schema: ANALYTICS
        └── Tables, Views, Materialized Views
```

### CREATE DATABASE
Create a new database. Databases are the top-level containers for all objects.
```sql
CREATE DATABASE fttg_prod;
CREATE DATABASE fttg_dev  CLONE fttg_prod;  -- zero-copy clone

-- With data retention for Time Travel
CREATE DATABASE fttg_prod DATA_RETENTION_TIME_IN_DAYS = 14;
```

### CREATE SCHEMA
Create a schema inside a database to logically group related objects.
```sql
USE DATABASE fttg_prod;

CREATE SCHEMA raw;
CREATE SCHEMA staging;
CREATE SCHEMA analytics;

-- With managed access (centralises privilege grants to schema owner)
CREATE SCHEMA analytics WITH MANAGED ACCESS;
```

### USE DATABASE / SCHEMA
Set the active database and schema for the current session.
```sql
USE DATABASE fttg_prod;
USE SCHEMA analytics;

-- Shorthand — database.schema
USE fttg_prod.analytics;

-- Confirm current context
SELECT CURRENT_DATABASE(), CURRENT_SCHEMA();
```

### SHOW DATABASES
List all databases the current role has access to.
```sql
SHOW DATABASES;

-- Show schemas in current database
SHOW SCHEMAS;

-- Show tables in current schema
SHOW TABLES;
```

---

## Querying

### Basic SELECT
Standard SQL SELECT — Snowflake supports full ANSI SQL.
```sql
SELECT
    c.customer_name,
    o.order_date,
    o.total_amount
FROM fttg_prod.analytics.fact_orders o
JOIN fttg_prod.analytics.dim_customer c
    ON o.customer_key = c.customer_key
WHERE o.order_date >= '2024-01-01'
  AND o.total_amount > 500
ORDER BY o.total_amount DESC
LIMIT 100;
```

### QUALIFY
Filter window function results — like WHERE but applied after window functions are computed. Unique to Snowflake (and a few other modern warehouses).
```sql
-- Return only the most recent order per customer
SELECT
    customer_id,
    order_id,
    order_date,
    total_amount,
    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC) AS rn
FROM fact_orders
QUALIFY rn = 1;

-- Top 3 products by sales per region
SELECT
    region,
    product_name,
    SUM(amount) AS total_sales,
    RANK() OVER (PARTITION BY region ORDER BY SUM(amount) DESC) AS sales_rank
FROM fact_sales
GROUP BY region, product_name
QUALIFY sales_rank <= 3;
```

### SAMPLE
Return a random sample of rows — useful for quick data exploration on large tables.
```sql
-- Row-based sampling: approximately 1000 rows
SELECT * FROM fact_orders SAMPLE (1000 ROWS);

-- Percentage-based sampling: approximately 10% of rows
SELECT * FROM fact_orders SAMPLE (10);

-- Bernoulli sampling (row-level, more random but slower)
SELECT * FROM fact_orders SAMPLE BERNOULLI (5);

-- Block sampling (block-level, faster)
SELECT * FROM fact_orders SAMPLE BLOCK (5);
```

### PIVOT
Rotate rows into columns — turn distinct values in one column into separate column headers.
```sql
-- Turn Region values (North, South, East, West) into columns
SELECT *
FROM (
    SELECT region, sale_month, total_sales
    FROM monthly_sales_summary
)
PIVOT (
    SUM(total_sales)
    FOR region IN ('North', 'South', 'East', 'West')
) AS p;
```

### UNPIVOT
Rotate columns into rows — the reverse of PIVOT. Turns wide format into long format.
```sql
-- Turn Jan, Feb, Mar columns into Month / Amount rows
SELECT product_id, month, amount
FROM monthly_product_sales
UNPIVOT (
    amount FOR month IN (jan, feb, mar, apr, may, jun)
);
```

### Result Cache
Snowflake automatically caches the results of every query for 24 hours. If the same query is run again — by any user on the same account — against unchanged data, Snowflake returns the cached result instantly with zero warehouse compute cost.

```sql
-- First run: executes on the warehouse, result cached
SELECT region, SUM(amount) FROM fact_sales GROUP BY region;

-- Second run within 24 hours: served from cache (0 credits consumed)
SELECT region, SUM(amount) FROM fact_sales GROUP BY region;

-- Check if a query used the result cache
-- In Query History: look for "Query Result Reuse" in the query profile
```

**Result cache is invalidated when:** the underlying table data changes, the query text changes (even whitespace), or 24 hours have elapsed.

---

## Data Loading

### CREATE STAGE
A stage is a named location for data files — either inside Snowflake (internal stage) or pointing to cloud storage (external stage).
```sql
-- Internal stage (files stored inside Snowflake)
CREATE STAGE my_internal_stage
    FILE_FORMAT = (TYPE = 'CSV' FIELD_OPTIONALLY_ENCLOSED_BY = '"' SKIP_HEADER = 1);

-- External stage pointing to Azure Blob Storage
CREATE STAGE azure_raw_stage
    URL = 'azure://fttgstorage.blob.core.windows.net/raw-data/'
    CREDENTIALS = (AZURE_SAS_TOKEN = '<sas_token>')
    FILE_FORMAT = (TYPE = 'PARQUET');

-- External stage pointing to AWS S3
CREATE STAGE s3_raw_stage
    URL = 's3://fttg-data-bucket/raw/'
    CREDENTIALS = (AWS_KEY_ID = '<key>' AWS_SECRET_KEY = '<secret>')
    FILE_FORMAT = (TYPE = 'CSV' SKIP_HEADER = 1);

-- List files in a stage
LIST @my_internal_stage;
```

### PUT (upload file)
Upload a local file to an internal Snowflake stage. Only available in SnowSQL (CLI) — not in the Snowsight web UI.
```sql
-- Upload a single file
PUT file:///home/alex/data/sales_2024.csv @my_internal_stage;

-- Upload all CSV files in a directory
PUT file:///home/alex/data/*.csv @my_internal_stage AUTO_COMPRESS = TRUE;

-- Upload to a subfolder in the stage
PUT file:///home/alex/data/sales.csv @my_internal_stage/2024/june/;
```

### COPY INTO (load)
Load data from a stage into a Snowflake table. The primary bulk load command.
```sql
-- Load from internal stage
COPY INTO fact_sales
FROM @my_internal_stage/sales_2024.csv
FILE_FORMAT = (TYPE = 'CSV' SKIP_HEADER = 1 FIELD_OPTIONALLY_ENCLOSED_BY = '"')
ON_ERROR = 'SKIP_FILE';   -- options: CONTINUE, SKIP_FILE, ABORT_STATEMENT

-- Load from external stage with pattern matching
COPY INTO fact_sales
FROM @azure_raw_stage
PATTERN = '.*sales_2024.*\.csv'
FILE_FORMAT = (TYPE = 'CSV' SKIP_HEADER = 1);

-- Load Parquet with column mapping
COPY INTO dim_product (product_id, product_name, category, price)
FROM (
    SELECT
        $1:product_id::INT,
        $1:product_name::VARCHAR,
        $1:category::VARCHAR,
        $1:price::DECIMAL(10,2)
    FROM @s3_raw_stage/products/
)
FILE_FORMAT = (TYPE = 'PARQUET');

-- Dry run — validate without loading
COPY INTO fact_sales
FROM @my_internal_stage
FILE_FORMAT = (TYPE = 'CSV' SKIP_HEADER = 1)
VALIDATION_MODE = 'RETURN_ERRORS';
```

### COPY INTO (unload)
Export data from a Snowflake table to a stage as files.
```sql
-- Unload to internal stage as CSV
COPY INTO @my_internal_stage/export/sales_export_
FROM (SELECT * FROM fact_sales WHERE order_date >= '2024-01-01')
FILE_FORMAT = (TYPE = 'CSV' COMPRESSION = 'NONE')
HEADER = TRUE
SINGLE = FALSE        -- split into multiple files
MAX_FILE_SIZE = 104857600;  -- 100MB per file

-- Unload to S3 as Parquet
COPY INTO @s3_raw_stage/exports/
FROM fact_sales
FILE_FORMAT = (TYPE = 'PARQUET')
OVERWRITE = TRUE;
```

### Snowpipe
Continuous, event-driven data ingestion. Snowpipe monitors a stage and automatically loads new files as they arrive — without a scheduled pipeline or manual COPY INTO command.
```sql
-- Create a pipe that auto-ingests from a stage
CREATE PIPE sales_pipe
    AUTO_INGEST = TRUE   -- triggered by cloud storage event notification
AS
COPY INTO fact_sales
FROM @azure_raw_stage/sales/
FILE_FORMAT = (TYPE = 'CSV' SKIP_HEADER = 1);

-- Check pipe status
SHOW PIPES;
SELECT SYSTEM$PIPE_STATUS('sales_pipe');

-- Pause / resume
ALTER PIPE sales_pipe PAUSE;
ALTER PIPE sales_pipe RESUME;
```

---

## Semi-Structured Data

Snowflake has native support for semi-structured data — JSON, Avro, ORC, Parquet, and XML — stored in a flexible `VARIANT` column.

### VARIANT type
A column that can store any semi-structured value — JSON object, array, string, number, or null.
```sql
CREATE TABLE raw_events (
    event_id    INT,
    event_time  TIMESTAMP,
    payload     VARIANT   -- stores the entire JSON document
);

-- Insert JSON directly
INSERT INTO raw_events
SELECT
    1,
    CURRENT_TIMESTAMP,
    PARSE_JSON('{"user_id": 42, "action": "login", "device": "mobile"}');
```

### Parse JSON
Use `PARSE_JSON()` to convert a text string into a VARIANT value.
```sql
SELECT PARSE_JSON('{"name": "Alex", "score": 98}');

-- Convert a text column containing JSON into VARIANT
UPDATE raw_events
SET payload = PARSE_JSON(payload_text)
WHERE payload IS NULL;
```

### Dot / colon notation
Navigate into VARIANT values using `:` for key access and `.` for nested access.
```sql
-- Colon notation — access top-level key
SELECT payload:user_id     AS user_id
FROM raw_events;

-- Nested access
SELECT payload:address:city    AS city,
       payload:address:country  AS country
FROM raw_events;

-- Cast to a SQL type
SELECT
    payload:user_id::INT        AS user_id,
    payload:action::VARCHAR     AS action,
    payload:score::DECIMAL(5,2) AS score
FROM raw_events;

-- Array index access
SELECT payload:tags[0]::VARCHAR AS first_tag
FROM raw_events;
```

### FLATTEN
Explode a JSON array into individual rows — one row per array element.
```sql
-- Explode the "tags" array — each tag becomes its own row
SELECT
    e.event_id,
    f.value::VARCHAR AS tag
FROM raw_events e,
LATERAL FLATTEN(input => e.payload:tags) f;

-- Flatten a nested array of objects
SELECT
    e.event_id,
    f.value:product_id::INT  AS product_id,
    f.value:quantity::INT    AS quantity
FROM raw_orders e,
LATERAL FLATTEN(input => e.payload:line_items) f;
```

### OBJECT_CONSTRUCT
Build a JSON object from key-value pairs.
```sql
SELECT OBJECT_CONSTRUCT(
    'customer_id', customer_id,
    'name',        customer_name,
    'region',      region
) AS customer_json
FROM dim_customer;

-- With NULL handling
SELECT OBJECT_CONSTRUCT_KEEP_NULL(
    'id',    customer_id,
    'email', email        -- included even if NULL
) AS customer_json
FROM dim_customer;
```

### ARRAY_AGG
Aggregate multiple rows into a JSON array.
```sql
-- Collect all product names for each order into an array
SELECT
    order_id,
    ARRAY_AGG(product_name) AS products
FROM order_line_items
GROUP BY order_id;

-- With ordering
SELECT
    customer_id,
    ARRAY_AGG(order_id) WITHIN GROUP (ORDER BY order_date) AS order_history
FROM fact_orders
GROUP BY customer_id;
```

---

## Time Travel

Snowflake Time Travel lets you query data as it existed at any point in the past — within the retention period. The default retention period is 1 day (Standard edition); up to 90 days on Enterprise.

### Query past data
Access historical versions of a table using `AT` or `BEFORE` clauses.
```sql
-- Query data as it was at a specific timestamp
SELECT * FROM fact_sales
AT (TIMESTAMP => '2024-06-01 08:00:00'::TIMESTAMP);

-- Query data as it was N seconds ago
SELECT * FROM fact_sales
AT (OFFSET => -3600);   -- 1 hour ago

-- Query data as it was at a specific query ID (before that query ran)
SELECT * FROM fact_sales
BEFORE (STATEMENT => '8e5d0ca9-005e-44e4-8d41-...');

-- Query a specific version number
SELECT * FROM fact_sales
AT (VERSION => 42);

-- Restore accidentally deleted rows
INSERT INTO fact_sales
SELECT * FROM fact_sales
AT (TIMESTAMP => '2024-06-14 23:59:00'::TIMESTAMP)
WHERE sale_date = '2024-06-14';
```

### UNDROP
Restore a dropped table, schema, or database within the retention period.
```sql
-- Restore a dropped table
DROP TABLE fact_sales;   -- accidentally dropped
UNDROP TABLE fact_sales; -- restore it

-- Restore a dropped schema
UNDROP SCHEMA analytics;

-- Restore a dropped database
UNDROP DATABASE fttg_prod;
```

### Set retention period
Configure how long Time Travel history is kept. Longer retention uses more storage.
```sql
-- Set retention on a table
ALTER TABLE fact_sales SET DATA_RETENTION_TIME_IN_DAYS = 14;

-- Set retention on a schema (applies to all objects in the schema)
ALTER SCHEMA analytics SET DATA_RETENTION_TIME_IN_DAYS = 30;

-- Set retention on a database
ALTER DATABASE fttg_prod SET DATA_RETENTION_TIME_IN_DAYS = 7;

-- Disable Time Travel for a table (transient tables have 0 or 1 day)
CREATE TRANSIENT TABLE staging_temp (
    id INT,
    data VARIANT
) DATA_RETENTION_TIME_IN_DAYS = 0;
```

---

## Cloning

Zero-copy cloning creates a full copy of a table, schema, or database instantly — without duplicating the underlying storage. The clone shares the same data files as the original until either is modified.

### CLONE table
Create an instant copy of a table. No data is physically copied — shared storage until writes occur.
```sql
-- Clone a table
CREATE TABLE fact_sales_backup CLONE fact_sales;

-- Clone for dev/test — no storage cost until data diverges
CREATE TABLE fact_sales_dev CLONE fact_sales;

-- Verify
SELECT COUNT(*) FROM fact_sales_backup;   -- same row count instantly
```

### CLONE database
Clone an entire database — all schemas and tables — instantly.
```sql
-- Create a dev copy of production
CREATE DATABASE fttg_dev CLONE fttg_prod;

-- Developers work in fttg_dev without affecting fttg_prod
-- Storage cost only accrues for rows that diverge after cloning
```

### Clone at point in time
Combine cloning with Time Travel to clone a table as it existed at a past point.
```sql
-- Clone the table as it was yesterday at midnight
CREATE TABLE fact_sales_snapshot
CLONE fact_sales
AT (TIMESTAMP => DATEADD(day, -1, CURRENT_TIMESTAMP)::TIMESTAMP);

-- Clone before a specific statement ran (useful for undoing a bad DML)
CREATE TABLE fact_sales_pre_load
CLONE fact_sales
BEFORE (STATEMENT => '8e5d0ca9-005e-44e4-8d41-...');
```

---

## Streams & Tasks

### CREATE STREAM
A stream tracks changes (INSERT, UPDATE, DELETE) to a table since the last time the stream was consumed. Used to implement incremental processing and CDC (Change Data Capture) pipelines.
```sql
-- Create a stream on a table
CREATE STREAM sales_stream ON TABLE fact_sales;

-- Stream on a view (append-only streams)
CREATE STREAM events_stream
ON TABLE raw_events
APPEND_ONLY = TRUE;   -- tracks inserts only, not updates/deletes

-- Show streams
SHOW STREAMS;
```

### Query a stream
Read the changes captured by a stream. Each row includes system columns that describe the change type.
```sql
-- View pending changes in the stream
SELECT
    *,
    METADATA$ACTION,        -- INSERT or DELETE
    METADATA$ISUPDATE,      -- TRUE if this row is part of an UPDATE
    METADATA$ROW_ID         -- unique row identifier
FROM sales_stream;

-- Process inserts only
SELECT * FROM sales_stream
WHERE METADATA$ACTION = 'INSERT'
  AND METADATA$ISUPDATE = FALSE;

-- Process updates (appear as DELETE + INSERT pair)
SELECT * FROM sales_stream
WHERE METADATA$ACTION = 'INSERT'
  AND METADATA$ISUPDATE = TRUE;
```

### CREATE TASK
A task schedules a SQL statement or stored procedure to run on a time schedule or when triggered by another task (task tree).
```sql
-- Simple scheduled task
CREATE TASK refresh_gold_summary
    WAREHOUSE = analytics_wh
    SCHEDULE = 'USING CRON 0 2 * * * UTC'   -- daily at 2am UTC
AS
CALL usp_refresh_gold_summary();

-- Task triggered by a stream (runs when stream has data)
CREATE TASK process_sales_stream
    WAREHOUSE = analytics_wh
    SCHEDULE = '5 MINUTE'
    WHEN SYSTEM$STREAM_HAS_DATA('sales_stream')
AS
INSERT INTO fact_sales_processed
SELECT
    sale_id,
    customer_id,
    product_id,
    amount,
    sale_date
FROM sales_stream
WHERE METADATA$ACTION = 'INSERT';

-- Tasks start suspended — must be resumed to activate
ALTER TASK refresh_gold_summary RESUME;
ALTER TASK process_sales_stream RESUME;

-- Suspend a task
ALTER TASK refresh_gold_summary SUSPEND;
```

### EXECUTE TASK
Manually trigger a task to run immediately — useful for testing.
```sql
EXECUTE TASK refresh_gold_summary;

-- Check task run history
SELECT *
FROM TABLE(INFORMATION_SCHEMA.TASK_HISTORY(
    TASK_NAME => 'refresh_gold_summary'
))
ORDER BY SCHEDULED_TIME DESC
LIMIT 20;
```

---

## Access Control

Snowflake uses Role-Based Access Control (RBAC). Users are assigned roles. Privileges are granted to roles. A user gets the union of all privileges from all their active roles.

**Built-in system roles:**
| Role | Purpose |
|---|---|
| ACCOUNTADMIN | Highest privilege — account management, billing |
| SYSADMIN | Create and manage databases, warehouses, schemas |
| SECURITYADMIN | Manage users, roles, and grants |
| USERADMIN | Create and manage users and roles |
| PUBLIC | Default role granted to every user |

### CREATE ROLE
Create a custom role for a team or function.
```sql
CREATE ROLE analytics_reader;
CREATE ROLE data_engineer;
CREATE ROLE bi_developer;

-- Create a role hierarchy (data_engineer inherits analytics_reader privileges)
GRANT ROLE analytics_reader TO ROLE data_engineer;
```

### GRANT privilege
Assign privileges on objects to a role.
```sql
-- Grant warehouse usage
GRANT USAGE ON WAREHOUSE analytics_wh TO ROLE analytics_reader;

-- Grant database and schema access
GRANT USAGE ON DATABASE fttg_prod           TO ROLE analytics_reader;
GRANT USAGE ON SCHEMA   fttg_prod.analytics  TO ROLE analytics_reader;

-- Grant table-level privileges
GRANT SELECT ON ALL TABLES IN SCHEMA fttg_prod.analytics TO ROLE analytics_reader;
GRANT SELECT ON FUTURE TABLES IN SCHEMA fttg_prod.analytics TO ROLE analytics_reader;

-- Grant full table access to data engineers
GRANT SELECT, INSERT, UPDATE, DELETE
    ON ALL TABLES IN SCHEMA fttg_prod.staging
    TO ROLE data_engineer;

-- Grant role to a user
GRANT ROLE analytics_reader TO USER alex_mensah;
GRANT ROLE data_engineer    TO USER pipeline_svc_account;
```

### REVOKE
Remove a privilege or role assignment.
```sql
-- Revoke table access
REVOKE SELECT ON TABLE fact_sales FROM ROLE analytics_reader;

-- Revoke role from user
REVOKE ROLE data_engineer FROM USER alex_mensah;

-- Revoke all privileges on a schema
REVOKE ALL PRIVILEGES ON SCHEMA fttg_prod.staging FROM ROLE data_engineer;
```

### USE ROLE
Switch the active role for the current session.
```sql
USE ROLE analytics_reader;
USE ROLE sysadmin;

-- Confirm current role
SELECT CURRENT_ROLE();
```

### Row-level security
Implement row-level security using Snowflake **Row Access Policies** — filter rows based on the querying user's role or attributes.
```sql
-- Create a row access policy
CREATE ROW ACCESS POLICY region_access_policy
AS (region VARCHAR) RETURNS BOOLEAN ->
    CASE
        WHEN CURRENT_ROLE() IN ('SYSADMIN', 'ACCOUNTADMIN') THEN TRUE
        WHEN CURRENT_ROLE() = 'ANALYST_NORTH' AND region = 'North' THEN TRUE
        WHEN CURRENT_ROLE() = 'ANALYST_SOUTH' AND region = 'South' THEN TRUE
        ELSE FALSE
    END;

-- Apply the policy to a table column
ALTER TABLE fact_sales
ADD ROW ACCESS POLICY region_access_policy ON (region);

-- Remove the policy
ALTER TABLE fact_sales
DROP ROW ACCESS POLICY region_access_policy;
```

---

## Performance & Optimisation

### Clustering keys
By default Snowflake sorts data in micro-partitions by insertion order. Defining a clustering key re-orders data by a frequently filtered column — reducing the number of micro-partitions scanned per query.
```sql
-- Define a clustering key on a large table
ALTER TABLE fact_sales CLUSTER BY (sale_date, region);

-- Check clustering depth (lower = better clustered)
SELECT SYSTEM$CLUSTERING_INFORMATION('fact_sales', '(sale_date, region)');

-- Manually trigger re-clustering (usually automatic on Enterprise)
ALTER TABLE fact_sales RECLUSTER;

-- Drop a clustering key
ALTER TABLE fact_sales DROP CLUSTERING KEY;
```

**When to use clustering keys:**
- Table has billions of rows
- Queries almost always filter on the same 1–2 columns
- Without a clustering key, queries scan too many micro-partitions

**When NOT to use:** small or medium tables, tables queried with many different filter patterns.

### EXPLAIN
Generate the query execution plan without running the query. Shows estimated cost, join order, and operations.
```sql
EXPLAIN
SELECT
    c.region,
    SUM(f.amount) AS total_sales
FROM fact_sales f
JOIN dim_customer c ON f.customer_key = c.customer_key
WHERE f.sale_date >= '2024-01-01'
GROUP BY c.region;

-- Tabular output
EXPLAIN USING TABULAR
SELECT ...;
```

### Query Profile
The graphical execution plan in Snowsight — shows actual runtime statistics for a completed query: which nodes were slow, how many partitions were scanned vs pruned, and where time was spent.

**Access:** Snowsight → Query History → click any query → **Query Profile** tab

**Key metrics to inspect:**
- **Partitions scanned vs total** — a high ratio means the query is scanning most of the table (consider clustering)
- **Bytes spilled to local/remote storage** — means the warehouse ran out of memory; scale up the warehouse
- **Compilation time** — high compilation time on complex queries; simplify or break into CTEs
- **Most expensive nodes** — the largest boxes in the profile diagram show where time is being spent

### Materialized view
A precomputed result set stored as a physical table — automatically maintained by Snowflake when the base table changes. Faster than a regular view for expensive aggregation queries that run frequently.
```sql
-- Create a materialized view
CREATE MATERIALIZED VIEW mv_daily_region_sales AS
SELECT
    sale_date,
    region,
    SUM(amount)  AS total_sales,
    COUNT(*)     AS order_count,
    AVG(amount)  AS avg_order_value
FROM fact_sales
GROUP BY sale_date, region;

-- Query it like a regular view
SELECT * FROM mv_daily_region_sales
WHERE sale_date >= '2024-01-01'
ORDER BY sale_date DESC;

-- Refresh manually if needed
ALTER MATERIALIZED VIEW mv_daily_region_sales REFRESH;

-- Drop
DROP MATERIALIZED VIEW mv_daily_region_sales;
```

**Limitations:** Materialized views cannot contain joins, certain window functions, or non-deterministic functions. Available on Enterprise edition.

### Search optimisation
Adds a persistent search access path for point lookup queries — fast equality searches on high-cardinality columns without a clustering key.
```sql
-- Enable search optimisation on a table
ALTER TABLE fact_sales ADD SEARCH OPTIMIZATION;

-- Add search optimisation for specific columns only (more efficient)
ALTER TABLE fact_sales
ADD SEARCH OPTIMIZATION ON EQUALITY(customer_id, transaction_id);

-- Check search optimisation status
SHOW TABLES LIKE 'fact_sales';

-- Remove search optimisation
ALTER TABLE fact_sales DROP SEARCH OPTIMIZATION;
```

**When to use:** tables where users frequently look up individual records by ID or unique key — customer lookups, transaction lookups, audit queries. Not for range queries or aggregations.

---

*Part of the FTTG Learn Cheat Sheet series — [fttgsolutions.com](https://learn.fttgsolutions.com/cheatsheets)*
