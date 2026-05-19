# Power Query M Cheat Sheet Guide

> Quick reference for Power Query M — the functional language behind Power BI and Excel data transformations. Covers values, operators, text, numbers, dates, lists, records, and tables.

📋 **Quick reference:** [Power Query M Cheat Sheet](/cheatsheets/m-code) — use this alongside the guide for fast syntax lookup while you read.

---

## Core Concepts

### Power Query
Power Query is the data transformation engine built into Power BI, Excel, and Microsoft Fabric. It lets you connect to data sources, clean and reshape data, and load it into a model — without writing SQL or Python. Every transformation you apply in the Power Query Editor generates M code behind the scenes.

### Power Query M
M (officially "Power Query Formula Language") is the functional language that powers every transformation in Power Query. It is case-sensitive, expression-based, and lazy — steps are only evaluated when needed. You write M directly in the Advanced Editor or it is generated automatically by the UI.

### Expression
Everything in M is an expression that evaluates to a value. A value can be a number, text, a list, a record, or a table. There are no statements or loops in the traditional sense — just expressions that produce values.
```m
// A simple expression
1 + 1  // evaluates to 2

// A text expression
"Hello" & " " & "World"  // evaluates to "Hello World"
```

### Query (let...in)
A query is a `let...in` expression. `let` defines named steps. `in` specifies which step is the final output.
```m
let
    Source     = Csv.Document(File.Contents("C:\data\sales.csv")),
    Promoted   = Table.PromoteHeaders(Source),
    TypedCols  = Table.TransformColumnTypes(Promoted, {
                     {"Date",   type date},
                     {"Amount", type number}
                 }),
    Filtered   = Table.SelectRows(TypedCols, each [Amount] > 0)
in
    Filtered
```

### Comments
M supports single-line and multi-line comments.
```m
// This is a single-line comment

/* This is a
   multi-line comment */
```

---

## Creating Values

### Number
Integer and decimal number literals.
```m
42        // integer
3.14      // decimal
-100      // negative
1.5e3     // scientific notation = 1500
```

### Text
Text values are enclosed in double quotes. Use `#(lf)` for a line feed, `#(tab)` for a tab.
```m
"Hello World"
"Line 1#(lf)Line 2"   // newline inside text
"Tab#(tab)separated"
```

### Logical
Boolean values — always lowercase in M.
```m
true
false
```

### Null
Represents the absence of a value.
```m
null
```

### Date
Date literals use the `#date` constructor.
```m
#date(2024, 6, 15)   // June 15, 2024
```

### Datetime
Datetime literals use the `#datetime` constructor.
```m
#datetime(2024, 6, 15, 9, 30, 0)   // June 15 2024 09:30:00
```

### Duration
Duration literals use the `#duration` constructor — days, hours, minutes, seconds.
```m
#duration(1, 2, 30, 0)   // 1 day, 2 hours, 30 minutes
#duration(0, 0, 0, 45)   // 45 seconds
```

### List
An ordered collection of values, enclosed in curly braces.
```m
{1, 2, 3, 4, 5}
{"apple", "banana", "cherry"}
{1, "mixed", true, null}          // lists can hold mixed types
{1..10}                           // range shorthand: 1 to 10
```

### Record
A set of named fields enclosed in square brackets. Like a row or a JSON object.
```m
[Name = "Alex", Age = 30, Active = true]
```

### Table
A structured collection of rows and columns. Usually produced by a data source function or a `Table.From*` function.
```m
#table(
    {"Name",  "Sales"},
    {
        {"North", 42000},
        {"South", 38000},
        {"East",  51000}
    }
)
```

---

## Variables & Queries

### let...in
The foundation of every M query. Each step in `let` is a named variable referencing the previous step.
```m
let
    RawData    = Excel.Workbook(File.Contents("C:\sales.xlsx"), true),
    SalesSheet = RawData{[Item="Sales", Kind="Sheet"]}[Data],
    Promoted   = Table.PromoteHeaders(SalesSheet),
    Cleaned    = Table.SelectRows(Promoted, each [Region] <> null)
in
    Cleaned
```

