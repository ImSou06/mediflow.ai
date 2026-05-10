"""
MediFlow AI — Database Layer
Schema v1.2: merged original relational structure + new tables from database-edit-1.2
New tables: symptoms_history, emergency_cases, appointments, feedback
Updated schemas: hospitals (hospital_name, total_doctors, emergency_available,
                             avg_wait_time, busyness_level),
                 doctors (doctor_name, specialization, patients_today, availability),
                 queue_logs (log_date instead of date)
"""
import sqlite3
import os
import random
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), 'database.db')


def get_connection():
    """Return a connection with row_factory for dict-like access."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create all tables and seed demo data if the DB is fresh."""
    conn = get_connection()
    cur = conn.cursor()

    cur.executescript("""
    -- ── Core tables ──────────────────────────────────────────────────────────

    CREATE TABLE IF NOT EXISTS users (
        user_id    INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT NOT NULL,
        phone      TEXT UNIQUE,
        age        INTEGER,
        gender     TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS hospitals (
        hospital_id         INTEGER PRIMARY KEY AUTOINCREMENT,
        hospital_name       TEXT NOT NULL,
        location            TEXT,
        total_doctors       INTEGER,
        emergency_available TEXT DEFAULT 'Yes',
        avg_wait_time       INTEGER DEFAULT 30,
        busyness_level      TEXT DEFAULT 'Moderate'
    );

    CREATE TABLE IF NOT EXISTS departments (
        dept_id          INTEGER PRIMARY KEY AUTOINCREMENT,
        hospital_id      INTEGER,
        dept_name        TEXT,
        avg_consult_time INTEGER,
        FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
    );

    CREATE TABLE IF NOT EXISTS doctors (
        doctor_id      INTEGER PRIMARY KEY AUTOINCREMENT,
        doctor_name    TEXT,
        specialization TEXT,
        dept_id        INTEGER,
        patients_today INTEGER DEFAULT 0,
        availability   TEXT DEFAULT 'Available',
        FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
    );

    CREATE TABLE IF NOT EXISTS tokens (
        token_id       INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id        INTEGER,
        hospital_id    INTEGER,
        dept_id        INTEGER,
        doctor_id      INTEGER,
        token_number   TEXT,
        status         TEXT,
        priority       TEXT DEFAULT 'normal',
        symptoms       TEXT,
        estimated_time TIMESTAMP,
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id)    REFERENCES users(user_id),
        FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id),
        FOREIGN KEY (dept_id)    REFERENCES departments(dept_id),
        FOREIGN KEY (doctor_id)  REFERENCES doctors(doctor_id)
    );

    CREATE TABLE IF NOT EXISTS queue_logs (
        log_id          INTEGER PRIMARY KEY AUTOINCREMENT,
        dept_id         INTEGER,
        log_date        DATE,
        total_patients  INTEGER,
        avg_wait_time   INTEGER,
        peak_hour       TEXT,
        FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
    );

    -- ── New tables from database-edit-1.2 ────────────────────────────────────

    CREATE TABLE IF NOT EXISTS symptoms_history (
        history_id           INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id              INTEGER,
        symptoms             TEXT,
        severity_score       INTEGER,
        predicted_department TEXT,
        visit_date           TEXT,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    );

    CREATE TABLE IF NOT EXISTS emergency_cases (
        case_id        INTEGER PRIMARY KEY AUTOINCREMENT,
        token_id       INTEGER,
        emergency_level TEXT,
        response_time  INTEGER,
        admitted       TEXT,
        FOREIGN KEY (token_id) REFERENCES tokens(token_id)
    );

    CREATE TABLE IF NOT EXISTS appointments (
        appointment_id   INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id          INTEGER,
        doctor_id        INTEGER,
        appointment_date TEXT,
        appointment_time TEXT,
        status           TEXT,
        FOREIGN KEY (user_id)   REFERENCES users(user_id),
        FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
    );

    CREATE TABLE IF NOT EXISTS feedback (
        feedback_id   INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id       INTEGER,
        rating        INTEGER,
        feedback_text TEXT,
        created_at    TEXT,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    );

    -- ── Indexes ───────────────────────────────────────────────────────────────
    CREATE INDEX IF NOT EXISTS idx_dept   ON tokens(dept_id);
    CREATE INDEX IF NOT EXISTS idx_status ON tokens(status);
    """)

    # Seed only if hospitals table is empty
    cur.execute("SELECT COUNT(*) FROM hospitals")
    if cur.fetchone()[0] == 0:
        _seed(cur)

    conn.commit()
    conn.close()


