# Data Warehouse Cheat Sheet Guide

> Quick reference for data warehouse concepts — OLTP vs OLAP, dimensional modeling, star and snowflake schemas, data marts, SCD types, ETL/ELT patterns, OLAP operations, partitioning, data quality, and governance.

📋 **Quick reference:** [Data Warehouse Cheat Sheet](/cheatsheets/data-warehouse) — use this alongside the guide for fast syntax lookup while you read.

---

## Core Concepts

A data warehouse is a centralised repository optimised for analytical queries — not for day-to-day transactions. Understanding the difference between OLTP and OLAP systems, and the building blocks of dimensional models, is the foundation everything else rests on.

### OLTP vs OLAP

**OLTP (Online Transaction Processing)** systems power day-to-day operations: point-of-sale, order entry, customer records. They are highly normalised (3rd Normal Form) to minimise write duplication, and optimised for fast, concurrent short transactions.

**OLAP (Online Analytical Processing)** systems power reporting and analysis. They are intentionally denormalised to reduce joins, and optimised for reading and aggregating large volumes of data. A data warehouse is an OLAP system.

| | OLTP | OLAP |
|---|---|---|
| **Purpose** | Run operations | Support decisions |
| **Schema** | Normalised (3NF) | Denormalised (star/snowflake) |
| **Query pattern** | Many short reads/writes | Few large aggregations |
| **Data size** | Gigabytes | Terabytes to petabytes |
| **Latency** | Milliseconds | Seconds to minutes |
| **Users** | Thousands (concurrent) | Dozens to hundreds |
| **Examples** | MySQL, PostgreSQL (transactional) | Snowflake, BigQuery, Redshift |

```sql
-- OLTP: point lookup for a single order
SELECT * FROM orders WHERE order_id = 12345;

-- OLAP: aggregate millions of rows for a regional report
SELECT region, SUM(revenue) AS total_revenue
FROM fact_sales
WHERE sale_date >= '2024-01-01'
GROUP BY region
ORDER BY total_revenue DESC;
```

### Data Mart

A data mart is a focused, subject-specific subset of the enterprise data warehouse. Instead of exposing the full DW to every team, marts provide a curated, pre-filtered view of data relevant to a particular business function.

```
Enterprise Data Warehouse
├── Sales data mart       → sales & revenue team
├── Finance data mart     → finance & accounting team
├── Marketing data mart   → campaign analytics team
└── HR data mart          → workforce planning team
```

**Dependent vs independent data marts:**

- **Dependent mart** — sourced and derived from the central enterprise DW. Consistent, governed, preferred.
- **Independent mart** — sourced directly from operational systems, bypassing the DW. Creates data silos and inconsistency across teams. Avoid unless there is no central DW.

```sql
-- Dependent mart: filtered view from the central DW
CREATE TABLE finance_mart.fact_gl_transactions AS
SELECT *
FROM enterprise_dw.fact_transactions
WHERE source_system = 'ERP';
```

### Fact Table

The fact table is the central table in a dimensional model. It stores measurable, quantitative business events — sales, page views, transactions, inventory movements. Each row represents one event at the declared grain.

Fact tables are **tall and narrow**: many rows, relatively few columns. Most columns are foreign keys pointing to dimension tables; the remaining columns are the measures.

```sql
CREATE TABLE fact_sales (
  sales_key     BIGINT PRIMARY KEY,       -- surrogate key
  date_key      INT REFERENCES dim_date(date_key),
  product_key   INT REFERENCES dim_product(product_key),
  customer_key  INT REFERENCES dim_customer(customer_key),
  store_key     INT REFERENCES dim_store(store_key),
  quantity      INT,
  unit_price    DECIMAL(10,2),
  total_amount  DECIMAL(12,2)             -- additive measure
);
```

### Dimension Table

Dimension tables store the descriptive context for facts — the *who*, *what*, *where*, and *when* that allow you to filter, group, and label your measures. They are **wide** (many descriptive columns) but relatively small in row count.

```sql
CREATE TABLE dim_product (
  product_key    INT PRIMARY KEY,   -- surrogate key (DW-generated)
  product_id     VARCHAR(20),       -- natural key (from source system)
  product_name   VARCHAR(200),
  category       VARCHAR(100),
  subcategory    VARCHAR(100),
  brand          VARCHAR(100),
  unit_cost      DECIMAL(10,2),
  is_active      BOOLEAN,
  effective_date DATE,
  expiry_date    DATE
);
```

### Grain

The grain is a precise declaration of what one row in a fact table represents. It must be defined before designing any table — ambiguous grain is the most common cause of double-counting errors in a data warehouse.

```sql
-- BAD: what does one row represent? One order? One line item?
CREATE TABLE fact_sales (order_id INT, ...);

-- GOOD: grain is explicit — one row per order line item
-- Grain: one row per unique combination of (order_id, line_number)
CREATE TABLE fact_order_lines (
  order_line_key BIGINT PRIMARY KEY,
  order_id       INT,
  line_number    INT,
  product_key    INT,
  quantity       INT,
  line_total     DECIMAL(12,2)
);
```

**Rule:** only facts that are true at the declared grain belong in a fact table. If you have measures at different granularities, create separate fact tables.

### Surrogate Key

A surrogate key is a system-generated integer used as the primary key in a dimension table. It is completely separate from the business key (the ID in the source system).

```sql
-- SQL Server / PostgreSQL
product_key INT IDENTITY(1,1) PRIMARY KEY

-- MySQL
product_key INT AUTO_INCREMENT PRIMARY KEY

-- Snowflake / BigQuery
product_key INT GENERATED ALWAYS AS IDENTITY
```

