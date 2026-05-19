# Microsoft Fabric Cheat Sheet Guide

> Quick reference for Microsoft Fabric — from OneLake and Data Factory to Lakehouses, Warehouses, Real-Time Analytics, Power BI integration, and governance.

📋 **Quick reference:** [Microsoft Fabric Cheat Sheet](/cheatsheets/ms-fabric) — use this alongside the guide for fast syntax lookup while you read.

---

## Core Components

### Microsoft Fabric
An end-to-end SaaS analytics platform from Microsoft. It unifies data engineering, data integration, data warehousing, real-time analytics, and business intelligence under a single product — one tenant, one storage layer (OneLake), one billing unit (Fabric capacity), and one governance model.

Before Fabric, building a modern data platform on Azure meant stitching together separate services: Azure Data Factory for pipelines, Azure Data Lake Storage for files, Synapse Analytics for queries, and Power BI for reporting. Each had its own security model, its own monitoring, and its own way of connecting to the others. Fabric collapses that stack.

**Key workloads in Fabric:**
| Workload | What it does |
|---|---|
| Data Engineering | Spark notebooks, Lakehouses, Delta tables |
| Data Factory | Pipelines, Dataflows Gen2, data movement |
| Data Warehousing | T-SQL Warehouse, SQL endpoint |
| Real-Time Analytics | Eventstream, KQL Database |
| Power BI | Semantic models, reports, dashboards |
| Data Science | ML experiments, models, notebooks |

### OneLake
The single unified storage layer built into every Fabric tenant. All data across all workspaces and all workloads lands here. You do not provision it — it exists automatically when you have a Fabric tenant.

**Key properties:**
- One lake per organization — all workspaces share the same underlying storage
- Built on Azure Data Lake Storage Gen2 under the hood
- All data stored in Delta Parquet format for structured tables
- Accessible by all Fabric workloads natively — no data copying between services
- Supports **shortcuts** — virtual links to external storage (ADLS Gen2, AWS S3, GCS) without moving data

```
Tenant
└── OneLake
    ├── Workspace A
    │   ├── Lakehouse 1 (Tables + Files)
    │   └── Warehouse 1
    └── Workspace B
        └── Lakehouse 2 (Tables + Files)
```

### Lakehouse
The primary data storage and processing object in Fabric. A Lakehouse combines the flexibility of a data lake (store any file type) with the structure of a data warehouse (Delta tables with a SQL endpoint).

**Two sections:**
- **Tables** — Delta tables. Queryable via SQL endpoint, readable by Spark notebooks and semantic models
- **Files** — Raw files (CSV, Parquet, JSON, images). Not directly queryable via SQL — process with Spark first

**Automatically provides:**
- A **SQL Analytics Endpoint** for T-SQL queries on Tables
- An **auto-generated semantic model** for Power BI DirectLake connections

### Warehouse
A dedicated T-SQL analytics engine on top of OneLake. Designed for SQL-focused teams who need a traditional data warehouse experience — DDL statements, stored procedures, transactions, views — without Spark.

**Lakehouse vs Warehouse:**
| | Lakehouse | Warehouse |
|---|---|---|
| Primary interface | Spark / SQL endpoint | T-SQL |
| DDL support | Limited (via SQL endpoint) | Full CREATE/ALTER/DROP |
| Stored procedures | No | Yes |
| Transactions | Delta ACID | Full T-SQL transactions |
| Best for | Data engineering + BI | SQL-focused analytics teams |

### Data Factory
The data integration workload in Fabric. Orchestrates data movement and transformation — ingesting from external sources into OneLake, triggering notebooks, and scheduling pipeline runs.

**Two tools:**
- **Pipelines** — visual workflow orchestration (copy, transform, loop, conditional logic)
- **Dataflow Gen2** — no-code Power Query M transformations with OneLake output

### Real-Time Analytics
The streaming and time-series analytics workload. Designed for high-velocity event data — IoT telemetry, clickstreams, log data, financial ticks.

**Two tools:**
- **Eventstream** — ingest and route real-time event streams from sources like Azure Event Hub, Kafka, and IoT Hub
- **KQL Database** — store and query time-series data using Kusto Query Language (KQL)

### Power BI
The reporting and visualization workload. Natively embedded in Fabric — reports, semantic models, and dashboards are first-class Fabric items that live in workspaces alongside Lakehouses and pipelines.

