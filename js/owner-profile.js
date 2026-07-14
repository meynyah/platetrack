// ==========================================
// PlateTrack | Owner Profile
// ==========================================

let currentOwnerEmail = null;

document.addEventListener("DOMContentLoaded", function(){

    const owner = requireOwnerSession();

    if(!owner){
        return;
    }

    currentOwnerEmail = owner.email;

    loadProfile();

});

// ==========================================
// SESSION / STORAGE HELPERS
// ==========================================

function getOwners(){

    return JSON.parse(localStorage.getItem("plateTrackOwners")) || [];

}

function saveOwners(owners){

    localStorage.setItem("plateTrackOwners", JSON.stringify(owners));

}

function requireOwnerSession(){

    const sessionEmail = localStorage.getItem("plateTrackOwnerSession");

    if(!sessionEmail){

        window.location.href = "owner-login.html";
        return null;

    }

    const owners = getOwners();

    const owner = owners.find(function(item){
        return item.email === sessionEmail;
    });

    if(!owner){

        localStorage.removeItem("plateTrackOwnerSession");
        window.location.href = "owner-login.html";
        return null;

    }

    return owner;

}

function getCurrentOwner(){

    const owners = getOwners();

    return owners.find(function(owner){
        return owner.email === currentOwnerEmail;
    });

}

// ==========================================
// LOAD PROFILE
// ==========================================

function loadProfile(){

    const owner = getCurrentOwner();

    if(!owner){
        return;
    }

    document.getElementById("ownerName").textContent = owner.fullName;
    document.getElementById("emailText").textContent = owner.email;
    document.getElementById("contactText").textContent = owner.mobile;
    document.getElementById("addressText").textContent = owner.address;

    if(owner.dateRegistered){

        const date = new Date(owner.dateRegistered);

        document.getElementById("joinedDate").textContent =
        "Member since " + date.toLocaleDateString("en-US",{ year:"numeric", month:"long" });

    }

    loadVehicles(owner);

    loadAvatar(owner);

}

// ==========================================
// PROFILE PICTURE UPLOAD
// ==========================================

function loadAvatar(owner){

    const img = document.getElementById("avatarImage");
    const icon = document.getElementById("avatarIcon");

    if(owner.profilePicture){

        img.src = owner.profilePicture;
        img.style.display = "block";
        icon.style.display = "none";

    }
    else{

        img.style.display = "none";
        icon.style.display = "block";

    }

}

document.addEventListener("DOMContentLoaded", function(){

    const avatarInput = document.getElementById("avatarUploadInput");

    if(!avatarInput){
        return;
    }

    avatarInput.addEventListener("change", function(e){

        const file = e.target.files[0];

        if(!file){
            return;
        }

        if(!file.type.startsWith("image/")){

            showError(
                "Invalid File",
                "Please select an image file (JPG, PNG, etc.)."
            );

            return;
        }

        const reader = new FileReader();

        reader.onload = function(event){

            const img = new Image();

            img.onload = function(){

                // Resize down before storing, since this prototype
                // stores everything as base64 text in localStorage,
                // which has a limited storage quota.
                const maxSize = 300;
                const scale = Math.min(1, maxSize / Math.max(img.width, img.height));

                const canvas = document.createElement("canvas");

                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);

                const ctx = canvas.getContext("2d");

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const dataUrl = canvas.toDataURL("image/jpeg", 0.8);

                const owners = getOwners();

                const ownerIndex = owners.findIndex(function(item){
                    return item.email === currentOwnerEmail;
                });

                if(ownerIndex === -1){
                    return;
                }

                owners[ownerIndex].profilePicture = dataUrl;

                try{

                    saveOwners(owners);

                    loadAvatar(owners[ownerIndex]);

                    showSuccess(
                        "Profile Picture Updated",
                        "Your profile picture has been updated successfully."
                    );

                }
                catch(error){

                    console.error("Unable to save profile picture:", error);

                    showError(
                        "Upload Failed",
                        "Unable to save the profile picture. Your browser storage may be full."
                    );

                }

            };

            img.src = event.target.result;

        };

        reader.readAsDataURL(file);

        // Reset the input so selecting the same file again still fires "change"
        avatarInput.value = "";

    });

});

