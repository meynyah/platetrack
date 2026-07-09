// ==========================================
// PLATETRACK PROFILE
// ==========================================

const defaultProfile = {
    officerName: "Juan Dela Cruz",
    badgeNumber: "ATC-2026-014",
    email: "officer@platetrack.com",
    contact: "09123456789",
    assignedArea: "Antipolo City",
    station: "Antipolo Traffic Management Office",
    joinedDate: "Joined 2026"
};

function getSavedProfile(){

    try{

        const savedProfile =
        JSON.parse(localStorage.getItem("plateTrackProfile"));

        return {
            ...defaultProfile,
            ...(savedProfile || {})
        };

    }
    catch(error){

        localStorage.removeItem("plateTrackProfile");
        return defaultProfile;

    }

}

function setText(id,value){

    const element = document.getElementById(id);

    if(element){
        element.textContent = value;
    }

}

function getInputValue(id){

    const element = document.getElementById(id);

    return element ? element.value.trim() : "";

}

function saveProfileData(profile){

    localStorage.setItem(
        "plateTrackProfile",
        JSON.stringify(profile)
    );

}

function loadProfile(){

    const profile = getSavedProfile();

    setText("officerName",profile.officerName);
    setText("badgeNumber","Badge No. " + profile.badgeNumber);
    setText("emailText",profile.email);
    setText("contactText",profile.contact);
    setText("areaText",profile.assignedArea);
    setText("joinedDate",profile.joinedDate);

}

function openEditModal(){

    const profile = getSavedProfile();

    const email = document.getElementById("editEmail");
    const contact = document.getElementById("editContact");
    const area = document.getElementById("editArea");
    const modal = document.getElementById("editModal");

    if(email){
        email.value = profile.email;
    }

    if(contact){
        contact.value = profile.contact;
    }

    if(area){
        area.value = profile.assignedArea;
    }

    if(modal){
        modal.classList.add("show");
    }

}

function closeEditModal(){

    const modal = document.getElementById("editModal");

    if(modal){
        modal.classList.remove("show");
    }

}

function saveProfile(){

    const email = getInputValue("editEmail");
    const contact = getInputValue("editContact");
    const assignedArea = getInputValue("editArea");
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(email === "" || contact === "" || assignedArea === ""){

        showError(
            "Incomplete Profile",
            "Please complete your email, contact number, and assigned area."
        );

        return;

    }

    if(!emailPattern.test(email)){

        showError(
            "Invalid Email",
            "Please enter a valid email address."
        );

        return;

    }

    if(!/^09\d{9}$/.test(contact)){

        showError(
            "Invalid Contact Number",
            "Please enter a valid 11-digit Philippine mobile number."
        );

        return;

    }

    const profile = {
        ...getSavedProfile(),
        email,
        contact,
        assignedArea
    };

    saveProfileData(profile);
    loadProfile();
    closeEditModal();

    showSuccess(
        "Profile Updated",
        "Your profile information has been updated successfully."
    );

}

function openPasswordModal(){

    ["currentPassword","newPassword","confirmPassword"].forEach(function(id){

        const input = document.getElementById(id);

        if(input){
            input.value = "";
        }

    });

    const modal = document.getElementById("passwordModal");

    if(modal){
        modal.classList.add("show");
    }

}

function closePasswordModal(){

    const modal = document.getElementById("passwordModal");

    if(modal){
        modal.classList.remove("show");
    }

}

function isStrongPassword(password){

    return (
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /\d/.test(password)
    );

}

function savePassword(){

    const currentPassword = getInputValue("currentPassword");
    const newPassword = getInputValue("newPassword");
    const confirmPassword = getInputValue("confirmPassword");

    if(currentPassword === "" || newPassword === "" || confirmPassword === ""){

        showError(
            "Incomplete Password",
            "Please complete all password fields."
        );

        return;

    }

    if(!isStrongPassword(newPassword)){

        showError(
            "Weak Password",
            "Please use at least 8 characters with uppercase, lowercase, and a number."
        );

        return;

    }

    if(newPassword !== confirmPassword){

        showError(
            "Password Mismatch",
            "The new password and confirmation password do not match."
        );

        return;

    }

    closePasswordModal();

    showSuccess(
        "Password Updated",
        "Password changing will be connected to the backend in the final version."
    );

}

function aboutPlateTrack(){

    showInfo(
        "About PlateTrack",
        "PlateTrack is a mobile machine learning-based license plate recognition system for automated traffic violation monitoring of private four-wheel vehicles in Antipolo City.",
        "OK"
    );

}

function closeProfileModals(event){

    ["editModal","passwordModal"].forEach(function(id){

        const modal = document.getElementById(id);

        if(modal && event.target === modal){
            modal.classList.remove("show");
        }

    });

}

document.addEventListener("DOMContentLoaded",function(){

    loadProfile();

    window.addEventListener("click",closeProfileModals);

});

window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.saveProfile = saveProfile;
window.openPasswordModal = openPasswordModal;
window.closePasswordModal = closePasswordModal;
window.savePassword = savePassword;
window.aboutPlateTrack = aboutPlateTrack;
