// ==========================================
// PlateTrack | Owner Dashboard
// Backend + JWT Version
// ==========================================

const API_BASE = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", async function(){

    const session = requireOwnerSession();

    if(!session){
        return;
    }

    updateDateTime();
    updateGreeting();
    loadOwnerInfo(session.user);
    loadRegisteredPlate(session.user);

    setInterval(updateDateTime, 1000);

    await loadOwnerDashboardData(session.token);

});

// ==========================================
// SESSION
// ==========================================

function requireOwnerSession(){

    const token =
        localStorage.getItem("plateTrackOwnerToken");

    const storedUser =
        localStorage.getItem("plateTrackOwnerUser");

    if(!token || !storedUser){

        clearOwnerSession();

        window.location.replace("owner-login.html");

        return null;
    }

    try{

        const user = JSON.parse(storedUser);

        if(!user || user.role !== "owner"){

            throw new Error("Invalid owner session.");
        }

        return {
            token,
            user
        };

    }catch(error){

        clearOwnerSession();

        window.location.replace("owner-login.html");

        return null;
    }

}

function clearOwnerSession(){

    localStorage.removeItem("plateTrackOwnerToken");
    localStorage.removeItem("plateTrackOwnerUser");
    localStorage.removeItem("plateTrackOwnerSession");

}

// ==========================================
// API
// ==========================================

async function ownerApiRequest(endpoint, token, options = {}){

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

        clearOwnerSession();

        window.location.replace("owner-login.html");

        throw new Error(
            data.message ||
            "Your session has expired. Please sign in again."
        );
    }

    if(!response.ok){

        throw new Error(
            data.message ||
            "Unable to load owner data."
        );
    }

    return data;
}

// ==========================================
// DATE / TIME / GREETING
// ==========================================

function updateDateTime(){

    const now = new Date();

    const todayDate =
        document.getElementById("todayDate");

    const liveTime =
        document.getElementById("liveTime");

    if(todayDate){

        todayDate.textContent =
            now.toLocaleDateString(
                "en-PH",
                {
                    year:"numeric",
                    month:"long",
                    day:"numeric"
                }
            );
    }

    if(liveTime){

        liveTime.textContent =
            now.toLocaleTimeString(
                "en-PH",
                {
                    hour:"numeric",
                    minute:"2-digit",
                    second:"2-digit",
                    hour12:true
                }
            );
    }
}

function updateGreeting(){

    const greeting =
        document.getElementById("greeting");

    if(!greeting){
        return;
    }

    const hour = new Date().getHours();

    if(hour < 12){

        greeting.textContent =
            "Good Morning ☀️";

    }else if(hour < 18){

        greeting.textContent =
            "Good Afternoon 🌤";

    }else{

        greeting.textContent =
            "Good Evening 🌙";
    }
}

// ==========================================
// OWNER INFORMATION
// ==========================================

function loadOwnerInfo(owner){

    const ownerName =
        document.getElementById("ownerName");

    const ownerEmail =
        document.getElementById("ownerEmail");

    if(ownerName){

        ownerName.textContent =
            owner.fullName ||
            "Vehicle Owner";
    }

    if(ownerEmail){

        ownerEmail.textContent =
            owner.email ||
            "No email available";
    }

    const image =
        document.getElementById("dashboardAvatarImage");

    const icon =
        document.getElementById("dashboardAvatarIcon");

    if(image){
        image.style.display = "none";
    }

    if(icon){
        icon.style.display = "block";
    }
}

function loadRegisteredPlate(owner){

    const plateList =
        document.getElementById("plateList");

    const plateCount =
        document.getElementById("plateCount");

    const plateNumber =
        String(owner.plateNumber || "")
            .trim()
            .toUpperCase();

    if(plateCount){

        plateCount.textContent =
            plateNumber ? "1" : "0";
    }

    if(!plateList){
        return;
    }

    if(!plateNumber){

        plateList.innerHTML = `
            <div class="plate-chip">
                <i class="fa-solid fa-circle-info"></i>
                No registered plate
            </div>
        `;

        return;
    }

    plateList.innerHTML = `
        <div class="plate-chip">

            <i class="fa-solid fa-id-card"></i>

            ${escapeHtml(plateNumber)}

            <span class="plate-chip-detail">
                Registered Vehicle
            </span>

        </div>
    `;
}

