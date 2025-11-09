import API from "./api.js"
const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ump-html-1.onrender.com";

function cookieGet(name) {
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

function cookieRemove(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

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

  const email = cookieGet("pendingEmail"); // from signup step (cookie)
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
    cookieRemove("pendingEmail");
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

  const userEmail = cookieGet("email"); // replaced sessionStorage with cookie

  if (!userEmail) {
    alert("Missing email. Please go back and enter your email again.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/auth/resend-otp`, {
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
