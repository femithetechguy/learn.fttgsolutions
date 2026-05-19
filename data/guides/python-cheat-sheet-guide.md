# Python Cheat Sheet Guide

> Quick reference for Python syntax and built-ins — variables, strings, lists, dicts, loops, functions, classes, file I/O, and more.

📋 **Quick reference:** [Python Cheat Sheet](/cheatsheets/python) — use this alongside the guide for fast syntax lookup while you read.

---

## Getting Started

### print()
Output a value to the console. Accepts multiple arguments separated by commas.
```python
print("Hello, World!")
print("Name:", "Alex", "| Age:", 30)
print("Line 1\nLine 2")        # \n = newline
print("A", "B", "C", sep="-") # A-B-C
print("No newline", end=" ")   # suppress newline
```

### Variables
Assign a value to a name. Python is dynamically typed — no type declaration needed.
```python
name = "Alex"
age = 30
score = 98.5
is_active = True
result = None   # absence of value
```

### input()
Read a line of text from the user. Always returns a string — cast if you need a number.
```python
name = input("Enter your name: ")
age  = int(input("Enter your age: "))
```

### type()
Return the type of a value.
```python
type(42)          # <class 'int'>
type("hello")     # <class 'str'>
type(3.14)        # <class 'float'>
type(True)        # <class 'bool'>
type([1, 2, 3])   # <class 'list'>
```

### Comment
Single-line comment with `#`. Python ignores everything after `#` on that line.
```python
# This is a comment
x = 10  # inline comment
```

### Multiline comment
Use triple quotes for a multiline string that acts as a block comment or docstring.
```python
"""
This is a multiline comment.
Python treats it as a string literal
that is never assigned.
"""

def calculate_tax(amount):
    """
    Calculate tax at 20%.
    Returns the tax amount.
    """
    return amount * 0.2
```

---

## Data Types

### str
Text — a sequence of characters enclosed in single or double quotes.
```python
name    = "Alex Mensah"
message = 'Hello, World!'
multi   = """Line 1
Line 2"""
```

### int
Whole numbers — positive, negative, or zero. No size limit in Python.
```python
count  = 42
deficit = -100
big    = 1_000_000   # underscores for readability
```

### float
Decimal numbers.
```python
price = 3.99
pi    = 3.14159
rate  = 1.5e-3   # scientific notation = 0.0015
```

### bool
Boolean — `True` or `False`. Note the capital letters.
```python
is_active = True
has_error = False

# Truthy / falsy values
bool(0)      # False
bool("")     # False
bool(None)   # False
bool(1)      # True
bool("hi")   # True
bool([1])    # True
```

### list
An ordered, mutable collection. Items can be of any type.
```python
numbers  = [1, 2, 3, 4, 5]
names    = ["Alex", "Sarah", "James"]
mixed    = [1, "hello", True, None]
empty    = []
nested   = [[1, 2], [3, 4]]
```

### tuple
An ordered, immutable collection. Cannot be changed after creation.
```python
point      = (3, 7)
rgb        = (255, 128, 0)
single     = (42,)    # comma required for single-item tuple
empty      = ()
coordinates = (40.7128, -74.0060)
```

### dict
An unordered collection of key-value pairs. Keys must be unique and immutable.
```python
person = {
    "name":   "Alex",
    "age":    30,
    "active": True
}
empty_dict = {}
```

### set
An unordered collection of unique values. No duplicates allowed.
```python
tags    = {"python", "data", "analytics"}
numbers = {1, 2, 3, 4, 5}
empty   = set()   # not {} — that creates a dict
```

### int()
Convert a value to an integer.
```python
int("42")     # 42
int(3.99)     # 3  (truncates, does not round)
int(True)     # 1
int(False)    # 0
```

### float()
Convert a value to a float.
```python
float("3.14")   # 3.14
float(42)       # 42.0
float("1e3")    # 1000.0
```

### str()
Convert a value to a string.
```python
str(42)      # "42"
str(3.14)    # "3.14"
str(True)    # "True"
str(None)    # "None"
```

