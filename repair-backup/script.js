// =========================================
// PlateTrack | Traffic Enforcer Login
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");
    const loginButton = document.getElementById("loginButton");

    const API_URL = "http://localhost:5000/api/auth/enforcer/login";

    if (!loginForm) {
        return;
    }

    // ===============================
    // Show / Hide Password
    // ===============================

    if (togglePassword && password) {

        togglePassword.addEventListener("click", () => {

            const icon = togglePassword.querySelector("i");

            if (password.type === "password") {

                password.type = "text";
                icon.className = "fa-solid fa-eye-slash";
                togglePassword.setAttribute("aria-label", "Hide Password");

            } else {

                password.type = "password";
                icon.className = "fa-solid fa-eye";
                togglePassword.setAttribute("aria-label", "Show Password");

            }

        });

    }

    // ===============================
    // Login Form Submit
    // ===============================

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const emailValue = email.value.trim().toLowerCase();
        const passwordValue = password.value;

        if (emailValue === "") {

            showError(
                "Email Required",
                "Please enter your registered PlateTrack email address."
            );

            return;

        }

        if (!emailValue.includes("@") || !emailValue.includes(".")) {

            showError(
                "Invalid Email",
                "Please enter a valid email address."
            );

            return;

        }

        if (passwordValue === "") {

            showError(
                "Password Required",
                "Please enter your account password."
            );

            return;

        }

        setLoadingState(true);

        try {

            const response = await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: emailValue,
                    password: passwordValue
                })

            });

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message || "Unable to sign in. Please try again."
                );

            }

            if (!data.token || !data.user) {

                throw new Error(
                    "The server returned an incomplete login response."
                );

            }

            // ===============================
            // Save authenticated session
            // ===============================

            const storage = document.getElementById("remember")?.checked
                ? localStorage
                : sessionStorage;

            localStorage.removeItem("plateTrackToken");
            localStorage.removeItem("plateTrackEnforcer");
            sessionStorage.removeItem("plateTrackToken");
            sessionStorage.removeItem("plateTrackEnforcer");

            storage.setItem("plateTrackToken", data.token);
            storage.setItem(
                "plateTrackEnforcer",
                JSON.stringify(data.user)
            );

            loginButton.classList.remove("loading");
            loginButton.classList.add("success");

            loginButton.innerHTML = `
                <i class="fa-solid fa-circle-check"></i>
                Login Successful
            `;

            showSuccess(
                "Login Successful",
                `Welcome back, ${data.user.fullName}.`,
                () => {
                    window.location.href = "enforcer-dashboard.html";
                }
            );

        } catch (error) {

            console.error("Login error:", error);

            showError(
                "Login Failed",
                error.message ||
                "Unable to connect to the PlateTrack server."
            );

            resetLoginButton();

        }

    });

    // ===============================
    // Button Helpers
    // ===============================

    function setLoadingState(isLoading) {

        loginButton.disabled = isLoading;

        if (isLoading) {

            loginButton.classList.remove("success");
            loginButton.classList.add("loading");

            loginButton.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Signing in...
            `;

        }

    }

    function resetLoginButton() {

        loginButton.disabled = false;
        loginButton.classList.remove("loading", "success");
        loginButton.innerHTML = "Sign in to System";

    }

});
