// =========================================
// PlateTrack | Vehicle Owner Register
// =========================================

const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const progressFill = document.getElementById("progressFill");
const stepText = document.getElementById("stepText");

const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");

const registerBtn = document.getElementById("registerBtn");

const strengthFill = document.getElementById("strengthFill");
const strengthText = document.getElementById("strengthText");

const confirmIcon = document.getElementById("confirmIcon");
const passwordMatch = document.getElementById("passwordMatch");

const rules = {
    length: document.getElementById("ruleLength"),
    upper: document.getElementById("ruleUpper"),
    lower: document.getElementById("ruleLower"),
    number: document.getElementById("ruleNumber"),
    special: document.getElementById("ruleSpecial")
};

// =========================================
// OWNER STORAGE HELPERS
// =========================================

function getOwners(){

    return JSON.parse(localStorage.getItem("plateTrackOwners")) || [];

}

function saveOwners(owners){

    localStorage.setItem("plateTrackOwners", JSON.stringify(owners));

}

// =========================================
// NEXT STEP
// =========================================

function nextStep(){

    const fullName = document.getElementById("fullName").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const address = document.getElementById("address").value.trim();
    const plateNumbers = document.getElementById("plateNumbers").value.trim();

    if(fullName === "" || mobile === "" || address === "" || plateNumbers === ""){

        showError(
            "Incomplete Information",
            "Please complete all required personal information fields."
        );

        return;
    }

    if(!/^09\d{9}$/.test(mobile)){

        showError(
            "Invalid Mobile Number",
            "Please enter a valid 11-digit Philippine mobile number."
        );

        return;
    }

    step1.style.display = "none";
    step2.style.display = "block";

    progressFill.style.width = "100%";
    stepText.textContent = "Step 2 of 2";
}

// =========================================
// PREVIOUS STEP
// =========================================

function previousStep(){

    step2.style.display = "none";
    step1.style.display = "block";

    progressFill.style.width = "50%";
    stepText.textContent = "Step 1 of 2";
}

// =========================================
// SHOW / HIDE PASSWORD
// =========================================

function toggle(input, button){

    const icon = button.querySelector("i");

    if(input.type === "password"){
        input.type = "text";
        icon.className = "fa-solid fa-eye-slash";
    }else{
        input.type = "password";
        icon.className = "fa-solid fa-eye";
    }
}

togglePassword.addEventListener("click", () => {
    toggle(password, togglePassword);
});

toggleConfirmPassword.addEventListener("click", () => {
    toggle(confirmPassword, toggleConfirmPassword);
});

// =========================================
// PASSWORD RULES
// =========================================

function updateRule(rule, valid, hasTyped){

    const icon = rule.querySelector("i");

    rule.classList.remove("valid", "invalid");

    if(!hasTyped){
        icon.className = "fa-regular fa-circle";
        return;
    }

    if(valid){
        rule.classList.add("valid");
        icon.className = "fa-solid fa-circle-check";
    }else{
        rule.classList.add("invalid");
        icon.className = "fa-solid fa-circle-xmark";
    }
}

function checkPassword(){

    const value = password.value;

    const hasTyped = value.length > 0;
    const hasLength = value.length >= 8;
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    updateRule(rules.length, hasLength, hasTyped);
    updateRule(rules.upper, hasUpper, hasTyped);
    updateRule(rules.lower, hasLower, hasTyped);
    updateRule(rules.number, hasNumber, hasTyped);
    updateRule(rules.special, hasSpecial, hasTyped);

    let score = 0;

    if(hasLength) score++;
    if(hasUpper) score++;
    if(hasLower) score++;
    if(hasNumber) score++;
    if(hasSpecial) score++;

    if(!hasTyped){
        strengthFill.style.width = "0%";
        strengthFill.style.background = "#223656";
        strengthText.textContent = "—";
        return score;
    }

    if(score <= 1){
        strengthFill.style.width = "20%";
        strengthFill.style.background = "#ef4444";
        strengthText.textContent = "Weak";
        strengthText.style.color = "#f87171";
    }else if(score === 2){
        strengthFill.style.width = "45%";
        strengthFill.style.background = "#f97316";
        strengthText.textContent = "Fair";
        strengthText.style.color = "#fb923c";
    }else if(score === 3 || score === 4){
        strengthFill.style.width = "75%";
        strengthFill.style.background = "#facc15";
        strengthText.textContent = "Good";
        strengthText.style.color = "#fde047";
    }else{
        strengthFill.style.width = "100%";
        strengthFill.style.background = "#22c55e";
        strengthText.textContent = "Strong";
        strengthText.style.color = "#4ade80";
    }

    return score;
}