**DirectLake** is the connection mode that makes Fabric reporting unique — semantic models read Delta tables in OneLake directly without importing data, delivering import-level query speed with near-real-time freshness.

---

## Workspaces & Storage

### Workspace
A container for all Fabric items — Lakehouses, Warehouses, notebooks, pipelines, semantic models, and reports. Every workspace is backed by a folder in OneLake.

**Workspace roles:**
| Role | Permissions |
|---|---|
| Admin | Full control — manage members, delete workspace |
| Member | Create, edit, publish items — manage permissions |
| Contributor | Create and edit items — cannot manage permissions |
| Viewer | Read-only access to published content |

**Best practice:** one workspace per domain per environment (e.g. `Retail-Sales-Dev`, `Retail-Sales-Prod`). Use deployment pipelines to promote content between environments.

### Capacity
The compute and storage billing unit in Fabric. Every workspace must be assigned to a capacity. Capacity is measured in **Capacity Units (CUs)** and determines how much compute is available for all workloads running in that capacity.

**SKUs:**
- **F SKUs** — Fabric capacity (F2 to F2048). Purchased in Azure portal
- **P SKUs** — Power BI Premium capacity (P1 to P5). Legacy — still supported
- **Trial** — free 60-day Fabric trial capacity for evaluation

**Key concept:** all workloads in a capacity share the same CU pool. A heavy Spark notebook job competes with a pipeline run and a semantic model refresh on the same capacity. Monitor with the **Fabric Capacity Metrics app**.

### Shortcuts
Virtual links that make external data appear inside OneLake without physically copying it. A shortcut points to data in ADLS Gen2, AWS S3, Google Cloud Storage, or another OneLake location — and it appears as a folder inside a Lakehouse.

```
Lakehouse
└── Files
    ├── shortcut → adls://external-account/raw-data/    (reads live from ADLS)
    └── shortcut → s3://partner-bucket/exports/         (reads live from S3)
└── Tables
    └── shortcut → OneLake/OtherWorkspace/Lakehouse/    (reads from another workspace)
```

**Use cases:**
- Query external data without an ETL pipeline
- Share data between workspaces without duplication
- Federate data from partner systems without ingestion

### Delta Tables
The standard table format in Fabric. Delta Lake is an open-source storage layer that adds ACID transactions, schema enforcement, and time travel to Parquet files.

**Key Delta features:**
- **ACID transactions** — concurrent reads and writes are safe
- **Time travel** — query data as it existed at any previous version
- **Schema enforcement** — rejects writes that don't match the table schema
- **Schema evolution** — can add columns without breaking existing readers
- **Optimize & Z-order** — compact small files and co-locate related data for faster queries

```sql
-- Time travel in SQL endpoint
SELECT * FROM sales_fact
FOR TIMESTAMP AS OF '2024-06-01 00:00:00'

-- Version-based time travel
SELECT * FROM sales_fact
FOR VERSION AS OF 5
```

```python
# Time travel in PySpark notebook
df = spark.read.format("delta") \
    .option("versionAsOf", 5) \
    .load("Tables/sales_fact")
```

### Files Section
The unstructured storage area of a Lakehouse. Stores raw files in any format — CSV, JSON, Parquet, images, PDFs. Files here are not queryable via the SQL endpoint — they must be processed with a Spark notebook before becoming Delta tables.

**Common pattern (Medallion):**
```
Files/
├── bronze/      ← raw ingested files land here
│   ├── wms/
│   └── gps/
└── (processed by notebook → written to Tables/ as Delta)
```

### Tables Section
The structured Delta table storage area of a Lakehouse. All tables here are:
- Automatically registered in the SQL Analytics Endpoint
- Readable by Spark notebooks as Delta tables
- Accessible by Power BI semantic models via DirectLake
- Discoverable in the OneLake Data Hub

---

## Data Engineering

### Notebook
A collaborative, browser-based coding environment in Fabric. Supports Python, PySpark, Scala, SQL, and R in the same notebook. Each cell can use a different language.

**Key features:**
- Native Spark session — no cluster configuration needed
- Built-in `spark` and `mssparkutils` objects available automatically
- Inline Delta table explorer — browse Lakehouse tables without leaving the notebook
- Parameterized notebooks — accept parameters when called from a pipeline
- Version history and Git integration