### Naming conventions
Step names can contain spaces if wrapped in `#"..."`. Descriptive names make queries readable.
```m
let
    #"Raw Source"       = Csv.Document(...),
    #"Promoted Headers" = Table.PromoteHeaders(#"Raw Source"),
    #"Removed Nulls"    = Table.SelectRows(#"Promoted Headers", each [ID] <> null)
in
    #"Removed Nulls"
```

### Step reference
Each step is just a variable. You reference a previous step by name to build on it.
```m
let
    Source   = ...,
    Step2    = Table.PromoteHeaders(Source),   // references Source
    Step3    = Table.SelectRows(Step2, ...)    // references Step2
in
    Step3
```

---

## Operators

### Arithmetic
Standard math operators.
```m
5 + 3    // 8
10 - 4   // 6
6 * 7    // 42
15 / 4   // 3.75
```

### Comparison
Return `true` or `false`. M comparisons are type-sensitive.
```m
5 > 3     // true
5 < 3     // false
5 = 5     // true  (single = for equality)
5 <> 3    // true  (not equal)
5 >= 5    // true
5 <= 4    // false
```

### Logical
Combine boolean expressions.
```m
true and false   // false
true or false    // true
not true         // false
```

### Text concatenation &
Join two text values with `&`.
```m
"Hello" & " " & "World"   // "Hello World"
"FY" & Text.From(2024)    // "FY2024"
```

### List concatenation &
Combine two lists with `&`.
```m
{1, 2, 3} & {4, 5, 6}    // {1, 2, 3, 4, 5, 6}
{"a", "b"} & {"c"}        // {"a", "b", "c"}
```

### is / as (type)
`is` tests whether a value is of a type. `as` asserts a type (errors if wrong).
```m
42 is number        // true
"hello" is text     // true
42 is text          // false

42 as number        // 42
"hello" as number   // error
```

### ? (optional)
Append `?` to a type to allow null values without error.
```m
42 as number?       // 42
null as number?     // null (no error)
```

---

## Text Functions

### Text.Length
Return the number of characters in a text value.
```m
Text.Length("Hello")          // 5
Text.Length([ProductCode])    // length of each code
```

### Text.Upper / Lower / Proper
Convert text to uppercase, lowercase, or title case.
```m
Text.Upper("hello world")    // "HELLO WORLD"
Text.Lower("HELLO WORLD")    // "hello world"
Text.Proper("hello world")   // "Hello World"
```

### Text.Start / End
Extract N characters from the start or end of a string.
```m
Text.Start("SKU-001-A", 3)   // "SKU"
Text.End("SKU-001-A", 1)     // "A"
```

### Text.Middle
Extract a substring by start position and length (zero-indexed).
```m
// Text.Middle(text, start, count)
Text.Middle("SKU-001-A", 4, 3)   // "001"
```

### Text.Range
Extract a substring by start position and optional length (zero-indexed).
```m
Text.Range("Hello World", 6)      // "World"
Text.Range("Hello World", 0, 5)   // "Hello"
```

### Text.Split
Split a text string into a list using a delimiter.
```m
Text.Split("North,South,East", ",")   // {"North", "South", "East"}
Text.Split("2024-06-15", "-")         // {"2024", "06", "15"}
```

### Text.Combine
Join a list of text values into a single string with an optional separator.
```m
Text.Combine({"North", "South", "East"}, ", ")   // "North, South, East"
Text.Combine({"2024", "06", "15"}, "-")          // "2024-06-15"
```

### Text.Replace
Replace all occurrences of a substring with another.
```m
Text.Replace("Hello World", "World", "M Code")   // "Hello M Code"
Text.Replace([Phone], "-", "")                   // remove dashes
```

### Text.Contains
Return true if a text value contains a substring.
```m
Text.Contains("Power BI Desktop", "BI")     // true
Text.Contains("Power BI Desktop", "DAX")    // false
```

### Text.StartsWith / EndsWith
Return true if text starts or ends with a given value.
```m
Text.StartsWith("SKU-001", "SKU")   // true
Text.EndsWith("report.csv", ".csv") // true
```