**Why surrogate keys matter:**
- Source system keys can change (mergers, migrations, re-numbering)
- Surrogate keys are stable — fact table foreign keys never need updating
- Enable SCD Type 2 — multiple dimension rows can share the same business key with different surrogate keys

### Measure Types

Not all numeric columns can be summed freely. Getting this wrong silently produces incorrect totals.

| Type | Rule | Examples | Safe aggregation |
|---|---|---|---|
| **Additive** | Sum across all dimensions | Revenue, quantity, cost | SUM |
| **Semi-additive** | Sum across some dimensions only | Account balance, inventory count | SUM by account; AVG across dates |
| **Non-additive** | Never sum | Unit price, ratio, percentage | AVG, MIN, MAX — or recalculate |

```sql
-- Additive: sum freely across any combination of dimensions
SELECT region, year, SUM(sales_amount) FROM fact_sales GROUP BY region, year;

-- Semi-additive: inventory can be summed by product, NOT across dates
-- WRONG: gives inflated total
SELECT SUM(inventory_count) FROM fact_inventory;

-- CORRECT: snapshot at a single point in time
SELECT product_key, SUM(inventory_count)
FROM fact_inventory
WHERE snapshot_date = '2024-06-30'
GROUP BY product_key;

-- Non-additive: recalculate from components
SELECT SUM(revenue) / NULLIF(SUM(units_sold), 0) AS avg_unit_price
FROM fact_sales;
```

---

## Schema Patterns

The schema pattern defines how fact and dimension tables are arranged and related. The choice affects query complexity, storage, and tooling compatibility.

### Star Schema

The most common dimensional schema. One fact table sits at the centre surrounded by flat, denormalised dimension tables. Joins are always two hops: fact → dimension. BI tools like Power BI and Tableau are designed around the star schema.

```
          dim_date
              │
dim_store ── fact_sales ── dim_product
              │
          dim_customer
```

```sql
SELECT
    d.year,
    d.quarter,
    p.category,
    s.region,
    SUM(f.total_amount) AS revenue
FROM fact_sales f
JOIN dim_date d     ON f.date_key = d.date_key
JOIN dim_product p  ON f.product_key = p.product_key
JOIN dim_store s    ON f.store_key = s.store_key
GROUP BY d.year, d.quarter, p.category, s.region;
```

**Pros:** simple joins, fast queries, easy for BI tools to auto-detect relationships.
**Cons:** dimension data is denormalised — repeated values consume more storage.

### Snowflake Schema

A normalised star schema. Dimension tables are further broken into sub-dimension tables to eliminate redundancy. A product dimension might link to a separate category and subcategory table.

```
dim_date ────────────────────────────┐
dim_product → dim_category           ├── fact_sales
dim_customer → dim_city → dim_country│
dim_store ───────────────────────────┘
```

```sql
-- Requires more joins to reach leaf-level attributes
SELECT
    cat.category_name,
    cty.country_name,
    SUM(f.total_amount) AS revenue
FROM fact_sales f
JOIN dim_product p   ON f.product_key = p.product_key
JOIN dim_category cat ON p.category_key = cat.category_key   -- extra hop
JOIN dim_customer cu ON f.customer_key = cu.customer_key
JOIN dim_city ci     ON cu.city_key = ci.city_key            -- extra hop
JOIN dim_country cty ON ci.country_key = cty.country_key     -- extra hop
GROUP BY cat.category_name, cty.country_name;
```

**Pros:** less storage, consistent attribute updates (change category name in one place).
**Cons:** more joins, harder for BI tools, slower queries.

### Galaxy Schema

Two or more fact tables share conformed dimension tables — enabling cross-process analysis. Also called a fact constellation schema.

```
dim_date ──┬── fact_sales
            └── fact_inventory
dim_product─┬── fact_sales
             └── fact_inventory
```

A **conformed dimension** is one that has the same definition and keys across every fact table that uses it. `dim_date` and `dim_product` must have the same `date_key` and `product_key` values in both fact tables for cross-fact queries to produce correct results.

```sql
-- Cross-fact analysis: compare sales vs inventory by product and date
SELECT
    p.product_name,
    d.full_date,
    SUM(s.total_amount) AS daily_sales,
    SUM(i.inventory_count) AS end_of_day_stock
FROM dim_date d
JOIN dim_product p     ON TRUE
LEFT JOIN fact_sales s
    ON s.date_key = d.date_key AND s.product_key = p.product_key
LEFT JOIN fact_inventory i
    ON i.date_key = d.date_key AND i.product_key = p.product_key
WHERE d.full_date = '2024-06-30'
GROUP BY p.product_name, d.full_date;
```

### Data Vault

A modeling methodology designed for agility and auditability, built on three object types:

- **Hub** — stores the business key and its metadata. One hub per business concept.
- **Link** — stores relationships between hubs. A link represents a business transaction or association.
- **Satellite** — stores descriptive attributes and their full history, attached to a hub or link.

```sql
-- Hub: business key + load metadata
CREATE TABLE hub_customer (
  customer_hk   CHAR(32) PRIMARY KEY,  -- MD5/SHA hash of business key
  customer_bk   VARCHAR(50),           -- business key from source
  load_date     TIMESTAMP,
  record_source VARCHAR(100)           -- 'CRM', 'ERP', etc.
);

-- Link: relationship between customer and order hubs
CREATE TABLE link_order_customer (
  order_customer_hk CHAR(32) PRIMARY KEY,
  order_hk          CHAR(32),
  customer_hk       CHAR(32),
  load_date         TIMESTAMP,
  record_source     VARCHAR(100)
);

-- Satellite: time-versioned descriptive attributes
CREATE TABLE sat_customer_profile (
  customer_hk   CHAR(32),
  load_date     TIMESTAMP,
  load_end_date TIMESTAMP,
  customer_name VARCHAR(200),
  email         VARCHAR(200),
  city          VARCHAR(100),
  PRIMARY KEY (customer_hk, load_date)
);
```