// =========================================
// PASSWORD MATCH
// =========================================

function checkPasswordMatch(){

    const box = confirmPassword.parentElement;

    if(confirmPassword.value === ""){

        passwordMatch.textContent = "";
        passwordMatch.className = "password-match";

        box.classList.remove("success", "error");

        confirmIcon.className = "fa-solid fa-lock-open input-icon";

        return false;
    }

    if(password.value === confirmPassword.value){

        passwordMatch.innerHTML =
        '<i class="fa-solid fa-circle-check"></i> Passwords match';

        passwordMatch.className = "password-match success";

        box.classList.remove("error");
        box.classList.add("success");

        confirmIcon.className = "fa-solid fa-circle-check input-icon";

        return true;
    }

    passwordMatch.innerHTML =
    '<i class="fa-solid fa-circle-xmark"></i> Passwords do not match';

    passwordMatch.className = "password-match error";

    box.classList.remove("success");
    box.classList.add("error");

    confirmIcon.className = "fa-solid fa-circle-xmark input-icon";

    return false;
}

password.addEventListener("input", () => {
    checkPassword();
    checkPasswordMatch();
});

confirmPassword.addEventListener("input", checkPasswordMatch);

// =========================================
// CREATE ACCOUNT
// =========================================

registerBtn.addEventListener("click", function(){

    const fullName = document.getElementById("fullName").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const address = document.getElementById("address").value.trim();

    const plateNumbers = document
        .getElementById("plateNumbers")
        .value
        .trim()
        .split(",")
        .map(function(plate){ return plate.trim().toUpperCase(); })
        .filter(function(plate){ return plate !== ""; });

    const email = document.getElementById("email").value.trim().toLowerCase();
    const agreement = document.getElementById("agreement");

    const score = checkPassword();
    const isMatch = checkPasswordMatch();

    if(email === "" || password.value === "" || confirmPassword.value === ""){

        showError(
            "Incomplete Information",
            "Please complete all required account information fields."
        );

        return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!emailPattern.test(email)){

        showError(
            "Invalid Email",
            "Please enter a valid email address."
        );

        return;
    }

    if(score < 5){

        showError(
            "Weak Password",
            "Please follow all password requirements before creating your account."
        );

        return;
    }

    if(!isMatch){

        showError(
            "Password Mismatch",
            "Your passwords do not match. Please check your confirmation password."
        );

        return;
    }

    if(!agreement.checked){

        showError(
            "Agreement Required",
            "Please certify that the information you provided is accurate."
        );

        return;
    }

    const owners = getOwners();

    const existingOwner = owners.find(function(owner){
        return owner.email.toLowerCase() === email;
    });

    if(existingOwner){

        showError(
            "Account Already Exists",
            "An account with this email address already exists. Please sign in instead."
        );

        return;
    }

    registerBtn.disabled = true;
    registerBtn.classList.add("loading");

    registerBtn.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Creating Account...
    `;

    setTimeout(() => {

        registerBtn.classList.remove("loading");
        registerBtn.classList.add("success");

        registerBtn.innerHTML = `
            <i class="fa-solid fa-circle-check"></i>
            Account Created
        `;

        setTimeout(() => {

            owners.push({
                fullName: fullName,
                mobile: mobile,
                address: address,
                plates: plateNumbers,
                email: email,
                password: password.value
            });

            saveOwners(owners);

            showSuccess(
                "Registration Successful",
                "Your vehicle owner account has been created successfully.<br><br>You may now sign in to view your violations.",
                () => {
                    window.location.href = "owner-login.html";
                },
                "Sign In Now"
            );

            registerBtn.disabled = false;
            registerBtn.classList.remove("success");
            registerBtn.innerHTML = "Create Account";

        }, 900);

    }, 1500);
});
