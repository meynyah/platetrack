// =========================================
// PlateTrack - Reset Password
// =========================================

const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");

const toggleNewPassword =
document.getElementById("toggleNewPassword");

const toggleConfirmPassword =
document.getElementById("toggleConfirmPassword");

const resetPasswordBtn =
document.getElementById("resetPasswordBtn");

const strengthFill =
document.getElementById("strengthFill");

const strengthText =
document.getElementById("strengthText");

// =========================================
// SHOW / HIDE PASSWORD
// =========================================

function togglePassword(input, button){

    if(input.type === "password"){

        input.type = "text";

        button.innerHTML =
        '<i class="fa-solid fa-eye-slash"></i>';

    }else{

        input.type = "password";

        button.innerHTML =
        '<i class="fa-solid fa-eye"></i>';

    }

}

toggleNewPassword.addEventListener("click",function(){

    togglePassword(newPassword,toggleNewPassword);

});

toggleConfirmPassword.addEventListener("click",function(){

    togglePassword(confirmPassword,toggleConfirmPassword);

});

// =========================================
// PASSWORD RULES
// =========================================

const rules = {

    length:document.getElementById("ruleLength"),

    upper:document.getElementById("ruleUpper"),

    lower:document.getElementById("ruleLower"),

    number:document.getElementById("ruleNumber"),

    special:document.getElementById("ruleSpecial")

};

function updateRule(rule,valid){

    if(valid){

        rule.classList.add("valid");

        rule.querySelector("i").className =
        "fa-solid fa-circle-check";

    }else{

        rule.classList.remove("valid");

        rule.querySelector("i").className =
        "fa-solid fa-circle-xmark";

    }

}

newPassword.addEventListener("input",checkPassword);

function checkPassword(){

    const password = newPassword.value;

    const hasLength = password.length >= 8;

    const hasUpper = /[A-Z]/.test(password);

    const hasLower = /[a-z]/.test(password);

    const hasNumber = /[0-9]/.test(password);

    const hasSpecial =
    /[!@#$%^&*(),.?":{}|<>]/.test(password);

    updateRule(rules.length,hasLength);

    updateRule(rules.upper,hasUpper);

    updateRule(rules.lower,hasLower);

    updateRule(rules.number,hasNumber);

    updateRule(rules.special,hasSpecial);

    let score = 0;

    if(hasLength) score++;

    if(hasUpper) score++;

    if(hasLower) score++;

    if(hasNumber) score++;

    if(hasSpecial) score++;

    if(score <= 1){

        strengthFill.style.width = "20%";

        strengthFill.style.background = "#dc3545";

        strengthText.innerHTML =
        "Password Strength: Weak";

    }

    else if(score == 2){

        strengthFill.style.width = "40%";

        strengthFill.style.background = "#ff9800";

        strengthText.innerHTML =
        "Password Strength: Fair";

    }

    else if(score == 3 || score == 4){

        strengthFill.style.width = "75%";

        strengthFill.style.background = "#facc15";

        strengthText.innerHTML =
        "Password Strength: Good";

    }

    else{

        strengthFill.style.width = "100%";

        strengthFill.style.background = "#22c55e";

        strengthText.innerHTML =
        "Password Strength: Strong";

    }

}

// =========================================
// RESET PASSWORD
// =========================================

resetPasswordBtn.addEventListener("click",function(){

    const password = newPassword.value;

    const confirm = confirmPassword.value;

    if(password === "" || confirm === ""){

        showError(

            "Missing Information",

            "Please complete all required fields."

        );

        return;

    }

    if(password !== confirm){

        showError(

            "Password Mismatch",

            "The passwords do not match."

        );

        return;

    }

    if(password.length < 8){

        showError(

            "Weak Password",

            "Please create a stronger password."

        );

        return;

    }

    resetPasswordBtn.disabled = true;

    resetPasswordBtn.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Updating Password...
    `;

    // Simulate Server

    setTimeout(function(){

        resetPasswordBtn.disabled = false;

        resetPasswordBtn.innerHTML =
        "Reset Password";

        showSuccess(

            "Password Updated",

            "Your password has been updated successfully.",

            function(){

                window.location.href =
                "enforcer-login.html";

            }

        );

    },2000);

});