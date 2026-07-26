import sqlite3
import csv
import os

DB_PATH = 'boardmind.db'
OUTPUT_DIR = '../csv_exports'

os.makedirs(OUTPUT_DIR, exist_ok=True)

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

def export_table(table_name, csv_filename, query=None):
    if query is None:
        query = f"SELECT * FROM {table_name}"
    
    cursor.execute(query)
    rows = cursor.fetchall()
    
    # Get column names
    col_names = [description[0] for description in cursor.description]
    
    csv_path = os.path.join(OUTPUT_DIR, csv_filename)
    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(col_names)
        writer.writerows(rows)
    print(f"Exported {len(rows)} rows to {csv_filename}")

# 1. Employees (Join with departments for the department name)
emp_query = """
SELECT 
    e.first_name as 'First Name',
    e.last_name as 'Last Name',
    e.role as 'Role',
    d.name as 'Department',
    e.salary as 'Salary',
    e.hire_date as 'Hire Date',
    e.termination_date as 'Termination Date'
FROM employees e
JOIN departments d ON e.department_id = d.id
"""
export_table('employees', 'employees.csv', emp_query)

# 2. Customers
cust_query = """
SELECT 
    company_name as 'Company Name',
    industry as 'Industry',
    acquisition_date as 'Acquisition Date',
    churn_date as 'Churn Date',
    tier as 'Subscription Tier'
FROM customers
"""
export_table('customers', 'customers.csv', cust_query)

# 3. Expenses
exp_query = """
SELECT 
    date as 'Expense Date',
    category as 'Category',
    amount as 'Amount'
FROM expenses
"""
export_table('expenses', 'expenses.csv', exp_query)

# 4. Sales Transactions
sales_query = """
SELECT 
    st.transaction_date as 'Transaction Date',
    c.company_name as 'Customer Name',
    p.name as 'Product Name',
    e.first_name || ' ' || e.last_name as 'Sales Rep Name',
    st.quantity as 'Quantity',
    st.revenue as 'Total Revenue',
    st.discount as 'Discount'
FROM sales_transactions st
JOIN customers c ON st.customer_id = c.id
JOIN products p ON st.product_id = p.id
JOIN employees e ON st.sales_rep_id = e.id
"""
export_table('sales_transactions', 'sales_invoices.csv', sales_query)

conn.close()
print(f"\nAll exports completed! CSVs are saved in: {os.path.abspath(OUTPUT_DIR)}")