```python
# Access a Lakehouse table
df = spark.read.format("delta").load("Tables/sales_fact")

# Write a Delta table
df.write.format("delta").mode("overwrite").saveAsTable("gold_sales_summary")

# Run SQL in a Python notebook
df = spark.sql("SELECT region, SUM(amount) FROM sales_fact GROUP BY region")
```

### Apache Spark
The distributed compute engine powering data engineering in Fabric. Spark processes data in parallel across a cluster of nodes — enabling transformations on datasets that are too large for single-machine processing.

**Fabric Spark concepts:**
- **Starter pool** — a pre-warmed Spark pool that starts in ~15 seconds. Used for most interactive and pipeline notebook runs
- **Custom pool** — a dedicated Spark cluster with specific node sizes and counts
- **High concurrency mode** — multiple notebooks share the same Spark session — reduces startup overhead for concurrent pipeline runs

### PySpark
The Python API for Apache Spark. Write Python code that executes on the distributed Spark engine. The DataFrame API is the primary interface — it looks similar to pandas but executes across a cluster.

**Key PySpark patterns in Fabric:**
```python
from pyspark.sql import functions as F

# Read from Lakehouse table
df = spark.read.format("delta").load("Tables/silver_transactions")

# Transform
df_clean = (
    df
    .filter(F.col("amount") > 0)
    .withColumn("month", F.date_trunc("month", F.col("transaction_date")))
    .withColumn("margin", F.col("revenue") - F.col("cost"))
)

# Aggregate
df_summary = (
    df_clean
    .groupBy("region", "month")
    .agg(
        F.sum("amount").alias("total_sales"),
        F.count("transaction_id").alias("order_count"),
        F.avg("margin").alias("avg_margin")
    )
)

# Write to Gold Lakehouse table
df_summary.write \
    .format("delta") \
    .mode("overwrite") \
    .option("overwriteSchema", "true") \
    .saveAsTable("gold_sales_summary")
```

### DataFrame
The primary data structure in PySpark. A distributed table with named columns and a schema. Operations on a DataFrame are lazy — they build an execution plan but do not run until an action is called (`.show()`, `.count()`, `.write()`).

```python
# Create from file
df = spark.read.csv("Files/bronze/sales.csv", header=True, inferSchema=True)

# Create from Delta table
df = spark.read.format("delta").load("Tables/silver_sales")

# Schema inspection
df.printSchema()
df.dtypes

# Basic operations
df.show(5)
df.count()
df.columns
df.select("region", "amount").distinct()
df.filter(df.amount > 1000)
df.orderBy("amount", ascending=False)
```

### Save as Table
Write a DataFrame as a Delta table in the Lakehouse Tables section. Two methods — `saveAsTable` registers in the metastore; `save` writes to a path only.
```python
# saveAsTable — registers table in metastore (preferred)
df.write \
    .format("delta") \
    .mode("overwrite") \
    .saveAsTable("gold_sales_summary")

# save — writes to path, not registered automatically
df.write \
    .format("delta") \
    .mode("append") \
    .save("Tables/gold_sales_summary")

# With partitioning
df.write \
    .format("delta") \
    .mode("overwrite") \
    .partitionBy("region", "year") \
    .saveAsTable("gold_sales_partitioned")
```

### Semantic Link
A Python library (`sempy`) that lets Fabric notebooks interact directly with Power BI semantic models — read data, evaluate DAX measures, and push data back to semantic models from a notebook.

```python
import sempy.fabric as fabric

# List semantic models in the workspace
fabric.list_datasets()

# Read a table from a semantic model
df = fabric.read_table("Sales Semantic Model", "FactSales")

# Evaluate a DAX measure
result = fabric.evaluate_dax(
    "Sales Semantic Model",
    """
    EVALUATE
    SUMMARIZECOLUMNS(
        DimDate[Year],
        "Total Sales", [Total Sales]
    )
    """
)
```

---

## Data Factory & Pipelines

### Pipeline
A visual workflow that orchestrates data movement and transformation. A pipeline is a sequence of activities that execute in a defined order, with conditional branching, loops, and error handling.