**When to use Data Vault:** large enterprises, many source systems, regulatory audit requirements, or when the source schema changes frequently. More complex to build and query than star schema — typically requires a downstream star schema presentation layer for BI tools.

### One Big Table (OBT)

Pre-join all dimension attributes into a single wide, denormalised table. Eliminates joins at query time entirely.

```sql
CREATE TABLE obt_sales AS
SELECT
  f.total_amount,
  f.quantity,
  d.full_date,
  d.year,
  d.quarter,
  d.month_name,
  p.product_name,
  p.category,
  p.brand,
  c.customer_name,
  c.country,
  c.customer_segment,
  s.store_name,
  s.region
FROM fact_sales f
JOIN dim_date d     ON f.date_key = d.date_key
JOIN dim_product p  ON f.product_key = p.product_key
JOIN dim_customer c ON f.customer_key = c.customer_key
JOIN dim_store s    ON f.store_key = s.store_key;
```

**When to use:** modern cloud DWs (BigQuery, Databricks) with columnar storage make wide tables efficient. Suitable for self-serve analytics where users should not need to know how to join. Trade-off: attribute updates require rebuilding the table; SCD Type 2 history becomes complex.

---

## Slowly Changing Dimensions (SCD)

SCD patterns define how a dimension table handles changes to attribute values over time. Choosing the right type depends on whether historical reporting matters and how much history you need to keep.

| Type | Strategy | History kept | Complexity |
|---|---|---|---|
| **0** | Never update | None | Trivial |
| **1** | Overwrite | None | Low |
| **2** | Add new row | Full | Medium |
| **3** | Add prior column | One version | Low |
| **4** | History table | Full (separate) | Medium |
| **6** | Hybrid (1+2+3) | Full + current | High |

### SCD Type 0 — Fixed

The attribute never changes after initial load. Used for inherently immutable data.

```sql
-- Set once at load time, never updated
-- Examples: date of birth, original signup date, country of incorporation
INSERT INTO dim_customer (customer_key, customer_bk, date_of_birth, signup_date)
VALUES (1001, 'CUST-001', '1990-03-15', '2018-06-01');

-- No UPDATE statement ever runs against these columns
```

### SCD Type 1 — Overwrite

Overwrite the old value with the new one. No history is retained. Use when corrections are being made, or when historical accuracy by attribute is not required.

```sql
-- A customer moves to a new city — overwrite, don't track history
UPDATE dim_customer
SET
  city         = 'Austin',
  state        = 'TX',
  updated_at   = CURRENT_TIMESTAMP
WHERE customer_bk = 'CUST-001';
```

**Caution:** any historical fact rows that joined to this customer will now show the new city as if the customer always lived there. Only use Type 1 when this is acceptable.

### SCD Type 2 — History Row

The most common SCD type. A new row is inserted for each change, preserving the complete history. Three columns are required: `effective_date`, `expiry_date`, and `is_current`.

```sql
-- Step 1: expire the current active row
UPDATE dim_customer
SET
  expiry_date = CURRENT_DATE - INTERVAL '1 day',
  is_current  = FALSE
WHERE customer_bk = 'CUST-001'
  AND is_current = TRUE;

-- Step 2: insert the new version
INSERT INTO dim_customer
  (customer_bk, name, city, effective_date, expiry_date, is_current)
VALUES
  ('CUST-001', 'Alice Johnson', 'Dallas', CURRENT_DATE, '9999-12-31', TRUE);
```

Facts join to the dimension row that was current *at the time of the event*:

```sql
-- Fact rows correctly report the city the customer lived in at time of sale
SELECT
  f.sale_date,
  c.city AS city_at_time_of_sale,
  SUM(f.total_amount) AS revenue
FROM fact_sales f
JOIN dim_customer c
  ON f.customer_key = c.customer_key
 AND f.sale_date BETWEEN c.effective_date AND c.expiry_date
GROUP BY f.sale_date, c.city;
```

### SCD Type 3 — Prior Column

Add extra columns to hold the previous value of a tracked attribute. Only one level of history is kept — current and one prior value.

```sql
CREATE TABLE dim_customer (
  customer_key      INT PRIMARY KEY,
  customer_bk       VARCHAR(50),
  current_city      VARCHAR(100),
  previous_city     VARCHAR(100),
  city_changed_date DATE
);

-- On change: shift current → previous, store new current
UPDATE dim_customer
SET
  previous_city     = current_city,
  current_city      = 'Houston',
  city_changed_date = CURRENT_DATE
WHERE customer_bk = 'CUST-001';
```

**Best for:** comparing current state vs. one prior state — for example, reporting on customers who changed region and how their spending shifted.

### SCD Type 4 — History Table

Keep the current dimension table lean (latest values only) and offload all change history to a separate archive table.

```sql
-- Current table: always reflects the latest state
CREATE TABLE dim_customer (
  customer_key INT PRIMARY KEY,
  customer_bk  VARCHAR(50),
  name         VARCHAR(200),
  city         VARCHAR(100),
  updated_at   TIMESTAMP
);

-- History table: every version of every row
CREATE TABLE dim_customer_history (
  history_key  INT PRIMARY KEY,
  customer_bk  VARCHAR(50),
  name         VARCHAR(200),
  city         VARCHAR(100),
  valid_from   TIMESTAMP,
  valid_to     TIMESTAMP
);

-- On change: archive old state, update current table
INSERT INTO dim_customer_history
  SELECT customer_bk, name, city, updated_at, CURRENT_TIMESTAMP
  FROM dim_customer WHERE customer_bk = 'CUST-001';

UPDATE dim_customer
SET city = 'Phoenix', updated_at = CURRENT_TIMESTAMP
WHERE customer_bk = 'CUST-001';
```

