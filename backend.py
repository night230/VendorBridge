from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_mail import Mail, Message
import sqlite3
import jwt
import datetime
import random
import time

app = Flask(__name__)
CORS(app)

# ================= MAIL CONFIG =================
app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 587
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USERNAME"] = "ygamer2306@gmail.com"
app.config["MAIL_PASSWORD"] = "ohuq dzmb kedg dglw"
app.config["MAIL_DEFAULT_SENDER"] = "ygamer2306@gmail.com"

mail = Mail(app)

# ================= DATABASE =================
def init_db():
    conn = sqlite3.connect("users.db")
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            password TEXT
        )
    """)

    conn.commit()
    conn.close()

init_db()

# ================= OTP STORE (TEMP MEMORY) =================
otp_store = {}

# ================= CONFIG =================
SECRET_KEY = "mysecretkey"


def create_token(email):
    return jwt.encode(
        {"email": email, "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)},
        SECRET_KEY,
        algorithm="HS256"
    )

# ================= EMAIL FUNCTION =================
def send_email(to, subject, body):
    msg = Message(subject, recipients=[to], body=body)
    mail.send(msg)

# ================= OTP GENERATOR =================
def generate_otp():
    return str(random.randint(100000, 999999))

# ================= SIGNUP =================
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    email = data["email"]
    password = data["password"]

    conn = sqlite3.connect("users.db")
    c = conn.cursor()

    try:
        c.execute("INSERT INTO users (email, password) VALUES (?, ?)", (email, password))
        conn.commit()
    except:
        return jsonify({"msg": "User already exists"}), 400

    conn.close()

    # OTP + Welcome Email
    otp = generate_otp()
    otp_store[email] = otp

    send_email(
        email,
        "Welcome to VendorBridge 🎉",
        f"""
Hello,

Welcome to VendorBridge!
Your account has been created successfully.

Your OTP for verification is: {otp}

Thanks,
Team VendorBridge
        """
    )

    return jsonify({"msg": "Signup successful. OTP sent to email."})


# ================= LOGIN =================
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data["email"]
    password = data["password"]

    conn = sqlite3.connect("users.db")
    c = conn.cursor()

    c.execute("SELECT * FROM users WHERE email=? AND password=?", (email, password))
    user = c.fetchone()

    conn.close()

    if not user:
        return jsonify({"msg": "Invalid credentials"}), 401

    token = create_token(email)

    # Welcome Back Email
    send_email(
        email,
        "Welcome Back 👋",
        f"""
Hello,

You have successfully logged into VendorBridge.

If this wasn't you, please reset your password immediately.

Thanks,
Team VendorBridge
        """
    )

    return jsonify({
        "msg": "Login successful",
        "token": token
    })


# ================= FORGOT PASSWORD =================
@app.route("/forgot", methods=["POST"])
def forgot():
    email = request.json["email"]

    conn = sqlite3.connect("users.db")
    c = conn.cursor()

    c.execute("SELECT * FROM users WHERE email=?", (email,))
    user = c.fetchone()

    conn.close()

    if not user:
        return jsonify({"msg": "User not found"}), 404

    otp = generate_otp()
    otp_store[email] = otp

    send_email(
        email,
        "Password Reset OTP 🔐",
        f"""
Hello,

We received a request to reset your password.

Your OTP is: {otp}

This OTP is valid for a short time.

If this wasn't you, ignore this email.

Thanks,
Team VendorBridge
        """
    )

    return jsonify({"msg": "OTP sent for password reset"})


# ================= RESET PASSWORD =================
@app.route("/reset", methods=["POST"])
def reset():
    data = request.json
    email = data["email"]
    otp = data["otp"]
    new_password = data["new_password"]

    if email not in otp_store:
        return jsonify({"msg": "OTP expired"}), 400

    if otp_store[email] != otp:
        return jsonify({"msg": "Invalid OTP"}), 400

    conn = sqlite3.connect("users.db")
    c = conn.cursor()

    c.execute("UPDATE users SET password=? WHERE email=?", (new_password, email))
    conn.commit()
    conn.close()

    del otp_store[email]

    send_email(
        email,
        "Password Reset Successful ✅",
        """
Hello,

Your password has been successfully reset.

If this wasn't you, contact support immediately.

Thanks,
Team VendorBridge
        """
    )

    return jsonify({"msg": "Password reset successful"})


# ================= RUN SERVER =================
if __name__ == "__main__":
    app.run(debug=True)
    
    # ================= VERIFY OTP =================
@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.json
    email = data["email"]
    otp = data["otp"]

    if email not in otp_store:
        return jsonify({"msg": "OTP expired or not found"}), 400

    if otp_store[email] != otp:
        return jsonify({"msg": "Invalid OTP"}), 400

    del otp_store[email]
    return jsonify({"msg": "OTP verified successfully"})