**Common activity types:**
| Activity | Purpose |
|---|---|
| Copy Data | Move data from source to destination |
| Notebook | Run a Fabric notebook |
| Dataflow Gen2 | Run a dataflow transformation |
| Script | Execute a SQL script |
| Web | Call a REST API |
| ForEach | Loop over a list of items |
| If Condition | Branch based on a condition |
| Set Variable | Store a value for use later in the pipeline |
| Wait | Pause for a specified duration |

### Copy Activity
The workhorse of data ingestion — moves data from a source connector to a destination. Supports 90+ connectors including SQL Server, SharePoint, REST APIs, SFTP, S3, ADLS, and more.

**Key settings:**
- **Source** — connection + dataset (table, query, or file path)
- **Sink** — destination connection + write behaviour (overwrite, append, merge)
- **Mapping** — column-level field mapping between source and destination
- **Performance** — degree of copy parallelism, staging settings

**Common pattern — land raw files to Lakehouse Files:**
```
Source: SharePoint Online (Excel file)
  ↓  Copy Activity
Sink: Lakehouse Files section → /bronze/sales/YYYY-MM-DD/
```

### Dataflow Gen2
A no-code/low-code transformation tool using the Power Query M engine. Drag-and-drop transformations that output to a Lakehouse table, Warehouse table, or other destination.

**When to use Dataflow Gen2 vs Notebook:**
| | Dataflow Gen2 | Notebook |
|---|---|---|
| Audience | Analysts, low-code users | Engineers, data scientists |
| Language | Power Query M (visual) | Python, PySpark, SQL, Scala |
| Best for | Simple transformations, reshaping | Complex logic, large data, ML |
| Scale | Limited Spark compute | Full Spark cluster |

### Schedule Pipeline
Trigger a pipeline on a time-based cadence — without writing any code.

**Steps:**
1. Open the pipeline → **Schedule** tab
2. Toggle **Scheduled** on
3. Set recurrence: Daily, Weekly, Monthly, or Custom (cron)
4. Set start time and timezone
5. Save

**Trigger types:**
- **Scheduled** — runs on a time cadence
- **Manual** — triggered by a user clicking Run
- **Event-based** — triggers when a file lands in OneLake (via Storage Event trigger)
- **Pipeline** — triggered by another pipeline completing

### Parameters
Make pipelines reusable by parameterizing values that change between runs — file paths, dates, DC IDs, environment names.

```json
// Pipeline parameters definition
{
  "run_date": { "type": "string", "defaultValue": "" },
  "dc_id":    { "type": "string", "defaultValue": "ALL" },
  "env":      { "type": "string", "defaultValue": "dev" }
}
```

```python
# Access pipeline parameters inside a Fabric notebook
run_date = mssparkutils.runtime.context.get("run_date")
dc_id    = mssparkutils.runtime.context.get("dc_id")
```

### Monitor Hub
The central observability dashboard for all Fabric activity — pipeline runs, notebook executions, Spark jobs, dataflow runs, and more.

**Access:** Left nav → **Monitor**

**Key views:**
- **Pipeline runs** — status, duration, start/end time, triggered by
- **Notebook runs** — execution history, Spark session details
- **Background jobs** — scheduled refresh, dataflow runs

**Useful for:** debugging failed runs, tracking data latency, capacity utilization monitoring, and auditing who ran what and when.

---

## SQL & Warehousing

### SQL Endpoint
A read-only T-SQL interface automatically provisioned for every Lakehouse. Exposes all Delta tables in the Lakehouse's Tables section as queryable SQL objects — no setup required.

**Key properties:**
- Read-only — cannot INSERT, UPDATE, or DELETE via the SQL endpoint
- Tables appear automatically as soon as they are written to the Lakehouse
- Supports views and stored procedures (via Warehouse, not SQL endpoint)
- Connection string available for external tools (SSMS, Azure Data Studio, Power BI)

```sql
-- Query via SQL endpoint
SELECT
    region,
    SUM(amount)    AS total_sales,
    COUNT(*)       AS order_count
FROM gold_sales_summary
GROUP BY region
ORDER BY total_sales DESC;
```

### T-SQL
The query language for Fabric Warehouse and the SQL Analytics Endpoint. Standard T-SQL syntax — SELECT, JOIN, WHERE, GROUP BY, window functions, CTEs.

