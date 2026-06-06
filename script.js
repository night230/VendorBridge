// ===============================
// CONFIG
// ===============================
const API_URL = "http://127.0.0.1:5000";

// ===============================
// UI TOGGLE
// ===============================
const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

if (registerBtn && loginBtn) {
    registerBtn.addEventListener('click', () => {
        container.classList.add('active');
    });

    loginBtn.addEventListener('click', () => {
        container.classList.remove('active');
    });
}

// ===============================
// SIGNUP
// ===============================
const signupForm = document.querySelector(".register form");

if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const inputs = signupForm.querySelectorAll("input");
        const name = inputs[0].value;
        const email = inputs[1].value;
        const password = inputs[2].value;

        try {
            const res = await fetch(`${API_URL}/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                alert("Signup successful! OTP sent to your email.");
                localStorage.setItem("pendingEmail", email);
                window.location.href = "./verify-otp.html";
            } else {
                alert(data.msg || "Signup failed. Try again.");
            }
        } catch (err) {
            alert("Server se connect nahi ho pa raha. Backend chalu hai?");
            console.error(err);
        }
    });
}

// ===============================
// LOGIN
// ===============================
const loginForm = document.querySelector(".login form");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = loginForm.querySelector("input[type='text']").value;
        const password = loginForm.querySelector("input[type='password']").value;

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("userEmail", email);
                alert("Welcome back 👋");
                window.location.href = "../home_dashbord/dashboard.html";
            } else {
                alert(data.msg || "Invalid credentials.");
            }
        } catch (err) {
            alert("Server se connect nahi ho pa raha. Backend chalu hai?");
            console.error(err);
        }
    });
}