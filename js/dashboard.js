// ==========================================
// LOAD SAVED THEME
// ==========================================

// ==========================================
// PLATETRACK DASHBOARD
// ==========================================

document.addEventListener("DOMContentLoaded",function(){

    updateDateTime();
    updateGreeting();
    loadDashboardData();
    loadRecentDetections();

    setInterval(updateDateTime,1000);

});

function getViolationRecords(){

    const data = localStorage.getItem("plateTrackHistory");

    if(!data){
        return [];
    }

    return JSON.parse(data);

}

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

function toggleMenu(){

    const menu = document.getElementById("headerMenu");

    menu.style.display =
    menu.style.display === "block" ? "none" : "block";

}

window.addEventListener("click",function(e){

    if(!e.target.closest(".menu-wrapper")){

        const menu = document.getElementById("headerMenu");

        if(menu){
            menu.style.display = "none";
        }

    }

});

function startDetection(){

    showSuccess(
        "Opening Camera",
        "The camera will now open for license plate detection."
    );

    setTimeout(function(){
        window.location.href = "camera.html";
    },1000);

}

function openNotificationModal(){

    document.getElementById("notificationModal").style.display = "flex";

}

function closeNotificationModal(){

    document.getElementById("notificationModal").style.display = "none";

}

function confirmLogout(){

    showConfirm(
        "Logout",
        "Are you sure you want to logout?",
        function(){
            window.location.href = "enforcer-login.html";
        }
    );

}

function loadDashboardData(){

    const records = getViolationRecords();
    const notificationsSetting =
    localStorage.getItem("plateTrackNotifications");

    const preferences = {
        notifications:
        notificationsSetting === null ? true : notificationsSetting === "true"
    };

    document.getElementById("vehicleCount").textContent = records.length;
    document.getElementById("violationCount").textContent = records.length;
    document.getElementById("pendingReports").textContent = records.length;

    const notificationCount = document.getElementById("notificationCount");
    const notificationList = document.getElementById("notificationList");

    if(!preferences.notifications){

        notificationCount.style.display = "none";

        notificationList.innerHTML = `
            <div class="notification-item">
                <i class="fa-solid fa-bell-slash"></i>
                <span>Notifications are turned off in Settings.</span>
            </div>
        `;

    }
    else if(records.length === 0){

        notificationCount.style.display = "none";

        notificationList.innerHTML = `
            <div class="notification-item">
                <i class="fa-solid fa-circle-info"></i>
                <span>No new notifications.</span>
            </div>
        `;

    }
    else{

        notificationCount.style.display = "flex";
        notificationCount.textContent = records.length;

        notificationList.innerHTML = `
            <div class="notification-item">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span>${records.length} violation record(s) saved in history.</span>
            </div>
        `;

    }

}

function loadRecentDetections(){

    const container = document.getElementById("recentDetection");
    const records = getViolationRecords();

    container.innerHTML = "";

    if(records.length === 0){

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fa-solid fa-car"></i>
                </div>
                <h3>No Recent Detection</h3>
                <p>No saved violation records found yet.</p>
            </div>
        `;

        return;
    }

    const recent = records.slice(0,3);

    recent.forEach(function(item){

        const plate = item.plateNumber || "Unknown Plate";
        const vehicle = item.vehicleType || item.vehicleModel || "Unknown Vehicle";
        const color = item.vehicleColor || "Unknown Color";
        const violation = item.violation || item.violationType || "Violation Recorded";
        const location = item.location || "Unknown Location";
        const date = item.date || "Recent";

        container.innerHTML += `
            <div class="detection-card">

                <div class="plate-icon">
                    <i class="fa-solid fa-car"></i>
                </div>

                <div class="plate-details">
                    <h3>${plate}</h3>
                    <p>${vehicle} • ${color}</p>
                    <small>${violation}</small>
                    <small>${location}</small>
                </div>

                <span class="time-badge">
                    ${date}
                </span>

            </div>
        `;

    });

}