```sql
-- Standard query
SELECT
    c.customer_name,
    d.year,
    d.month_name,
    SUM(f.amount) AS monthly_sales
FROM fact_sales f
JOIN dim_customer c ON f.customer_key = c.customer_key
JOIN dim_date     d ON f.date_key     = d.date_key
GROUP BY c.customer_name, d.year, d.month_name
ORDER BY d.year, d.month_name;

-- Window function
SELECT
    region,
    sale_date,
    daily_sales,
    SUM(daily_sales) OVER (
        PARTITION BY region
        ORDER BY sale_date
        ROWS UNBOUNDED PRECEDING
    ) AS running_total
FROM daily_sales_summary;
```

### Stored Procedure
Reusable T-SQL logic stored in a Fabric Warehouse. Executes a sequence of SQL statements as a unit. Only available in Warehouse — not in the SQL endpoint.

```sql
CREATE PROCEDURE usp_refresh_gold_summary
    @run_date DATE = NULL
AS
BEGIN
    SET @run_date = COALESCE(@run_date, CAST(GETDATE() AS DATE));

    DELETE FROM gold_daily_summary
    WHERE summary_date = @run_date;

    INSERT INTO gold_daily_summary (summary_date, region, total_sales, order_count)
    SELECT
        @run_date,
        region,
        SUM(amount),
        COUNT(*)
    FROM silver_transactions
    WHERE CAST(transaction_date AS DATE) = @run_date
    GROUP BY region;
END;

-- Execute
EXEC usp_refresh_gold_summary @run_date = '2024-06-15';
```

### View
A saved SELECT query that behaves like a virtual table. Available in both Warehouse and via SQL endpoint.

```sql
-- Create a view in Fabric Warehouse
CREATE VIEW vw_active_customer_sales AS
SELECT
    c.customer_key,
    c.customer_name,
    c.region,
    SUM(f.amount) AS lifetime_sales,
    COUNT(*)      AS total_orders
FROM fact_sales f
JOIN dim_customer c ON f.customer_key = c.customer_key
WHERE c.is_active = 1
GROUP BY c.customer_key, c.customer_name, c.region;
```

### CTAS
Create Table As Select — create a new table from a query result. Useful for materializing aggregations and Gold layer tables in a Warehouse.

```sql
-- Create Gold summary table from Silver data
CREATE TABLE gold_region_summary
AS
SELECT
    region,
    YEAR(sale_date)  AS sale_year,
    MONTH(sale_date) AS sale_month,
    SUM(amount)      AS total_sales,
    COUNT(*)         AS order_count,
    AVG(amount)      AS avg_order_value
FROM silver_transactions
WHERE amount > 0
GROUP BY region, YEAR(sale_date), MONTH(sale_date);
```

### Star Schema
The recommended data model pattern for Fabric Warehouse and Lakehouse Gold layer. One central fact table surrounded by dimension tables.

```sql
-- Fact table — one row per transaction
CREATE TABLE fact_sales (
    sale_key       BIGINT        NOT NULL,
    date_key       INT           NOT NULL,   -- FK to dim_date
    customer_key   INT           NOT NULL,   -- FK to dim_customer
    product_key    INT           NOT NULL,   -- FK to dim_product
    store_key      INT           NOT NULL,   -- FK to dim_store
    quantity       INT,
    unit_price     DECIMAL(10,2),
    amount         DECIMAL(12,2),
    cost           DECIMAL(12,2)
);

-- Dimension table — one row per customer
CREATE TABLE dim_customer (
    customer_key   INT           NOT NULL PRIMARY KEY,
    customer_id    VARCHAR(20)   NOT NULL,
    customer_name  VARCHAR(200),
    region         VARCHAR(50),
    country        VARCHAR(50),
    is_active      BIT           DEFAULT 1
);
```

---

## Real-Time Analytics

### Eventstream
A no-code pipeline for ingesting, transforming, and routing real-time event streams. Connects sources (Azure Event Hub, Kafka, IoT Hub, sample data) to destinations (KQL Database, Lakehouse, another Eventstream).

**Key concepts:**
- **Source** — where events come from (Event Hub, Kafka, IoT Hub, custom app)
- **Transformation** — filter, aggregate, or reshape events in flight
- **Destination** — where processed events land (KQL Database, Lakehouse table, Warehouse)

