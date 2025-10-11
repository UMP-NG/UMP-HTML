// ../functions/auth.js

import API from "../functions/api.js";

// Select DOM elements
const inputs = document.querySelectorAll(".code-inputs input");
const verifyBtn = document.querySelector(".verify-btn");

// Autofocus & move between fields
inputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    if (input.value.length === 1 && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !input.value && index > 0) {
      inputs[index - 1].focus();
    }
  });
});

verifyBtn.addEventListener("click", async () => {
  const otp = Array.from(inputs)
    .map((i) => i.value)
    .join("");
  if (otp.length !== 4) {
    alert("Please enter the full 4-digit code.");
    return;
  }

  const email = localStorage.getItem("pendingEmail"); // from signup step
  if (!email) {
    alert("No email found — please sign up again.");
    window.location.href = "../Pages/signup.html";
    return;
  }

  verifyBtn.disabled = true;
  verifyBtn.textContent = "Verifying...";

  try {
    await API.verifyOtp({ email, otp });
    alert("✅ Email verified successfully!");
    localStorage.removeItem("pendingEmail");
    window.location.href = "..Pages/login.html"; // redirect to login
  } catch (err) {
    alert(err.body?.message || "Invalid or expired OTP.");
  } finally {
    verifyBtn.disabled = false;
    verifyBtn.textContent = "Verify";
  }
});

const resendLink = document.getElementById("resend-link");

resendLink.addEventListener("click", async (e) => {
  e.preventDefault();

  const userEmail = sessionStorage.getItem("email"); // or however you stored it

  if (!userEmail) {
    alert("Missing email. Please go back and enter your email again.");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/auth/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail }),
    });

    const data = await response.json();
    if (response.ok) {
      alert("✅ OTP has been resent to your email.");
    } else {
      alert("❌ Failed to resend OTP: " + data.message);
    }
  } catch (err) {
    console.error(err);
    alert("❌ Network error. Please try again.");
  }
});