**Best for:** when the vast majority of queries only need current data, but auditors occasionally need to see the full history.

### SCD Type 6 — Hybrid

Combines Type 1 (current value always up to date), Type 2 (full history via new rows), and Type 3 (original value preserved on every row). Each row shows the historical attribute at the time of the event *and* the customer's current attribute.

```sql
CREATE TABLE dim_customer (
  customer_key    INT PRIMARY KEY,
  customer_bk     VARCHAR(50),
  -- Type 2 versioning columns
  effective_date  DATE,
  expiry_date     DATE,
  is_current      BOOLEAN,
  -- Type 3: value at creation of this version
  original_city   VARCHAR(100),
  -- Type 1: always updated to the latest value on every row
  current_city    VARCHAR(100)
);

-- When Alice moves from Austin to Dallas:
-- 1. Expire the old row (Type 2 step)
-- 2. Insert new row with original_city = 'Austin', current_city = 'Dallas'
-- 3. Update ALL prior rows to set current_city = 'Dallas' (Type 1 step)
```

This lets you answer both:
- "What city was the customer in when they made this purchase?" → `original_city` on the dimension row linked by the fact
- "What city is that customer in today?" → `current_city` on the same row

---

## ETL vs ELT

The order in which you extract, transform, and load data determines where processing happens, who controls transformation logic, and how agile your pipeline is.

### ETL Pattern

**Extract → Transform → Load.** Data is cleaned and reshaped *before* it enters the warehouse. Transformation happens on a dedicated ETL server or cluster outside the DW.

```
[Source Systems]
      │  Extract (JDBC, API, file export)
      ▼
[ETL Server / Tool]
      │  Transform (filter, join, aggregate, clean)
      ▼
[Data Warehouse]
      │  Load (bulk insert into final tables)
      ▼
[Reports / BI Tools]
```

**Common tools:** SSIS, Talend, Informatica, Apache Spark.
**Best for:** on-premise DWs where warehouse compute is expensive, or when transformations require logic that cannot be expressed in SQL.

### ELT Pattern

**Extract → Load → Transform.** Raw data lands in the warehouse first; transformations are written in SQL and run *inside* the warehouse using its own compute.

```
[Source Systems]
      │  Extract (raw data, minimal changes)
      ▼
[Data Warehouse — Raw / Bronze Layer]
      │  Transform (SQL, dbt, Dataform)
      ▼
[Data Warehouse — Curated / Silver Layer]
      │
      ▼
[Data Warehouse — Presentation / Gold Layer]
      │
      ▼
[Reports / BI Tools]
```

**Common tools:** dbt, Dataform, native SQL scripts.
**Best for:** cloud DWs (Snowflake, BigQuery, Databricks) where compute scales elastically. All transformation logic lives in SQL — version-controlled, testable, and readable by analysts.

### Medallion Architecture

A three-layer ELT architecture popularised by Databricks, widely adopted across cloud DWs.

| Layer | Also called | Purpose |
|---|---|---|
| **Bronze** | Raw | Store data exactly as received from the source — no transformations |
| **Silver** | Staging / Conformed | Clean, deduplicate, validate, join across sources |
| **Gold** | Presentation / Curated | Business-ready aggregates, dimensional models, mart tables |

```sql
-- Bronze: raw landing zone — preserve source data as-is
CREATE TABLE bronze.orders_raw (
  raw_payload VARIANT,                          -- JSON as received
  ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  source_file VARCHAR(500)
);

-- Silver: cleaned and conformed
CREATE TABLE silver.orders (
  order_id    VARCHAR(50) NOT NULL,
  customer_id VARCHAR(50) NOT NULL,
  order_date  DATE        NOT NULL,
  total       DECIMAL(12,2),
  updated_at  TIMESTAMP
);

-- Gold: business-ready aggregate
CREATE TABLE gold.daily_revenue_by_region AS
SELECT
  o.order_date,
  c.region,
  COUNT(DISTINCT o.order_id) AS order_count,
  SUM(o.total)               AS revenue
FROM silver.orders o
JOIN silver.customers c ON o.customer_id = c.customer_id
GROUP BY o.order_date, c.region;
```

### Incremental Load

Load only new or changed records since the last pipeline run — not the full dataset. Essential for large tables where a full reload would take hours.

```sql
-- Pattern 1: watermark on a timestamp column
INSERT INTO silver.orders
SELECT *
FROM bronze.orders_raw
WHERE ingested_at > (
  SELECT COALESCE(MAX(updated_at), '1900-01-01')
  FROM silver.orders
);

-- Pattern 2: MERGE (upsert) — handles both inserts and updates
MERGE INTO silver.orders AS target
USING (
  SELECT order_id, customer_id, order_date, total, ingested_at
  FROM bronze.orders_raw
  WHERE ingested_at > :last_run_watermark
) AS source
  ON target.order_id = source.order_id
WHEN MATCHED AND source.ingested_at > target.updated_at THEN
  UPDATE SET
    target.total      = source.total,
    target.updated_at = source.ingested_at
WHEN NOT MATCHED THEN
  INSERT (order_id, customer_id, order_date, total, updated_at)
  VALUES (source.order_id, source.customer_id, source.order_date, source.total, source.ingested_at);
```

### Full Refresh vs Incremental

| Approach | When to use | Trade-off |
|---|---|---|
| **Full refresh** | Small tables, reference/lookup data, tables with no reliable timestamp | Simple but expensive at scale |
| **Incremental append** | Immutable event data (logs, transactions that never update) | Fast; cannot handle updates |
| **Incremental upsert** | Mutable source data where records can change | Handles updates; requires a reliable updated_at or CDC feed |

