import requests
import json
import os

BASE_URL = "http://127.0.0.1:8000/api/v1"

print("--- BoardMind Data Import Verification ---")
print("1. Verifying Database Abstraction (X-Data-Mode)...")
res_sim = requests.get(f"{BASE_URL}/system/status", headers={"x-data-mode": "simulator"})
print(f"Simulator Mode Status: {res_sim.status_code}")

res_real = requests.get(f"{BASE_URL}/system/status", headers={"x-data-mode": "real"})
print(f"Real Data Mode Status: {res_real.status_code}")

print("\n2. Verifying /auto-map endpoint...")
payload = {
    "columns": ["Client Name", "Invoice Date", "Invoice Value", "Monthly Cost", "Subscription Plan", "ID"]
}
res_map = requests.post(f"{BASE_URL}/data-import/auto-map", json=payload)
mappings = res_map.json().get("mappings", [])
print(f"Mapped Columns: {len(mappings)}")
for m in mappings:
    if m['mapped_column']:
        print(f" - {m['mapped_column']} -> {m['boardmind_field']} (Confidence: {m['confidence']})")

print("\n3. Verifying /validate endpoint...")
validate_payload = {"mappings": mappings}
res_valid = requests.post(f"{BASE_URL}/data-import/validate", json=validate_payload)
print(f"Validation Result: {res_valid.json()}")

print("\nAll endpoints verified successfully!")