// ==========================================
// LOAD DASHBOARD DATA
// ==========================================

async function loadOwnerDashboardData(token){

    try{

        const [
            violations,
            appeals
        ] = await Promise.all([

            ownerApiRequest(
                "/owner/violations/mine",
                token
            ),

            ownerApiRequest(
                "/owner/appeals/mine",
                token
            )

        ]);

        const safeViolations =
            Array.isArray(violations)
                ? violations
                : [];

        const safeAppeals =
            Array.isArray(appeals)
                ? appeals
                : [];

        loadStats(
            safeViolations,
            safeAppeals
        );

        loadRecentViolations(
            safeViolations
        );

    }catch(error){

        console.error(
            "Owner dashboard loading error:",
            error
        );

        const recentViolations =
            document.getElementById(
                "recentViolations"
            );

        if(recentViolations){

            recentViolations.innerHTML = `
                <div class="empty-state" style="display:flex;">

                    <div class="empty-icon">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                    </div>

                    <h3>
                        Unable to Load Records
                    </h3>

                    <p>
                        ${escapeHtml(
                            error.message ||
                            "Please refresh the dashboard."
                        )}
                    </p>

                </div>
            `;
        }
    }
}

// ==========================================
// STATS
// ==========================================

function loadStats(violations, appeals){

    const violationCount =
        document.getElementById(
            "violationCount"
        );

    const pendingAppeals =
        document.getElementById(
            "pendingAppeals"
        );

    const pending =
        appeals.filter(function(appeal){

            return (
                appeal.status === "submitted" ||
                appeal.status === "under_review"
            );
        });

    if(violationCount){

        violationCount.textContent =
            violations.length;
    }

    if(pendingAppeals){

        pendingAppeals.textContent =
            pending.length;
    }
}

// ==========================================
// RECENT VIOLATIONS
// ==========================================

function loadRecentViolations(violations){

    const container =
        document.getElementById(
            "recentViolations"
        );

    if(!container){
        return;
    }

    container.innerHTML = "";

    if(!violations.length){

        container.innerHTML = `
            <div class="empty-state" style="display:flex;">

                <div class="empty-icon">
                    <i class="fa-solid fa-circle-check"></i>
                </div>

                <h3>
                    No Violations Found
                </h3>

                <p>
                    Your registered plate has no recorded violations.
                </p>

            </div>
        `;

        return;
    }

    violations
        .slice(0, 3)
        .forEach(function(item){

            const date =
                item.dateTime
                    ? new Date(
                        item.dateTime
                    ).toLocaleString(
                        "en-PH",
                        {
                            month:"short",
                            day:"numeric",
                            year:"numeric",
                            hour:"numeric",
                            minute:"2-digit"
                        }
                    )
                    : "Recent";

            container.insertAdjacentHTML(
                "beforeend",
                `
                    <div class="detection-card">

                        <div class="plate-icon">

                            <i class="fa-solid fa-car"></i>

                        </div>

                        <div class="plate-details">

                            <h3>
                                ${escapeHtml(
                                    item.plateNumber ||
                                    "Unknown Plate"
                                )}
                            </h3>

                            <p>
                                ${escapeHtml(
                                    item.violationType ||
                                    "Traffic Violation"
                                )}
                            </p>

                            <small>
                                ${escapeHtml(
                                    item.location ||
                                    "Antipolo City"
                                )}
                            </small>

                        </div>

                        <span class="time-badge">
                            ${escapeHtml(date)}
                        </span>

                    </div>
                `
            );
        });
}

// ==========================================
// MENU
// ==========================================

function toggleMenu(){

    const menu =
        document.getElementById("headerMenu");

    if(!menu){
        return;
    }

    menu.style.display =
        menu.style.display === "block"
            ? "none"
            : "block";
}

window.toggleMenu = toggleMenu;

window.addEventListener("click", function(event){

    if(!event.target.closest(".menu-wrapper")){

        const menu =
            document.getElementById(
                "headerMenu"
            );

        if(menu){
            menu.style.display = "none";
        }
    }
});

// ==========================================
// LOGOUT
// ==========================================

function confirmLogout(){

    showConfirm(
        "Logout",
        "Are you sure you want to log out?",
        function(){

            clearOwnerSession();

            window.location.replace(
                "owner-login.html"
            );
        }
    );
}

window.confirmLogout = confirmLogout;

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