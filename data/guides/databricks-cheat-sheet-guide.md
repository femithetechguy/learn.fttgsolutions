# Databricks Cheat Sheet Guide

> Quick reference for Databricks — from Delta Lake and PySpark DataFrames to Unity Catalog, MLflow, magic commands, and cluster configuration.

📋 **Quick reference:** [Databricks Cheat Sheet](/cheatsheets/databricks) — use this alongside the guide for fast syntax lookup while you read.

---

## Magic Commands

Magic commands are cell-level directives in Databricks notebooks. They start with `%` and switch the language or context for that single cell — regardless of the notebook's default language.

### %sql
Run a SQL query in a Python or Scala notebook cell. The result renders as an interactive table.
```sql
%sql
SELECT
    region,
    SUM(amount)  AS total_sales,
    COUNT(*)     AS order_count
FROM fttg_prod.analytics.fact_sales
WHERE sale_date >= '2024-01-01'
GROUP BY region
ORDER BY total_sales DESC;
```

### %python / %scala / %r
Switch the language for a single cell in a multi-language notebook.
```python
%python
df = spark.read.format("delta").load("/mnt/gold/fact_sales")
df.show(5)
```
```scala
%scala
val df = spark.read.format("delta").load("/mnt/gold/fact_sales")
df.show(5)
```

### %fs
Run Databricks filesystem (DBFS) commands — list, copy, move, and delete files in cloud storage mounted to DBFS.
```python
%fs ls /mnt/bronze/wms/

%fs ls dbfs:/user/hive/warehouse/

# Copy a file
%fs cp /mnt/bronze/sales.csv /mnt/archive/sales_backup.csv

# Delete a file
%fs rm /mnt/temp/scratch.csv

# Create a directory
%fs mkdirs /mnt/bronze/new_source/
```

### %sh
Run shell commands on the driver node. Useful for installing packages, inspecting the filesystem, or running CLI tools.
```bash
%sh
# Install a Python package
pip install great_expectations

# Check disk space
df -h

# List environment variables
env | grep DATABRICKS

# Inspect a mounted path
ls -la /dbfs/mnt/bronze/
```

### %run
Execute another notebook and import its variables and functions into the current notebook's scope. Used for shared utility notebooks.
```python
%run ./utils/data_quality_checks

%run ../config/pipeline_config

# After %run, variables and functions defined in the target notebook are available
# Example: if pipeline_config defines ENV = "prod"
print(ENV)   # prod
```

### %md
Write Markdown documentation in a notebook cell — rendered as formatted text, not code.
```markdown
%md
# Pipeline: Sales Ingestion — Bronze to Silver

**Owner:** Alex Mensah  
**Schedule:** Daily at 01:00 UTC  
**Source:** SharePoint → ADLS Gen2 → DBFS mount  

## Steps
1. Read raw CSV from Bronze
2. Validate schema
3. Deduplicate on `transaction_id`
4. Cast column types
5. Write to Silver as Delta table
```

---

## Delta Lake

Delta Lake is the default table format in Databricks. It adds ACID transactions, schema enforcement, time travel, and audit history to Parquet files stored in cloud storage.

### CREATE TABLE (Delta)
Create a managed or external Delta table.
```sql
-- Managed Delta table (Databricks manages storage location)
CREATE TABLE IF NOT EXISTS fttg_prod.analytics.fact_sales (
    sale_key        BIGINT        NOT NULL,
    sale_date       DATE          NOT NULL,
    customer_key    INT,
    product_key     INT,
    region          STRING,
    amount          DECIMAL(12,2),
    quantity        INT,
    cost            DECIMAL(12,2)
)
USING DELTA
PARTITIONED BY (sale_date)
COMMENT 'Daily sales transactions — Gold layer';

-- External Delta table (you control the storage path)
CREATE TABLE IF NOT EXISTS fttg_prod.analytics.fact_sales_ext
USING DELTA
LOCATION 'abfss://gold@fttgstorage.dfs.core.windows.net/fact_sales/'
AS SELECT * FROM staging_sales WHERE amount > 0;
```

```python
# Create from PySpark
df.write \
    .format("delta") \
    .mode("overwrite") \
    .partitionBy("sale_date") \
    .option("overwriteSchema", "true") \
    .saveAsTable("fttg_prod.analytics.fact_sales")
```