### Text.Trim / TrimStart / TrimEnd
Remove whitespace. `Trim` removes both sides; `TrimStart` removes leading; `TrimEnd` removes trailing.
```m
Text.Trim("  Hello World  ")       // "Hello World"
Text.TrimStart("  Hello World  ")  // "Hello World  "
Text.TrimEnd("  Hello World  ")    // "  Hello World"
```

### Text.PadStart / PadEnd
Pad a string to a minimum length with a specified character.
```m
Text.PadStart("42", 5, "0")    // "00042"
Text.PadEnd("North", 10, " ")  // "North     "
```

### Text.From
Convert any value to its text representation.
```m
Text.From(42)            // "42"
Text.From(3.14)          // "3.14"
Text.From(true)          // "true"
Text.From(#date(2024,6,15))  // "2024-06-15"
```

### Text.ToList
Convert a text string into a list of individual characters.
```m
Text.ToList("ABC")   // {"A", "B", "C"}
```

---

## Number Functions

### Number.Abs
Return the absolute value.
```m
Number.Abs(-42)   // 42
Number.Abs(42)    // 42
```

### Number.Round
Round to a specified number of decimal places.
```m
Number.Round(3.14159, 2)   // 3.14
Number.Round(2.5, 0)       // 3
```

### Number.RoundUp / RoundDown
Always round up or always round down.
```m
Number.RoundUp(3.1, 0)     // 4
Number.RoundDown(3.9, 0)   // 3
```

### Number.IntegerDivide
Return the integer quotient of a division (no remainder).
```m
Number.IntegerDivide(17, 5)   // 3
```

### Number.Mod
Return the remainder of a division.
```m
Number.Mod(17, 5)   // 2
Number.Mod(10, 2)   // 0
```

### Number.Power
Raise a number to a power.
```m
Number.Power(2, 10)   // 1024
Number.Power(9, 0.5)  // 3 (square root)
```

### Number.Sqrt
Return the square root.
```m
Number.Sqrt(144)   // 12
Number.Sqrt(2)     // 1.4142...
```

### Number.Ln / Exp
Natural logarithm and its inverse (e to the power of x).
```m
Number.Ln(1)      // 0
Number.Exp(1)     // 2.71828... (e)
```

### Number.Log
Logarithm with a specified base.
```m
Number.Log(100, 10)   // 2
Number.Log(8, 2)      // 3
```

### Number.IsNaN
Return true if a value is Not a Number (NaN).
```m
Number.IsNaN(0/0)    // true
Number.IsNaN(42)     // false
```

### Number.From
Convert a value to a number.
```m
Number.From("42")      // 42
Number.From(true)      // 1
Number.From(false)     // 0
```

### Number.ToText
Convert a number to text with optional format and culture.
```m
Number.ToText(1234567.89, "N2")    // "1,234,567.89"
Number.ToText(0.852, "P1")        // "85.2%"
```

### Value.Equals
Test deep equality between two values of any type.
```m
Value.Equals({1,2,3}, {1,2,3})    // true
Value.Equals([A=1], [A=1])        // true
```

---

## Date & Time Functions

### Date.From
Convert a value to a date.
```m
Date.From("2024-06-15")              // #date(2024, 6, 15)
Date.From(#datetime(2024,6,15,9,0,0)) // #date(2024, 6, 15)
```

### DateTime.LocalNow
Return the current local date and time.
```m
DateTime.LocalNow()   // current datetime on the machine
```

### Date.Year / Month / Day
Extract the year, month, or day from a date.
```m
Date.Year(#date(2024, 6, 15))    // 2024
Date.Month(#date(2024, 6, 15))   // 6
Date.Day(#date(2024, 6, 15))     // 15
```

### Date.DayOfWeek
Return the day of week as a number. Optional second argument sets the first day of the week.
```m
// Day.Monday makes Monday = 0
Date.DayOfWeek(#date(2024, 6, 15), Day.Monday)   // returns 5 (Saturday)
```

### Date.WeekOfYear
Return the week number of the year.
```m
Date.WeekOfYear(#date(2024, 6, 15))   // 24
```

### Date.QuarterOfYear
Return the quarter number (1–4).
```m
Date.QuarterOfYear(#date(2024, 6, 15))   // 2
```

