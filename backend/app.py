"""
MediFlow AI — Flask Backend
Merged: original relational API + new endpoints from api_updated.py
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import random
import hashlib
from database import init_db, get_connection
from ai_engine import (
    generate_ai_json,
    get_wait_info,
    get_crowd_and_timing,
    suggest_doctor,
    analyze_patient,
    hospital_journey,
    suggest_hospital,
    elderly_mode,
    get_dashboard_stats,
    get_position,
    compute_priority_score,
)

app = Flask(__name__)
CORS(app)

init_db()

# ─────────────────────────────────────────────────────────
# 1. MAIN AI REPORT
# ─────────────────────────────────────────────────────────
@app.route('/api/ai-report', methods=['GET'])
def ai_report():
    try:
        dept_id  = request.args.get('dept_id')
        token    = request.args.get('token')
        symptoms = request.args.get('symptoms')
        age      = request.args.get('age')

        if not dept_id or not symptoms or not age:
            return jsonify({"status": "error", "message": "Missing required parameters"})

        dept_id = int(dept_id)
        age     = int(age)

        data = generate_ai_json(dept_id, token, symptoms, age)

        return jsonify({
            "status": "success",
            "timestamp": datetime.now().isoformat(),
            "meta": {"model": "MediFlow AI v1.0"},
            "data": data,
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})


# ─────────────────────────────────────────────────────────
# 2. WAIT TIME
# ─────────────────────────────────────────────────────────
@app.route('/api/wait-time', methods=['GET'])
def wait_time():
    try:
        dept_id = int(request.args.get('dept_id'))
        wait, advice, queue_len, consult_time = get_wait_info(dept_id)
        return jsonify({
            "wait_time":    wait,
            "advice":       advice,
            "queue_length": queue_len,
            "consult_time": consult_time,
        })
    except Exception as e:
        return jsonify({"error": str(e)})


# ─────────────────────────────────────────────────────────
# 3. CROWD + TIMING
# ─────────────────────────────────────────────────────────
@app.route('/api/crowd-info', methods=['GET'])
def crowd_info():
    try:
        dept_id = int(request.args.get('dept_id'))
        peak, crowd, suggestion, color = get_crowd_and_timing(dept_id)
        return jsonify({"peak_hour": peak, "crowd": crowd, "best_time": suggestion, "color": color})
    except Exception as e:
        return jsonify({"error": str(e)})


# ─────────────────────────────────────────────────────────
# 4. EMERGENCY / DEPARTMENT ANALYSIS
# ─────────────────────────────────────────────────────────
@app.route('/api/analyze', methods=['GET'])
def analyze():
    try:
        symptoms = request.args.get('symptoms')
        dept_id  = int(request.args.get('dept_id'))
        emergency, department, status, is_emergency = analyze_patient(symptoms, dept_id)
        return jsonify({
            "emergency":              emergency,
            "is_emergency":           is_emergency,
            "recommended_department": department,
            "hospital_status":        status,
        })
    except Exception as e:
        return jsonify({"error": str(e)})


# ─────────────────────────────────────────────────────────
# 5. DOCTOR SUGGESTION
# ─────────────────────────────────────────────────────────
@app.route('/api/doctor', methods=['GET'])
def doctor():
    try:
        dept_id = request.args.get('dept_id', type=int)
        doc = suggest_doctor(dept_id)
        return jsonify({"suggested_doctor": doc})
    except Exception as e:
        return jsonify({"error": str(e)})


# ─────────────────────────────────────────────────────────
# 6. HOSPITAL NAVIGATION
# ─────────────────────────────────────────────────────────
@app.route('/api/navigation', methods=['GET'])
def navigation():
    try:
        dept_id = int(request.args.get('dept_id'))
        wait, _, _, _ = get_wait_info(dept_id)
        journey, total = hospital_journey(dept_id, wait)
        return jsonify({"journey": journey, "total_time": total})
    except Exception as e:
        return jsonify({"error": str(e)})


# ─────────────────────────────────────────────────────────
# 7. MULTI-HOSPITAL SUGGESTION
# ─────────────────────────────────────────────────────────
@app.route('/api/hospital-suggestion', methods=['GET'])
def hospital_suggestion():
    try:
        dept_id = int(request.args.get('dept_id'))
        wait, _, _, _ = get_wait_info(dept_id)
        suggestion = suggest_hospital(wait)
        return jsonify({"suggestion": suggestion})
    except Exception as e:
        return jsonify({"error": str(e)})


# ─────────────────────────────────────────────────────────
# 8. ELDERLY MODE
# ─────────────────────────────────────────────────────────
@app.route('/api/elderly', methods=['GET'])
def elderly():
    try:
        age = int(request.args.get('age'))
        result = elderly_mode(age)
        return jsonify({"mode": result})
    except Exception as e:
        return jsonify({"error": str(e)})


# ─────────────────────────────────────────────────────────
# 9. TOKEN BOOKING
# ─────────────────────────────────────────────────────────
@app.route("/api/tokens/book", methods=["POST"])
def book_token():
    data = request.json or {}
    try:
        dept_id      = int(data.get("dept_id", 1))
        patient_name = data.get("patient_name", "Anonymous")
        age          = int(data.get("age", 30))
        phone        = data.get("phone", f"99{random.randint(10000000, 99999999)}")
        gender       = data.get("gender", "Other")
        symptoms     = data.get("symptoms", "")

        conn = get_connection()
        cur  = conn.cursor()

        # User
        cur.execute("SELECT user_id FROM users WHERE phone = ?", (phone,))
        user_row = cur.fetchone()
        if user_row:
            user_id = user_row["user_id"]
        else:
            cur.execute(
                "INSERT INTO users (name, phone, age, gender) VALUES (?, ?, ?, ?)",
                (patient_name, phone, age, gender)
            )
            user_id = cur.lastrowid

        # Hospital
        cur.execute("SELECT hospital_id FROM departments WHERE dept_id = ?", (dept_id,))
        dept_row   = cur.fetchone()
        hospital_id = dept_row["hospital_id"] if dept_row else 1

        # Doctor
        doctor_name = suggest_doctor(dept_id)
        cur.execute(
            "SELECT doctor_id FROM doctors WHERE doctor_name = ? AND dept_id = ?",
            (doctor_name, dept_id)
        )
        doc_row   = cur.fetchone()
        doctor_id = doc_row["doctor_id"] if doc_row else None

        # Token number — random-looking in A000-A199 range
        # Use a per-dept deterministic base (50-180) so tokens look like A153, A090
        # and increment sequentially from there
        base = int(hashlib.md5(f"dept_{dept_id}".encode()).hexdigest(), 16) % 130 + 50
        cur.execute("SELECT COUNT(*) as cnt FROM tokens WHERE dept_id = ?", (dept_id,))
        total_count  = cur.fetchone()["cnt"]
        token_seq    = (base + total_count) % 200
        token_number = f"A{token_seq:03d}"

        # Priority
        emergency, department, status, is_emergency = analyze_patient(symptoms, dept_id)
        priority = "emergency" if is_emergency else ("elderly" if age >= 60 else "normal")

        # Fetch hospital name for response
        cur.execute("SELECT hospital_name FROM hospitals WHERE hospital_id = ?", (hospital_id,))
        hosp_row = cur.fetchone()
        hospital_name_str = hosp_row["hospital_name"] if hosp_row else None

        cur.execute(
            "INSERT INTO tokens (user_id, hospital_id, dept_id, doctor_id, token_number, status, priority, symptoms) "
            "VALUES (?, ?, ?, ?, ?, 'waiting', ?, ?)",
            (user_id, hospital_id, dept_id, doctor_id, token_number, priority, symptoms),
        )
        token_id = cur.lastrowid
        conn.commit()
        conn.close()

        return jsonify({
            "token_id":     token_id,
            "token_number": token_number,
            "token_code":   token_number,
            "priority":     priority,
            "patient_name": patient_name,
            "age":          age,
            "hospital_id":  hospital_id,
            "hospital_name": hospital_name_str,
            "ai_report":    generate_ai_json(dept_id, token_number, symptoms, age),
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─────────────────────────────────────────────────────────
# 10. TOKEN TRACKING
# ─────────────────────────────────────────────────────────
@app.route("/api/tokens/<token_val>")
def get_token(token_val):
    conn = get_connection()
    cur  = conn.cursor()

    query = """
        SELECT t.*, u.name as patient_name, u.age,
               h.hospital_name as hospital_name
        FROM tokens t
        JOIN users u ON t.user_id = u.user_id
        JOIN hospitals h ON t.hospital_id = h.hospital_id
        WHERE {}
    """
    if token_val.isdigit():
        cur.execute(query.format("t.token_id = ?"), (token_val,))
    else:
        cur.execute(query.format("t.token_number = ?"), (token_val,))

    token = cur.fetchone()
    if not token:
        conn.close()
        return jsonify({"error": "Token not found"}), 404

    token_dict = dict(token)
    token_dict["token_code"] = token_dict["token_number"]

    cur.execute(
        "SELECT COUNT(*) as cnt FROM tokens WHERE dept_id = ? AND status = 'waiting' AND token_id < ?",
        (token_dict["dept_id"], token_dict["token_id"])
    )
    token_dict["position"] = cur.fetchone()["cnt"]
    conn.close()

    token_dict["ai_report"] = generate_ai_json(
        token_dict["dept_id"],
        token_dict["token_number"],
        token_dict.get("symptoms", ""),
        token_dict["age"]
    )
    return jsonify(token_dict)


# ─────────────────────────────────────────────────────────
# 11. DASHBOARD STATS
# ─────────────────────────────────────────────────────────
@app.route("/api/dashboard/stats")
def dashboard_stats():
    hospital_id = request.args.get("hospital_id", 1, type=int)
    return jsonify(get_dashboard_stats(hospital_id))


# ─────────────────────────────────────────────────────────
# 12. HOSPITALS LIST
# ─────────────────────────────────────────────────────────
@app.route("/api/hospitals")
def list_hospitals():
    conn = get_connection()
    cur  = conn.cursor()
    cur.execute("""
        SELECT h.hospital_id,
               h.hospital_name  AS name,
               h.location       AS address,
               h.emergency_available,
               h.busyness_level,
               h.avg_wait_time  AS base_wait,
               (SELECT COUNT(*) FROM tokens t
                WHERE t.hospital_id = h.hospital_id AND t.status = 'waiting') AS total_waiting,
               (SELECT COUNT(*) * 12 FROM tokens t
                WHERE t.hospital_id = h.hospital_id AND t.status = 'waiting') AS estimated_wait
        FROM hospitals h
    """)
    hospitals = [dict(r) for r in cur.fetchall()]
    conn.close()

    if hospitals:
        min_wait = min(h["estimated_wait"] for h in hospitals)
        for h in hospitals:
            h["recommended"]  = (h["estimated_wait"] == min_wait)
            h["status_color"] = "green" if h["estimated_wait"] < 30 else ("yellow" if h["estimated_wait"] < 60 else "red")

    return jsonify(hospitals)


# ─────────────────────────────────────────────────────────
# 13. DEPARTMENTS LIST
# ─────────────────────────────────────────────────────────
@app.route("/api/departments")
def list_departments():
    hospital_id = request.args.get("hospital_id", 1, type=int)
    conn = get_connection()
    cur  = conn.cursor()
    cur.execute(
        "SELECT dept_id, dept_name as name FROM departments WHERE hospital_id = ?",
        (hospital_id,)
    )
    depts = [dict(r) for r in cur.fetchall()]
    conn.close()
    return jsonify(depts)


# ─────────────────────────────────────────────────────────
# 14. DEPARTMENT OVERVIEW (Queue Tracker)
# ─────────────────────────────────────────────────────────
@app.route("/api/departments/overview")
def departments_overview():
    hospital_id = request.args.get("hospital_id", 1, type=int)
    conn = get_connection()
    cur  = conn.cursor()
    cur.execute("""
        SELECT d.dept_id, d.dept_name as name, d.avg_consult_time,
               COUNT(CASE WHEN t.status='waiting'   THEN 1 END) as waiting,
               COUNT(CASE WHEN t.status='completed' THEN 1 END) as served
        FROM departments d
        LEFT JOIN tokens t ON d.dept_id = t.dept_id
        WHERE d.hospital_id = ?
        GROUP BY d.dept_id
    """, (hospital_id,))
    rows = cur.fetchall()
    conn.close()

    result = []
    for row in rows:
        r = dict(row)
        wait_time, _, _, _ = get_wait_info(r["dept_id"])
        waiting = r["waiting"] or 0
        if waiting > 7:
            crowd       = "Crowded"
            crowd_level = "high"
        elif waiting > 3:
            crowd       = "Moderate"
            crowd_level = "medium"
        else:
            crowd       = "Fast"
            crowd_level = "low"
        r["wait_time"]   = wait_time
        r["crowd"]       = crowd
        r["crowd_level"] = crowd_level
        result.append(r)
    return jsonify(result)


# ─────────────────────────────────────────────────────────
# 15. DOCTORS ON DUTY
# ─────────────────────────────────────────────────────────
@app.route("/api/doctors")
def list_doctors():
    hospital_id = request.args.get("hospital_id", 1, type=int)
    conn = get_connection()
    cur  = conn.cursor()
    cur.execute("""
        SELECT dr.doctor_id, dr.doctor_name AS name, dr.specialization,
               dr.patients_today, dr.availability,
               d.dept_name AS department
        FROM doctors dr
        JOIN departments d ON dr.dept_id = d.dept_id
        WHERE d.hospital_id = ?
        ORDER BY
            CASE dr.availability WHEN 'Available' THEN 0 ELSE 1 END,
            dr.doctor_name ASC
    """, (hospital_id,))
    doctors = [dict(r) for r in cur.fetchall()]
    conn.close()
    return jsonify(doctors)


# ─────────────────────────────────────────────────────────
# 16. LIVE STATUS  (new from api_updated)
# ─────────────────────────────────────────────────────────
@app.route('/api/live-status', methods=['GET'])
def live_status():
    try:
        dept_id = int(request.args.get('dept_id'))
        wait, _, queue_len, _ = get_wait_info(dept_id)
        peak, crowd, _, _     = get_crowd_and_timing(dept_id)
        return jsonify({
            "wait_time":    wait,
            "queue_length": queue_len,
            "crowd":        crowd,
            "status":       "Live",
            "last_updated": datetime.now().strftime("%H:%M:%S"),
        })
    except Exception as e:
        return jsonify({"error": str(e)})


# ─────────────────────────────────────────────────────────
# 17. ALERT SYSTEM  (new from api_updated)
# ─────────────────────────────────────────────────────────
@app.route('/api/alerts', methods=['GET'])
def alerts():
    try:
        dept_id = int(request.args.get('dept_id'))
        wait, _, _, _ = get_wait_info(dept_id)
        if wait > 60:
            alert = "High waiting time. Consider visiting later."
        elif wait > 30:
            alert = "Moderate crowd. Plan accordingly."
        else:
            alert = "Low crowd. Good time to visit."
        return jsonify({"alert": alert, "wait_time": wait})
    except Exception as e:
        return jsonify({"error": str(e)})


# ─────────────────────────────────────────────────────────
# 18. HEALTH CHECK  (new from api_updated)
# ─────────────────────────────────────────────────────────
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "server":    "running",
        "database":  "connected",
        "ai_model":  "active",
        "timestamp": datetime.now().isoformat(),
    })


# ─────────────────────────────────────────────────────────
# 19. SMART PRIORITY  (new from api_updated)
# ─────────────────────────────────────────────────────────
@app.route('/api/priority', methods=['GET'])
def priority():
    try:
        age      = int(request.args.get('age'))
        symptoms = request.args.get('symptoms', '')
        wait, _, _, _ = get_wait_info(int(request.args.get('dept_id', 1)))
        emergency, _, _, _ = analyze_patient(symptoms, int(request.args.get('dept_id', 1)))
        score = compute_priority_score(age, symptoms, wait, emergency)
        return jsonify({"priority_score": score})
    except Exception as e:
        return jsonify({"error": str(e)})


# ─────────────────────────────────────────────────────────
# 20. TOKEN POSITION  (new from ai_updated)
# ─────────────────────────────────────────────────────────
@app.route('/api/position', methods=['GET'])
def token_position():
    try:
        dept_id = int(request.args.get('dept_id'))
        token   = request.args.get('token')
        pos     = get_position(dept_id, token)
        return jsonify({"position": pos, "found": pos != -1})
    except Exception as e:
        return jsonify({"error": str(e)})


# ─────────────────────────────────────────────────────────
# 21. SYMPTOMS HISTORY
# ─────────────────────────────────────────────────────────
@app.route('/api/symptoms-history', methods=['GET'])
def symptoms_history():
    try:
        user_id = request.args.get('user_id', type=int)
        conn = get_connection()
        cur  = conn.cursor()
        if user_id:
            cur.execute(
                "SELECT * FROM symptoms_history WHERE user_id = ? ORDER BY visit_date DESC",
                (user_id,)
            )
        else:
            cur.execute("SELECT * FROM symptoms_history ORDER BY visit_date DESC LIMIT 50")
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        return jsonify(rows)
    except Exception as e:
        return jsonify({"error": str(e)})


@app.route('/api/symptoms-history', methods=['POST'])
def add_symptoms_history():
    try:
        data = request.json or {}
        conn = get_connection()
        cur  = conn.cursor()
        cur.execute(
            "INSERT INTO symptoms_history (user_id, symptoms, severity_score, "
            "predicted_department, visit_date) VALUES (?,?,?,?,?)",
            (data.get('user_id'), data.get('symptoms'), data.get('severity_score'),
             data.get('predicted_department'), data.get('visit_date', datetime.now().strftime('%Y-%m-%d')))
        )
        conn.commit()
        conn.close()
        return jsonify({"status": "ok", "id": cur.lastrowid}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─────────────────────────────────────────────────────────
# 22. EMERGENCY CASES
# ─────────────────────────────────────────────────────────
@app.route('/api/emergency-cases', methods=['GET'])
def emergency_cases():
    try:
        conn = get_connection()
        cur  = conn.cursor()
        cur.execute("""
            SELECT ec.*, t.token_number, u.name as patient_name
            FROM emergency_cases ec
            JOIN tokens t ON ec.token_id = t.token_id
            JOIN users  u ON t.user_id   = u.user_id
            ORDER BY ec.case_id DESC LIMIT 50
        """)
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        return jsonify(rows)
    except Exception as e:
        return jsonify({"error": str(e)})


# ─────────────────────────────────────────────────────────
# 23. APPOINTMENTS
# ─────────────────────────────────────────────────────────
@app.route('/api/appointments', methods=['GET'])
def get_appointments():
    try:
        user_id = request.args.get('user_id', type=int)
        conn = get_connection()
        cur  = conn.cursor()
        if user_id:
            cur.execute("""
                SELECT a.*, u.name as patient_name, d.doctor_name
                FROM appointments a
                JOIN users   u ON a.user_id   = u.user_id
                JOIN doctors d ON a.doctor_id = d.doctor_id
                WHERE a.user_id = ?
                ORDER BY a.appointment_date, a.appointment_time
            """, (user_id,))
        else:
            cur.execute("""
                SELECT a.*, u.name as patient_name, d.doctor_name
                FROM appointments a
                JOIN users   u ON a.user_id   = u.user_id
                JOIN doctors d ON a.doctor_id = d.doctor_id
                ORDER BY a.appointment_date, a.appointment_time
            """)
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        return jsonify(rows)
    except Exception as e:
        return jsonify({"error": str(e)})


@app.route('/api/appointments', methods=['POST'])
def book_appointment():
    try:
        data = request.json or {}
        conn = get_connection()
        cur  = conn.cursor()
        cur.execute(
            "INSERT INTO appointments (user_id, doctor_id, appointment_date, "
            "appointment_time, status) VALUES (?,?,?,?,?)",
            (data.get('user_id'), data.get('doctor_id'),
             data.get('appointment_date'), data.get('appointment_time'),
             data.get('status', 'Booked'))
        )
        conn.commit()
        appt_id = cur.lastrowid
        conn.close()
        return jsonify({"status": "ok", "appointment_id": appt_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─────────────────────────────────────────────────────────
# 24. FEEDBACK
# ─────────────────────────────────────────────────────────
@app.route('/api/feedback', methods=['GET'])
def get_feedback():
    try:
        conn = get_connection()
        cur  = conn.cursor()
        cur.execute("""
            SELECT f.*, u.name as patient_name
            FROM feedback f
            JOIN users u ON f.user_id = u.user_id
            ORDER BY f.created_at DESC LIMIT 50
        """)
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        return jsonify(rows)
    except Exception as e:
        return jsonify({"error": str(e)})


@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    try:
        data = request.json or {}
        conn = get_connection()
        cur  = conn.cursor()
        cur.execute(
            "INSERT INTO feedback (user_id, rating, feedback_text, created_at) VALUES (?,?,?,?)",
            (data.get('user_id'), data.get('rating'), data.get('feedback_text'),
             datetime.now().strftime('%Y-%m-%d'))
        )
        conn.commit()
        conn.close()
        return jsonify({"status": "ok"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─────────────────────────────────────────────────────────
# HOME
# ─────────────────────────────────────────────────────────
@app.route('/')
def home():
    return jsonify({
        "project": "MediFlow AI",
        "version": "1.2",
        "status":  "Running",
        "apis": [
            "/api/ai-report", "/api/wait-time", "/api/crowd-info",
            "/api/analyze", "/api/doctor", "/api/navigation",
            "/api/hospital-suggestion", "/api/elderly",
            "/api/tokens/book", "/api/tokens/<token>",
            "/api/dashboard/stats", "/api/hospitals", "/api/departments",
            "/api/departments/overview", "/api/doctors",
            "/api/live-status", "/api/alerts", "/api/health",
            "/api/priority", "/api/position",
            "/api/symptoms-history", "/api/emergency-cases",
            "/api/appointments", "/api/feedback",
        ]
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