**Common pattern:**
```
IoT sensors → Azure IoT Hub → Eventstream → KQL Database (real-time)
                                           → Lakehouse (batch history)
```

### KQL Database
A time-series optimized database in Fabric. Built on the same engine as Azure Data Explorer. Designed for high-velocity append-only data — telemetry, logs, metrics, events.

**Key properties:**
- Columnar storage optimized for time-range queries
- Auto-ingestion from Eventstream
- Data expires automatically based on retention policy
- Accessible from Real-Time Dashboards and Power BI

```kql
// Basic KQL query
SensorReadings
| where ingestion_time() > ago(1h)
| where device_id == "DC-001"
| summarize avg_temp = avg(temperature) by bin(timestamp, 5m)
| order by timestamp desc
```

### Kusto Query Language (KQL)
The query language for KQL Databases. Pipe-based syntax — each operator passes its result to the next.

```kql
// Filter and aggregate
DeliveryEvents
| where event_time > ago(24h)
| where event_type == "delivered"
| summarize
    total_deliveries = count(),
    on_time = countif(is_on_time == true),
    avg_delay_minutes = avg(delay_minutes)
  by dc_id, bin(event_time, 1h)
| extend on_time_rate = round(todouble(on_time) / total_deliveries * 100, 1)
| order by event_time desc

// Join two tables
DeliveryEvents
| join kind=leftouter DriverInfo on $left.driver_id == $right.driver_id
| project event_time, driver_name, dc_id, is_on_time
```

**Common KQL operators:**
| Operator | Purpose |
|---|---|
| `where` | Filter rows |
| `summarize` | Aggregate |
| `extend` | Add a calculated column |
| `project` | Select columns |
| `order by` | Sort results |
| `join` | Join two tables |
| `bin()` | Round timestamps to buckets |
| `ago()` | Relative time expression |
| `countif()` | Count rows matching a condition |

### Real-Time Dashboard
A live dashboard that runs KQL queries on a schedule — updating automatically without manual refresh. Tiles can show line charts, bar charts, maps, stat cards, and tables.

**Key features:**
- Auto-refresh interval (as low as 30 seconds)
- Parameter controls for time range and dimension filters
- Shareable via Fabric workspace — no Power BI license required for viewers
- Embeddable in external portals

### Streaming Data
General patterns for working with real-time data in Fabric.

```kql
// Query most recent N events
SensorReadings
| top 100 by ingestion_time() desc

// Detect anomalies in the last hour
SensorReadings
| where ingestion_time() > ago(1h)
| summarize avg_val = avg(value), std_val = stdev(value) by sensor_id
| extend z_score = (avg_val - 50) / std_val
| where abs(z_score) > 2

// Time-series aggregation
ClickEvents
| where event_time > ago(7d)
| summarize clicks = count() by bin(event_time, 1h), page_id
| render timechart
```

---

## Power BI Integration

### Semantic Model
The DAX layer that sits between OneLake data and Power BI reports. Defines measures, relationships, hierarchies, and security rules. In Fabric, semantic models are first-class workspace items — not embedded inside a `.pbix` file.

**Two types in Fabric:**
- **Default semantic model** — auto-generated by every Lakehouse and Warehouse. Always in sync with the tables. Cannot be modified directly
- **Custom semantic model** — a semantic model you build manually, pointing at Lakehouse or Warehouse tables via DirectLake

### Direct Lake
The connection mode that makes Fabric reporting distinct from traditional Power BI.

**How it works:** instead of copying data into the VertiPaq in-memory engine (Import) or querying the source live on every visual interaction (DirectQuery), DirectLake reads Delta table column segments from OneLake on demand. The engine loads what it needs into memory as queries arrive — delivering near-import performance with near-real-time data freshness.

**DirectLake vs Import vs DirectQuery:**
| Mode | Data freshness | Query speed | Dataset size limit | Requires Fabric? |
|---|---|---|---|---|
| Import | Refresh cadence | Fastest | ~10GB practical | No |
| DirectQuery | Real-time | Slowest | Unlimited | No |
| Direct Lake | Near real-time | Near import | Unlimited | Yes |

**Fallback behavior:** if a DAX query cannot be served from memory, DirectLake automatically falls back to DirectQuery against the SQL endpoint. Monitor fallback rate in the Fabric Capacity Metrics app.

