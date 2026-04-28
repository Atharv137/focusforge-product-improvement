-- Step 1: Analyze the original broken index behavior
-- The original index: CREATE INDEX idx_salary_department ON employees(salary, department);
-- We use EXPLAIN ANALYZE to see how PostgreSQL executes this query.
EXPLAIN ANALYZE 
SELECT *
FROM employees
WHERE department = 'Sales'
AND salary > 50000;

-- Step 2: Drop the inefficient index
DROP INDEX IF EXISTS idx_salary_department;

-- Step 3: Create the corrected composite index
-- Following the Left-Most Prefix Rule, we put the equality filter (department) first,
-- and the range filter (salary) second.
CREATE INDEX idx_department_salary ON employees(department, salary);

-- Step 4: Analyze the query performance again to confirm the fix
EXPLAIN ANALYZE 
SELECT *
FROM employees
WHERE department = 'Sales'
AND salary > 50000;
