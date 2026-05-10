"""
AI Engine — MediFlow AI
Merged: original relational logic + updated AI scoring from ai_updated.py
"""
import sqlite3
from datetime import datetime, timedelta
import random
from database import get_connection


# ───────────────────────────────────────────────────────
# 1. WAIT TIME  (+ time-based AI adjustment from ai_updated)
# ───────────────────────────────────────────────────────
def get_wait_info(dept_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT COUNT(*) as cnt FROM tokens WHERE dept_id=? AND status='waiting'",
        (dept_id,)
    )
    queue_len = cursor.fetchone()["cnt"]

    cursor.execute(
        "SELECT avg_consult_time FROM departments WHERE dept_id=?",
        (dept_id,)
    )
    result = cursor.fetchone()
    consult_time = result["avg_consult_time"] if result else 10

    wait_time = queue_len * consult_time

    # ── Time-based AI adjustment (from ai_updated) ──────
    current_hour = datetime.now().hour
    if 11 <= current_hour <= 14:
        wait_time += 15   # lunch rush
    elif 18 <= current_hour <= 20:
        wait_time += 10   # evening rush

    if wait_time > 45:
        advice = f"Delay your visit by {wait_time // 2} minutes"
    else:
        advice = "You can visit now"

    conn.close()
    # Return queue_len and consult_time as extras (used by generate_ai_json)
    return wait_time, advice, queue_len, consult_time


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

    cursor.execute(
        "SELECT COUNT(*) as cnt FROM tokens WHERE dept_id=? AND status='waiting'",
        (dept_id,)
    )
    count = cursor.fetchone()["cnt"]

    if count < 3:
        crowd = "Low"
        crowd_color = "green"
    elif count <= 7:
        crowd = "Moderate"
        crowd_color = "yellow"
    else:
        crowd = "High"
        crowd_color = "red"

    if peak_hour == "11AM-1PM":
        suggestion = "Visit after 2 PM"
    else:
        suggestion = "Morning hours are better"

    conn.close()
    return peak_hour, crowd, suggestion, crowd_color


# ───────────────────────────────────────────────────────
# 3. DOCTOR  (keeps relational lookup, falls back to pool)
# ───────────────────────────────────────────────────────
def suggest_doctor(dept_id=None):
    if dept_id:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT doctor_name FROM doctors WHERE dept_id = ? AND availability = 'Available'",
            (dept_id,)
        )
        rows = cur.fetchall()
        conn.close()
        if rows:
            return random.choice([r["doctor_name"] for r in rows])
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

    cursor.execute(
        "SELECT avg_consult_time FROM departments WHERE dept_id=?",
        (dept_id,)
    )
    result = cursor.fetchone()
    consult_time = result["avg_consult_time"] if result else 10
    conn.close()

    total_time = 5 + wait_time + consult_time + 10

    journey = [
        "Registration → 5 mins",
        f"Waiting → {wait_time} mins",
        f"Consultation → {consult_time} mins",
        "Pharmacy → 10 mins",
    ]
    return journey, total_time


# ───────────────────────────────────────────────────────
# 6. ANALYSIS  (severity score + broad keyword matching)
# ───────────────────────────────────────────────────────
def analyze_patient(symptoms, dept_id):
    s = symptoms.lower()

    # Severity scoring — broad keyword variants covered
    severity_score = 0
    if any(k in s for k in ["chest pain", "chest ache", "chest tightness"]):
        severity_score += 5
    if any(k in s for k in ["breathing", "breath", "shortness of breath",
                             "difficulty breathing", "can't breathe", "cannot breathe",
                             "breathless", "dyspnea"]):
        severity_score += 4
    if any(k in s for k in ["bleeding", "blood loss", "hemorrhage"]):
        severity_score += 5
    if any(k in s for k in ["unconscious", "unresponsive", "fainted", "collapsed",
                             "not responding", "passed out"]):
        severity_score += 6
    if any(k in s for k in ["heart attack", "cardiac arrest", "myocardial"]):
        severity_score += 6
    if any(k in s for k in ["stroke", "paralysis", "facial droop", "slurred speech"]):
        severity_score += 6
    if any(k in s for k in ["severe pain", "extreme pain", "unbearable pain"]):
        severity_score += 4
    if any(k in s for k in ["fever", "high temperature", "pyrexia"]):
        severity_score += 2

    is_emergency = severity_score >= 6
    emergency = "Emergency" if is_emergency else ("Urgent" if severity_score >= 4 else "Normal")

    # Department routing
    if any(k in s for k in ["bone", "fracture", "joint", "sprain", "orthopedic"]):
        department = "Orthopedic"
    elif any(k in s for k in ["heart", "chest", "cardiac", "cardio"]):
        department = "Cardiology"
    elif any(k in s for k in ["child", "infant", "baby", "pediatric"]):
        department = "Pediatrics"
    elif any(k in s for k in ["ear", "nose", "throat", " ent ", "sinus"]):
        department = "ENT"
    elif any(k in s for k in ["tooth", "dental", "gum", "mouth"]):
        department = "Dental"
    else:
        department = "General Medicine"

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT COUNT(*) as cnt FROM tokens WHERE dept_id=? AND status='waiting'",
        (dept_id,)
    )
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
            {"name": "City Hospital",  "wait_time": wait_time},
            {"name": "Green Care",     "wait_time": alt_wait},
            {"name": "Apollo Clinic",  "wait_time": wait_time + 10},
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
    return {"enabled": False, "benefits": []}