### bool()
Convert a value to a boolean.
```python
bool(1)      # True
bool(0)      # False
bool("hi")   # True
bool("")     # False
bool([])     # False
bool(None)   # False
```

---

## Arithmetic & Operators

### Addition
```python
5 + 3       # 8
"Hello" + " World"  # "Hello World" (string concatenation)
[1, 2] + [3, 4]     # [1, 2, 3, 4] (list concatenation)
```

### Subtraction
```python
10 - 4    # 6
```

### Multiplication
```python
6 * 7     # 42
"ab" * 3  # "ababab" (string repetition)
[0] * 5   # [0, 0, 0, 0, 0]
```

### Float division
Always returns a float.
```python
15 / 4    # 3.75
10 / 2    # 5.0
```

### Integer division
Returns the integer quotient — floors the result.
```python
15 // 4   # 3
-7 // 2   # -4  (floors toward negative infinity)
```

### Modulo
Returns the remainder after division.
```python
17 % 5    # 2
10 % 3    # 1
even = (n % 2 == 0)  # check if n is even
```

### Exponentiation
Raise a number to a power.
```python
2 ** 10   # 1024
9 ** 0.5  # 3.0  (square root)
```

### Compound assignment
Shorthand for updating a variable.
```python
x = 10
x += 5    # x = 15
x -= 3    # x = 12
x *= 2    # x = 24
x /= 4    # x = 6.0
x //= 2   # x = 3.0
x **= 3   # x = 27.0
x %= 5    # x = 2.0
```

### and
Return True only if both conditions are true.
```python
True and True    # True
True and False   # False

age >= 18 and has_id == True
```

### or
Return True if at least one condition is true.
```python
True or False    # True
False or False   # False

is_admin or is_manager
```

### not
Negate a boolean value.
```python
not True    # False
not False   # True
not (x > 5)
```

### is
Test identity — whether two variables point to the exact same object. Not the same as `==`.
```python
x = [1, 2, 3]
y = x
z = [1, 2, 3]

x is y    # True  (same object)
x is z    # False (equal values, different objects)
x == z    # True

# Common use: check for None
if value is None:
    print("No value")
```

---

## Strings

### Index access
Access individual characters by position. Negative indices count from the end.
```python
s = "Hello"
s[0]    # "H"
s[4]    # "o"
s[-1]   # "o"  (last character)
s[-2]   # "l"
```

### Slicing
Extract a substring with `[start:stop:step]`. Stop is exclusive.
```python
s = "Hello World"
s[0:5]    # "Hello"
s[6:11]   # "World"
s[::2]    # "HloWrd"  (every other character)
```

### Slice from start
Omit the start index to slice from the beginning.
```python
s = "Hello World"
s[:5]     # "Hello"
s[:3]     # "Hel"
```

### Slice to end
Omit the stop index to slice to the end.
```python
s = "Hello World"
s[6:]     # "World"
s[-5:]    # "World"
```

### Reverse string
Use a step of `-1` to reverse.
```python
s = "Hello"
s[::-1]   # "olleH"
```

### len()
Return the number of characters in a string (or items in a list/dict/set).
```python
len("Hello")       # 5
len("Hello World") # 11
len("")            # 0
```

### Concatenation
Join strings with `+`. For multiple values use f-strings instead.
```python
first = "Hello"
last  = "World"
full  = first + " " + last   # "Hello World"
```

### Repetition
Repeat a string N times with `*`.
```python
"ha" * 3    # "hahaha"
"-" * 40    # a divider line
```

### in operator
Check whether a substring exists in a string.
```python
"ell" in "Hello"     # True
"xyz" in "Hello"     # False
"@" in "a@b.com"     # True
```

### Loop characters
Iterate over each character in a string.
```python
for char in "Hello":
    print(char)
# H e l l o
```

### join()
Join a list of strings into one string with a separator.
```python
words = ["Power", "BI", "Report"]
" ".join(words)    # "Power BI Report"
", ".join(words)   # "Power, BI, Report"
"-".join(words)    # "Power-BI-Report"
```

