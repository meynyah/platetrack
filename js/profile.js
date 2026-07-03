// ======================================
// OFFICER PROFILE
// ======================================

let profile =
JSON.parse(localStorage.getItem("officerProfile")) || {

    name: "Juan Dela Cruz",

    badge: "TP-2026-001",

    station: "Antipolo Traffic Office",

    contact: "09123456789",

    email: "officer@platetrack.com"

};


// ======================================
// DEFAULT PASSWORD
// ======================================

if(!localStorage.getItem("officerPassword")){

    localStorage.setItem(

        "officerPassword",

        "12345678"

    );

}


// ======================================
// LOAD PROFILE
// ======================================

function loadProfile(){

    document.getElementById("officerName").textContent =
    profile.name;

    document.getElementById("badgeNumber").textContent =
    profile.badge;

    document.getElementById("station").textContent =
    profile.station;

    document.getElementById("contact").textContent =
    profile.contact;

    document.getElementById("email").textContent =
    profile.email;

}

loadProfile();


// ======================================
// EDIT PROFILE
// ======================================

function openEditModal(){

    document.getElementById("editModal").style.display =
    "flex";

    document.getElementById("editName").value =
    profile.name;

    document.getElementById("editBadge").value =
    profile.badge;

    document.getElementById("editStation").value =
    profile.station;

    document.getElementById("editContact").value =
    profile.contact;

    document.getElementById("editEmail").value =
    profile.email;

}


function closeEditModal(){

    document.getElementById("editModal").style.display =
    "none";

}


// ======================================
// SAVE PROFILE
// ======================================

function saveProfile(){

    const station =
    document.getElementById("editStation")
    .value.trim();

    const contact =
    document.getElementById("editContact")
    .value.trim();

    const email =
    document.getElementById("editEmail")
    .value.trim();


    if(station===""){

        showError(

            "Station Required",

            "Please enter your station."

        );

        return;

    }


    if(contact===""){

        showError(

            "Contact Number Required",

            "Please enter your contact number."

        );

        return;

    }


    if(!/^09\d{9}$/.test(contact)){

        showError(

            "Invalid Contact Number",

            "Contact number must start with 09 and contain 11 digits."

        );

        return;

    }


    if(email===""){

        showError(

            "Email Required",

            "Please enter your email address."

        );

        return;

    }


    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){

        showError(

            "Invalid Email",

            "Please enter a valid email address."

        );

        return;

    }


    profile.station = station;

    profile.contact = contact;

    profile.email = email;


    localStorage.setItem(

        "officerProfile",

        JSON.stringify(profile)

    );


    loadProfile();

    closeEditModal();


    showSuccess(

        "Profile Updated",

        "Officer profile updated successfully."

    );

}

// ======================================
// PASSWORD MODAL
// ======================================

function openPasswordModal(){

    document.getElementById("passwordModal").style.display =
    "flex";

    document.getElementById("currentPassword").value = "";

    document.getElementById("newPassword").value = "";

    document.getElementById("confirmPassword").value = "";

    document.getElementById("passwordMessage").textContent = "";

    document.getElementById("strengthFill").style.width = "0%";

    document.getElementById("strengthFill").style.background =
    "#dc3545";

    document.getElementById("strengthText").textContent =
    "Password Strength";

}

function closePasswordModal(){

    document.getElementById("passwordModal").style.display =
    "none";

}


// ======================================
// PASSWORD STRENGTH
// ======================================

function checkPasswordStrength(){

    const password =
    document.getElementById("newPassword").value;

    const bar =
    document.getElementById("strengthFill");

    const text =
    document.getElementById("strengthText");

    let score = 0;

    if(password.length >= 8) score++;

    if(/[A-Z]/.test(password)) score++;

    if(/[a-z]/.test(password)) score++;

    if(/[0-9]/.test(password)) score++;

    if(/[^A-Za-z0-9]/.test(password)) score++;

    if(score <= 2){

        bar.style.width = "35%";
        bar.style.background = "#ef4444";
        text.textContent = "Weak Password";

    }

    else if(score <= 4){

        bar.style.width = "70%";
        bar.style.background = "#f59e0b";
        text.textContent = "Medium Password";

    }

    else{

        bar.style.width = "100%";
        bar.style.background = "#22c55e";
        text.textContent = "Strong Password";

    }

}


// ======================================
// SHOW / HIDE PASSWORD
// ======================================

function togglePassword(id, icon){

    const input =
    document.getElementById(id);

    if(input.type === "password"){

        input.type = "text";

        icon.textContent = "🙈";

    }

    else{

        input.type = "password";

        icon.textContent = "👁";

    }

}


// ======================================
// SAVE PASSWORD
// ======================================

function savePassword(){

    const current =
    document.getElementById("currentPassword").value;

    const newPassword =
    document.getElementById("newPassword").value;

    const confirmPassword =
    document.getElementById("confirmPassword").value;

    const message =
    document.getElementById("passwordMessage");

    const savedPassword =
    localStorage.getItem("officerPassword");

    message.style.color = "#ff6b6b";

    if(current === ""){

        message.textContent =
        "Current password is required.";

        return;

    }

    if(current !== savedPassword){

        message.textContent =
        "Current password is incorrect.";

        return;

    }

    if(newPassword.length < 8){

        message.textContent =
        "Password must be at least 8 characters.";

        return;

    }

    if(!/[A-Z]/.test(newPassword)){

        message.textContent =
        "Password must contain at least one uppercase letter.";

        return;

    }

    if(!/[0-9]/.test(newPassword)){

        message.textContent =
        "Password must contain at least one number.";

        return;

    }

    if(newPassword !== confirmPassword){

        message.textContent =
        "Passwords do not match.";

        return;

    }

    if(newPassword === current){

        message.textContent =
        "New password must be different.";

        return;

    }

    localStorage.setItem(

        "officerPassword",

        newPassword

    );

    closePasswordModal();

    showSuccess(

        "Password Updated",

        "Your password has been changed successfully."

    );

}


// ======================================
// CLOSE MODALS
// ======================================

window.onclick = function(event){

    const editModal =
    document.getElementById("editModal");

    const passwordModal =
    document.getElementById("passwordModal");

    if(event.target === editModal){

        closeEditModal();

    }

    if(event.target === passwordModal){

        closePasswordModal();

    }

};