def _seed(cur):
    """Insert rich demo data covering all tables."""

    # ── Hospitals ─────────────────────────────────────────────────────────────
    hospitals = [
        ('City Hospital',    'Kolkata',   40, 'Yes', 45, 'High'),
        ('District Hospital','Howrah',    30, 'Yes', 30, 'Moderate'),
        ('Apollo Lifeline',  'Salt Lake', 35, 'Yes', 20, 'Low'),
    ]
    cur.executemany(
        "INSERT INTO hospitals (hospital_name, location, total_doctors, "
        "emergency_available, avg_wait_time, busyness_level) VALUES (?,?,?,?,?,?)",
        hospitals,
    )

    # ── Departments (6 per hospital) ──────────────────────────────────────────
    dept_names = [
        ("General Medicine", 10),
        ("Orthopedic",       15),
        ("Dental",           15),
        ("Cardiology",       20),
        ("Pediatrics",       10),
        ("ENT",              12),
    ]
    for h_id in range(1, 4):
        for name, consult in dept_names:
            cur.execute(
                "INSERT INTO departments (hospital_id, dept_name, avg_consult_time) VALUES (?,?,?)",
                (h_id, name, consult)
            )

    # ── Doctors (2 per department, 18 depts total) ────────────────────────────
    doctor_pool = [
        ('Dr. Sharma', 'General Medicine'),
        ('Dr. Roy',    'Cardiology'),
        ('Dr. Das',    'Orthopedic'),
        ('Dr. Gupta',  'Pediatrics'),
        ('Dr. Sen',    'ENT'),
    ]
    for d_id in range(1, 19):
        docs = random.sample(doctor_pool, 2)
        for name, spec in docs:
            cur.execute(
                "INSERT INTO doctors (doctor_name, specialization, dept_id, "
                "patients_today, availability) VALUES (?,?,?,?,?)",
                (name, spec, d_id, random.randint(5, 20),
                 random.choice(['Available', 'Busy']))
            )

    # ── Users ─────────────────────────────────────────────────────────────────
    users = [
        ('Ramesh', '9876543210', 45, 'Male'),
        ('Sita',   '9123456780', 60, 'Female'),
        ('Rahul',  '9988776655', 25, 'Male'),
        ('Priya',  '8877665544', 32, 'Female'),
        ('Amit',   '9000000001', 34, 'Male'),
        ('Ananya', '9000000004', 22, 'Female'),
        ('Karan',  '9000000005', 39, 'Male'),
        ('Neha',   '9000000006', 48, 'Female'),
    ]
    cur.executemany(
        "INSERT INTO users (name, phone, age, gender) VALUES (?,?,?,?)",
        users,
    )

    # ── Tokens ────────────────────────────────────────────────────────────────
    statuses   = ["waiting"] * 6 + ["completed"] * 3 + ["missed"]
    priorities = ["normal", "normal", "elderly", "emergency"]
    for d_id in range(1, 19):
        hospital_id = (d_id - 1) // 6 + 1
        cur.execute("SELECT doctor_id FROM doctors WHERE dept_id = ?", (d_id,))
        doc_ids = [r['doctor_id'] for r in cur.fetchall()]
        for i in range(random.randint(3, 8)):
            u_id    = random.randint(1, 8)
            doc_id  = random.choice(doc_ids) if doc_ids else None
            t_num   = f"A{i:03d}"
            status  = random.choice(statuses)
            priority = random.choice(priorities)
            cur.execute(
                "INSERT INTO tokens (user_id, hospital_id, dept_id, doctor_id, "
                "token_number, status, priority, symptoms) VALUES (?,?,?,?,?,?,?,?)",
                (u_id, hospital_id, d_id, doc_id, t_num, status, priority, "Regular checkup")
            )

    # ── Queue logs ────────────────────────────────────────────────────────────
    for d_id in range(1, 19):
        for days_ago in range(3):
            log_date = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d')
            cur.execute(
                "INSERT INTO queue_logs (dept_id, log_date, total_patients, "
                "avg_wait_time, peak_hour) VALUES (?,?,?,?,?)",
                (d_id, log_date, random.randint(50, 150),
                 random.randint(30, 60),
                 random.choice(['11AM-1PM', '10AM-12PM', '12PM-2PM']))
            )

    # ── Symptoms history ──────────────────────────────────────────────────────
    symptoms_data = [
        (1, "fever and cough",  2, "General Medicine", "2026-05-01"),
        (2, "chest pain",       8, "Cardiology",       "2026-05-02"),
        (3, "bone fracture",    7, "Orthopedic",       "2026-05-02"),
        (4, "skin allergy",     3, "General Medicine", "2026-05-03"),
    ]
    cur.executemany(
        "INSERT INTO symptoms_history (user_id, symptoms, severity_score, "
        "predicted_department, visit_date) VALUES (?,?,?,?,?)",
        symptoms_data,
    )

    # ── Appointments ──────────────────────────────────────────────────────────
    cur.executemany(
        "INSERT INTO appointments (user_id, doctor_id, appointment_date, "
        "appointment_time, status) VALUES (?,?,?,?,?)",
        [
            (1, 1, "2026-05-10", "10:00", "Booked"),
            (2, 2, "2026-05-10", "11:00", "Completed"),
        ]
    )

    # ── Feedback ──────────────────────────────────────────────────────────────
    cur.executemany(
        "INSERT INTO feedback (user_id, rating, feedback_text, created_at) VALUES (?,?,?,?)",
        [
            (1, 5, "Very smooth process",   "2026-05-01"),
            (2, 4, "Good AI predictions",   "2026-05-02"),
        ]
    )