### split()
Split a string into a list by a delimiter. Default splits on whitespace.
```python
"Hello World".split()          # ["Hello", "World"]
"a,b,c".split(",")             # ["a", "b", "c"]
"2024-06-15".split("-")        # ["2024", "06", "15"]
"a,b,c".split(",", maxsplit=1) # ["a", "b,c"]
```

### strip()
Remove leading and trailing whitespace (or specific characters).
```python
"  Hello  ".strip()       # "Hello"
"  Hello  ".lstrip()      # "Hello  "
"  Hello  ".rstrip()      # "  Hello"
"###Hello###".strip("#")  # "Hello"
```

### replace()
Replace all occurrences of a substring.
```python
"Hello World".replace("World", "Python")   # "Hello Python"
"a-b-c".replace("-", "")                   # "abc"
"aaa".replace("a", "b", 2)                 # "bba"  (max 2 replacements)
```

### lower() / upper()
Convert to lowercase or uppercase.
```python
"Hello World".lower()   # "hello world"
"hello world".upper()   # "HELLO WORLD"
"hello world".title()   # "Hello World"
```

### endswith()
Return True if a string ends with a given suffix. `startswith()` checks the beginning.
```python
"report.csv".endswith(".csv")      # True
"report.csv".endswith(".xlsx")     # False
"SKU-001".startswith("SKU")        # True
```

---

## String Formatting

### f-string (basic)
Embed variables directly in a string using `f"..."` and `{variable}`.
```python
name = "Alex"
age  = 30
print(f"Name: {name}, Age: {age}")   # Name: Alex, Age: 30
```

### f-string (expression)
Evaluate any expression inside `{}`.
```python
x = 5
print(f"Square: {x ** 2}")          # Square: 25
print(f"Upper: {'hello'.upper()}")  # Upper: HELLO
print(f"Sum: {2 + 3}")              # Sum: 5
```

### f-string (decimals)
Control decimal places with `:.Nf` format spec.
```python
pi = 3.14159
print(f"{pi:.2f}")   # 3.14
print(f"{pi:.4f}")   # 3.1416
```

### f-string (zero pad)
Pad a number with leading zeros using `:0Nd`.
```python
n = 42
print(f"{n:05d}")   # 00042
print(f"{n:08d}")   # 00000042
```

### f-string (thousands)
Add thousand separators with `:,`.
```python
revenue = 1234567.89
print(f"{revenue:,.2f}")   # 1,234,567.89
print(f"{revenue:,}")      # 1,234,567.89
```

### f-string (percentage)
Format a decimal as a percentage with `:.N%`.
```python
rate = 0.8523
print(f"{rate:.1%}")   # 85.2%
print(f"{rate:.0%}")   # 85%
```

### f-string (binary)
Format an integer in binary with `:b`.
```python
print(f"{255:b}")    # 11111111
print(f"{10:08b}")   # 00001010
```

### f-string (hex)
Format an integer in hexadecimal with `:x` (lowercase) or `:X` (uppercase).
```python
print(f"{255:x}")    # ff
print(f"{255:X}")    # FF
print(f"{255:#x}")   # 0xff
```

### format() method
Older string formatting using `.format()` — still common in legacy code.
```python
"Hello, {}!".format("Alex")
"Name: {name}, Age: {age}".format(name="Alex", age=30)
"{:.2f}".format(3.14159)    # "3.14"
```

### % formatting
Oldest formatting style — still seen in legacy code and logging.
```python
"Hello, %s!" % "Alex"
"Score: %.1f%%" % 98.5   # "Score: 98.5%"
"%d items" % 42
```

---

## Lists

### Create list
```python
numbers = [1, 2, 3, 4, 5]
names   = ["Alex", "Sarah", "James"]
mixed   = [1, "hello", True, None]
empty   = []
```

### From range
Generate a list from a range.
```python
list(range(5))          # [0, 1, 2, 3, 4]
list(range(1, 6))       # [1, 2, 3, 4, 5]
list(range(0, 10, 2))   # [0, 2, 4, 6, 8]
```

