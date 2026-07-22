// =========================================
// PlateTrack | Vehicle Owner Login
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("ownerLoginForm");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");
    const loginButton = document.getElementById("loginButton");

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

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const emailValue = email.value.trim().toLowerCase();
        const passwordValue = password.value.trim();

        if(emailValue === ""){
            showError("Email Required", "Please enter your registered email address.");
            return;
        }

        if(!emailValue.includes("@") || !emailValue.includes(".")){
            showError("Invalid Email", "Please enter a valid email address.");
            return;
        }

        if(passwordValue === ""){
            showError("Password Required", "Please enter your account password.");
            return;
        }

        loginButton.disabled = true;
        loginButton.classList.add("loading");
        loginButton.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Signing in...`;

        try {

            const response = await fetch(`${API_BASE_URL}/api/auth/owner/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailValue, password: passwordValue })
            });

            const data = await response.json();

            if(!response.ok){
                loginButton.disabled = false;
                loginButton.classList.remove("loading");
                loginButton.innerHTML = "Sign in to My Account";

                let errorTitle = "Login Failed";
                if(response.status === 401) errorTitle = "Invalid Credentials";
                if(response.status === 403) errorTitle = "Account Not Approved";

                showError(errorTitle, data.message || "Something went wrong. Please try again.");
                return;
            }

            const matchedOwner = data.user;

            loginButton.classList.remove("loading");
            loginButton.classList.add("success");
            loginButton.innerHTML = `<i class="fa-solid fa-circle-check"></i> Login Successful`;

            setTimeout(() => {

                localStorage.setItem("plateTrackToken", data.token);
                localStorage.setItem("plateTrackOwnerSession", JSON.stringify(matchedOwner));

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

        } catch (error) {
            loginButton.disabled = false;
            loginButton.classList.remove("loading");
            loginButton.innerHTML = "Sign in to My Account";
            showError("Connection Error", "Unable to reach the server. Please try again.");
        }

    });

});