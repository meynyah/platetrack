// =========================================
// PlateTrack Register
// =========================================

const step1 =
document.getElementById("step1");

const step2 =
document.getElementById("step2");

const progressFill =
document.getElementById("progressFill");

const stepText =
document.getElementById("stepText");

// =========================================
// NEXT STEP
// =========================================

function nextStep(){

    const firstName =
    document.getElementById("firstName").value.trim();

    const lastName =
    document.getElementById("lastName").value.trim();

    const badgeNumber =
    document.getElementById("badgeNumber").value.trim();

    const employeeID =
    document.getElementById("employeeID").value.trim();

    if(
        firstName === "" ||
        lastName === "" ||
        badgeNumber === "" ||
        employeeID === ""
    ){

        showError(

            "Incomplete Information",

            "Please complete all required fields before continuing."

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
// PASSWORD SHOW / HIDE
// =========================================

const password =
document.getElementById("password");

const confirmPassword =
document.getElementById("confirmPassword");

const togglePassword =
document.getElementById("togglePassword");

const toggleConfirmPassword =
document.getElementById("toggleConfirmPassword");

function toggle(input,button){

    if(input.type==="password"){

        input.type="text";

        button.innerHTML =
        '<i class="fa-solid fa-eye-slash"></i>';

    }

    else{

        input.type="password";

        button.innerHTML =
        '<i class="fa-solid fa-eye"></i>';

    }

}

togglePassword.addEventListener("click",function(){

    toggle(password,togglePassword);

});

toggleConfirmPassword.addEventListener("click",function(){

    toggle(confirmPassword,toggleConfirmPassword);

});

// =========================================
// PASSWORD STRENGTH
// =========================================

const strengthFill =
document.getElementById("strengthFill");

const strengthText =
document.getElementById("strengthText");

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

password.addEventListener("input",checkPassword);

function checkPassword(){

    const value = password.value;

    const hasLength = value.length >= 8;
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);

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

    if(score<=1){

        strengthFill.style.width="20%";
        strengthFill.style.background="#dc3545";
        strengthText.textContent="Weak";

    }

    else if(score==2){

        strengthFill.style.width="45%";
        strengthFill.style.background="#ff9800";
        strengthText.textContent="Fair";

    }

    else if(score==3 || score==4){

        strengthFill.style.width="75%";
        strengthFill.style.background="#facc15";
        strengthText.textContent="Good";

    }

    else{

        strengthFill.style.width="100%";
        strengthFill.style.background="#22c55e";
        strengthText.textContent="Strong";

    }

}

// =========================================
// CREATE ACCOUNT
// =========================================

const registerBtn =
document.getElementById("registerBtn");

registerBtn.addEventListener("click",function(){

    const email =
    document.getElementById("email").value.trim();

    const mobile =
    document.getElementById("mobile").value.trim();

    const agreement =
    document.getElementById("agreement");

    if(

        email==="" ||
        password.value==="" ||
        confirmPassword.value===""

    ){

        showError(

            "Incomplete Information",

            "Please complete all required fields."

        );

        return;

    }

    if(password.value!==confirmPassword.value){

        showError(

            "Password Mismatch",

            "Your passwords do not match."

        );

        return;

    }

    if(password.value.length<8){

        showError(

            "Weak Password",

            "Please create a stronger password."

        );

        return;

    }

    if(!agreement.checked){

        showError(

            "Agreement Required",

            "Please certify that you are an authorized Traffic Enforcer."

        );

        return;

    }

    registerBtn.disabled=true;

    registerBtn.innerHTML=`
        <i class="fa-solid fa-spinner fa-spin"></i>
        Creating Account...
    `;

    setTimeout(function(){

        registerBtn.disabled=false;

        registerBtn.innerHTML="Create Account";

        showSuccess(

            "Registration Submitted",

            "Your registration has been submitted successfully.\n\nYour account is now pending administrator approval.\n\nYou will receive an email once your account has been reviewed.\n\nOnly approved officers can sign in.",

            function(){

                window.location.href="enforcer-login.html";

            }

        );

    },2000);

});