### append()
Add a single item to the end of the list.
```python
items = [1, 2, 3]
items.append(4)     # [1, 2, 3, 4]
items.append([5,6]) # [1, 2, 3, 4, [5, 6]]  (appends as one item)
```

### extend()
Add all items from another iterable to the end of the list.
```python
items = [1, 2, 3]
items.extend([4, 5, 6])   # [1, 2, 3, 4, 5, 6]
items.extend("abc")        # [1, 2, 3, 4, 5, 6, "a", "b", "c"]
```

### pop()
Remove and return an item by index. Default removes the last item.
```python
items = [10, 20, 30, 40]
items.pop()     # returns 40, list is now [10, 20, 30]
items.pop(0)    # returns 10, list is now [20, 30]
```

### del
Remove an item by index or remove a slice.
```python
items = [10, 20, 30, 40, 50]
del items[0]      # [20, 30, 40, 50]
del items[1:3]    # [20, 50]
del items         # deletes the variable entirely
```

### Index access
Access items by position. Negative indices count from the end.
```python
items = [10, 20, 30, 40]
items[0]    # 10
items[-1]   # 40  (last item)
items[-2]   # 30
```

### Slicing
Extract a sublist.
```python
items = [10, 20, 30, 40, 50]
items[1:4]    # [20, 30, 40]
items[:3]     # [10, 20, 30]
items[2:]     # [30, 40, 50]
items[::2]    # [10, 30, 50]
items[::-1]   # [50, 40, 30, 20, 10]  (reversed)
```

### sort()
Sort a list in-place. Use `sorted()` to return a new sorted list.
```python
nums = [3, 1, 4, 1, 5, 9]
nums.sort()                      # [1, 1, 3, 4, 5, 9]
nums.sort(reverse=True)          # [9, 5, 4, 3, 1, 1]

words = ["banana", "apple", "cherry"]
words.sort(key=len)              # ["apple", "banana", "cherry"]

# sorted() — does not modify original
sorted_nums = sorted(nums)
```

### reverse()
Reverse a list in-place.
```python
items = [1, 2, 3, 4, 5]
items.reverse()   # [5, 4, 3, 2, 1]
```

### count()
Count how many times a value appears in the list.
```python
[1, 2, 2, 3, 2].count(2)   # 3
["a","b","a"].count("a")   # 2
```

### len()
Return the number of items.
```python
len([1, 2, 3])   # 3
len([])          # 0
```

### Repeat list
Repeat a list N times with `*`.
```python
[0] * 5          # [0, 0, 0, 0, 0]
[1, 2] * 3       # [1, 2, 1, 2, 1, 2]
```

### List comprehension
Build a list in one line using an expression with an optional condition.
```python
squares   = [x ** 2 for x in range(1, 6)]          # [1, 4, 9, 16, 25]
evens     = [x for x in range(10) if x % 2 == 0]   # [0, 2, 4, 6, 8]
upper     = [s.upper() for s in ["a", "b", "c"]]   # ["A", "B", "C"]

# Nested comprehension
matrix    = [[i * j for j in range(1, 4)] for i in range(1, 4)]
```

### filter()
Filter items using a function. Returns an iterator — wrap in `list()`.
```python
nums    = [1, 2, 3, 4, 5, 6]
evens   = list(filter(lambda x: x % 2 == 0, nums))  # [2, 4, 6]

# Equivalent comprehension (more Pythonic)
evens   = [x for x in nums if x % 2 == 0]
```

---

## Tuples & Sets

### Tuple
Ordered, immutable sequence. Use when data should not change.
```python
point   = (3, 7)
rgb     = (255, 128, 0)
single  = (42,)         # note trailing comma for single-item tuple
empty   = ()

# Access like a list
point[0]   # 3
point[-1]  # 7
```