```sql
-- Full refresh: truncate and reload
TRUNCATE TABLE silver.products;
INSERT INTO silver.products SELECT * FROM bronze.products_raw;

-- Incremental append: new rows only
INSERT INTO silver.page_views
SELECT * FROM bronze.page_views_raw
WHERE event_date > (SELECT MAX(event_date) FROM silver.page_views);
```

---

## OLAP Operations

OLAP operations describe the ways analysts navigate and slice a multi-dimensional dataset. Understanding these operations helps design schemas and aggregations that support the analysis patterns your business needs.

### Roll-Up

Aggregate data from a lower granularity to a higher one — from individual days up to months, quarters, and years.

```sql
-- ROLLUP generates subtotals at each level of the hierarchy
SELECT
  YEAR(sale_date)    AS year,
  QUARTER(sale_date) AS quarter,
  MONTH(sale_date)   AS month,
  SUM(total_amount)  AS revenue
FROM fact_sales
GROUP BY ROLLUP (YEAR(sale_date), QUARTER(sale_date), MONTH(sale_date))
ORDER BY year, quarter, month;
```

Rows where `quarter` and `month` are NULL are the yearly subtotals. The row where all columns are NULL is the grand total.

### Drill-Down

The inverse of roll-up — navigate from a summary view into progressively more detailed data.

```sql
-- Level 1: annual view
SELECT year, SUM(revenue) AS total FROM fact_sales GROUP BY year;

-- Level 2: drill into 2024 by quarter
SELECT year, quarter, SUM(revenue) AS total
FROM fact_sales
WHERE year = 2024
GROUP BY year, quarter;

-- Level 3: drill into Q1 by month
SELECT year, quarter, month, SUM(revenue) AS total
FROM fact_sales
WHERE year = 2024 AND quarter = 1
GROUP BY year, quarter, month;
```

### Slice

Fix one dimension to a single value — reduces the n-dimensional dataset by filtering out all other values of that dimension.

```sql
-- Slice: only Q1 2024 (fix the time dimension to a single quarter)
SELECT
  p.category,
  s.region,
  SUM(f.total_amount) AS revenue
FROM fact_sales f
JOIN dim_date d    ON f.date_key = d.date_key
JOIN dim_product p ON f.product_key = p.product_key
JOIN dim_store s   ON f.store_key = s.store_key
WHERE d.year = 2024 AND d.quarter = 1    -- the slice
GROUP BY p.category, s.region;
```

### Dice

Filter on multiple dimensions simultaneously to isolate a specific sub-cube.

```sql
-- Dice: Q1 2024, Electronics category, North region only
SELECT SUM(f.total_amount) AS revenue, COUNT(*) AS order_count
FROM fact_sales f
JOIN dim_date d    ON f.date_key = d.date_key
JOIN dim_product p ON f.product_key = p.product_key
JOIN dim_store s   ON f.store_key = s.store_key
WHERE d.year = 2024
  AND d.quarter = 1
  AND p.category = 'Electronics'
  AND s.region = 'North';
```

### GROUPING SETS

Compute multiple GROUP BY combinations in a single query pass — more efficient than UNION ALL of separate queries.

```sql
SELECT
  region,
  product_category,
  year,
  SUM(revenue)         AS total_revenue,
  GROUPING(region)     AS is_region_subtotal,    -- 1 when this column is a subtotal
  GROUPING(year)       AS is_year_subtotal
FROM fact_sales
GROUP BY GROUPING SETS (
  (region, year),              -- revenue by region and year
  (product_category, year),    -- revenue by category and year
  (year),                      -- grand total by year only
  ()                           -- overall grand total
)
ORDER BY year, region, product_category;
```

Use `GROUPING()` to distinguish between a NULL value in the data and a NULL that represents a subtotal row.

---

## Partitioning & Clustering

Partitioning and clustering are physical organisation strategies that allow the query engine to skip data it doesn't need. The difference: partitioning skips whole files or file groups; clustering skips micro-partitions or row groups within files.

### Range Partitioning

Divide a table into partitions based on a continuous range of values — almost always a date column for fact tables.

```sql
-- PostgreSQL declarative partitioning
CREATE TABLE fact_sales (
  sale_date    DATE        NOT NULL,
  product_key  INT,
  total_amount DECIMAL(12,2)
) PARTITION BY RANGE (sale_date);

-- Create one partition per year
CREATE TABLE fact_sales_2023
  PARTITION OF fact_sales
  FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');

CREATE TABLE fact_sales_2024
  PARTITION OF fact_sales
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Queries with a date filter only scan the matching partition
SELECT SUM(total_amount)
FROM fact_sales
WHERE sale_date BETWEEN '2024-01-01' AND '2024-03-31';
-- → scans only fact_sales_2024, ignores all other years
```

### List Partitioning

Partition by a discrete set of values — useful for low-cardinality columns like region or country.

```sql
CREATE TABLE fact_sales (
  region       VARCHAR(50) NOT NULL,
  sale_date    DATE,
  total_amount DECIMAL(12,2)
) PARTITION BY LIST (region);

CREATE TABLE fact_sales_north
  PARTITION OF fact_sales
  FOR VALUES IN ('North', 'Northwest', 'Northeast');

CREATE TABLE fact_sales_south
  PARTITION OF fact_sales
  FOR VALUES IN ('South', 'Southeast', 'Southwest');

CREATE TABLE fact_sales_other
  PARTITION OF fact_sales DEFAULT;    -- catch-all for unmatched values
```

### Partition Pruning

The query engine skips partitions that cannot satisfy the filter condition. Pruning only works when the filter is directly on the partition column — wrapping it in a function defeats pruning.

