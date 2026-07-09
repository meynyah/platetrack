// =========================================
// PlateTrack | Traffic Enforcer Login
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");
    const loginButton = document.getElementById("loginButton");

    if(!loginForm){
        return;
    }

    // ===============================
    // Show / Hide Password
    // ===============================

    if(togglePassword && password){

        togglePassword.addEventListener("click", () => {

            const icon = togglePassword.querySelector("i");

            if(password.type === "password"){

                password.type = "text";
                icon.className = "fa-solid fa-eye-slash";
                togglePassword.setAttribute("aria-label", "Hide Password");

            }else{

                password.type = "password";
                icon.className = "fa-solid fa-eye";
                togglePassword.setAttribute("aria-label", "Show Password");

            }

        });

    }

    // ===============================
    // Login Form Submit
    // ===============================

    loginForm.addEventListener("submit", (e) => {

        e.preventDefault();

        const emailValue = email.value.trim();
        const passwordValue = password.value.trim();

        if(emailValue === ""){

            showError(
                "Email Required",
                "Please enter your registered PlateTrack email address."
            );

            return;

        }

        if(!emailValue.includes("@") || !emailValue.includes(".")){

            showError(
                "Invalid Email",
                "Please enter a valid email address."
            );

            return;

        }

        if(passwordValue === ""){

            showError(
                "Password Required",
                "Please enter your account password."
            );

            return;

        }

        // ===============================
        // Loading State
        // ===============================

        loginButton.disabled = true;
        loginButton.classList.add("loading");

        loginButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Signing in...
        `;

        setTimeout(() => {

            // ===============================
            // Success State
            // ===============================

            loginButton.classList.remove("loading");
            loginButton.classList.add("success");

            loginButton.innerHTML = `
                <i class="fa-solid fa-circle-check"></i>
                Login Successful
            `;

            setTimeout(() => {

                showSuccess(
                    "Login Successful",
                    "Welcome back, Traffic Enforcer. Redirecting you to the dashboard.",
                    () => {
                        window.location.href = "enforcer-dashboard.html";
                    }
                );

                // Reset if modal is closed but page stays

                loginButton.disabled = false;
                loginButton.classList.remove("success");
                loginButton.innerHTML = "Sign in to System";

            }, 850);

        }, 1500);

    });

});
