// =========================================
// PlateTrack - Forgot Password
// =========================================

const emailInput = document.getElementById("email");
const sendCodeBtn = document.getElementById("sendCodeBtn");

sendCodeBtn.addEventListener("click", sendVerificationCode);

function sendVerificationCode(){

    const email = emailInput.value.trim();

    // Email Required

    if(email === ""){

        showError(
            "Email Required",
            "Please enter your registered email address."
        );

        emailInput.focus();

        return;

    }

    // Email Validation

    const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!emailPattern.test(email)){

        showError(
            "Invalid Email",
            "Please enter a valid email address."
        );

        emailInput.focus();

        return;

    }

    // Loading State

    sendCodeBtn.disabled = true;

    sendCodeBtn.innerHTML = `
    <i class="fa-solid fa-spinner fa-spin"></i>
    &nbsp;
    Sending Verification Code...
    `;

    // Simulate Server

    setTimeout(function(){

        sendCodeBtn.disabled = false;

        sendCodeBtn.innerHTML =
        "Send Verification Code";

        showSuccess(

            "Verification Code Sent",

            "A verification code has been sent to your registered email address.",

            function(){

                window.location.href =
                "verification.html";

            }

        );

    },2000);

}