// ==========================================
// VEHICLES LIST
// ==========================================

function loadVehicles(owner){

    const vehicleList = document.getElementById("vehicleList");

    vehicleList.innerHTML = "";

    const vehicles = owner.vehicles || [];

    if(vehicles.length === 0){

        vehicleList.innerHTML = `
            <div class="vehicle-item">
                <div class="info-icon">
                    <i class="fa-solid fa-circle-info"></i>
                </div>
                <div class="vehicle-item-content">
                    <span class="vehicle-item-plate">No registered vehicles</span>
                    <span class="vehicle-item-detail">Tap the + button above to add one</span>
                </div>
            </div>
        `;

        return;
    }

    vehicles.forEach(function(vehicle, index){

        vehicleList.innerHTML += `
            <div class="vehicle-item">

                <div class="info-icon">
                    <i class="fa-solid fa-car"></i>
                </div>

                <div class="vehicle-item-content">
                    <span class="vehicle-item-plate">${vehicle.plateNumber}</span>
                    <span class="vehicle-item-detail">${vehicle.vehicleType || "-"} • ${vehicle.vehicleColor || "-"}</span>
                </div>

                <div class="vehicle-actions">

                    <button
                    type="button"
                    onclick="openEditVehicleModal(${index})"
                    aria-label="Edit vehicle">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button
                    type="button"
                    onclick="deleteVehicle(${index})"
                    aria-label="Delete vehicle">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </div>
        `;

    });

}

// ==========================================
// ADD / EDIT VEHICLE MODAL
// ==========================================

function openAddVehicleModal(){

    document.getElementById("vehicleModalTitle").textContent = "Add Vehicle";
    document.getElementById("vehicleEditIndex").value = "-1";
    document.getElementById("vehiclePlateInput").value = "";
    document.getElementById("vehicleTypeInput").value = "";
    document.getElementById("vehicleColorInput").value = "";

    document.getElementById("vehicleModal").classList.add("show");

}

function openEditVehicleModal(index){

    const owner = getCurrentOwner();
    const vehicle = (owner.vehicles || [])[index];

    if(!vehicle){
        return;
    }

    document.getElementById("vehicleModalTitle").textContent = "Edit Vehicle";
    document.getElementById("vehicleEditIndex").value = index;
    document.getElementById("vehiclePlateInput").value = vehicle.plateNumber;
    document.getElementById("vehicleTypeInput").value = vehicle.vehicleType;
    document.getElementById("vehicleColorInput").value = vehicle.vehicleColor;

    document.getElementById("vehicleModal").classList.add("show");

}

function closeVehicleModal(){

    document.getElementById("vehicleModal").classList.remove("show");

}

function saveVehicle(){

    const plate = document.getElementById("vehiclePlateInput").value.trim().toUpperCase();
    const type = document.getElementById("vehicleTypeInput").value.trim();
    const color = document.getElementById("vehicleColorInput").value.trim();
    const editIndex = parseInt(document.getElementById("vehicleEditIndex").value, 10);

    if(plate === "" || type === "" || color === ""){

        showError(
            "Incomplete Information",
            "Please fill in the plate number, vehicle type, and color."
        );

        return;
    }

    const owners = getOwners();

    const ownerIndex = owners.findIndex(function(owner){
        return owner.email === currentOwnerEmail;
    });

    if(ownerIndex === -1){
        return;
    }

    if(!owners[ownerIndex].vehicles){
        owners[ownerIndex].vehicles = [];
    }

    const vehicleData = {
        plateNumber: plate,
        vehicleType: type,
        vehicleColor: color
    };

    if(editIndex === -1){

        owners[ownerIndex].vehicles.push(vehicleData);

    }
    else{

        owners[ownerIndex].vehicles[editIndex] = vehicleData;

    }

    saveOwners(owners);

    closeVehicleModal();

    loadProfile();

    showSuccess(
        "Vehicle Saved",
        "Your vehicle information has been saved successfully."
    );

}