### MERGE INTO (upsert)
Insert new rows and update existing ones in a single atomic operation — the Delta Lake equivalent of SQL MERGE / upsert.
```sql
MERGE INTO fttg_prod.analytics.fact_sales AS target
USING (
    SELECT * FROM staging_sales_delta
) AS source
ON target.sale_key = source.sale_key
WHEN MATCHED AND source.amount <> target.amount THEN
    UPDATE SET
        target.amount   = source.amount,
        target.quantity = source.quantity
WHEN NOT MATCHED THEN
    INSERT (sale_key, sale_date, customer_key, product_key, region, amount, quantity, cost)
    VALUES (source.sale_key, source.sale_date, source.customer_key, source.product_key,
            source.region, source.amount, source.quantity, source.cost)
WHEN NOT MATCHED BY SOURCE AND target.sale_date >= current_date() - 7 THEN
    DELETE;
```

```python
# MERGE via Python Delta API
from delta.tables import DeltaTable

target = DeltaTable.forName(spark, "fttg_prod.analytics.fact_sales")

target.alias("t").merge(
    source_df.alias("s"),
    "t.sale_key = s.sale_key"
).whenMatchedUpdateAll() \
 .whenNotMatchedInsertAll() \
 .execute()
```

### Time Travel
Query a Delta table as it existed at a previous version or timestamp.
```python
# Query by version number
df = spark.read.format("delta") \
    .option("versionAsOf", 5) \
    .table("fttg_prod.analytics.fact_sales")

# Query by timestamp
df = spark.read.format("delta") \
    .option("timestampAsOf", "2024-06-01 00:00:00") \
    .table("fttg_prod.analytics.fact_sales")
```

```sql
%sql
-- Version-based time travel
SELECT * FROM fttg_prod.analytics.fact_sales VERSION AS OF 5;

-- Timestamp-based time travel
SELECT * FROM fttg_prod.analytics.fact_sales
TIMESTAMP AS OF '2024-06-01 00:00:00';

-- Restore accidentally deleted rows
INSERT INTO fttg_prod.analytics.fact_sales
SELECT * FROM fttg_prod.analytics.fact_sales VERSION AS OF 10
WHERE sale_date = '2024-06-14';
```

### DESCRIBE HISTORY
View the full audit log of all operations on a Delta table — writes, merges, schema changes, optimizations.
```sql
%sql
DESCRIBE HISTORY fttg_prod.analytics.fact_sales;

-- Limit to recent operations
DESCRIBE HISTORY fttg_prod.analytics.fact_sales LIMIT 10;
```

```python
from delta.tables import DeltaTable

dt = DeltaTable.forName(spark, "fttg_prod.analytics.fact_sales")
dt.history().show(truncate=False)

# Filter history
dt.history(10).select("version", "timestamp", "operation", "operationParameters").show()
```

### OPTIMIZE
Compact small Delta files into larger ones to improve read performance. Run regularly on tables with frequent small writes.
```sql
%sql
-- Optimize all files
OPTIMIZE fttg_prod.analytics.fact_sales;

-- Z-ORDER — co-locate related data for faster filtered queries
OPTIMIZE fttg_prod.analytics.fact_sales
ZORDER BY (region, sale_date);

-- Optimize a specific partition
OPTIMIZE fttg_prod.analytics.fact_sales
WHERE sale_date = '2024-06-15';
```

```python
from delta.tables import DeltaTable

DeltaTable.forName(spark, "fttg_prod.analytics.fact_sales").optimize().executeZOrderBy("region", "sale_date")
```

### VACUUM
Remove old Delta versions and deleted files to reclaim cloud storage. Default retention is 7 days — do not reduce below 7 days on active tables.
```sql
%sql
-- Vacuum with default 7-day retention
VACUUM fttg_prod.analytics.fact_sales;

-- Vacuum with custom retention (hours)
VACUUM fttg_prod.analytics.fact_sales RETAIN 168 HOURS;

-- Dry run — see what would be deleted without deleting
VACUUM fttg_prod.analytics.fact_sales DRY RUN;
```

### RESTORE
Roll back a Delta table to a previous version. Useful for recovering from a bad write or accidental delete.
```sql
%sql
-- Restore to a specific version
RESTORE TABLE fttg_prod.analytics.fact_sales TO VERSION AS OF 8;

-- Restore to a specific timestamp
RESTORE TABLE fttg_prod.analytics.fact_sales
TO TIMESTAMP AS OF '2024-06-14 23:59:00';
```

