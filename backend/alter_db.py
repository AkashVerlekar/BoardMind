import sqlite3

def alter_db(db_path):
    print(f"Altering {db_path}...")
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        try:
            cursor.execute("ALTER TABLE recommendations ADD COLUMN action_plan TEXT;")
        except Exception as e: print(e)
        try:
            cursor.execute("ALTER TABLE recommendations ADD COLUMN action_plan_generated_at DATETIME;")
        except Exception as e: print(e)
        try:
            cursor.execute("ALTER TABLE recommendations ADD COLUMN action_plan_is_ai BOOLEAN;")
        except Exception as e: print(e)
        conn.commit()
        print("Success")
    except sqlite3.OperationalError as e:
        print(f"Operational error: {e}")
    finally:
        conn.close()

alter_db("d:/Users/91915/Desktop/Narayan/backend/boardmind_sim.db")
alter_db("d:/Users/91915/Desktop/Narayan/backend/boardmind_real.db")