### Tuple unpacking
Assign tuple values to multiple variables at once.
```python
x, y = (3, 7)
r, g, b = (255, 128, 0)

# Swap values
a, b = b, a

# Ignore values with _
first, _, last = ("Alex", "J", "Mensah")

# Collect remainder with *
head, *tail = (1, 2, 3, 4, 5)   # head=1, tail=[2,3,4,5]
```

### Set
Unordered collection of unique values. No duplicates, no guaranteed order.
```python
tags    = {"python", "data", "bi"}
numbers = {1, 2, 3, 4, 5}
empty   = set()   # {} creates a dict — use set() for empty set

# Duplicates are removed automatically
{1, 2, 2, 3, 3, 3}   # {1, 2, 3}
```

### set.add()
Add a single item to a set.
```python
tags = {"python", "data"}
tags.add("analytics")   # {"python", "data", "analytics"}
tags.add("python")      # no change — already exists
```

### set.remove()
Remove an item — raises KeyError if not found. Use `discard()` to avoid the error.
```python
tags = {"python", "data", "analytics"}
tags.remove("data")        # {"python", "analytics"}
tags.discard("missing")    # no error if not found
```

### Union
Combine two sets — all unique items from both. Use `|` operator or `.union()`.
```python
a = {1, 2, 3}
b = {3, 4, 5}
a | b           # {1, 2, 3, 4, 5}
a.union(b)      # {1, 2, 3, 4, 5}
```

### Intersection
Items that exist in both sets. Use `&` operator or `.intersection()`.
```python
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}
a & b                  # {3, 4}
a.intersection(b)      # {3, 4}
```

### Difference
Items in the first set that are not in the second. Use `-` or `.difference()`.
```python
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}
a - b              # {1, 2}
a.difference(b)    # {1, 2}
```

---

## Dictionaries

### Create dict
```python
person = {"name": "Alex", "age": 30, "active": True}
empty  = {}
nested = {"address": {"city": "Atlanta", "state": "GA"}}
```

### Access value
Use `[]` — raises KeyError if the key does not exist.
```python
person["name"]    # "Alex"
person["age"]     # 30
```

### get()
Access a value safely — returns `None` (or a default) if the key does not exist.
```python
person.get("name")           # "Alex"
person.get("email")          # None
person.get("email", "N/A")   # "N/A"
```

### Add / update
Assign a value to a key. Creates it if new, updates it if existing.
```python
person["email"] = "alex@fttg.com"   # add
person["age"]   = 31                 # update
```

### update()
Merge another dictionary (or key-value pairs) into the existing dict.
```python
person.update({"city": "Atlanta", "age": 31})
person.update(role="Engineer", level="Senior")
```

### del key
Remove a key-value pair.
```python
del person["active"]
```

### keys()
Return a view of all keys.
```python
person.keys()    # dict_keys(["name", "age", "active"])
list(person.keys())
```

### values()
Return a view of all values.
```python
person.values()   # dict_values(["Alex", 30, True])
list(person.values())
```

### items()
Return a view of all key-value pairs as tuples.
```python
person.items()
# dict_items([("name","Alex"), ("age",30), ("active",True)])
```

### Loop dict
Iterate over keys, values, or both.
```python
# Keys only (default)
for key in person:
    print(key)

# Keys and values
for key, value in person.items():
    print(f"{key}: {value}")

# Values only
for value in person.values():
    print(value)
```

### Dict comprehension
Build a dictionary in one line.
```python
squares = {x: x**2 for x in range(1, 6)}
# {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

filtered = {k: v for k, v in person.items() if v is not None}
upper_keys = {k.upper(): v for k, v in person.items()}
```

### in operator
Check whether a key exists in a dictionary.
```python
"name" in person      # True
"email" in person     # False
"name" not in person  # False
```

---

## Control Flow

### if / elif / else
Execute code conditionally.
```python
score = 85

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "F"

print(f"Grade: {grade}")   # Grade: B
```

### Ternary operator
One-line if/else expression.
```python
status = "Pass" if score >= 70 else "Fail"
label  = "Even" if n % 2 == 0 else "Odd"
value  = x if x is not None else "default"
```

