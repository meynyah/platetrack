// =========================================
// PlateTrack - Email Verification
// =========================================

const codeInputs = document.querySelectorAll(".code-input");
const verifyBtn = document.getElementById("verifyBtn");
const resendBtn = document.getElementById("resendCode");

// =========================================
// OTP Input Behavior
// =========================================

codeInputs.forEach((input, index) => {

    // Numbers Only

    input.addEventListener("input", function () {

        this.value = this.value.replace(/[^0-9]/g, "");

        if (this.value.length === 1 && index < codeInputs.length - 1) {

            codeInputs[index + 1].focus();

        }

    });

    // Backspace

    input.addEventListener("keydown", function (e) {

        if (e.key === "Backspace" &&
            this.value === "" &&
            index > 0) {

            codeInputs[index - 1].focus();

        }

    });

});


// =========================================
// Paste Support
// =========================================

codeInputs[0].addEventListener("paste", function (e) {

    e.preventDefault();

    const pasteData = (e.clipboardData || window.clipboardData)
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 6);

    pasteData.split("").forEach((digit, i) => {

        if (codeInputs[i]) {

            codeInputs[i].value = digit;

        }

    });

    if (pasteData.length > 0) {

        codeInputs[Math.min(pasteData.length - 1, 5)].focus();

    }

});


// =========================================
// Verify Code
// =========================================

verifyBtn.addEventListener("click", function () {

    let otp = "";

    codeInputs.forEach(input => {

        otp += input.value;

    });

    if (otp.length !== 6) {

        showError(

            "Incomplete Code",

            "Please enter the complete 6-digit verification code."

        );

        return;

    }

    verifyBtn.disabled = true;

    verifyBtn.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Verifying...
    `;

    // Simulate Server Verification

    setTimeout(function () {

        verifyBtn.disabled = false;

        verifyBtn.innerHTML = "Verify Code";

        showSuccess(

            "Verification Successful",

            "Your verification code has been verified successfully.",

            function () {

                window.location.href = "reset-password.html";

            }

        );

    }, 2000);

});


// =========================================
// Resend Code
// =========================================

resendBtn.addEventListener("click", function () {

    resendBtn.disabled = true;

    resendBtn.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Sending...
    `;

    setTimeout(function () {

        resendBtn.disabled = false;

        resendBtn.innerHTML = "Resend Code";

        showSuccess(

            "Verification Code Sent",

            "A new verification code has been sent to your registered email address."

        );

    }, 2000);

});