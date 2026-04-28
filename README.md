# Composite Index Investigation

## Overview
This repository contains the investigation and resolution of a slow database query caused by incorrect composite index column ordering. The goal of this project was to analyze how PostgreSQL utilizes (or ignores) indexes based on the order of their columns and the type of queries executed.

## Investigation Steps

1. **The Slow Query:** We observed a multi-column query filtering on `department` (exact match) and `salary` (range scan) performing a Sequential Scan instead of utilizing the existing index.
2. **Incorrect Index:** The existing index (`idx_salary_department`) was ordered `(salary, department)`. Due to the Left-Most Prefix Rule, PostgreSQL could not efficiently use it for the range-scan query.
3. **Corrected Index:** We replaced the index with `idx_department_salary` ordered by `(department, salary)`, prioritizing the equality filter column.
4. **Result:** The query planner shifted from a costly Sequential Scan to a fast, efficient Index Scan.

## Included Files
- `Changes.md`: Detailed explanation of the original issue, the Left-Most Prefix Rule, and how the fix solved the performance problem.
- `index_experiment.sql`: The SQL statements used during the investigation, including `EXPLAIN ANALYZE` commands, dropping the bad index, and creating the corrected one.