```python
# After writing Gold tables to Lakehouse, semantic model picks them up automatically
# No refresh needed for DirectLake — data is live from OneLake
df_gold.write.format("delta").mode("overwrite").saveAsTable("gold_sales_summary")
```

### Import Mode
Data is copied from the source into the VertiPaq in-memory engine at refresh time. Fast queries. Data is only as fresh as the last refresh. Practical size limit of around 10GB per dataset on Pro; larger on Premium/Fabric.

Use Import when: data does not live in Fabric, volume is manageable, and hourly or daily freshness is acceptable.

### DAX
The measure language for Power BI semantic models in Fabric. DAX measures evaluate dynamically based on filter context — the slicers, visual filters, and page filters active when a query runs.

```dax
-- Basic measure
Total Sales = SUM(fact_sales[amount])

-- CALCULATE modifies filter context
Sales USA =
CALCULATE([Total Sales], dim_customer[country] = "USA")

-- Year-over-year comparison
Sales YoY % =
VAR Current = [Total Sales]
VAR Prior   = CALCULATE([Total Sales], SAMEPERIODLASTYEAR(dim_date[date]))
RETURN DIVIDE(Current - Prior, Prior, 0)

-- DirectLake-compatible measure (avoid SUMMARIZE on large tables)
Region Count =
COUNTROWS(SUMMARIZE(fact_sales, dim_customer[region]))
```

### Report
A Power BI report published to a Fabric workspace. A collection of pages with interactive visuals — charts, tables, matrices, slicers, cards. Reports connect to a semantic model.

**In Fabric:** reports are created in Power BI Desktop and published, or created directly in the Service using the new web authoring experience.

### Dashboard
A single-page canvas of pinned tiles from one or more reports. Used for high-level monitoring — pin the most important KPI visuals from multiple reports into one view.

**Reports vs Dashboards:**
| | Report | Dashboard |
|---|---|---|
| Pages | Multiple | Single canvas |
| Interactivity | Full cross-filtering | Limited (tiles are static) |
| Data sources | One semantic model | Multiple reports/models |
| Best for | Deep analysis | Executive summary KPIs |

---

## Security & Governance

### Microsoft Purview
Microsoft's unified data governance platform — integrated with Fabric. Provides data cataloging, lineage, classification, and compliance management across all Fabric items and OneLake data.

**Key Purview capabilities in Fabric:**
- **Data catalog** — discover and document all tables, pipelines, and semantic models across the tenant
- **Data lineage** — trace where data came from, what transformed it, and where it flows to
- **Sensitivity labels** — classify data (Confidential, Highly Confidential, Public) and enforce protection policies
- **Information protection** — encrypt labeled data, restrict export, apply watermarks

### Row-Level Security (RLS)
Restrict which rows of data each user can see. Defined in the semantic model using DAX filter expressions — enforced by the Power BI engine at query time.

```dax
-- In the semantic model role filter on dim_store
[store_manager_email] = USERPRINCIPALNAME()

-- More complex — managers see their region
[region] = LOOKUPVALUE(
    dim_manager[region],
    dim_manager[email], USERPRINCIPALNAME()
)
```

**Steps:**
1. In Power BI Desktop → Modeling → **Manage Roles**
2. Create a role and add a DAX filter on the relevant dimension table
3. Publish to Fabric workspace
4. In the workspace → Semantic model → **Security** → assign users/groups to roles

**RLS does not apply to:** Warehouse direct SQL connections via SSMS or Azure Data Studio — those respect SQL-level permissions instead.

### Sensitivity Labels
Classify Fabric items and OneLake data according to your organization's information protection policy. Labels flow downstream — a Lakehouse table labeled Confidential propagates that label to reports built on it.

**Label tiers (example):**
- Public — non-sensitive, shareable externally
- General — internal use
- Confidential — business-sensitive data
- Highly Confidential — regulated data (PII, PHI, financial)

**Set labels:** open any Fabric item → `...` menu → **Apply sensitivity label**

### Data Lineage
Visual tracing of data flow through a Fabric workspace — from source through pipelines, Lakehouses, semantic models, to reports.

**Access:** Workspace → **Lineage view** (top-right toggle)