### Date.AddDays / Months / Years
Add a specified number of days, months, or years to a date.
```m
Date.AddDays(#date(2024, 6, 15), 30)     // #date(2024, 7, 15)
Date.AddMonths(#date(2024, 6, 15), 3)    // #date(2024, 9, 15)
Date.AddYears(#date(2024, 6, 15), 1)     // #date(2025, 6, 15)
```

### Date.StartOfMonth / EndOfMonth
Return the first or last day of the month.
```m
Date.StartOfMonth(#date(2024, 6, 15))   // #date(2024, 6, 1)
Date.EndOfMonth(#date(2024, 6, 15))     // #date(2024, 6, 30)
```

### Date.StartOfYear / EndOfYear
Return the first or last day of the year.
```m
Date.StartOfYear(#date(2024, 6, 15))   // #date(2024, 1, 1)
Date.EndOfYear(#date(2024, 6, 15))     // #date(2024, 12, 31)
```

### Duration.Days / TotalHours
Extract components from a duration value.
```m
Duration.Days(#duration(3, 4, 30, 0))        // 3
Duration.TotalHours(#duration(1, 6, 0, 0))   // 30
```

### Date difference
Subtract two dates to get a duration, then extract the component you need.
```m
let
    Start    = #date(2024, 1, 1),
    End      = #date(2024, 6, 15),
    Diff     = End - Start,
    DaysApart = Duration.Days(Diff)   // 166
in
    DaysApart
```

---

## List Functions

### List creation
Create lists with literal syntax or range shorthand.
```m
{1, 2, 3}           // explicit list
{1..10}             // range: 1 to 10
{"a".."e"}          // character range: {"a","b","c","d","e"}
{}                  // empty list
```

### List.Count
Return the number of items in a list.
```m
List.Count({10, 20, 30, 40})   // 4
```

### List.First / Last
Return the first or last item.
```m
List.First({10, 20, 30})   // 10
List.Last({10, 20, 30})    // 30
```

### List.FirstN / LastN
Return the first or last N items as a list.
```m
List.FirstN({10, 20, 30, 40, 50}, 3)   // {10, 20, 30}
List.LastN({10, 20, 30, 40, 50}, 2)    // {40, 50}
```

### List.Distinct
Remove duplicate values.
```m
List.Distinct({"a", "b", "a", "c", "b"})   // {"a", "b", "c"}
```

### List.Select
Filter a list to items that satisfy a condition.
```m
List.Select({1, 2, 3, 4, 5, 6}, each _ > 3)   // {4, 5, 6}
List.Select({"apple","ant","banana"}, each Text.StartsWith(_, "a"))
// {"apple", "ant"}
```

### List.Transform
Apply a function to every item in a list and return the results.
```m
List.Transform({1, 2, 3, 4}, each _ * 2)         // {2, 4, 6, 8}
List.Transform({"hello", "world"}, Text.Upper)    // {"HELLO", "WORLD"}
```

### List.Sort
Sort a list. Default is ascending; pass `Order.Descending` for descending.
```m
List.Sort({3, 1, 4, 1, 5, 9})                    // {1, 1, 3, 4, 5, 9}
List.Sort({3, 1, 4, 1, 5, 9}, Order.Descending)  // {9, 5, 4, 3, 1, 1}
```

### List.Reverse
Reverse the order of a list.
```m
List.Reverse({1, 2, 3, 4, 5})   // {5, 4, 3, 2, 1}
```

### List.Contains / ContainsAny / All
Test whether a list contains a value, any value from another list, or all values.
```m
List.Contains({"a","b","c"}, "b")                   // true
List.ContainsAny({"a","b","c"}, {"b","x"})          // true (b matches)
List.ContainsAll({"a","b","c"}, {"a","b"})          // true
```

### List.MatchesAny / All
Test whether any or all items in a list satisfy a condition.
```m
List.MatchesAny({1, 2, 3, 4}, each _ > 3)    // true (4 > 3)
List.MatchesAll({1, 2, 3, 4}, each _ > 0)    // true (all positive)
```

### List.RemoveNulls
Remove all null values from a list.
```m
List.RemoveNulls({1, null, 2, null, 3})   // {1, 2, 3}
```

