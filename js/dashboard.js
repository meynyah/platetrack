// ==========================================
// PLATETRACK DASHBOARD
// ==========================================

const API_BASE = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded",async function(){

    const token = getEnforcerToken();

    if(!token){
        window.location.href = "enforcer-login.html";
        return;
    }

    updateDateTime();
    updateGreeting();

    await loadDashboardData(token);
    await loadNotifications(token);

    setInterval(updateDateTime,1000);

});

// ==========================================
// ENFORCER AUTH TOKEN
// ==========================================

function getEnforcerToken(){

    return (
        localStorage.getItem("plateTrackToken") ||
        sessionStorage.getItem("plateTrackToken")
    );

}

function clearEnforcerSession(){

    localStorage.removeItem("plateTrackToken");
    localStorage.removeItem("plateTrackEnforcer");
    sessionStorage.removeItem("plateTrackToken");
    sessionStorage.removeItem("plateTrackEnforcer");

}

// ==========================================
// API HELPER
// ==========================================

async function enforcerApiRequest(endpoint, token, options = {}){

    const response = await fetch(
        API_BASE + endpoint,
        {
            ...options,

            headers:{
                "Content-Type":"application/json",
                "Authorization":`Bearer ${token}`,
                ...(options.headers || {})
            }
        }
    );

    let data = {};

    try{
        data = await response.json();
    }catch(error){
        data = {};
    }

    if(response.status === 401 || response.status === 403){

        clearEnforcerSession();
        window.location.href = "enforcer-login.html";

        throw new Error(
            data.message || "Your session has expired. Please sign in again."
        );
    }

    if(!response.ok){
        throw new Error(data.message || "Request failed.");
    }

    return data;

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
            clearEnforcerSession();
            window.location.href = "enforcer-login.html";
        }
    );

}

// ==========================================
// DASHBOARD DATA (from the backend — this is
// what the enforcer has actually submitted,
// visible to admin/owner too)
// ==========================================

async function loadDashboardData(token){

    let violations = [];

    try{

        violations = await enforcerApiRequest("/enforcer/violations/mine", token);

        if(!Array.isArray(violations)){
            violations = [];
        }

    }
    catch(error){

        console.error("Unable to load your reports:", error);

        const recentDetection = document.getElementById("recentDetection");

        if(recentDetection){

            recentDetection.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                    </div>
                    <h3>Unable to Load Reports</h3>
                    <p>${escapeHtml(error.message || "Please refresh the page.")}</p>
                </div>
            `;

        }

        document.getElementById("vehicleCount").textContent = "0";
        document.getElementById("violationCount").textContent = "0";
        document.getElementById("pendingReports").textContent = "0";

        return;

    }

    document.getElementById("vehicleCount").textContent = violations.length;
    document.getElementById("violationCount").textContent = violations.length;

    const pending = violations.filter(function(item){
        return item.status === "pending";
    });

    document.getElementById("pendingReports").textContent = pending.length;

    loadRecentDetections(violations);

}

function loadRecentDetections(violations){

    const container = document.getElementById("recentDetection");

    container.innerHTML = "";

    if(violations.length === 0){

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fa-solid fa-car"></i>
                </div>
                <h3>No Recent Detection</h3>
                <p>No submitted violation reports found yet.</p>
            </div>
        `;

        return;
    }

    const recent = violations.slice(0,3);

    recent.forEach(function(item){

        const plate = item.plateNumber || "Unknown Plate";
        const violation = item.violationType || "Violation Recorded";
        const location = item.location || "Unknown Location";

        const date = item.dateTime
            ? new Date(item.dateTime).toLocaleString("en-US",{
                month:"short",
                day:"numeric",
                year:"numeric",
                hour:"numeric",
                minute:"2-digit"
            })
            : "Recent";

        container.innerHTML += `
            <div class="detection-card">

                <div class="plate-icon">
                    <i class="fa-solid fa-car"></i>
                </div>

                <div class="plate-details">
                    <h3>${escapeHtml(plate)}</h3>
                    <small>${escapeHtml(violation)}</small>
                    <small>${escapeHtml(location)}</small>
                </div>

                <span class="time-badge">
                    ${escapeHtml(date)}
                </span>

            </div>
        `;

    });

}

// ==========================================
// NOTIFICATIONS
// ==========================================

async function loadNotifications(token){

    const notificationCount = document.getElementById("notificationCount");
    const notificationList = document.getElementById("notificationList");

    let notifications = [];

    try{

        notifications = await enforcerApiRequest("/enforcer/notifications", token);

        if(!Array.isArray(notifications)){
            notifications = [];
        }

    }
    catch(error){

        console.error("Unable to load notifications:", error);

        notificationCount.style.display = "none";

        notificationList.innerHTML = `
            <div class="notification-item">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span>Unable to load notifications.</span>
            </div>
        `;

        return;

    }

    const unread = notifications.filter(function(item){
        return !item.read;
    });

    if(notifications.length === 0){

        notificationCount.style.display = "none";

        notificationList.innerHTML = `
            <div class="notification-item">
                <i class="fa-solid fa-circle-info"></i>
                <span>No new notifications.</span>
            </div>
        `;

        return;

    }

    notificationCount.style.display = unread.length > 0 ? "flex" : "none";
    notificationCount.textContent = unread.length;

    notificationList.innerHTML = "";

    notifications.slice(0,10).forEach(function(item){

        notificationList.innerHTML += `
            <div
            class="notification-item${item.read ? "" : " unread"}"
            onclick="markNotificationRead('${item._id}')"
            style="cursor:pointer;">
                <i class="fa-solid fa-bell"></i>
                <span><strong>${escapeHtml(item.title)}</strong><br>${escapeHtml(item.message)}</span>
            </div>
        `;

    });

}

async function markNotificationRead(notificationId){

    const token = getEnforcerToken();

    if(!token){
        return;
    }

    try{

        await enforcerApiRequest(
            `/enforcer/notifications/${notificationId}/read`,
            token,
            { method:"PATCH" }
        );

        await loadNotifications(token);

    }
    catch(error){

        console.error("Unable to mark notification as read:", error);

    }

}

window.markNotificationRead = markNotificationRead;

// ==========================================
// SAFE HTML
// ==========================================

function escapeHtml(value){
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