```sql
-- ENABLES pruning: direct comparison on partition column
WHERE sale_date >= '2024-01-01' AND sale_date < '2025-01-01'

-- DISABLES pruning: function applied to partition column
WHERE YEAR(sale_date) = 2024          -- optimizer can't prune
WHERE DATE_TRUNC('year', sale_date) = '2024-01-01'  -- also disabled

-- DISABLES pruning: no filter on partition column at all
SELECT SUM(total_amount) FROM fact_sales;   -- full scan
```

### Clustering / Sorting

Physically co-locate rows with similar values within partitions to further reduce data scanned.

```sql
-- Snowflake: define a multi-column clustering key
ALTER TABLE fact_sales CLUSTER BY (sale_date, region);

-- BigQuery: partition + cluster together
CREATE TABLE fact_sales
PARTITION BY DATE(sale_date)
CLUSTER BY region, product_id
AS SELECT * FROM staging.sales;

-- Redshift: define a compound sort key
CREATE TABLE fact_sales (
  sale_date    DATE,
  region       VARCHAR(50),
  product_key  INT,
  total_amount DECIMAL(12,2)
)
SORTKEY (sale_date, region);    -- most-filtered column first
```

Column order in the clustering key matters — place the column used most frequently in filters first.

---

## Aggregation Patterns

Pre-computing aggregations trades storage for query speed. Use these patterns when reports query the same expensive aggregations repeatedly.

### Aggregate Table

Pre-compute and physically store a summary result. Reports query the aggregate table directly instead of the full fact table.

```sql
-- Build the aggregate table
CREATE TABLE agg_daily_sales AS
SELECT
  d.full_date,
  p.category,
  s.region,
  SUM(f.total_amount) AS daily_revenue,
  COUNT(DISTINCT f.customer_key) AS unique_customers,
  COUNT(*) AS order_count
FROM fact_sales f
JOIN dim_date d     ON f.date_key = d.date_key
JOIN dim_product p  ON f.product_key = p.product_key
JOIN dim_store s    ON f.store_key = s.store_key
GROUP BY d.full_date, p.category, s.region;

-- Daily refresh job: truncate and reload
TRUNCATE TABLE agg_daily_sales;
INSERT INTO agg_daily_sales SELECT ...;
```

### Materialized View

A query result stored physically and maintained by the database engine — either on a schedule or automatically when base data changes.

```sql
-- PostgreSQL: manually refreshed
CREATE MATERIALIZED VIEW mv_monthly_revenue AS
SELECT
  DATE_TRUNC('month', sale_date) AS month,
  region,
  SUM(total_amount)              AS revenue,
  COUNT(*)                       AS order_count
FROM fact_sales
GROUP BY 1, 2;

-- Refresh without locking reads
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_monthly_revenue;

-- Snowflake: auto-refreshes when base table changes
CREATE MATERIALIZED VIEW mv_monthly_revenue AS
SELECT
  DATE_TRUNC('month', sale_date) AS month,
  region,
  SUM(total_amount) AS revenue
FROM fact_sales
GROUP BY 1, 2;
```

### Window Aggregations

Compute running totals, moving averages, and cumulative metrics without collapsing rows.

```sql
-- Running total (cumulative sum)
SELECT
  sale_date,
  daily_revenue,
  SUM(daily_revenue) OVER (
    ORDER BY sale_date
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS running_total
FROM agg_daily_sales;

-- 7-day rolling average
SELECT
  sale_date,
  daily_revenue,
  AVG(daily_revenue) OVER (
    ORDER BY sale_date
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) AS rolling_7day_avg
FROM agg_daily_sales;

-- Rank within partition (e.g., top product per region per month)
SELECT
  month, region, product_name, revenue,
  RANK() OVER (PARTITION BY month, region ORDER BY revenue DESC) AS rank
FROM agg_monthly_product_sales
QUALIFY rank <= 5;    -- Snowflake syntax; use a subquery in other databases
```

### Period-over-Period

Compare a metric to the equivalent period in a prior time range.

```sql
-- Year-over-year using LAG (looks back 12 months in the ordered window)
SELECT
  month,
  revenue,
  LAG(revenue, 12) OVER (ORDER BY month) AS revenue_prior_year,
  revenue - LAG(revenue, 12) OVER (ORDER BY month) AS yoy_absolute_change,
  ROUND(
    100.0 * (revenue - LAG(revenue, 12) OVER (ORDER BY month))
    / NULLIF(LAG(revenue, 12) OVER (ORDER BY month), 0),
  1) AS yoy_pct_change
FROM agg_monthly_revenue
ORDER BY month;
```

`NULLIF(..., 0)` prevents division-by-zero errors when the prior period had zero revenue.

---

## Data Quality

Data quality failures are silent — bad data produces plausible but wrong answers. Validate at every stage of the pipeline and reconcile totals between source and target after every load.

### Null Checks

Null values in foreign key columns cause fact rows to disappear from queries that use inner joins. Null values in measure columns silently exclude rows from SUM and AVG.

```sql
-- Audit nulls across critical columns before load
SELECT
  COUNT(*)                                       AS total_rows,
  COUNT(*) FILTER (WHERE order_id IS NULL)       AS null_order_id,
  COUNT(*) FILTER (WHERE customer_key IS NULL)   AS null_customer_key,
  COUNT(*) FILTER (WHERE sale_date IS NULL)      AS null_sale_date,
  COUNT(*) FILTER (WHERE total_amount IS NULL)   AS null_total_amount
FROM staging.orders;

-- Enforce NOT NULL at the schema level
ALTER TABLE fact_sales
  ALTER COLUMN order_id    SET NOT NULL,
  ALTER COLUMN customer_key SET NOT NULL,
  ALTER COLUMN sale_date   SET NOT NULL;
```