---

## PySpark DataFrames

A DataFrame is the primary data structure in PySpark — a distributed table with named columns and a schema. Operations are lazy — they build an execution plan but do not run until an action (`.show()`, `.count()`, `.write()`) is called.

### Read data
Load data from various sources into a DataFrame.
```python
from pyspark.sql import functions as F

# Read Delta table
df = spark.read.format("delta").table("fttg_prod.analytics.fact_sales")

# Read from a path
df = spark.read.format("delta").load("abfss://gold@fttgstorage.dfs.core.windows.net/fact_sales/")

# Read CSV
df = spark.read.csv(
    "abfss://bronze@fttgstorage.dfs.core.windows.net/sales/",
    header=True,
    inferSchema=True
)

# Read Parquet
df = spark.read.parquet("/mnt/bronze/events/")

# Read JSON
df = spark.read.json("/mnt/bronze/api_responses/")

# Read from JDBC (e.g. SQL Server)
df = spark.read \
    .format("jdbc") \
    .option("url", "jdbc:sqlserver://server:1433;databaseName=FTTG") \
    .option("dbtable", "dbo.fact_sales") \
    .option("user", dbutils.secrets.get("kv-scope", "sql-user")) \
    .option("password", dbutils.secrets.get("kv-scope", "sql-password")) \
    .load()
```

### Select & filter
Choose columns and filter rows.
```python
# Select specific columns
df.select("region", "sale_date", "amount")

# Select with expressions
df.select(
    F.col("region"),
    F.col("amount").alias("sale_amount"),
    (F.col("amount") - F.col("cost")).alias("margin")
)

# Filter rows
df.filter(F.col("amount") > 1000)
df.filter((F.col("region") == "North") & (F.col("amount") > 500))
df.filter(F.col("region").isin(["North", "South", "East"]))
df.filter(F.col("sale_date") >= "2024-01-01")
df.filter(F.col("customer_id").isNotNull())

# Drop duplicates
df.dropDuplicates(["transaction_id"])
df.distinct()
```

### withColumn
Add a new column or replace an existing one.
```python
df = df \
    .withColumn("margin", F.col("amount") - F.col("cost")) \
    .withColumn("margin_pct", F.round(F.col("margin") / F.col("amount"), 4)) \
    .withColumn("sale_month", F.date_trunc("month", F.col("sale_date"))) \
    .withColumn("is_high_value", F.when(F.col("amount") >= 10000, True).otherwise(False)) \
    .withColumn("region_upper", F.upper(F.col("region"))) \
    .withColumnRenamed("amount", "sale_amount")
```

### GroupBy & aggregate
Group rows and compute aggregations — equivalent to SQL GROUP BY.
```python
from pyspark.sql import functions as F

df_summary = df.groupBy("region", "sale_month") \
    .agg(
        F.sum("amount").alias("total_sales"),
        F.count("sale_key").alias("order_count"),
        F.avg("amount").alias("avg_order_value"),
        F.max("amount").alias("max_order"),
        F.countDistinct("customer_key").alias("unique_customers"),
        F.sum(F.when(F.col("amount") > 1000, 1).otherwise(0)).alias("high_value_orders")
    )

# Multiple aggregations in one pass
df.agg(
    F.sum("amount").alias("total"),
    F.count("*").alias("rows"),
    F.min("sale_date").alias("earliest"),
    F.max("sale_date").alias("latest")
).show()
```

### Join
Combine two DataFrames on a key column.
```python
# Inner join
df_joined = df_sales.join(df_customers, on="customer_key", how="inner")

# Left join
df_joined = df_sales.join(df_customers, on="customer_key", how="left")

# Join on multiple columns
df_joined = df_sales.join(
    df_targets,
    on=["region", "sale_month"],
    how="left"
)

# Join on expression (different column names)
df_joined = df_sales.join(
    df_customers,
    df_sales["cust_id"] == df_customers["customer_id"],
    how="inner"
)

# Avoid column ambiguity after join
df_joined = df_sales.alias("s").join(
    df_customers.alias("c"),
    F.col("s.customer_key") == F.col("c.customer_key"),
    how="left"
).select("s.*", "c.customer_name", "c.region")
```

