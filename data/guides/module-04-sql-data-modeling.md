# Module 4 — SQL & Data Modeling

**Client:** FTTG Finance
**Skill level:** Senior IC
**Read time:** ~6 min

---

## The core problem Alex solves

FTTG Finance manages five investment portfolios. The finance team produces monthly P&L reports by pulling Excel extracts from their trading system, pasting them into a master spreadsheet, and manually reconciling the numbers. It takes three days every month. The numbers are frequently wrong because someone overwrote a formula. There is no way to drill from a summary P&L figure down to the individual transactions that make it up.

Alex is brought in to build a proper data model — a star schema in SQL Server that becomes the single source of truth for all portfolio reporting, fed by a nightly ETL from the trading system.

---

## Section 1 — The concept

### Why data modeling matters

A data model is the structure you impose on raw data to make it queryable, reliable, and performant. The difference between a well-modeled dataset and a poorly modeled one is the difference between a report that runs in two seconds and one that times out, between an analyst who trusts the numbers and one who checks every figure in Excel before presenting.

The two most important modeling patterns in enterprise BI are the star schema and the snowflake schema.

### Star schema

A star schema has one central fact table surrounded by dimension tables. The fact table holds measurable events — transactions, admissions, shipments, orders. Each row is one event. Dimension tables describe the context of those events — who, what, where, when.

```
DimDate ──────────────┐
DimPortfolio ─────────┤──── FactTransaction
DimSecurity ──────────┤
DimTrader ────────────┘
```

Relationships are simple — one dimension row to many fact rows. Filters flow from dimensions to fact. The structure is flat, denormalized at the dimension level, and optimized for read performance. Power BI's VertiPaq engine and most analytical databases are designed to operate on this pattern efficiently.

### Snowflake schema

A snowflake schema normalizes the dimension tables — splitting them into sub-dimensions to eliminate redundancy. A `DimSecurity` table in a star schema might have both security name and asset class as columns. In a snowflake schema, asset class becomes its own table with a foreign key back to `DimSecurity`.

Snowflake schemas reduce storage redundancy and enforce referential integrity more strictly. The trade-off is more joins at query time and more complexity in the model. For most BI and reporting workloads, the star schema wins on performance and maintainability.

### OLTP vs OLAP

Source systems are typically designed for OLTP — Online Transaction Processing. Highly normalized, optimized for fast individual writes, many small transactions per second. Think of a trading system recording each trade as it happens.

Reporting systems are designed for OLAP — Online Analytical Processing. Denormalized or semi-normalized, optimized for fast reads across large volumes of data. Think of a dashboard aggregating two years of trades across five portfolios.

You almost never report directly off an OLTP source. The normalization that makes writes fast makes reads slow at scale. The job of data modeling is to transform OLTP source data into an OLAP-friendly structure.

### Key SQL concepts for senior interviews

**Window functions** — perform calculations across a set of rows related to the current row without collapsing them into a single aggregate. Essential for running totals, rankings, and period-over-period comparisons.

```sql
-- Running P&L total by portfolio
SELECT
    transaction_date,
    portfolio_id,
    daily_pnl,
    SUM(daily_pnl) OVER (
        PARTITION BY portfolio_id
        ORDER BY transaction_date
        ROWS UNBOUNDED PRECEDING
    ) AS running_pnl
FROM FactTransaction
```

**CTEs** — Common Table Expressions defined with the `WITH` clause. Name intermediate result sets to make complex queries readable.

```sql
WITH
    monthly_returns AS (
        SELECT
            portfolio_id,
            DATE_TRUNC('month', transaction_date) AS month,
            SUM(pnl) AS monthly_pnl
        FROM FactTransaction
        GROUP BY portfolio_id, DATE_TRUNC('month', transaction_date)
    ),
    portfolio_benchmarks AS (
        SELECT portfolio_id, benchmark_return
        FROM DimPortfolio
    )
SELECT
    r.portfolio_id,
    r.month,
    r.monthly_pnl,
    r.monthly_pnl - b.benchmark_return AS alpha
FROM monthly_returns r
JOIN portfolio_benchmarks b ON b.portfolio_id = r.portfolio_id
ORDER BY r.month DESC
```

**Query optimization** — understanding execution plans, index usage, and how the database engine processes joins and filters.

---

## Section 2 — Alex's story

