// ==========================================
// PlateTrack | Owner Dashboard
// ==========================================

document.addEventListener("DOMContentLoaded", function(){

    const owner = requireOwnerSession();

    if(!owner){
        return;
    }

    updateDateTime();
    updateGreeting();
    loadOwnerInfo(owner);
    loadPlates(owner);
    loadStats(owner);
    loadRecentViolations(owner);

    setInterval(updateDateTime, 1000);

});

// ==========================================
// SESSION HELPERS
// ==========================================

function getOwners(){

    return JSON.parse(localStorage.getItem("plateTrackOwners")) || [];

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

function getOwnerViolations(owner){

    const history = JSON.parse(localStorage.getItem("plateTrackHistory")) || [];

    const ownerPlates = (owner.plates || []).map(function(plate){
        return plate.toUpperCase();
    });

    return history.filter(function(record){
        return ownerPlates.includes((record.plateNumber || "").toUpperCase());
    });

}

function getOwnerAppeals(owner){

    const appeals = JSON.parse(localStorage.getItem("plateTrackAppeals")) || [];

    return appeals.filter(function(appeal){
        return appeal.ownerEmail === owner.email;
    });

}

// ==========================================
// DATE / TIME / GREETING
// ==========================================

function updateDateTime(){

    const now = new Date();

    document.getElementById("todayDate").textContent =
    now.toLocaleDateString("en-US",{
        year:"numeric",
        month:"long",
        day:"numeric"
    });

    document.getElementById("liveTime").textContent =
    now.toLocaleTimeString("en-US",{
        hour:"numeric",
        minute:"2-digit",
        second:"2-digit",
        hour12:true
    });

}

function updateGreeting(){

    const hour = new Date().getHours();
    const greeting = document.getElementById("greeting");

    if(hour < 12){
        greeting.innerHTML = "Good Morning ☀️";
    }
    else if(hour < 18){
        greeting.innerHTML = "Good Afternoon 🌤";
    }
    else{
        greeting.innerHTML = "Good Evening 🌙";
    }

}

// ==========================================
// LOAD OWNER INFO
// ==========================================

function loadOwnerInfo(owner){

    document.getElementById("ownerName").textContent = owner.fullName;
    document.getElementById("ownerEmail").textContent = owner.email;

}

function loadPlates(owner){

    const plateList = document.getElementById("plateList");

    plateList.innerHTML = "";

    (owner.plates || []).forEach(function(plate){

        plateList.innerHTML += `
            <div class="plate-chip">
                <i class="fa-solid fa-id-card"></i>
                ${plate}
            </div>
        `;

    });

    if((owner.plates || []).length === 0){

        plateList.innerHTML = `
            <div class="plate-chip">
                <i class="fa-solid fa-circle-info"></i>
                No registered plates
            </div>
        `;

    }

}

// ==========================================
// LOAD STATS
// ==========================================

function loadStats(owner){

    const violations = getOwnerViolations(owner);
    const appeals = getOwnerAppeals(owner);

    const pending = appeals.filter(function(appeal){
        return appeal.status === "Pending";
    });

    document.getElementById("plateCount").textContent = (owner.plates || []).length;
    document.getElementById("violationCount").textContent = violations.length;
    document.getElementById("pendingAppeals").textContent = pending.length;

}

// ==========================================
// LOAD RECENT VIOLATIONS
// ==========================================

function loadRecentViolations(owner){

    const container = document.getElementById("recentViolations");
    const violations = getOwnerViolations(owner);

    container.innerHTML = "";

    if(violations.length === 0){

        container.innerHTML = `
            <div class="empty-state" style="display:flex;">
                <div class="empty-icon">
                    <i class="fa-solid fa-circle-check"></i>
                </div>
                <h3>No Violations Found</h3>
                <p>Your registered plates have no recorded violations.</p>
            </div>
        `;

        return;
    }

    const recent = violations.slice(0,3);

    recent.forEach(function(item){

        container.innerHTML += `
            <div class="detection-card">

                <div class="plate-icon">
                    <i class="fa-solid fa-car"></i>
                </div>

                <div class="plate-details">
                    <h3>${item.plateNumber || "Unknown Plate"}</h3>
                    <p>${item.vehicleType || "Unknown Vehicle"}</p>
                    <small>${item.violation || "Violation Recorded"}</small>
                </div>

                <span class="time-badge">
                    ${item.date || "Recent"}
                </span>

            </div>
        `;

    });

}

// ==========================================
// MENU / LOGOUT
// ==========================================

function toggleMenu(){

    const menu = document.getElementById("headerMenu");

    menu.style.display =
    menu.style.display === "block" ? "none" : "block";

}

window.addEventListener("click", function(e){

    if(!e.target.closest(".menu-wrapper")){

        const menu = document.getElementById("headerMenu");

        if(menu){
            menu.style.display = "none";
        }

    }

});

function confirmLogout(){

    showConfirm(
        "Logout",
        "Are you sure you want to logout?",
        function(){
            localStorage.removeItem("plateTrackOwnerSession");
            window.location.href = "owner-login.html";
        }
    );

}
