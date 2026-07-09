// =========================================
// PlateTrack | Forgot Password
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("forgotPasswordForm");
    const email = document.getElementById("email");
    const button = document.getElementById("sendCodeButton");

    // ===============================
    // Form Submit
    // ===============================

    form.addEventListener("submit", (e) => {

        e.preventDefault();

        const emailValue = email.value.trim();

        // ===============================
        // Validation
        // ===============================

        if(emailValue === ""){

            showError(
                "Email Required",
                "Please enter your registered PlateTrack email address."
            );

            email.focus();

            return;

        }

        const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if(!emailPattern.test(emailValue)){

            showError(
                "Invalid Email",
                "Please enter a valid email address."
            );

            email.focus();

            return;

        }

        // ===============================
        // Loading State
        // ===============================

        button.disabled = true;

        button.classList.add("loading");

        button.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Sending Verification Code...
        `;

        // Simulated request for the static prototype.

        setTimeout(() => {

            // ===============================
            // Success State
            // ===============================

            button.classList.remove("loading");

            button.classList.add("success");

            button.innerHTML = `
                <i class="fa-solid fa-circle-check"></i>
                Verification Code Sent
            `;

            setTimeout(() => {

                showSuccess(
                    "Verification Code Sent",
                    "A 6-digit verification code has been sent to your registered email address.<br><br>Please check your Inbox or Spam folder before continuing.",
                    () => {

                        window.location.href = "verification.html";

                    },
                    "Continue"

                );

                // Reset button if page remains

                button.disabled = false;

                button.classList.remove("success");

                button.innerHTML =
                "Send Verification Code";

            }, 900);

        }, 1800);

    });

});