### The situation at FTTG Finance

The trading system was a normalized OLTP database — 40+ tables, multiple joins required to reconstruct a single complete transaction record, no historical snapshots, no aggregation tables. The finance team had no access to it directly. They worked from Excel exports that the IT team generated on request.

The ask was a data model that the finance team could query directly and that Power BI could report against — accurate, auditable, and fast enough that a monthly P&L report ran in seconds rather than requiring three days of manual work.

### What Alex built

**Source analysis.** Alex mapped the trading system schema and identified the four tables that contained everything needed: `trades`, `positions`, `securities_master`, and `accounts`. Everything else was lookup data.

**Star schema design.** Four dimension tables and one fact table:

```sql
-- Dimension: Portfolio
CREATE TABLE DimPortfolio (
    portfolio_key   INT IDENTITY PRIMARY KEY,
    portfolio_id    VARCHAR(20) NOT NULL,
    portfolio_name  VARCHAR(100) NOT NULL,
    asset_class     VARCHAR(50),
    benchmark       VARCHAR(50),
    manager_name    VARCHAR(100)
);

-- Dimension: Security
CREATE TABLE DimSecurity (
    security_key    INT IDENTITY PRIMARY KEY,
    ticker          VARCHAR(20) NOT NULL,
    security_name   VARCHAR(200),
    asset_type      VARCHAR(50),
    sector          VARCHAR(50),
    currency        VARCHAR(10)
);

-- Dimension: Date
CREATE TABLE DimDate (
    date_key        INT PRIMARY KEY,  -- YYYYMMDD integer
    full_date       DATE NOT NULL,
    year            INT,
    quarter         INT,
    month           INT,
    month_name      VARCHAR(20),
    week_of_year    INT,
    is_trading_day  BIT
);

-- Fact: Transaction
CREATE TABLE FactTransaction (
    transaction_key     BIGINT IDENTITY PRIMARY KEY,
    date_key            INT NOT NULL REFERENCES DimDate(date_key),
    portfolio_key       INT NOT NULL REFERENCES DimPortfolio(portfolio_key),
    security_key        INT NOT NULL REFERENCES DimSecurity(security_key),
    transaction_type    VARCHAR(20),  -- BUY, SELL, DIVIDEND
    quantity            DECIMAL(18,4),
    price               DECIMAL(18,6),
    gross_amount        DECIMAL(18,2),
    fees                DECIMAL(18,2),
    net_amount          DECIMAL(18,2),
    pnl                 DECIMAL(18,2)
);
```

**ETL stored procedure.** A nightly SQL Server Agent job called a stored procedure that extracted from the trading system tables, applied transformation logic, and loaded into the star schema using `MERGE` statements for idempotency.

```sql
-- Upsert into DimSecurity using MERGE
MERGE DimSecurity AS target
USING (
    SELECT DISTINCT
        ticker,
        security_name,
        asset_type,
        sector,
        currency
    FROM trading_system.dbo.securities_master
) AS source
ON target.ticker = source.ticker
WHEN MATCHED THEN
    UPDATE SET
        security_name = source.security_name,
        sector        = source.sector
WHEN NOT MATCHED THEN
    INSERT (ticker, security_name, asset_type, sector, currency)
    VALUES (source.ticker, source.security_name, source.asset_type, source.sector, source.currency);
```

**Key queries for the finance team.** Alex documented a library of standard SQL queries the finance team could run directly — monthly P&L by portfolio, YTD returns, performance vs benchmark, top holdings by position size. These were also the basis for the Power BI measures.

### The outcome

The three-day monthly reconciliation process was replaced by a report that refreshed nightly and was accurate by 6am on the first of each month. The finance team could drill from a portfolio-level P&L summary down to individual transactions in three clicks. The Excel master spreadsheet was archived.

---

## Section 3 — Interview Q&A

**Q: What is the difference between a star schema and a snowflake schema, and which do you prefer?**

A star schema has dimension tables that are fully denormalized — all attributes of a dimension are in one table. A snowflake schema normalizes dimensions into sub-tables to reduce redundancy.

I default to star schema for BI and reporting workloads. The denormalization means fewer joins at query time, which translates to better performance in analytical databases and in Power BI's VertiPaq engine. The extra storage cost of redundant attributes is negligible compared to the read performance gain.