### List.RemoveRange
Remove a range of items by start index and count.
```m
// List.RemoveRange(list, index, count)
List.RemoveRange({1, 2, 3, 4, 5}, 1, 2)   // {1, 4, 5}
```

### List.Repeat
Repeat a list N times.
```m
List.Repeat({1, 2}, 3)   // {1, 2, 1, 2, 1, 2}
```

### List.Combine
Concatenate multiple lists into one.
```m
List.Combine({{1, 2}, {3, 4}, {5, 6}})   // {1, 2, 3, 4, 5, 6}
```

### List.Split
Split a list into sublists of a specified size.
```m
List.Split({1, 2, 3, 4, 5, 6}, 2)
// {{1, 2}, {3, 4}, {5, 6}}
```

### List.Min / Max / Sum / Average
Aggregate functions over a list.
```m
List.Min({3, 1, 4, 1, 5})      // 1
List.Max({3, 1, 4, 1, 5})      // 5
List.Sum({10, 20, 30})          // 60
List.Average({10, 20, 30})      // 20
```

### List.Product / StandardDeviation
Multiply all values or calculate standard deviation.
```m
List.Product({2, 3, 4})           // 24
List.StandardDeviation({2,4,4,4,5,5,7,9})  // 2
```

### List.Union / Intersect / Difference
Set operations on lists.
```m
List.Union({{1,2,3},{2,3,4}})          // {1, 2, 3, 4}
List.Intersect({{1,2,3},{2,3,4}})      // {2, 3}
List.Difference({1,2,3,4},{2,4})       // {1, 3}
```

### List.Numbers
Generate a list of numbers from a start, with a count and optional step.
```m
List.Numbers(1, 5)        // {1, 2, 3, 4, 5}
List.Numbers(0, 5, 2)     // {0, 2, 4, 6, 8}
```

### List.Dates
Generate a list of dates from a start, with a count and duration step.
```m
List.Dates(
    #date(2024, 1, 1),
    12,
    #duration(31, 0, 0, 0)
)
// Approximately one date per month for 12 months
```

### List.Generate
Generate a list by iterating with an initial state, condition, and next-state function.
```m
// Generate powers of 2 up to 512
List.Generate(
    () => 1,
    each _ <= 512,
    each _ * 2
)
// {1, 2, 4, 8, 16, 32, 64, 128, 256, 512}
```

### List.SingleOrDefault
Return the single item in a list, or a default value if the list is empty or has multiple items.
```m
List.SingleOrDefault({42})        // 42
List.SingleOrDefault({}, 0)       // 0
List.SingleOrDefault({1,2}, -1)   // -1 (multiple items)
```

---

## Record Functions

### Record creation
Create a record with named fields using square bracket syntax.
```m
[Name = "Alex", Role = "Engineer", Active = true]
```

### Record.Field
Access a field value by name as a function call.
```m
Record.Field([Name = "Alex", Age = 30], "Name")   // "Alex"
```

### record[FieldName]
Access a field value using dot-style lookup — more common in practice.
```m
let r = [Name = "Alex", Age = 30]
in  r[Name]   // "Alex"
```

### Record.FieldNames / Values
Return a list of all field names or all field values.
```m
Record.FieldNames([A = 1, B = 2, C = 3])    // {"A", "B", "C"}
Record.FieldValues([A = 1, B = 2, C = 3])   // {1, 2, 3}
```

### Record.HasFields
Return true if a record contains the specified field(s).
```m
Record.HasFields([A = 1, B = 2], "A")          // true
Record.HasFields([A = 1, B = 2], {"A", "C"})   // false (C missing)
```

### Record.AddField
Add a new field to a record.
```m
Record.AddField([Name = "Alex"], "Role", "Engineer")
// [Name = "Alex", Role = "Engineer"]
```

### Record.RemoveFields
Remove one or more fields from a record.
```m
Record.RemoveFields([A = 1, B = 2, C = 3], {"B", "C"})
// [A = 1]
```