### Window functions
Perform calculations across a partition of rows without collapsing them.
```python
from pyspark.sql.window import Window

# Partition by region, order by sale_date
w = Window.partitionBy("region").orderBy("sale_date")

# Running total
df = df.withColumn("running_total", F.sum("amount").over(w))

# Row number — rank each sale within its region by date
df = df.withColumn("row_num", F.row_number().over(w))

# Lag — previous row's amount
df = df.withColumn("prev_amount", F.lag("amount", 1).over(w))

# Lead — next row's amount
df = df.withColumn("next_amount", F.lead("amount", 1).over(w))

# Partition window (no ordering — aggregate over entire partition)
w_partition = Window.partitionBy("region")
df = df.withColumn("region_total", F.sum("amount").over(w_partition))
df = df.withColumn("pct_of_region", F.round(F.col("amount") / F.col("region_total"), 4))

# Rank with dense_rank
w_rank = Window.partitionBy("region").orderBy(F.desc("amount"))
df = df.withColumn("sales_rank", F.dense_rank().over(w_rank))
```

### Write data
Persist a DataFrame to storage or a table.
```python
# Write as Delta table (managed)
df.write \
    .format("delta") \
    .mode("overwrite") \
    .option("overwriteSchema", "true") \
    .saveAsTable("fttg_prod.analytics.fact_sales")

# Write as Delta to a path (external)
df.write \
    .format("delta") \
    .mode("append") \
    .partitionBy("sale_date", "region") \
    .save("abfss://gold@fttgstorage.dfs.core.windows.net/fact_sales/")

# Write as Parquet
df.write \
    .format("parquet") \
    .mode("overwrite") \
    .save("/mnt/exports/fact_sales_export/")

# Write as CSV (single file)
df.coalesce(1) \
    .write \
    .format("csv") \
    .option("header", "true") \
    .mode("overwrite") \
    .save("/mnt/exports/sales_report/")

# Merge / upsert via DeltaTable API
from delta.tables import DeltaTable
DeltaTable.forName(spark, "fttg_prod.analytics.fact_sales") \
    .alias("t").merge(df.alias("s"), "t.sale_key = s.sale_key") \
    .whenMatchedUpdateAll() \
    .whenNotMatchedInsertAll() \
    .execute()
```

---

## Spark SQL

### Run SQL
Execute SQL directly against Delta tables, temp views, and Unity Catalog objects.
```python
# In a Python notebook — returns a DataFrame
result = spark.sql("""
    SELECT
        region,
        DATE_TRUNC('month', sale_date) AS sale_month,
        SUM(amount)  AS total_sales,
        COUNT(*)     AS order_count
    FROM fttg_prod.analytics.fact_sales
    WHERE sale_date >= '2024-01-01'
    GROUP BY region, DATE_TRUNC('month', sale_date)
    ORDER BY sale_month, total_sales DESC
""")
result.show()

# In a SQL cell
```

```sql
%sql
SELECT
    region,
    DATE_TRUNC('month', sale_date) AS sale_month,
    SUM(amount) AS total_sales
FROM fttg_prod.analytics.fact_sales
WHERE sale_date >= '2024-01-01'
GROUP BY 1, 2
ORDER BY 2, 3 DESC;
```

### Create temp view
Register a DataFrame as a temporary SQL view — only available in the current Spark session.
```python
# Register a DataFrame as a temp view
df_filtered.createOrReplaceTempView("sales_filtered")

# Now query it with SQL
spark.sql("SELECT region, SUM(amount) FROM sales_filtered GROUP BY region").show()

# Global temp view — available across notebooks in the same cluster
df_filtered.createOrReplaceGlobalTempView("sales_global")
spark.sql("SELECT * FROM global_temp.sales_global LIMIT 10").show()
```

### CREATE TABLE AS SELECT
Create a new Delta table from a query result.
```sql
%sql
-- CTAS — create Gold summary table
CREATE OR REPLACE TABLE fttg_prod.analytics.gold_monthly_sales
USING DELTA
PARTITIONED BY (sale_year)
COMMENT 'Monthly sales aggregation by region — Gold layer'
AS
SELECT
    YEAR(sale_date)                  AS sale_year,
    DATE_TRUNC('month', sale_date)   AS sale_month,
    region,
    SUM(amount)                      AS total_sales,
    COUNT(*)                         AS order_count,
    AVG(amount)                      AS avg_order_value,
    COUNT(DISTINCT customer_key)     AS unique_customers
FROM fttg_prod.analytics.fact_sales
WHERE amount > 0
GROUP BY 1, 2, 3;
```