### Duplicate Detection

Duplicate rows in a fact table cause double-counting in every aggregation. Duplicates in a dimension table cause fan-out in fact joins.

```sql
-- Identify duplicates on the natural key
SELECT order_id, COUNT(*) AS duplicate_count
FROM fact_sales
GROUP BY order_id
HAVING COUNT(*) > 1;

-- Deduplicate: keep the row with the lowest surrogate key
DELETE FROM fact_sales
WHERE sales_key NOT IN (
  SELECT MIN(sales_key)
  FROM fact_sales
  GROUP BY order_id
);

-- Or deduplicate in a CTE before loading
INSERT INTO fact_sales
WITH deduped AS (
  SELECT *,
    ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY ingested_at DESC) AS rn
  FROM staging.sales_raw
)
SELECT * FROM deduped WHERE rn = 1;
```

### Referential Integrity

An orphaned fact row — one whose foreign key has no matching dimension row — disappears from reports that use inner joins, and appears as NULL values in reports that use outer joins.

```sql
-- Check for orphaned customer keys in the fact table
SELECT f.customer_key, COUNT(*) AS orphan_count
FROM fact_sales f
LEFT JOIN dim_customer c ON f.customer_key = c.customer_key
WHERE c.customer_key IS NULL
GROUP BY f.customer_key;

-- Enforce at schema level (check support varies by platform)
ALTER TABLE fact_sales
  ADD CONSTRAINT fk_customer
  FOREIGN KEY (customer_key) REFERENCES dim_customer(customer_key);
```

**Note:** Snowflake, BigQuery, and most cloud DWs accept foreign key definitions for documentation purposes but do **not** enforce them at write time. Enforce referential integrity in ETL/ELT logic, not the schema.

### Range & Sanity Checks

Validate that numeric values fall within plausible business ranges and that dates are not in the future or impossibly far in the past.

```sql
SELECT
  COUNT(*) AS total_rows,
  COUNT(*) FILTER (WHERE total_amount < 0)        AS negative_amounts,
  COUNT(*) FILTER (WHERE total_amount > 500000)   AS suspiciously_large,
  COUNT(*) FILTER (WHERE quantity <= 0)           AS zero_or_negative_qty,
  COUNT(*) FILTER (WHERE sale_date > CURRENT_DATE) AS future_dates,
  COUNT(*) FILTER (WHERE sale_date < '2000-01-01') AS ancient_dates
FROM fact_sales;

-- Row count and sum reconciliation against source
-- Source total (from operational system):
-- orders placed on 2024-01-15 → 8,432 rows, $1,247,889.50
SELECT
  COUNT(*)          AS dw_row_count,
  SUM(total_amount) AS dw_total_revenue
FROM fact_sales
WHERE sale_date = '2024-01-15';
-- Must match source exactly
```

### Data Purging

Remove data that has exceeded its retention period to control costs, improve performance, and comply with data regulations.

```sql
-- Row-level delete: correct but slow on large tables
DELETE FROM fact_sales
WHERE sale_date < CURRENT_DATE - INTERVAL '7 years';

-- Partition drop: instant, no per-row overhead
ALTER TABLE fact_sales
  DROP PARTITION fact_sales_2016;    -- drops the entire year instantly

-- Archive before delete: keep a cold copy
INSERT INTO fact_sales_archive
SELECT * FROM fact_sales
WHERE sale_date < CURRENT_DATE - INTERVAL '7 years';

DELETE FROM fact_sales
WHERE sale_date < CURRENT_DATE - INTERVAL '7 years';

-- Reclaim storage after large deletes (PostgreSQL)
VACUUM ANALYZE fact_sales;
```

**Always prefer partition drop over row-level DELETE for large tables.** Dropping a partition is a metadata operation — it completes in milliseconds regardless of how many rows the partition contains.

---

## Performance Patterns

Query performance in a cloud DW is primarily determined by how much data is read. Every optimisation technique below reduces the volume of data scanned.

### Columnar Storage

Cloud DWs store each column separately on disk. A query that references three columns reads only those three columns — the other fifty are not touched.

```sql
-- Reads only the total_amount column — ignores all other columns
SELECT SUM(total_amount) FROM fact_sales;

-- Reads only region and total_amount — still very fast on a billion-row table
SELECT region, SUM(total_amount)
FROM fact_sales
GROUP BY region;

-- Reads ALL columns — defeats columnar pruning, much slower
SELECT * FROM fact_sales WHERE sale_date = '2024-06-01';
-- Use explicit column lists instead
SELECT order_id, customer_key, total_amount
FROM fact_sales WHERE sale_date = '2024-06-01';
```

Columnar storage also enables very high compression ratios on low-cardinality columns (e.g., a `region` column with 5 distinct values stored 1 billion times compresses 50–100x better than in a row store).

### Predicate Pushdown

Apply filter conditions as early as possible in the query plan to reduce rows that flow into joins and aggregations.

```sql
-- Less efficient: JOIN first, then filter — large intermediate result
SELECT f.*, d.year
FROM fact_sales f
JOIN dim_date d ON f.date_key = d.date_key
WHERE d.year = 2024;

-- More efficient: pre-filter the dimension before the join
WITH dates_2024 AS (
  SELECT date_key FROM dim_date WHERE year = 2024
)
SELECT f.*
FROM fact_sales f
JOIN dates_2024 d ON f.date_key = d.date_key;
```

Modern query optimisers often push predicates down automatically — but complex nested queries or views can defeat the optimiser. When in doubt, pre-filter in a CTE.

### Join Order Optimisation

The number of rows processed at each join stage determines query speed. Join the smallest (most selective) result set first to keep intermediate row counts low throughout the plan.

