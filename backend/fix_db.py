import sqlite3

def alter_db(db_path):
    print(f"Altering {db_path}...")
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if table exists first
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='recommendations';")
        if not cursor.fetchone():
            print("Table 'recommendations' does not exist yet.")
            return

        try:
            cursor.execute("ALTER TABLE recommendations ADD COLUMN action_plan TEXT;")
            print("Added action_plan")
        except Exception as e: print(e)
        
        try:
            cursor.execute("ALTER TABLE recommendations ADD COLUMN action_plan_generated_at DATETIME;")
            print("Added action_plan_generated_at")
        except Exception as e: print(e)
        
        try:
            cursor.execute("ALTER TABLE recommendations ADD COLUMN action_plan_is_ai BOOLEAN;")
            print("Added action_plan_is_ai")
        except Exception as e: print(e)
        
        conn.commit()
        print("Success")
    except sqlite3.OperationalError as e:
        print(f"Operational error: {e}")
    finally:
        conn.close()

alter_db("d:/Users/91915/Desktop/Narayan/backend/boardmind_sim.db")
alter_db("d:/Users/91915/Desktop/Narayan/backend/boardmind_real.db")