---

## Unity Catalog

Unity Catalog is Databricks' unified governance layer. It introduces a three-level namespace — catalog, schema, table — and centralises access control, data lineage, and auditing across all workspaces in a Databricks account.

### Three-level namespace
All objects in Unity Catalog are referenced with three levels: `catalog.schema.table`.
```sql
-- Full three-level reference
SELECT * FROM fttg_prod.analytics.fact_sales;

-- Set defaults so you don't need to qualify every name
USE CATALOG fttg_prod;
USE SCHEMA analytics;

SELECT * FROM fact_sales;   -- resolves to fttg_prod.analytics.fact_sales

-- Confirm current catalog and schema
SELECT current_catalog(), current_schema();
```

```
Account
└── Metastore (one per region)
    ├── Catalog: fttg_prod
    │   ├── Schema: raw
    │   ├── Schema: staging
    │   └── Schema: analytics
    │       ├── Table: fact_sales
    │       ├── Table: dim_customer
    │       └── View: vw_active_customers
    └── Catalog: fttg_dev
        └── Schema: analytics
```

### CREATE CATALOG
Create a top-level catalog — typically one per environment (prod, dev, staging) or per business domain.
```sql
-- Create a catalog
CREATE CATALOG IF NOT EXISTS fttg_prod
    COMMENT 'Production data — FTTG Solutions';

CREATE CATALOG IF NOT EXISTS fttg_dev
    COMMENT 'Development environment — safe to experiment';

-- List catalogs
SHOW CATALOGS;

-- Drop a catalog
DROP CATALOG fttg_dev CASCADE;   -- CASCADE drops all schemas and tables inside
```

### GRANT privilege
Assign privileges to users or groups at any level — catalog, schema, or table.
```sql
-- Grant catalog-level access
GRANT USE CATALOG ON CATALOG fttg_prod TO `analytics_team`;

-- Grant schema-level access
GRANT USE SCHEMA, CREATE TABLE, MODIFY
    ON SCHEMA fttg_prod.analytics
    TO `data_engineers`;

-- Grant table-level read access
GRANT SELECT ON TABLE fttg_prod.analytics.fact_sales TO `analysts`;

-- Grant SELECT on all current tables in a schema
GRANT SELECT ON ALL TABLES IN SCHEMA fttg_prod.analytics TO `analysts`;

-- Show grants on an object
SHOW GRANTS ON TABLE fttg_prod.analytics.fact_sales;

-- Revoke
REVOKE SELECT ON TABLE fttg_prod.analytics.fact_sales FROM `analysts`;
```

### Data lineage
Unity Catalog automatically tracks column-level data lineage — which tables and notebooks a column came from, and what downstream tables and dashboards it feeds.

**Access in Databricks UI:** Catalog Explorer → select a table → **Lineage** tab

```python
# Lineage is captured automatically when you write Delta tables
# via spark.write, CTAS, or MERGE — no extra code needed

# Example: lineage is tracked for this write
df_gold = df_silver \
    .groupBy("region", "sale_month") \
    .agg(F.sum("amount").alias("total_sales"))

df_gold.write.format("delta").mode("overwrite") \
    .saveAsTable("fttg_prod.analytics.gold_monthly_sales")

# Databricks records:
#   fttg_prod.analytics.fact_sales (source)
#       → notebook: Sales_Gold_Aggregate_NB
#           → fttg_prod.analytics.gold_monthly_sales (output)
```

---

## Clusters & Configuration

### Cluster types
Databricks offers two cluster types with different use cases and cost profiles.

| | All-Purpose Cluster | Job Cluster |
|---|---|---|
| Lifespan | Persistent — stays running | Ephemeral — created per job run, terminated on completion |
| Use case | Interactive development in notebooks | Production pipeline runs |
| Cost | Higher — billed while running even if idle | Lower — billed only during the job |
| Startup | Already running (or resumes quickly) | Cold start per run (~2-5 min) |
| Best for | Development, exploration, ad-hoc queries | Scheduled jobs, CI/CD pipelines |

**Best practice:** develop on all-purpose clusters, run production jobs on job clusters.

