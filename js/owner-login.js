// =========================================
// PlateTrack | Vehicle Owner Login
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("ownerLoginForm");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");
    const loginButton = document.getElementById("loginButton");

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
    // Get Registered Owners
    // ===============================

    function getOwners(){

        return JSON.parse(localStorage.getItem("plateTrackOwners")) || [];

    }

    // ===============================
    // Login Form Submit
    // ===============================

    loginForm.addEventListener("submit", (e) => {

        e.preventDefault();

        const emailValue = email.value.trim().toLowerCase();
        const passwordValue = password.value.trim();

        if(emailValue === ""){

            showError(
                "Email Required",
                "Please enter your registered email address."
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

        const owners = getOwners();

        const matchedOwner = owners.find(function(owner){
            return owner.email.toLowerCase() === emailValue;
        });

        if(!matchedOwner){

            showError(
                "Account Not Found",
                "No vehicle owner account was found for this email address. Please register first."
            );

            return;

        }

        if(matchedOwner.password !== passwordValue){

            showError(
                "Incorrect Password",
                "The password you entered is incorrect. Please try again."
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

            loginButton.classList.remove("loading");
            loginButton.classList.add("success");

            loginButton.innerHTML = `
                <i class="fa-solid fa-circle-check"></i>
                Login Successful
            `;

            setTimeout(() => {

                localStorage.setItem("plateTrackOwnerSession", matchedOwner.email);

                showSuccess(
                    "Login Successful",
                    `Welcome back, ${matchedOwner.fullName}. Redirecting you to your dashboard.`,
                    () => {
                        window.location.href = "owner-dashboard.html";
                    }
                );

                loginButton.disabled = false;
                loginButton.classList.remove("success");
                loginButton.innerHTML = "Sign in to My Account";

            }, 850);

        }, 1200);

    });

});