I use a snowflake schema when storage cost is a genuine constraint or when a dimension has a natural hierarchy that benefits from normalization — a product dimension with a product, subcategory, and category hierarchy is sometimes cleaner as three tables. But I always validate that the join cost at query time is acceptable before committing to it.

---

**Q: What is the difference between OLTP and OLAP, and why does it matter for data modeling?**

OLTP systems are designed for transactional writes — fast inserts and updates of individual records. They are highly normalized to minimize redundancy and enforce data integrity. A trading system, an ERP, a CRM — all OLTP.

OLAP systems are designed for analytical reads — fast aggregations across large volumes of data. They are denormalized for read performance. A data warehouse, a Lakehouse, a Power BI dataset — all OLAP.

It matters because you almost never report directly off an OLTP source. The normalization that makes writes fast makes analytical queries slow. Part of the data modeling job is transforming OLTP data into an OLAP-friendly structure — typically a star schema — that can serve reporting at scale.

At FTTG Finance, the trading system was a classic OLTP database with 40+ normalized tables. The star schema I built on top of it reduced a complex 8-table join down to a single fact table query.

---

**Q: Explain window functions and give an example of when you would use one.**

Window functions perform a calculation across a set of rows related to the current row, without collapsing the result set the way a `GROUP BY` would. They use an `OVER` clause to define the window — the partition and ordering.

I use them constantly for running totals, rankings, period-over-period comparisons, and lead/lag calculations. At FTTG Finance, running P&L by portfolio was a `SUM() OVER (PARTITION BY portfolio_id ORDER BY date ROWS UNBOUNDED PRECEDING)`. That gave us a cumulative P&L line on every row without a separate self-join or subquery.

The key ones to know for interviews: `ROW_NUMBER`, `RANK`, `DENSE_RANK`, `LAG`, `LEAD`, `SUM OVER`, `AVG OVER`, and `FIRST_VALUE` / `LAST_VALUE`.

---

**Q: How do you approach query optimization when a report is running slowly?**

I start by looking at the execution plan — in SQL Server that is the actual execution plan in SSMS, in Snowflake it is the query profile. The plan tells you where the cost is: table scans that should be index seeks, hash joins on large tables that could be reduced with better filtering, spills to disk indicating memory pressure.

The most common quick wins are: adding a covering index on the columns used in the `WHERE` clause and `JOIN` conditions, filtering earlier in the query to reduce the rows being joined, and replacing correlated subqueries with CTEs or joins.

At FTTG Finance, a monthly P&L summary query was running for 45 seconds. The execution plan showed a full table scan on `FactTransaction` because the `WHERE` clause was filtering on a computed expression — `YEAR(transaction_date) = 2024`. The engine could not use the index on `transaction_date` because of the function wrapping it. Rewriting the filter as a range — `transaction_date >= '2024-01-01' AND transaction_date < '2025-01-01'` — brought it down to under two seconds.

---

## Section 4 — Pitfalls

**Pitfall 1 — Reporting directly off OLTP.**
Candidates who have only worked with small datasets sometimes describe connecting Power BI directly to an ERP or CRM database. For a demo, fine. For a production reporting solution at scale, it is a performance disaster and a governance problem. A senior engineer knows to model the data first.

**Pitfall 2 — Not knowing surrogate keys.**
Star schemas use surrogate keys — integer identity columns — as primary keys on dimension tables, not the natural business keys from the source system. Business keys change. A company gets acquired and ticker symbols change. A patient gets a new medical record number. Surrogate keys insulate the fact table from those changes. If you describe a star schema without mentioning surrogate keys, an experienced interviewer will ask about it.

**Pitfall 3 — Using functions in WHERE clauses.**
This is one of the most common query performance mistakes. Wrapping a column in a function — `YEAR(date)`, `UPPER(name)`, `CAST(id AS VARCHAR)` — prevents the database from using an index on that column. Know this cold and mention it proactively when talking about optimization.

**Pitfall 4 — Describing GROUP BY without mentioning window functions.**
If your answer to aggregation questions only mentions `GROUP BY`, you are signalling a junior SQL skill level. Window functions are the tool that separates analysts who can run reports from engineers who can build performant pipelines. Know them, name them, give an example.

---

*Part of the FTTG Learn Interview Prep Series — [Back to context guide](./fttg-interview-prep-context)*