### Spark config (notebook)
Set Spark configuration properties at the session level from within a notebook.
```python
# Set config in a notebook
spark.conf.set("spark.sql.shuffle.partitions", "200")
spark.conf.set("spark.databricks.delta.optimizeWrite.enabled", "true")
spark.conf.set("spark.databricks.delta.autoCompact.enabled", "true")

# Read a config value
spark.conf.get("spark.sql.shuffle.partitions")

# Set multiple configs at cluster level (in cluster Advanced Options → Spark Config)
# spark.sql.shuffle.partitions 200
# spark.databricks.delta.optimizeWrite.enabled true
# spark.databricks.delta.autoCompact.enabled true
```

**Key config values:**
| Config | Purpose | Recommended value |
|---|---|---|
| `spark.sql.shuffle.partitions` | Number of partitions for shuffles | 200 (default), reduce for small data |
| `spark.databricks.delta.optimizeWrite.enabled` | Auto-coalesce small files on write | `true` |
| `spark.databricks.delta.autoCompact.enabled` | Auto-compact after write | `true` |
| `spark.sql.adaptive.enabled` | Adaptive Query Execution | `true` (default in DBR 7+) |

### Adaptive Query Execution
AQE is a Spark optimization that adjusts the query plan at runtime based on actual data statistics — not just estimates. Enabled by default in Databricks Runtime 7.0+.

```python
# Confirm AQE is enabled
spark.conf.get("spark.sql.adaptive.enabled")   # "true"

# AQE features:
# 1. Coalesces shuffle partitions — merges small post-shuffle partitions automatically
# 2. Converts sort-merge joins to broadcast joins when one side is small enough
# 3. Handles data skew — splits oversized partitions automatically

# Force disable for debugging (rarely needed)
spark.conf.set("spark.sql.adaptive.enabled", "false")
```

### dbutils.secrets
Access credentials stored in Azure Key Vault or Databricks Secret Store without hardcoding them in notebooks.
```python
# Get a secret
api_key   = dbutils.secrets.get(scope="kv-fttg-prod", key="wms-api-key")
sql_pwd   = dbutils.secrets.get(scope="kv-fttg-prod", key="sql-server-password")
sas_token = dbutils.secrets.get(scope="kv-fttg-prod", key="adls-sas-token")

# List available scopes
dbutils.secrets.listScopes()

# List keys in a scope (values are always redacted)
dbutils.secrets.list("kv-fttg-prod")

# Use in a connection
df = spark.read \
    .format("jdbc") \
    .option("url", "jdbc:sqlserver://fttg-sql.database.windows.net:1433") \
    .option("dbtable", "dbo.fact_sales") \
    .option("user", "svc_databricks") \
    .option("password", dbutils.secrets.get("kv-fttg-prod", "sql-password")) \
    .load()
```

---

## MLflow

MLflow is the experiment tracking and model management platform built into Databricks. It records parameters, metrics, and artifacts from every training run — making experiments reproducible and comparable.

### Start a run
Manually instrument a training run to track parameters, metrics, and model artifacts.
```python
import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

mlflow.set_experiment("/Users/alex@fttg.com/churn_prediction")

with mlflow.start_run(run_name="rf_baseline"):

    # Log parameters
    n_estimators = 100
    max_depth    = 10
    mlflow.log_param("n_estimators", n_estimators)
    mlflow.log_param("max_depth",    max_depth)

    # Train model
    model = RandomForestClassifier(n_estimators=n_estimators, max_depth=max_depth)
    model.fit(X_train, y_train)

    # Log metrics
    preds = model.predict(X_test)
    acc   = accuracy_score(y_test, preds)
    mlflow.log_metric("accuracy", acc)

    # Log the model
    mlflow.sklearn.log_model(model, "random_forest_model")

    print(f"Run complete. Accuracy: {acc:.4f}")
```

### Autologging
Enable automatic logging of parameters, metrics, and models for supported frameworks — no manual `log_param` calls needed.
```python
import mlflow

# Enable autologging for all supported frameworks
mlflow.autolog()

# Or enable for a specific framework
mlflow.sklearn.autolog()
mlflow.xgboost.autolog()
mlflow.pyspark.ml.autolog()

# Now train — everything is logged automatically
from sklearn.linear_model import LogisticRegression
model = LogisticRegression()
model.fit(X_train, y_train)
# Parameters, metrics, and model artifact are recorded automatically
```