```sql
-- Less efficient: join 1B fact rows to 10M dimension rows first
SELECT ...
FROM fact_sales f           -- 1 billion rows
JOIN dim_customer c ON f.customer_key = c.customer_key  -- 10M rows
JOIN dim_date d ON f.date_key = d.date_key
WHERE d.year = 2024 AND d.quarter = 1;

-- More efficient: pre-filter the time dimension (91 rows) and join it first
WITH q1_2024 AS (
  SELECT date_key
  FROM dim_date
  WHERE year = 2024 AND quarter = 1    -- 91 rows
)
SELECT ...
FROM q1_2024 d
JOIN fact_sales f ON f.date_key = d.date_key    -- immediately prunes to Q1 facts
JOIN dim_customer c ON f.customer_key = c.customer_key;
```

### Avoid Functions on Filtered Columns

Applying a function to a column in a WHERE clause prevents the query engine from using micro-partition metadata, bloom filters, or zone maps — the engine cannot prune without scanning every row.

```sql
-- PREVENTS pruning — optimizer cannot use partition metadata
WHERE YEAR(sale_date) = 2024
WHERE DATE_TRUNC('month', sale_date) = '2024-01-01'
WHERE UPPER(region) = 'NORTH'
WHERE CAST(order_id AS VARCHAR) LIKE '12%'

-- ENABLES pruning — filter directly on the column value
WHERE sale_date >= '2024-01-01' AND sale_date < '2025-01-01'
WHERE region = 'North'
WHERE order_id BETWEEN 120000 AND 129999
```

This rule is especially important for partition keys and clustering columns.

---

## Governance & Lineage

Governance is what allows a data warehouse to scale beyond a small team. Without it, analysts spend more time questioning data than using it.

### Audit Columns

Add these columns to every table in the warehouse. They enable debugging, lineage tracing, and compliance reporting without needing a separate audit system.

```sql
-- Add to every table
ALTER TABLE fact_sales
  ADD COLUMN created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN record_source VARCHAR(100),   -- 'CRM', 'ERP', 'Salesforce'
  ADD COLUMN batch_id      VARCHAR(50);    -- pipeline run ID for tracing

-- On insert
INSERT INTO fact_sales (order_id, ..., record_source, batch_id)
VALUES (..., 'OMS', 'pipeline-run-2024-06-01-0200');

-- On update
UPDATE fact_sales
SET city = 'Austin', updated_at = CURRENT_TIMESTAMP
WHERE customer_key = 1001;
```

`record_source` tells you *where* the data came from. `batch_id` tells you *which pipeline run* loaded it — invaluable when diagnosing a load failure.

### Data Catalog Metadata

Document tables and columns as close to the objects as possible. Metadata stored in the catalog is surfaced automatically in tools like Alation, Collibra, and DataHub.

```sql
-- PostgreSQL / standard SQL: COMMENT ON
COMMENT ON TABLE fact_sales IS
  'One row per order line item. Grain: order_id + line_number. Source: OMS.';

COMMENT ON COLUMN fact_sales.total_amount IS
  'Unit price × quantity in USD, before tax and discounts. Additive measure.';

-- Snowflake: ALTER ... SET COMMENT
ALTER TABLE fact_sales
  SET COMMENT = 'One row per order line item. Grain: order_id + line_number.';

ALTER TABLE fact_sales
  MODIFY COLUMN total_amount
  COMMENT 'USD revenue before tax. Additive — safe to SUM across all dimensions.';
```

A grain statement in the table comment prevents the most common DW modelling mistake — analysts building on the table know exactly what one row means.

### Row-Level Security

Filter rows at query time based on the querying user's role or attributes. Enforced transparently — analysts cannot bypass it by querying the table directly.

```sql
-- Snowflake Row Access Policy
CREATE OR REPLACE ROW ACCESS POLICY region_policy AS
  (region VARCHAR) RETURNS BOOLEAN ->
  CASE
    WHEN CURRENT_ROLE() = 'ADMIN'         THEN TRUE
    WHEN CURRENT_ROLE() = 'NORTH_ANALYST' THEN region = 'North'
    WHEN CURRENT_ROLE() = 'SOUTH_ANALYST' THEN region = 'South'
    ELSE FALSE
  END;

-- Apply to the table
ALTER TABLE fact_sales
  ADD ROW ACCESS POLICY region_policy ON (region);

-- An analyst with NORTH_ANALYST role runs:
SELECT SUM(total_amount) FROM fact_sales;
-- → automatically filtered to North region rows only
```

Implement row-level security on the presentation (Gold) layer, not on raw or staging tables. Raw data access should be restricted by schema-level permissions, not row-level policies.

### Column Masking

Redact or obfuscate sensitive columns (PII, PCI) at query time based on the user's role. No data duplication — the masking is applied dynamically when the column is read.

```sql
-- Snowflake Dynamic Data Masking
CREATE OR REPLACE MASKING POLICY email_mask AS
  (val STRING) RETURNS STRING ->
  CASE
    WHEN CURRENT_ROLE() IN ('PII_ADMIN', 'DPO') THEN val           -- full value
    WHEN CURRENT_ROLE() = 'ANALYST'             THEN '***@' || SPLIT_PART(val, '@', 2)  -- domain only
    ELSE '***REDACTED***'                                           -- fully masked
  END;

-- Apply to the sensitive column
ALTER TABLE dim_customer
  MODIFY COLUMN email SET MASKING POLICY email_mask;

-- An analyst sees:          ***@gmail.com
-- A PII admin sees:         alice.johnson@gmail.com
-- An unknown role sees:     ***REDACTED***
```

---

*Part of the FTTG Learn Cheat Sheet series — [fttgsolutions.com](https://learn.fttgsolutions.com/cheatsheets)*