# ───────────────────────────────────────────────────────
# 9. TOKEN POSITION  (new from ai_updated)
# ───────────────────────────────────────────────────────
def get_position(dept_id, token):
    """Return 1-based position of token in the waiting queue, or -1 if not found."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT token_number FROM tokens
        WHERE dept_id=? AND status='waiting'
        ORDER BY created_at
    """, (dept_id,))
    tokens = [t["token_number"] for t in cursor.fetchall()]
    conn.close()
    if token in tokens:
        return tokens.index(token) + 1
    return -1


# ───────────────────────────────────────────────────────
# 10. SMART PRIORITY SCORE  (new from api_updated)
# ───────────────────────────────────────────────────────
def compute_priority_score(age, symptoms, wait_time, emergency):
    score = 0
    if "emergency" in emergency.lower():
        score += 50
    if "urgent" in emergency.lower():
        score += 25
    if age >= 60:
        score += 20
    score += min(wait_time, 30)
    s = symptoms.lower()
    if "chest pain"  in s: score += 10
    if "breathing"   in s: score += 8
    return score


# ───────────────────────────────────────────────────────
# 11. MASTER AI REPORT  (enriched with new fields)
# ───────────────────────────────────────────────────────
def generate_ai_json(dept_id, token, symptoms, age):
    wait_time, advice, queue_len, consult_time = get_wait_info(dept_id)
    peak, crowd, best_time, _ = get_crowd_and_timing(dept_id)
    doctor = suggest_doctor(dept_id)
    emergency, department, status, is_emergency = analyze_patient(symptoms, dept_id)
    elderly = elderly_mode(age)
    journey_list, total_time = hospital_journey(dept_id, wait_time)
    hospital_alt = suggest_hospital(wait_time)

    # New fields from ai_updated
    position = get_position(dept_id, token) if token else -1
    eta_time = datetime.now() + timedelta(minutes=wait_time)
    eta_str = eta_time.strftime("%I:%M %p")
    explanation = f"{queue_len} patients ahead × {consult_time} mins consultation"
    priority_score = compute_priority_score(age, symptoms or "", wait_time, emergency)

    return {
        # Core fields (existing frontend uses these)
        "wait_time":          wait_time,
        "advice":             advice,
        "peak_hour":          peak,
        "crowd":              crowd,
        "best_time":          best_time,
        "doctor":             doctor,
        "emergency":          emergency,
        "is_emergency":       is_emergency,
        "department":         department,
        "hospital_status":    status,
        "elderly_mode":       elderly,
        "journey":            journey_list,
        "total_time":         total_time,
        "hospital_alternative": hospital_alt,
        # New enriched fields
        "explanation":        explanation,
        "position":           position,
        "estimated_arrival":  eta_str,
        "priority_score":     priority_score,
        "queue_length":       queue_len,
        "consult_time":       consult_time,
    }


# ───────────────────────────────────────────────────────
# 12. DASHBOARD STATS
# ───────────────────────────────────────────────────────
def get_dashboard_stats(hospital_id=1):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT COUNT(*) as cnt FROM tokens WHERE hospital_id = ? AND status = 'waiting'",
        (hospital_id,)
    )
    total_waiting = cur.fetchone()["cnt"]

    cur.execute(
        "SELECT COUNT(*) as cnt FROM tokens WHERE hospital_id = ? AND status = 'completed'",
        (hospital_id,)
    )
    total_served = cur.fetchone()["cnt"]

    cur.execute("""
        SELECT COUNT(*) as cnt FROM doctors dr
        JOIN departments d ON dr.dept_id = d.dept_id
        WHERE d.hospital_id = ? AND dr.availability = 'Available'
    """, (hospital_id,))
    active_doctors = cur.fetchone()["cnt"]

    cur.execute("""
        SELECT d.dept_id, d.dept_name as name, d.avg_consult_time,
               COUNT(CASE WHEN t.status='waiting'   THEN 1 END) as waiting,
               COUNT(CASE WHEN t.status='completed' THEN 1 END) as completed
        FROM departments d
        LEFT JOIN tokens t ON d.dept_id = t.dept_id
        WHERE d.hospital_id = ?
        GROUP BY d.dept_id
    """, (hospital_id,))

    departments = []
    for row in cur.fetchall():
        r = dict(row)
        wait_time, advice, _, _ = get_wait_info(r["dept_id"])
        peak, crowd, suggestion, color = get_crowd_and_timing(r["dept_id"])
        r.update({
            "est_wait":    wait_time,
            "crowd_level": crowd,
            "crowd_color": color,
            "peak_hour":   peak,
        })
        departments.append(r)

    conn.close()
    return {
        "total_waiting":  total_waiting,
        "total_served":   total_served,
        "active_doctors": active_doctors,
        "departments":    departments,
    }
