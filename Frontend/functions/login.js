// Function to handle switching between Sign In / Sign Up
function toggleAuthView(showSignUp)
{
    const container = document.getElementById("container");

    if (showSignUp) {
      container.classList.add("show-sign-up");
    } else {
      container.classList.remove("show-sign-up");
    }
}

// Attach events to your buttons
document.getElementById("switchtosignup").addEventListener("click", () => toggleAuthView(true));
document.getElementById("switchtosignin").addEventListener("click", () => toggleAuthView(false));

