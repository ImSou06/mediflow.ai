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
    """Create tables and seed with demo data if the DB doesn't exist yet."""
    conn = get_connection()
    cur = conn.cursor()

    # ── Tables (Updated to team member's schema) ────────────────
    cur.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT UNIQUE,
        age INTEGER,
        gender TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS hospitals (
        hospital_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        location TEXT,
        total_departments INTEGER
    );

    CREATE TABLE IF NOT EXISTS departments (
        dept_id INTEGER PRIMARY KEY AUTOINCREMENT,
        hospital_id INTEGER,
        dept_name TEXT,
        avg_consult_time INTEGER,
        FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
    );

    CREATE TABLE IF NOT EXISTS doctors (
        doctor_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        dept_id INTEGER,
        available BOOLEAN DEFAULT 1,
        shift_start TEXT,
        shift_end TEXT,
        FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
    );

    CREATE TABLE IF NOT EXISTS tokens (
        token_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        hospital_id INTEGER,
        dept_id INTEGER,
        doctor_id INTEGER,
        token_number TEXT,
        status TEXT,
        priority TEXT DEFAULT 'normal',
        symptoms TEXT,
        estimated_time TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id),
        FOREIGN KEY (dept_id) REFERENCES departments(dept_id),
        FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
    );

    CREATE TABLE IF NOT EXISTS queue_logs (
        log_id INTEGER PRIMARY KEY AUTOINCREMENT,
        dept_id INTEGER,
        date DATE,
        total_patients INTEGER,
        avg_wait_time INTEGER,
        peak_hour TEXT,
        FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
    );

    CREATE INDEX IF NOT EXISTS idx_dept ON tokens(dept_id);
    CREATE INDEX IF NOT EXISTS idx_status ON tokens(status);
    """)

    # ── Seed data (only if hospitals table is empty) ───────
    cur.execute("SELECT COUNT(*) FROM hospitals")
    if cur.fetchone()[0] == 0:
        _seed(cur)

    conn.commit()
    conn.close()


def _seed(cur):
    """Insert demo hospitals, departments, doctors, tokens, queue_logs."""

    # Hospitals
    hospitals = [
        ('City Hospital', 'Kolkata', 6),
        ('District Hospital', 'Howrah', 6),
        ('Apollo Lifeline', 'Salt Lake', 6),
    ]
    cur.executemany(
        "INSERT INTO hospitals (name, location, total_departments) VALUES (?,?,?)",
        hospitals,
    )

    # Departments
    dept_names = [
        ("General Medicine", 10),
        ("Orthopedic", 15),
        ("Dental", 15),
        ("Cardiology", 20),
        ("Pediatrics", 10),
        ("ENT", 12),
    ]
    for h_id in range(1, 4):
        for name, consult in dept_names:
            cur.execute(
                "INSERT INTO departments (hospital_id, dept_name, avg_consult_time) VALUES (?,?,?)",
                (h_id, name, consult)
            )

    # Doctors
    doctor_pool = [
        ('Dr. Sharma', '09:00', '15:00'),
        ('Dr. Roy', '10:00', '16:00'),
        ('Dr. Das', '08:00', '14:00'),
        ('Dr. Gupta', '12:00', '18:00'),
        ('Dr. Sen', '09:00', '17:00'),
    ]
    for d_id in range(1, 19):  # 3 hospitals * 6 depts
        # Assign 2 doctors per department
        docs = random.sample(doctor_pool, 2)
        for name, start, end in docs:
            cur.execute(
                "INSERT INTO doctors (name, dept_id, available, shift_start, shift_end) VALUES (?,?,?,?,?)",
                (name, d_id, 1, start, end)
            )

    # Users
    users = [
        ('Ramesh', '9876543210', 45, 'Male'),
        ('Sita', '9123456780', 60, 'Female'),
        ('Rahul', '9988776655', 25, 'Male'),
        ('Priya', '8877665544', 32, 'Female'),
    ]
    cur.executemany(
        "INSERT INTO users (name, phone, age, gender) VALUES (?,?,?,?)",
        users,
    )

    # Tokens
    statuses = ["waiting"] * 6 + ["completed"] * 3 + ["missed"]
    priorities = ["normal", "normal", "elderly", "emergency"]
    for d_id in range(1, 19):
        # Determine hospital_id for this dept
        hospital_id = (d_id - 1) // 6 + 1
        
        # Get doctors for this dept
        cur.execute("SELECT doctor_id FROM doctors WHERE dept_id = ?", (d_id,))
        doc_ids = [r['doctor_id'] for r in cur.fetchall()]
        
        for i in range(random.randint(3, 8)):
            u_id = random.randint(1, 4)
            doc_id = random.choice(doc_ids)
            t_num = f"{chr(64 + (d_id % 26) + 1)}{100 + i}"
            status = random.choice(statuses)
            priority = random.choice(priorities)
            
            cur.execute("""
                INSERT INTO tokens (user_id, hospital_id, dept_id, doctor_id, token_number, status, priority, symptoms)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (u_id, hospital_id, d_id, doc_id, t_num, status, priority, "Regular checkup"))

    # Queue logs
    for d_id in range(1, 19):
        for days_ago in range(3):
            date = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d')
            cur.execute("""
                INSERT INTO queue_logs (dept_id, date, total_patients, avg_wait_time, peak_hour)
                VALUES (?, ?, ?, ?, ?)
            """, (d_id, date, random.randint(50, 150), random.randint(30, 60), random.choice(['11AM-1PM', '10AM-12PM', '12PM-2PM'])))
