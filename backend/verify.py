import requests
import sqlite3
import json
import time
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000/api/v1"
DB_PATH = "d:/Users/91915/Desktop/Narayan/backend/boardmind_sim.db"

def run_verification():
    # Wait for server
    for _ in range(10):
        try:
            res = requests.get(f"{BASE_URL}/system/status")
            if res.status_code == 200: break
        except:
            time.sleep(1)

    print("=== Evidence 1: Database Persistence (Assigning) ===")
    # HIT API FIRST to ensure database initialization
    brief = requests.get(f"{BASE_URL}/dashboard/brief?period=30d").json()
    recs = brief.get("recommended_actions", [])
    
    if not recs:
        print("Inserting fallback recommendation...")
        # Force create a recommendation
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('''INSERT INTO recommendations (recommendation_id, title, description, priority, status, department_name, source_metric, recommendation_reason, created_date) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''', 
                  ("REC-EVID", "Optimize Cloud Spend", "Scale down test clusters.", "High", "Pending", "IT", "expense", "High anomaly in AWS costs", datetime.now()))
        conn.commit()
        conn.close()
        # Fetch again
        brief = requests.get(f"{BASE_URL}/dashboard/brief?period=30d").json()
        recs = brief.get("recommended_actions", [])
        
    rec = recs[0]
    rec_id = rec["id"]
    
    assigned_res = requests.post(f"{BASE_URL}/recommendations/{rec_id}/action?status=Assigned&assigned_to_id=1").json()
    print("API Response for Assign:")
    print(json.dumps({"id": assigned_res["id"], "status": assigned_res["status"], "assigned_to_id": assigned_res["assigned_to_id"]}, indent=2))
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT status, assigned_to_id FROM recommendations WHERE id=?", (rec_id,))
    row = cursor.fetchone()
    print(f"Database Record -> Status: '{row[0]}', Assigned To ID: {row[1]}")
    conn.close()
    
    print("\n=== Evidence 2: Action Plan Generation & Metadata ===")
    plan_res = requests.post(f"{BASE_URL}/recommendations/{rec_id}/action-plan").json()
    print(json.dumps({
        "action_plan_length": len(plan_res.get("action_plan", "")),
        "is_ai_generated": plan_res.get("action_plan_is_ai"),
        "generated_at": plan_res.get("action_plan_generated_at")
    }, indent=2))
    
    print("\n=== Evidence 3: Regenerated Plan Changes ===")
    plan_res2 = requests.post(f"{BASE_URL}/recommendations/{rec_id}/action-plan").json()
    print(f"First plan characters: {len(plan_res.get('action_plan', ''))}")
    print(f"Second plan characters: {len(plan_res2.get('action_plan', ''))}")
    # They should be exactly the same if fallback is used!
    print(f"Plans are different? {plan_res.get('action_plan') != plan_res2.get('action_plan')}")

    print("\n=== Evidence 4: Persistence on Refresh ===")
    brief2 = requests.get(f"{BASE_URL}/dashboard/brief?period=30d").json()
    rec2 = [r for r in brief2.get("recommended_actions", []) if r["id"] == rec_id][0]
    print(json.dumps({
        "status": rec2["status"],
        "has_action_plan": rec2["action_plan"] is not None,
        "persisted_generated_at": rec2["action_plan_generated_at"]
    }, indent=2))
    
    print("\n=== Evidence 5: Action Plan Content (Markdown & Context) ===")
    print("RAW MARKDOWN GENERATED:")
    print(plan_res.get("action_plan")[:300] + "\n...")

run_verification()