### pass
A no-op placeholder. Use when a block is required syntactically but you have nothing to put there yet.
```python
if condition:
    pass   # TODO: implement later

def placeholder():
    pass
```

---

## Loops

### for loop
Iterate over any iterable — list, string, range, dict, etc.
```python
for name in ["Alex", "Sarah", "James"]:
    print(name)

for char in "Hello":
    print(char)
```

### while loop
Repeat while a condition is true.
```python
count = 0
while count < 5:
    print(count)
    count += 1
```

### range()
Generate a sequence of integers.
```python
range(5)          # 0, 1, 2, 3, 4
range(1, 6)       # 1, 2, 3, 4, 5
range(0, 10, 2)   # 0, 2, 4, 6, 8  (step)
range(10, 0, -2)  # 10, 8, 6, 4, 2  (countdown)
```

### enumerate()
Loop with both index and value.
```python
names = ["Alex", "Sarah", "James"]
for i, name in enumerate(names):
    print(f"{i}: {name}")
# 0: Alex
# 1: Sarah
# 2: James

# Start at a different index
for i, name in enumerate(names, start=1):
    print(f"{i}. {name}")
```

### zip()
Loop over multiple iterables in parallel.
```python
names  = ["Alex", "Sarah", "James"]
scores = [95, 88, 72]

for name, score in zip(names, scores):
    print(f"{name}: {score}")
# Alex: 95  Sarah: 88  James: 72
```

### break
Exit a loop immediately.
```python
for n in range(10):
    if n == 5:
        break
    print(n)
# Prints 0 1 2 3 4
```

### continue
Skip the rest of the current iteration and move to the next.
```python
for n in range(10):
    if n % 2 == 0:
        continue
    print(n)
# Prints 1 3 5 7 9
```

### for / else
The `else` block runs only if the loop completed without hitting a `break`.
```python
for n in range(2, 10):
    if 10 % n == 0:
        print(f"Factor found: {n}")
        break
else:
    print("No factors found — 10 is prime")
# Factor found: 2
```

---

## Functions

### Define function
Use `def` to define a reusable block of code.
```python
def greet(name):
    return f"Hello, {name}!"

result = greet("Alex")   # "Hello, Alex!"
```

### Default argument
Provide a fallback value for a parameter.
```python
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

greet("Alex")              # "Hello, Alex!"
greet("Alex", "Welcome")   # "Welcome, Alex!"
```

### *args
Accept any number of positional arguments as a tuple.
```python
def add_all(*args):
    return sum(args)

add_all(1, 2, 3)        # 6
add_all(10, 20, 30, 40) # 100
```

### **kwargs
Accept any number of keyword arguments as a dictionary.
```python
def display(**kwargs):
    for key, value in kwargs.items():
        print(f"{key}: {value}")

display(name="Alex", role="Engineer", level="Senior")
```

### Multiple return
Return multiple values as a tuple.
```python
def min_max(numbers):
    return min(numbers), max(numbers)

low, high = min_max([3, 1, 4, 1, 5, 9])
# low=1, high=9
```

### Lambda
An anonymous one-line function. Use for short operations passed to other functions.
```python
square  = lambda x: x ** 2
add     = lambda x, y: x + y

square(5)     # 25
add(3, 4)     # 7

# Common use with sorted
names   = ["banana", "apple", "cherry"]
sorted(names, key=lambda s: len(s))   # ["apple", "banana", "cherry"]
```

### map()
Apply a function to every item in an iterable. Returns an iterator — wrap in `list()`.
```python
numbers = [1, 2, 3, 4, 5]
squares = list(map(lambda x: x ** 2, numbers))  # [1, 4, 9, 16, 25]

# Equivalent comprehension (more Pythonic)
squares = [x ** 2 for x in numbers]
```

---

## Classes & OOP

### Define class
Use `class` to define a blueprint for objects.
```python
class Employee:
    def __init__(self, name, role):
        self.name = name
        self.role = role
```

### Instantiate
Create an instance of a class by calling it like a function.
```python
emp = Employee("Alex", "Engineer")
print(emp.name)   # "Alex"
print(emp.role)   # "Engineer"
```