### Register model
Promote a model artifact from an experiment run to the MLflow Model Registry — making it available for staging and production deployment.
```python
import mlflow

# Register directly from a run
run_id = "8e5d0ca9-005e-44e4-8d41-abc123"
model_uri = f"runs:/{run_id}/random_forest_model"

registered = mlflow.register_model(
    model_uri  = model_uri,
    name       = "fttg_churn_predictor"
)

print(f"Model version: {registered.version}")

# Transition to staging
client = mlflow.tracking.MlflowClient()
client.transition_model_version_stage(
    name    = "fttg_churn_predictor",
    version = registered.version,
    stage   = "Staging"
)

# Transition to production
client.transition_model_version_stage(
    name    = "fttg_churn_predictor",
    version = registered.version,
    stage   = "Production"
)
```

### Load model
Load a registered model for scoring — in a notebook, a job, or a serving endpoint.
```python
import mlflow.sklearn

# Load the latest production version
model_name = "fttg_churn_predictor"
model      = mlflow.sklearn.load_model(f"models:/{model_name}/Production")

# Score new data
predictions = model.predict(X_new)

# Load a specific version
model_v3 = mlflow.sklearn.load_model(f"models:/{model_name}/3")

# Load as a PySpark UDF for batch scoring
predict_udf = mlflow.pyfunc.spark_udf(spark, f"models:/{model_name}/Production")
df_scored   = df_features.withColumn("churn_prediction", predict_udf(*feature_cols))
```

---

## Jobs & Workflows

### Create job (UI)
Databricks Jobs orchestrate notebook, Python script, and JAR task runs on a schedule or trigger.

**Steps in the UI:**
1. Left nav → **Workflows** → **Create job**
2. Name the job (e.g. `Sales_Daily_Ingest`)
3. Add a task → select type (Notebook, Python script, Delta Live Tables, etc.)
4. Select the notebook path and the cluster (use a **job cluster** for production)
5. Set parameters if needed
6. **Add trigger** → Scheduled (cron) or File arrival
7. **Add notification** → email on success/failure
8. Save and **Run now** to test

**Common cron schedules:**
```
Daily at 2am UTC:       0 0 2 * * ?
Every hour:             0 0 * * * ?
Every 15 minutes:       0 0/15 * * * ?
Weekdays at 6am UTC:    0 0 6 ? * MON-FRI
```

### Task dependencies
Connect tasks in a workflow so downstream tasks wait for upstream tasks to complete.
```python
# Task dependency is configured in the Workflows UI:
# Task A (Extract) → Task B (Transform) → Task C (Load)
#
# Each task can have multiple upstream dependencies:
# Task D runs only after both Task B and Task E complete

# Access task values passed between tasks using dbutils
# In Task A — set an output value
dbutils.jobs.taskValues.set(key="rows_loaded", value=df.count())

# In Task B — read the value from Task A
rows = dbutils.jobs.taskValues.get(
    taskKey   = "Extract",
    key       = "rows_loaded",
    default   = 0
)
print(f"Rows from upstream: {rows}")
```

### dbutils.notebook.run
Run another notebook programmatically from the current notebook — useful for dynamic fan-out patterns.
```python
# Run a notebook and get its exit value
result = dbutils.notebook.run(
    path      = "./Silver_Transform_NB",
    timeout_seconds = 3600,
    arguments = {
        "run_date": "2024-06-15",
        "dc_id":    "DC-001",
        "env":      "prod"
    }
)
print(f"Notebook result: {result}")

# Fan-out pattern — run the same notebook for each DC in parallel
from concurrent.futures import ThreadPoolExecutor

def run_for_dc(dc_id):
    return dbutils.notebook.run(
        "./Silver_Transform_NB",
        timeout_seconds = 1800,
        arguments = {"dc_id": dc_id, "run_date": "2024-06-15"}
    )

dc_ids = ["DC-001", "DC-002", "DC-003", "DC-004"]
with ThreadPoolExecutor(max_workers=4) as pool:
    results = list(pool.map(run_for_dc, dc_ids))

# In the target notebook — read parameters
dbutils.widgets.text("run_date", "")
dbutils.widgets.text("dc_id", "")

run_date = dbutils.widgets.get("run_date")
dc_id    = dbutils.widgets.get("dc_id")

# Signal success back to the caller
dbutils.notebook.exit(f"Completed: {dc_id} for {run_date}")
```

---

*Part of the FTTG Learn Cheat Sheet series — [fttgsolutions.com](https://learn.fttgsolutions.com/cheatsheets)*