Shows:
- Which pipelines feed which Lakehouses
- Which Lakehouses feed which semantic models
- Which semantic models feed which reports
- Impact analysis — what breaks if you change a table

### Workspace Roles
Control who can do what inside a Fabric workspace.

```
Admin      → full control, manage members, delete workspace
Member     → create/edit/publish all items, manage data source permissions
Contributor → create/edit items, cannot publish apps or manage permissions
Viewer     → read-only, can view reports and dashboards through the workspace
```

**Best practice:** end users should access content through a **published App**, not direct workspace access. Give end users the app consumer role — not workspace Viewer — so they only see published content, not works in progress.

---

## Best Practices

### Use Medallion Architecture
Organize Lakehouse data into three layers — Bronze, Silver, Gold. Each layer has a clear responsibility and clean separation of concerns.

```
Bronze  → raw data as ingested, no transformation, append-only audit trail
Silver  → cleaned, conformed, deduplicated, correctly typed
Gold    → aggregated, business-ready, optimized for reporting and semantic models
```

```python
# Bronze — land raw data as-is
df_raw.write.format("delta").mode("append") \
    .save("Files/bronze/wms/2024-06-15/")

# Silver — clean and conform
df_silver = df_raw \
    .dropDuplicates(["transaction_id"]) \
    .withColumn("sale_date", F.to_date("transaction_timestamp")) \
    .filter(F.col("amount") > 0)
df_silver.write.format("delta").mode("overwrite").saveAsTable("silver_transactions")

# Gold — aggregate for reporting
df_gold = df_silver.groupBy("region", "sale_date") \
    .agg(F.sum("amount").alias("daily_sales"))
df_gold.write.format("delta").mode("overwrite").saveAsTable("gold_daily_sales")
```

### Optimize Delta Tables
Keep Delta tables performant as they grow by running OPTIMIZE and VACUUM regularly.

```python
# OPTIMIZE — compact small files into larger ones (improves read performance)
spark.sql("OPTIMIZE gold_daily_sales")

# Z-ORDER — co-locate related data for faster filtered queries
spark.sql("OPTIMIZE silver_transactions ZORDER BY (region, sale_date)")

# VACUUM — remove old Delta versions to reclaim storage
# Default retention = 7 days. Do not set below 7 days for active tables
spark.sql("VACUUM silver_transactions RETAIN 168 HOURS")

# Check table history
spark.sql("DESCRIBE HISTORY silver_transactions").show(10)
```

### Separate Storage & Compute
OneLake separates storage from compute — take advantage of it. Do not size your capacity for peak load if average load is much lower. Use job clusters (via pipeline-triggered notebooks) that spin up for a job and terminate when done.

```
Pattern:
  Capacity (F8 or F16) — sized for average interactive workload
  Pipeline-triggered notebook — runs on a Spark session that terminates on completion
  Result: you pay for compute only while the job runs
```

### Prefer Direct Lake
When your data already lives in a Fabric Lakehouse or Warehouse, use DirectLake for semantic models instead of Import. It removes the refresh window, eliminates the dataset size ceiling, and keeps reports current with the latest pipeline run.

```
When to use DirectLake:  data in Fabric Lakehouse/Warehouse + freshness matters
When to use Import:      data outside Fabric + small volume + simple refresh cadence
When to use DirectQuery: absolute real-time requirement + source can handle query load
```

### Implement Naming Standards
Consistent naming across workspaces, Lakehouses, tables, pipelines, and notebooks prevents the "14 workspaces, nobody knows what owns what" problem.

```
Workspaces:   [Team]-[Domain]-[Env]
              Retail-Sales-Dev, Retail-Sales-Prod

Lakehouses:   [Domain]_[Layer]_LH
              Sales_Bronze_LH, Sales_Gold_LH

Tables:       [layer]_[entity]
              bronze_raw_transactions
              silver_transactions
              gold_daily_sales

Pipelines:    [Domain]_[Action]_Pipeline
              Sales_Ingest_Pipeline
              Sales_Transform_Pipeline

Notebooks:    [Domain]_[Layer]_[Action]_NB
              Sales_Silver_Clean_NB
              Sales_Gold_Aggregate_NB
```

---

*Part of the FTTG Learn Cheat Sheet series — [fttgsolutions.com](https://learn.fttgsolutions.com/cheatsheets)*