### Method
A function defined inside a class. The first parameter is always `self`.
```python
class Employee:
    def __init__(self, name, salary):
        self.name   = name
        self.salary = salary

    def get_raise(self, pct):
        self.salary *= (1 + pct)
        return self.salary

emp = Employee("Alex", 80000)
emp.get_raise(0.1)   # 88000.0
```

### Class variable
A variable shared by all instances of a class.
```python
class Employee:
    company = "FTTG Solutions"   # class variable

    def __init__(self, name):
        self.name = name         # instance variable

emp1 = Employee("Alex")
emp2 = Employee("Sarah")

Employee.company    # "FTTG Solutions"
emp1.company        # "FTTG Solutions"
```

### Inheritance
Create a child class that extends a parent class.
```python
class Manager(Employee):
    def __init__(self, name, salary, team_size):
        super().__init__(name, salary)
        self.team_size = team_size

    def describe(self):
        return f"{self.name} manages {self.team_size} people"
```

### super()
Call a method from the parent class.
```python
class Manager(Employee):
    def __init__(self, name, salary, team_size):
        super().__init__(name, salary)   # call Employee.__init__
        self.team_size = team_size
```

### __repr__()
Define a developer-friendly string representation of an object.
```python
class Employee:
    def __init__(self, name, role):
        self.name = name
        self.role = role

    def __repr__(self):
        return f"Employee(name={self.name!r}, role={self.role!r})"

emp = Employee("Alex", "Engineer")
repr(emp)   # "Employee(name='Alex', role='Engineer')"
```

### Custom exception
Define your own exception class by inheriting from `Exception`.
```python
class DataValidationError(Exception):
    pass

class SchemaError(DataValidationError):
    def __init__(self, column, expected, actual):
        self.message = f"Column '{column}': expected {expected}, got {actual}"
        super().__init__(self.message)

# Raise it
raise SchemaError("Amount", "number", "text")

# Catch it
try:
    validate_schema(df)
except SchemaError as e:
    print(f"Schema error: {e}")
```

---

## File Handling

### Read file
Open and read the entire contents of a text file. Use `with` to ensure the file is closed automatically.
```python
with open("data.txt", "r") as f:
    content = f.read()
    print(content)
```

### Read line by line
Iterate over lines — memory efficient for large files.
```python
with open("data.txt", "r") as f:
    for line in f:
        print(line.strip())   # strip() removes the trailing newline
```

### Write file
Write text to a file. Mode `"w"` overwrites; `"a"` appends.
```python
with open("output.txt", "w") as f:
    f.write("Hello, World!\n")
    f.write("Second line\n")

# Append
with open("output.txt", "a") as f:
    f.write("Third line\n")
```

### Write JSON
Serialize a Python object to a JSON file.
```python
import json

data = {"name": "Alex", "scores": [95, 88, 72]}

with open("data.json", "w") as f:
    json.dump(data, f, indent=2)
```

### Read JSON
Deserialize a JSON file into a Python object.
```python
import json

with open("data.json", "r") as f:
    data = json.load(f)

print(data["name"])      # "Alex"
print(data["scores"])    # [95, 88, 72]
```

### Delete file
Remove a file from the filesystem.
```python
import os

os.remove("output.txt")
```

### Check file exists
Check whether a file or directory exists before operating on it.
```python
import os

os.path.exists("data.txt")    # True or False
os.path.isfile("data.txt")    # True if it's a file
os.path.isdir("data/")        # True if it's a directory

# Safer pattern
if os.path.exists("data.txt"):
    os.remove("data.txt")
```

---

## Modules

### import
Import a module and access its contents with dot notation.
```python
import math
import os
import json

math.sqrt(144)     # 12.0
math.pi            # 3.14159...
os.getcwd()        # current working directory
```

### from import
Import specific names from a module — no dot notation needed.
```python
from math import sqrt, pi
from os.path import exists, join
from datetime import date, datetime

sqrt(144)          # 12.0
date.today()
```

