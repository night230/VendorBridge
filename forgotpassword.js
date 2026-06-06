const API = "http://127.0.0.1:5000";

document.getElementById("forgotForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const email = document.getElementById("email").value;

    const res = await fetch(`${API}/forgot`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (res.ok) {
        alert("OTP Sent Successfully");

        // show OTP box
        document.getElementById("otpSection").style.display = "block";
    } else {
        alert(data.msg || "Error sending OTP");
    }
});

document.getElementById("verifyBtn").addEventListener("click", async function() {

    const email = document.getElementById("email").value;
    const otp = document.getElementById("otp").value;

    const res = await fetch(`${API}/verify-reset-otp`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, otp })
    });

    const data = await res.json();

    if (res.ok) {
        alert("OTP Verified ✔ Now reset password page open karein");

        // redirect to reset page
        window.location.href = "reset-password.html";
    } else {
        alert(data.msg || "Invalid OTP");
    }
});