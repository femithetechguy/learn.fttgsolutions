# SQL Thinks in Sets

Most people learn SQL the wrong way. They approach it like a scripting language — write some instructions, loop through some rows, do something to each one. When it doesn't behave the way they expect, they add more conditions, more subqueries, more complexity, until it works. Barely.

The confusion isn't a syntax problem. It's a thinking problem. SQL doesn't operate on rows one at a time. It operates on *sets*. Every query is a description of a set of data you want — and the database figures out how to produce it.

Once that lands, SQL gets dramatically simpler.

## The Difference Between Row Thinking and Set Thinking

In row thinking, you imagine a cursor moving through a table, applying logic to each record in turn. This is how most general-purpose languages work. You loop, you check, you accumulate.

In set thinking, you describe the shape of what you want. The `WHERE` clause doesn't filter one row at a time — it defines which subset of the table belongs in your result. The `JOIN` doesn't fetch related rows one by one — it defines a new, combined set from two sources.

This isn't just academic. It changes how you write queries.

**Row thinking** leads you to write things like:

```sql
SELECT *
FROM orders
WHERE customer_id IN (
  SELECT customer_id FROM customers WHERE country = 'NG'
)
```

**Set thinking** leads you to the same result with more clarity:

```sql
SELECT o.*
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
WHERE c.country = 'NG'
```

The second query isn't just shorter — it's describing a relationship between two sets. Customers in Nigeria, and their orders. The database can optimise that relationship in ways a correlated subquery often can't.

## Why Aggregations Finally Make Sense

`GROUP BY` is where row thinkers get lost. The error message `column must appear in GROUP BY or aggregate function` feels arbitrary and hostile.

It isn't. It's enforcing set logic.

When you `GROUP BY country`, you're collapsing the orders table into a new set where each row represents a country — not a single order. In that new set, individual order fields (like `order_id` or `amount`) no longer exist as single values. They exist as *groups of values*. You can only refer to them through an aggregation — `SUM`, `COUNT`, `MAX` — that reduces a group to a single value.

```sql
SELECT
  country,
  COUNT(*)        AS total_orders,
  SUM(amount)     AS total_revenue,
  AVG(amount)     AS avg_order_value
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
GROUP BY country
ORDER BY total_revenue DESC
```

Read this as: *collapse all orders into groups by country, then describe each group*. Once you think of `GROUP BY` as defining a new grouped set rather than "sorting rows into buckets", the rule stops feeling arbitrary.

## NULLs and the Three-Valued Logic

SQL has a third logical value beyond `TRUE` and `FALSE`: `UNKNOWN`. This is what you get when either side of a comparison involves `NULL`.

`NULL = NULL` is not `TRUE`. It's `UNKNOWN`. This trips up almost everyone at some point.

```sql
-- This returns no rows, even if nulls exist
SELECT * FROM users WHERE last_login = NULL

-- This is correct
SELECT * FROM users WHERE last_login IS NULL
```

`NULL` means the absence of a value — not zero, not empty string, not false. Comparing the absence of something to anything produces an unknown result, which SQL treats as not matching. Use `IS NULL` and `IS NOT NULL` explicitly.

## CTEs Are Your Best Friend

Common Table Expressions (`WITH` clauses) are how you make complex queries readable. Instead of nesting subqueries five layers deep, you name intermediate sets and build on them:

```sql
WITH
  nigerian_customers AS (
    SELECT customer_id, name
    FROM customers
    WHERE country = 'NG'
  ),
  their_orders AS (
    SELECT o.*, c.name AS customer_name
    FROM orders o
    JOIN nigerian_customers c ON c.customer_id = o.customer_id
  )
SELECT
  customer_name,
  COUNT(*)   AS order_count,
  SUM(amount) AS lifetime_value
FROM their_orders
GROUP BY customer_name
ORDER BY lifetime_value DESC
```

Each CTE is a named set. You define it once, use it below. The query reads like a sentence: first define Nigerian customers, then get their orders, then summarise by customer.

## The Mental Model That Unlocks Everything

SQL rewards you for thinking about *relationships between sets* rather than operations on individual rows. When a query isn't working, the right question isn't "what's wrong with this row?" — it's "what set am I actually describing, and is that the set I want?"

Ask that question before you write a single line. Name the set you're building. Describe what belongs in it and what doesn't. Then translate that description into SQL.

The syntax is the easy part. The thinking is the skill.