### import as
Import a module or name under an alias.
```python
import pandas as pd
import numpy as np
from datetime import datetime as dt

df = pd.read_csv("data.csv")
arr = np.array([1, 2, 3])
now = dt.now()
```

### dir()
List all names defined in a module or object — useful for exploration.
```python
import math
dir(math)    # ['acos', 'acosh', 'asin', ..., 'sqrt', 'tan', ...]

x = "hello"
dir(x)       # all string methods
```

---

## Error Handling

### try / except
Catch and handle exceptions so the program does not crash.
```python
try:
    result = 10 / 0
except ZeroDivisionError:
    print("Cannot divide by zero")

try:
    value = int("abc")
except ValueError as e:
    print(f"Error: {e}")
```

### Multiple exceptions
Catch different exception types separately.
```python
try:
    data = load_data(path)
    result = process(data)
except FileNotFoundError:
    print("File not found")
except ValueError as e:
    print(f"Invalid value: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
```

### else clause
Run code only if no exception was raised.
```python
try:
    result = int(user_input)
except ValueError:
    print("Not a number")
else:
    print(f"Parsed successfully: {result}")
```

### finally clause
Run code regardless of whether an exception occurred. Used for cleanup.
```python
connection = None
try:
    connection = open_db_connection()
    run_query(connection)
except Exception as e:
    print(f"Query failed: {e}")
finally:
    if connection:
        connection.close()   # always runs
```

### raise
Raise an exception intentionally.
```python
def validate_age(age):
    if age < 0:
        raise ValueError(f"Age cannot be negative: {age}")
    if age > 150:
        raise ValueError(f"Age is unrealistic: {age}")
    return age

# Re-raise after logging
try:
    result = process()
except Exception as e:
    log_error(e)
    raise   # re-raises the same exception
```

---

## Generators & Advanced

### Generator function
A function that yields values one at a time instead of returning them all at once. Memory-efficient for large sequences.
```python
def count_up(n):
    for i in range(n):
        yield i

gen = count_up(5)
next(gen)   # 0
next(gen)   # 1

for value in count_up(5):
    print(value)   # 0 1 2 3 4
```

### Generator expression
Like a list comprehension but lazy — values are generated on demand, not stored in memory.
```python
# List comprehension — stores all in memory
squares_list = [x ** 2 for x in range(1_000_000)]

# Generator expression — generates one at a time
squares_gen  = (x ** 2 for x in range(1_000_000))

# Use with sum, max, etc.
total = sum(x ** 2 for x in range(1000))
```

### heapq (min-heap)
Efficient priority queue — always gives the smallest item first.
```python
import heapq

nums = [5, 2, 8, 1, 9, 3]
heapq.heapify(nums)          # convert list to heap in-place

heapq.heappush(nums, 4)      # add item
smallest = heapq.heappop(nums)   # remove and return smallest

# Top N smallest or largest
heapq.nsmallest(3, nums)     # [1, 2, 3]
heapq.nlargest(3, nums)      # [9, 8, 5]
```

### deque
Double-ended queue — efficient appends and pops from both ends. Better than a list for queue/stack operations.
```python
from collections import deque

q = deque([1, 2, 3])
q.append(4)        # add to right:  deque([1, 2, 3, 4])
q.appendleft(0)    # add to left:   deque([0, 1, 2, 3, 4])
q.pop()            # remove right:  returns 4
q.popleft()        # remove left:   returns 0

# Fixed-size deque — automatically discards oldest items
recent = deque(maxlen=5)
for i in range(10):
    recent.append(i)
# deque([5, 6, 7, 8, 9], maxlen=5)
```

### enumerate (start)
Start an enumerate counter from a value other than 0.
```python
items = ["alpha", "beta", "gamma"]

for i, item in enumerate(items, start=1):
    print(f"{i}. {item}")
# 1. alpha
# 2. beta
# 3. gamma
```

---

*Part of the FTTG Learn Cheat Sheet series — [fttgsolutions.com](https://learn.fttgsolutions.com/cheatsheets)*