### Record.RenameFields
Rename fields by providing a list of old/new name pairs.
```m
Record.RenameFields(
    [first_name = "Alex", last_name = "Mensah"],
    {{"first_name", "FirstName"}, {"last_name", "LastName"}}
)
// [FirstName = "Alex", LastName = "Mensah"]
```

### Record.ToTable
Convert a record to a two-column table with Name and Value columns.
```m
Record.ToTable([Region = "North", Sales = 42000])
// Table: Name | Value
//        Region | North
//        Sales  | 42000
```

### Record.FromList
Create a record from a list of values and a list of field names.
```m
Record.FromList({"Alex", 30, true}, {"Name", "Age", "Active"})
// [Name = "Alex", Age = 30, Active = true]
```

---

## Table Functions

### Table.FromRecords
Create a table from a list of records. Each record becomes a row.
```m
Table.FromRecords({
    [Name = "Alex",  Sales = 42000],
    [Name = "Sarah", Sales = 51000],
    [Name = "James", Sales = 38000]
})
```

### Table.RowCount / ColumnCount
Return the number of rows or columns.
```m
Table.RowCount(Source)     // e.g. 1500
Table.ColumnCount(Source)  // e.g. 12
```

### Table.ColumnNames
Return a list of column names.
```m
Table.ColumnNames(Source)   // {"ID", "Name", "Date", "Amount"}
```

### Table.SelectRows
Filter rows using a condition. `each` is shorthand for a row function.
```m
Table.SelectRows(Source, each [Region] = "North")
Table.SelectRows(Source, each [Amount] > 1000 and [Status] = "Active")
```

### Table.AddColumn
Add a new calculated column.
```m
Table.AddColumn(Source, "FullName", each [FirstName] & " " & [LastName])

Table.AddColumn(Source, "Margin",
    each [Revenue] - [Cost],
    type number
)
```

### Table.TransformColumns
Apply a transformation function to one or more existing columns.
```m
Table.TransformColumns(Source, {
    {"Name",   Text.Proper},
    {"Email",  Text.Lower},
    {"Amount", each _ * 1.1, type number}
})
```

### Table.TransformColumnTypes
Set the data type of one or more columns.
```m
Table.TransformColumnTypes(Source, {
    {"OrderDate",  type date},
    {"Amount",     type number},
    {"CustomerID", type text}
})
```

### Table.RemoveColumns
Remove one or more columns by name.
```m
Table.RemoveColumns(Source, {"TempCol", "InternalID"})
```

### Table.SelectColumns
Keep only the specified columns — drops everything else.
```m
Table.SelectColumns(Source, {"CustomerID", "Name", "OrderDate", "Amount"})
```

### Table.RenameColumns
Rename columns by providing old/new name pairs.
```m
Table.RenameColumns(Source, {
    {"customer_id",  "CustomerID"},
    {"order_date",   "OrderDate"},
    {"total_amount", "TotalAmount"}
})
```

### Table.ReorderColumns
Reorder columns to a specified sequence.
```m
Table.ReorderColumns(Source, {"ID", "Date", "Name", "Amount"})
```

### Table.Sort
Sort a table by one or more columns.
```m
Table.Sort(Source, {{"OrderDate", Order.Descending}})

// Multiple sort columns
Table.Sort(Source, {
    {"Region",    Order.Ascending},
    {"Amount",    Order.Descending}
})
```

### Table.Group
Group rows and apply aggregations — equivalent to GROUP BY in SQL.
```m
Table.Group(Source, {"Region"}, {
    {"TotalSales", each List.Sum([Amount]),     type number},
    {"OrderCount", each Table.RowCount(_),     type number},
    {"AvgSale",    each List.Average([Amount]), type number}
})
```

### Table.PromoteHeaders
Use the first row of a table as column headers.
```m
Table.PromoteHeaders(Source, [PromoteAllScalars = true])
```

### Table.DemoteHeaders
Move column headers back to the first row as data.
```m
Table.DemoteHeaders(Source)
```

### Table.FillDown / FillUp
Fill null values in a column by propagating the nearest non-null value downward or upward.
```m
Table.FillDown(Source, {"Region", "Category"})
Table.FillUp(Source, {"Region"})
```

