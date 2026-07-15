// PlateTrack | Traffic Enforcer Profile

let currentEnforcerEmail = null;

function getEnforcers(){
    try{
        const value = JSON.parse(localStorage.getItem("plateTrackEnforcers"));
        return Array.isArray(value) ? value : [];
    }catch(error){ return []; }
}

function saveEnforcers(enforcers){
    localStorage.setItem("plateTrackEnforcers", JSON.stringify(enforcers));
}

function getCurrentEnforcer(){
    return getEnforcers().find(function(enforcer){ return enforcer.email === currentEnforcerEmail; });
}

function setText(id, value){
    const element = document.getElementById(id);
    if(element) element.textContent = value;
}

function getInputValue(id){
    return document.getElementById(id).value.trim();
}

function loadAvatar(enforcer){
    const image = document.getElementById("avatarImage");
    const icon = document.getElementById("avatarIcon");
    const hasPicture = Boolean(enforcer.profilePicture);
    image.style.display = hasPicture ? "block" : "none";
    icon.style.display = hasPicture ? "none" : "block";
    if(hasPicture) image.src = enforcer.profilePicture;
}

function loadProfile(){
    const enforcer = getCurrentEnforcer();
    if(!enforcer) return;
    const registered = enforcer.dateRegistered ? new Date(enforcer.dateRegistered) : null;
    setText("officerName", enforcer.fullName || "Traffic Enforcer");
    setText("badgeNumber", "Badge No. " + (enforcer.badgeNumber || "Not provided"));
    setText("emailText", enforcer.email);
    setText("contactText", enforcer.mobile || "Not provided");
    setText("areaText", enforcer.assignedArea || "Antipolo City");
    setText("joinedDate", registered && !Number.isNaN(registered.getTime()) ? "Joined " + registered.getFullYear() : "Joined 2026");
    loadAvatar(enforcer);
}

function openEditModal(){
    const enforcer = getCurrentEnforcer();
    if(!enforcer) return;
    document.getElementById("editEmail").value = enforcer.email;
    document.getElementById("editContact").value = enforcer.mobile || "";
    document.getElementById("editArea").value = enforcer.assignedArea || "Antipolo City";
    document.getElementById("editModal").classList.add("show");
}

function closeEditModal(){ document.getElementById("editModal").classList.remove("show"); }

function saveProfile(){
    const email = getInputValue("editEmail").toLowerCase();
    const mobile = getInputValue("editContact");
    const assignedArea = getInputValue("editArea");
    if(!email || !mobile || !assignedArea){ showError("Incomplete Profile", "Please complete all profile fields."); return; }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ showError("Invalid Email", "Please enter a valid email address."); return; }
    if(!/^09\d{9}$/.test(mobile)){ showError("Invalid Contact Number", "Please enter a valid 11-digit Philippine mobile number."); return; }
    const enforcers = getEnforcers();
    const index = enforcers.findIndex(function(item){ return item.email === currentEnforcerEmail; });
    if(index < 0) return;
    if(enforcers.some(function(item, i){ return i !== index && item.email.toLowerCase() === email; })){
        showError("Email Already Used", "Another enforcer account already uses this email address."); return;
    }
    enforcers[index].email = email;
    enforcers[index].mobile = mobile;
    enforcers[index].assignedArea = assignedArea;
    saveEnforcers(enforcers);
    currentEnforcerEmail = email;
    localStorage.setItem("plateTrackEnforcerSession", email);
    loadProfile(); closeEditModal();
    showSuccess("Profile Updated", "Your profile information has been updated successfully.");
}

function openPasswordModal(){
    ["currentPassword", "newPassword", "confirmPassword"].forEach(function(id){ document.getElementById(id).value = ""; });
    document.getElementById("passwordModal").classList.add("show");
}

function closePasswordModal(){ document.getElementById("passwordModal").classList.remove("show"); }

function savePassword(){
    const currentPassword = getInputValue("currentPassword");
    const newPassword = getInputValue("newPassword");
    const confirmPassword = getInputValue("confirmPassword");
    if(!currentPassword || !newPassword || !confirmPassword){ showError("Incomplete Password", "Please complete all password fields."); return; }
    const enforcers = getEnforcers();
    const index = enforcers.findIndex(function(item){ return item.email === currentEnforcerEmail; });
    if(index < 0) return;
    if(enforcers[index].password !== currentPassword){ showError("Incorrect Password", "Your current password is incorrect."); return; }
    if(!(newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) && /\d/.test(newPassword))){
        showError("Weak Password", "Use at least 8 characters with uppercase, lowercase, and a number."); return;
    }
    if(newPassword !== confirmPassword){ showError("Password Mismatch", "The new passwords do not match."); return; }
    enforcers[index].password = newPassword;
    saveEnforcers(enforcers);
    closePasswordModal();
    showSuccess("Password Updated", "Your password has been changed successfully. Use it on your next sign-in.");
}

function handleAvatarUpload(event){
    const input = event.target;
    const file = input.files[0];
    if(!file) return;
    if(!["image/jpeg", "image/png", "image/webp"].includes(file.type)){ showError("Invalid File", "Select a JPG, PNG, or WebP image."); input.value = ""; return; }
    if(file.size > 5 * 1024 * 1024){ showError("Image Too Large", "Select an image smaller than 5 MB."); input.value = ""; return; }
    const reader = new FileReader();
    reader.onload = function(loadEvent){
        const source = new Image();
        source.onload = function(){
            const scale = Math.min(1, 400 / Math.max(source.width, source.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.max(1, Math.round(source.width * scale));
            canvas.height = Math.max(1, Math.round(source.height * scale));
            canvas.getContext("2d").drawImage(source, 0, 0, canvas.width, canvas.height);
            const enforcers = getEnforcers();
            const index = enforcers.findIndex(function(item){ return item.email === currentEnforcerEmail; });
            if(index < 0) return;
            enforcers[index].profilePicture = canvas.toDataURL("image/jpeg", 0.82);
            try{
                saveEnforcers(enforcers); loadAvatar(enforcers[index]);
                showSuccess("Profile Picture Updated", "Your profile picture has been saved to your credentials.");
            }catch(error){ showError("Upload Failed", "The image could not be saved. Browser storage may be full."); }
        };
        source.src = loadEvent.target.result;
    };
    reader.readAsDataURL(file);
    input.value = "";
}

function aboutPlateTrack(){
    window.location.href = "settings.html";
}

document.addEventListener("DOMContentLoaded", function(){
    const sessionEmail = localStorage.getItem("plateTrackEnforcerSession");
    const enforcer = getEnforcers().find(function(item){ return item.email === sessionEmail; });
    if(!enforcer){ window.location.href = "enforcer-login.html"; return; }
    currentEnforcerEmail = enforcer.email;
    loadProfile();
    document.getElementById("avatarUploadInput").addEventListener("change", handleAvatarUpload);
});

window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.saveProfile = saveProfile;
window.openPasswordModal = openPasswordModal;
window.closePasswordModal = closePasswordModal;
window.savePassword = savePassword;
window.aboutPlateTrack = aboutPlateTrack;
