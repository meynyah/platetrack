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

        let enforcers;
        try{
            const stored = JSON.parse(localStorage.getItem("plateTrackEnforcers"));
            enforcers = Array.isArray(stored) ? stored : [];
        }catch(error){ enforcers = []; }
        const matchedEnforcer = enforcers.find(function(enforcer){
            return enforcer.email && enforcer.email.toLowerCase() === emailValue.toLowerCase();
        });
        if(!matchedEnforcer){
            showError("Account Not Found", "No traffic enforcer account was found for this email address.");
            return;
        }
        const status = (matchedEnforcer.status || "pending").toLowerCase();
        if(status !== "approved" && status !== "active"){
            showError("Account Pending Approval", "Your enforcer account must be approved before you can sign in.");
            return;
        }
        if(matchedEnforcer.password !== passwordValue){
            showError("Incorrect Password", "The password you entered is incorrect.");
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
                    `Welcome back, ${matchedEnforcer.fullName}. Redirecting you to the dashboard.`,
                    () => {
                        localStorage.setItem("plateTrackEnforcerSession", matchedEnforcer.email);
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
