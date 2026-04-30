"""
AI Engine — logic aligned with check_things/ai_model.py.
Integrates relational database schema with advanced AI reporting.
"""
import sqlite3
from datetime import datetime, timedelta
import random
from database import get_connection

# ───────────────────────────────────────────────────────
# 1. WAIT TIME
# ───────────────────────────────────────────────────────
def get_wait_info(dept_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as cnt FROM tokens WHERE dept_id=? AND status='waiting'", (dept_id,))
    queue_len = cursor.fetchone()["cnt"]

    cursor.execute("SELECT avg_consult_time FROM departments WHERE dept_id=?", (dept_id,))
    result = cursor.fetchone()
    consult_time = result["avg_consult_time"] if result else 10

    wait_time = queue_len * consult_time

    if wait_time > 45:
        advice = f"Delay your visit by {wait_time//2} minutes"
    else:
        advice = "You can visit now"

    conn.close()
    return wait_time, advice


# ───────────────────────────────────────────────────────
# 2. CROWD + PEAK
# ───────────────────────────────────────────────────────
def get_crowd_and_timing(dept_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT peak_hour FROM queue_logs
    WHERE dept_id=?
    GROUP BY peak_hour
    ORDER BY SUM(total_patients) DESC LIMIT 1
    """, (dept_id,))
    peak = cursor.fetchone()
    peak_hour = peak["peak_hour"] if peak else "N/A"

    cursor.execute("SELECT COUNT(*) as cnt FROM tokens WHERE dept_id=? AND status='waiting'", (dept_id,))
    count = cursor.fetchone()["cnt"]

    if count < 3:
        crowd = "Low 🟢"
        crowd_color = "green"
    elif count <= 7:
        crowd = "Moderate 🟡"
        crowd_color = "yellow"
    else:
        crowd = "High 🔴"
        crowd_color = "red"

    if peak_hour == "11AM-1PM":
        suggestion = "Visit after 2 PM"
    else:
        suggestion = "Morning hours are better"

    conn.close()
    return peak_hour, crowd, suggestion, crowd_color


# ───────────────────────────────────────────────────────
# 3. DOCTOR
# ───────────────────────────────────────────────────────
def suggest_doctor(dept_id=None):
    # If dept_id provided, try to find active doctor for that dept
    if dept_id:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT name FROM doctors WHERE dept_id = ? AND available = 1", (dept_id,))
        rows = cur.fetchall()
        conn.close()
        if rows:
            return random.choice([r["name"] for r in rows])
            
    return random.choice(["Dr. Sharma", "Dr. Das", "Dr. Roy"])


# ───────────────────────────────────────────────────────
# 4. RE-ENTRY
# ───────────────────────────────────────────────────────
def reentry_message():
    return "If you missed your token, you can rejoin with adjusted priority."


# ───────────────────────────────────────────────────────
# 5. NAVIGATION
# ───────────────────────────────────────────────────────
def hospital_journey(dept_id, wait_time):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT avg_consult_time FROM departments WHERE dept_id=?", (dept_id,))
    result = cursor.fetchone()
    consult_time = result["avg_consult_time"] if result else 10

    conn.close()

    total_time = 5 + wait_time + consult_time + 10

    journey = [
        "Registration → 5 mins",
        f"Waiting → {wait_time} mins",
        f"Consultation → {consult_time} mins",
        "Pharmacy → 10 mins",
        f"Total Time: {total_time} mins"
    ]

    return journey, total_time


# ───────────────────────────────────────────────────────
# 6. ANALYSIS
# ───────────────────────────────────────────────────────
def analyze_patient(symptoms, dept_id):
    symptoms = symptoms.lower()

    emergency_keywords = ["chest pain", "breathing", "bleeding", "unconscious", "heart attack", "stroke"]
    is_emergency = any(word in symptoms for word in emergency_keywords)
    emergency = "Emergency" if is_emergency else "Normal"

    if "bone" in symptoms or "fracture" in symptoms:
        department = "Orthopedic"
    elif "heart" in symptoms or "chest" in symptoms:
        department = "Cardiology"
    else:
        department = "General Medicine"

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as cnt FROM tokens WHERE dept_id=? AND status='waiting'", (dept_id,))
    count = cursor.fetchone()["cnt"]

    conn.close()

    if count > 7:
        status = "Very Busy"
    elif count > 3:
        status = "Moderate"
    else:
        status = "Free"

    return emergency, department, status, is_emergency


# ───────────────────────────────────────────────────────
# 7. HOSPITAL SUGGESTION
# ───────────────────────────────────────────────────────
def suggest_hospital(wait_time):
    alt_wait = max(10, wait_time - random.randint(10, 25))

    return {
        "options": [
            {"name": "City Hospital", "wait_time": wait_time},
            {"name": "Green Care", "wait_time": alt_wait}
        ],
        "recommended": "Green Care"
    }


# ───────────────────────────────────────────────────────
# 8. ELDERLY MODE
# ───────────────────────────────────────────────────────
def elderly_mode(age):
    if age >= 60:
        return {
            "enabled": True,
            "benefits": ["Priority Queue", "Reduced Waiting Time", "Assistance Available"]
        }
    else:
        return {"enabled": False}


# ───────────────────────────────────────────────────────
# 9. MASTER AI REPORT
# ───────────────────────────────────────────────────────
def generate_ai_json(dept_id, token, symptoms, age):
    wait_time, advice = get_wait_info(dept_id)
    peak, crowd, best_time, _ = get_crowd_and_timing(dept_id)
    doctor = suggest_doctor(dept_id)
    emergency, department, status, is_emergency = analyze_patient(symptoms, dept_id)
    elderly = elderly_mode(age)
    journey_list, total_time = hospital_journey(dept_id, wait_time)
    hospital_alt = suggest_hospital(wait_time)

    return {
        "wait_time": wait_time,
        "advice": advice,
        "peak_hour": peak,
        "crowd": crowd,
        "best_time": best_time,
        "doctor": doctor,
        "emergency": emergency,
        "is_emergency": is_emergency,
        "department": department,
        "hospital_status": status,
        "elderly_mode": elderly,
        "journey": journey_list,
        "total_time": total_time,
        "hospital_alternative": hospital_alt
    }


# Keep dashboard stats for the dashboard page
def get_dashboard_stats(hospital_id=1):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) as cnt FROM tokens WHERE hospital_id = ? AND status = 'waiting'", (hospital_id,))
    total_waiting = cur.fetchone()["cnt"]
    cur.execute("SELECT COUNT(*) as cnt FROM tokens WHERE hospital_id = ? AND status = 'completed'", (hospital_id,))
    total_served = cur.fetchone()["cnt"]
    cur.execute("""SELECT COUNT(*) as cnt FROM doctors dr JOIN departments d ON dr.dept_id = d.dept_id 
                   WHERE d.hospital_id = ? AND dr.available = 1""", (hospital_id,))
    active_doctors = cur.fetchone()["cnt"]
    cur.execute("""SELECT d.dept_id, d.dept_name as name, d.avg_consult_time,
                  COUNT(CASE WHEN t.status='waiting' THEN 1 END) as waiting,
                  COUNT(CASE WHEN t.status='completed' THEN 1 END) as completed
           FROM departments d LEFT JOIN tokens t ON d.dept_id = t.dept_id
           WHERE d.hospital_id = ? GROUP BY d.dept_id""", (hospital_id,))
    departments = []
    for row in cur.fetchall():
        r = dict(row)
        wait_time, advice = get_wait_info(r["dept_id"])
        peak, crowd, suggestion, color = get_crowd_and_timing(r["dept_id"])
        r.update({"est_wait": wait_time, "crowd_level": crowd, "crowd_color": color, "peak_hour": peak})
        departments.append(r)
    conn.close()
    return {"total_waiting": total_waiting, "total_served": total_served, "active_doctors": active_doctors, "departments": departments}
