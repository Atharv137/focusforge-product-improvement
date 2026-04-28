# Index Investigation Changes

## 1. What the Original Index Did
The original index was created using:
```sql
CREATE INDEX idx_salary_department ON employees(salary, department);
```
This index sorted the rows primarily by the `salary` column, and secondarily by the `department` column. For queries filtering strictly by `salary`, this index could be used. However, for our query that filters on both `department` and a range of `salary`, the ordering restricted its usefulness.

## 2. Why the Incorrect Index Was Ineffective
The query we analyzed was:
```sql
SELECT *
FROM employees
WHERE department = 'Sales'
AND salary > 50000;
```
Because of the **Left-Most Prefix Rule**, the database can only efficiently navigate the index if the query uses the leading columns of the index. In this case, `salary` was the left-most column, but our query performed a range scan on `salary` (`> 50000`). Because it was a range scan on the leading column, the database could not easily jump to matching `department` values without scanning through the entire section of the index where `salary > 50000`. If this range comprises a large portion of the table, the PostgreSQL query planner calculates that an Index Scan is too expensive and chooses to perform a Sequential Scan (full table scan) instead.

## 3. How the Corrected Index Improved Performance
To resolve this, we dropped the ineffective index and created a new one:
```sql
CREATE INDEX idx_department_salary ON employees(department, salary);
```
The corrected index starts with the exact-match column (`department`). Now, when the query runs, PostgreSQL immediately jumps to the portion of the index where `department = 'Sales'`. Within that specific section, the rows are ordered by `salary`, allowing the database to instantly find and retrieve only the records where `salary > 50000`. This enables an efficient **Index Scan** and drastically reduces the execution time.

## 4. The Left-Most Prefix Rule
The **Left-Most Prefix Rule** dictates that a database uses a composite index from left to right. If a query filters by the first column, the index can be used. If it filters by the first and second, the index can be used for both. However, if a query skips the first column or performs a broad range scan on it, the subsequent columns in the index cannot be utilized effectively for fast lookups. Thus, a best practice for composite indexes is to place columns with **equality filters** first, followed by columns with **range filters**.
