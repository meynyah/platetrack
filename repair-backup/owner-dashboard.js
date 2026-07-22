document.addEventListener("DOMContentLoaded", function () {

    const token = localStorage.getItem("plateTrackOwnerToken");
    const storedUser = localStorage.getItem("plateTrackOwnerUser");

    if (!token || !storedUser) {
        window.location.href = "owner-login.html";
        return;
    }

    let owner;

    try {
        owner = JSON.parse(storedUser);
    } catch (error) {
        clearOwnerSession();
        window.location.href = "owner-login.html";
        return;
    }

    if (!owner || !owner.email) {
        clearOwnerSession();
        window.location.href = "owner-login.html";
        return;
    }

    loadOwnerInfo(owner);
    updateDateTime();
    updateGreeting();

    document.getElementById("plateCount").textContent =
        owner.plateNumber ? "1" : "0";

    document.getElementById("violationCount").textContent = "0";
    document.getElementById("pendingAppeals").textContent = "0";

    const plateList = document.getElementById("plateList");

    if (plateList) {
        plateList.innerHTML = owner.plateNumber
            ? `
                <div class="plate-chip">
                    <i class="fa-solid fa-id-card"></i>
                    ${escapeHtml(owner.plateNumber)}
                    <span class="plate-chip-detail">
                        Registered Vehicle
                    </span>
                </div>
            `
            : `
                <div class="plate-chip">
                    <i class="fa-solid fa-circle-info"></i>
                    No registered plate
                </div>
            `;
    }

    const recentViolations =
        document.getElementById("recentViolations");

    if (recentViolations) {
        recentViolations.innerHTML = `
            <div class="empty-state" style="display:flex;">
                <div class="empty-icon">
                    <i class="fa-solid fa-circle-check"></i>
                </div>

                <h3>No Violations Found</h3>

                <p>
                    Your registered plate has no recorded violations.
                </p>
            </div>
        `;
    }

    setInterval(updateDateTime, 1000);
});

function loadOwnerInfo(owner) {

    const ownerName = document.getElementById("ownerName");
    const ownerEmail = document.getElementById("ownerEmail");

    if (ownerName) {
        ownerName.textContent =
            owner.fullName || "Vehicle Owner";
    }

    if (ownerEmail) {
        ownerEmail.textContent =
            owner.email || "No email available";
    }

    const image =
        document.getElementById("dashboardAvatarImage");

    const icon =
        document.getElementById("dashboardAvatarIcon");

    if (image) {
        image.style.display = "none";
    }

    if (icon) {
        icon.style.display = "block";
    }
}

function updateDateTime() {

    const now = new Date();

    const todayDate =
        document.getElementById("todayDate");

    const liveTime =
        document.getElementById("liveTime");

    if (todayDate) {
        todayDate.textContent =
            now.toLocaleDateString("en-PH", {
                year: "numeric",
                month: "long",
                day: "numeric"
            });
    }

    if (liveTime) {
        liveTime.textContent =
            now.toLocaleTimeString("en-PH", {
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit",
                hour12: true
            });
    }
}

function updateGreeting() {

    const greeting =
        document.getElementById("greeting");

    if (!greeting) {
        return;
    }

    const hour = new Date().getHours();

    if (hour < 12) {
        greeting.textContent = "Good Morning ☀️";
    } else if (hour < 18) {
        greeting.textContent = "Good Afternoon 🌤";
    } else {
        greeting.textContent = "Good Evening 🌙";
    }
}

function toggleMenu() {

    const menu =
        document.getElementById("headerMenu");

    if (!menu) {
        return;
    }

    menu.style.display =
        menu.style.display === "block"
            ? "none"
            : "block";
}

function confirmLogout() {

    showConfirm(
        "Logout",
        "Are you sure you want to logout?",
        function () {
            clearOwnerSession();
            window.location.href = "owner-login.html";
        }
    );
}

function clearOwnerSession() {
    localStorage.removeItem("plateTrackOwnerToken");
    localStorage.removeItem("plateTrackOwnerUser");
    localStorage.removeItem("plateTrackOwnerSession");
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

window.toggleMenu = toggleMenu;
window.confirmLogout = confirmLogout;
