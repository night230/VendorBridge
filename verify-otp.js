// ===============================
// CONFIG
// ===============================
const API_URL = "http://127.0.0.1:5000";

// ===============================
// OTP VERIFY
// ===============================
const email = localStorage.getItem("pendingEmail");

if (!email) {
    alert("Session expired. Please signup again.");
    window.location.href = "./login.html";
}

document.getElementById("otpForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const otp = document.getElementById("otp").value.trim();

    if (!otp) {
        alert("OTP daalo pehle.");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Email verified! Ab login karo.");
            localStorage.removeItem("pendingEmail");
            window.location.href = "./login.html";
        } else {
            alert(data.msg || "OTP galat hai. Dobara try karo.");
        }
    } catch (err) {
        alert("Server se connect nahi ho pa raha. Backend chalu hai?");
        console.error(err);
    }
});