### Table.Pivot
Pivot a column — turn unique row values into column headers.
```m
// Turn Region values (North, South, East) into columns
Table.Pivot(
    Source,
    List.Distinct(Source[Region]),   // distinct values become column names
    "Region",                         // column to pivot
    "Amount",                         // values to aggregate
    List.Sum                          // aggregation function
)
```

### Table.Unpivot
Unpivot specified columns — turn column headers into row values. Reverse of pivot.
```m
Table.Unpivot(Source, {"Jan","Feb","Mar","Apr"}, "Month", "Amount")
// Columns Jan, Feb, Mar, Apr become rows in Month column
```

### Table.UnpivotOtherColumns
Unpivot all columns except the ones specified as identity columns.
```m
Table.UnpivotOtherColumns(Source, {"ProductID", "ProductName"}, "Month", "Amount")
```

### Table.ExpandListColumn
Expand a column containing lists — each list item becomes its own row.
```m
Table.ExpandListColumn(Source, "Tags")
```

### Table.ExpandRecordColumn
Expand a column containing records — each record field becomes its own column.
```m
Table.ExpandRecordColumn(
    Source,
    "Address",
    {"Street", "City", "PostalCode"},
    {"Address.Street", "Address.City", "Address.PostalCode"}
)
```

### Table.NestedJoin
Join two tables on a key column and store the result as a new nested table column.
```m
Table.NestedJoin(
    Orders, {"CustomerID"},
    Customers, {"CustomerID"},
    "CustomerData",
    JoinKind.LeftOuter
)
```

### Table.Join
Join two tables directly — returns a flat combined table.
```m
Table.Join(
    Orders,    {"CustomerID"},
    Customers, {"CustomerID"},
    JoinKind.Inner
)
```

### Table.Distinct
Remove duplicate rows. Optionally specify columns to compare.
```m
Table.Distinct(Source)
Table.Distinct(Source, {"CustomerID", "OrderDate"})
```

### Table.Buffer
Load the entire table into memory — prevents repeated re-evaluation of upstream steps. Use before operations that iterate over the table multiple times.
```m
Buffered = Table.Buffer(Source)
```

---

## Functions & Each

### Function definition
Define a reusable function using the `(parameters) => expression` syntax.
```m
// Named function in a let block
AddTax = (price as number, rate as number) as number =>
    price * (1 + rate),

// Call it
TotalWithTax = AddTax(100, 0.2)   // 120
```

### each shorthand
`each` is shorthand for `(_) =>` — a function that takes a single argument called `_`. Used heavily with table and list functions.
```m
// These are equivalent
Table.SelectRows(Source, each [Amount] > 100)
Table.SelectRows(Source, (_) => _[Amount] > 100)

// each in List.Transform
List.Transform({1, 2, 3, 4}, each _ * 2)
```

### each with record fields
Inside `each`, use `[FieldName]` to access a field of the current row record.
```m
// Access multiple fields per row
Table.AddColumn(Source, "Label",
    each [Region] & " - " & Text.From([Year])
)

// Conditional per row
Table.AddColumn(Source, "Tier",
    each if [Amount] >= 10000 then "High"
         else if [Amount] >= 5000 then "Mid"
         else "Low"
)
```

### Type annotation
Specify input and output types on a function for validation and documentation.
```m
CleanName = (raw as text) as text =>
    Text.Trim(Text.Proper(raw))
```

### Optional parameters
Mark a parameter optional with `optional`. It receives `null` if not provided.
```m
Greet = (name as text, optional greeting as text) as text =>
    let
        g = if greeting = null then "Hello" else greeting
    in
        g & ", " & name & "!"

Greet("Alex")              // "Hello, Alex!"
Greet("Alex", "Welcome")   // "Welcome, Alex!"
```

### ?? (null coalescing)
Return the left value if it is not null, otherwise return the right value.
```m
"value" ?? "default"   // "value"
null    ?? "default"   // "default"

// Practical use — fallback when a field might be null
[PreferredName] ?? [FirstName] ?? "Unknown"
```

---

*Part of the FTTG Learn Cheat Sheet series — [fttgsolutions.com](https://learn.fttgsolutions.com/cheatsheets)*