function deleteVehicle(index){

    showConfirm(
        "Remove Vehicle",
        "Are you sure you want to remove this vehicle from your account?",
        function(){

            const owners = getOwners();

            const ownerIndex = owners.findIndex(function(owner){
                return owner.email === currentOwnerEmail;
            });

            if(ownerIndex === -1){
                return;
            }

            owners[ownerIndex].vehicles.splice(index, 1);

            saveOwners(owners);

            loadProfile();

            showSuccess(
                "Vehicle Removed",
                "The vehicle has been removed from your account."
            );

        }
    );

}

// ==========================================
// EDIT PROFILE MODAL
// ==========================================

function openEditModal(){

    const owner = getCurrentOwner();

    document.getElementById("editEmail").value = owner.email;
    document.getElementById("editContact").value = owner.mobile;
    document.getElementById("editAddress").value = owner.address;

    document.getElementById("editModal").classList.add("show");

}

function closeEditModal(){

    document.getElementById("editModal").classList.remove("show");

}

function saveProfile(){

    const newEmail = document.getElementById("editEmail").value.trim().toLowerCase();
    const newContact = document.getElementById("editContact").value.trim();
    const newAddress = document.getElementById("editAddress").value.trim();

    if(newEmail === "" || newContact === "" || newAddress === ""){

        showError(
            "Incomplete Information",
            "Please complete all profile fields."
        );

        return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!emailPattern.test(newEmail)){

        showError(
            "Invalid Email",
            "Please enter a valid email address."
        );

        return;
    }

    const owners = getOwners();

    const ownerIndex = owners.findIndex(function(owner){
        return owner.email === currentOwnerEmail;
    });

    if(ownerIndex === -1){
        return;
    }

    // If email changed, make sure no other account already uses it
    if(newEmail !== currentOwnerEmail){

        const emailTaken = owners.some(function(owner, idx){
            return idx !== ownerIndex && owner.email.toLowerCase() === newEmail;
        });

        if(emailTaken){

            showError(
                "Email Already in Use",
                "Another account is already registered with this email address."
            );

            return;
        }

    }

    owners[ownerIndex].email = newEmail;
    owners[ownerIndex].mobile = newContact;
    owners[ownerIndex].address = newAddress;

    saveOwners(owners);

    // Keep session pointing at the (possibly new) email
    currentOwnerEmail = newEmail;
    localStorage.setItem("plateTrackOwnerSession", newEmail);

    closeEditModal();

    loadProfile();

    showSuccess(
        "Profile Updated",
        "Your profile information has been updated successfully."
    );

}

// ==========================================
// CHANGE PASSWORD MODAL
// ==========================================

function openPasswordModal(){

    document.getElementById("currentPassword").value = "";
    document.getElementById("newPassword").value = "";
    document.getElementById("confirmPassword").value = "";

    document.getElementById("passwordModal").classList.add("show");

}

function closePasswordModal(){

    document.getElementById("passwordModal").classList.remove("show");

}

function savePassword(){

    const currentPassword = document.getElementById("currentPassword").value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    if(currentPassword === "" || newPassword === "" || confirmPassword === ""){

        showError(
            "Incomplete Information",
            "Please complete all password fields."
        );

        return;
    }

    const owner = getCurrentOwner();

    if(owner.password !== currentPassword){

        showError(
            "Incorrect Password",
            "Your current password is incorrect."
        );

        return;
    }

    if(newPassword.length < 8){

        showError(
            "Weak Password",
            "Your new password must be at least 8 characters long."
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

    const owners = getOwners();

    const ownerIndex = owners.findIndex(function(item){
        return item.email === currentOwnerEmail;
    });

    if(ownerIndex === -1){
        return;
    }

    owners[ownerIndex].password = newPassword;

    saveOwners(owners);

    closePasswordModal();

    showSuccess(
        "Password Updated",
        "Your password has been changed successfully."
    );

}

// ==========================================
// CLICK OUTSIDE MODAL
// ==========================================

window.addEventListener("click", function(event){

    ["editModal","passwordModal","vehicleModal","globalModal"]

    .forEach(function(id){

        const modal = document.getElementById(id);

        if(event.target === modal){

            modal.classList.remove("show");

        }

    });

});
