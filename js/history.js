// ==========================================
// PLATETRACK
// HISTORY PAGE (My Reports — backend-connected)
// ==========================================

const API_BASE = "http://localhost:5000/api";

let allViolations = [];

document.addEventListener("DOMContentLoaded",async function(){

    const token = getEnforcerToken();

    if(!token){
        window.location.href = "enforcer-login.html";
        return;
    }

    await loadHistory(token);

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
// LOAD HISTORY (from backend)
// ==========================================

async function loadHistory(token, data = null){

    const historyList = document.getElementById("historyList");
    const emptyState = document.getElementById("emptyState");

    if(data === null){

        try{

            const response = await fetch(
                API_BASE + "/enforcer/violations/mine",
                {
                    headers:{
                        "Authorization":`Bearer ${token}`
                    }
                }
            );

            if(response.status === 401 || response.status === 403){

                clearEnforcerSession();
                window.location.href = "enforcer-login.html";
                return;

            }

            const violations = await response.json();

            if(!response.ok){
                throw new Error(violations.message || "Failed to load your reports.");
            }

            allViolations = Array.isArray(violations) ? violations : [];

        }
        catch(error){

            console.error("Unable to load violation history:", error);

            historyList.innerHTML = "";

            emptyState.style.display = "flex";
            emptyState.querySelector("h3") &&
                (emptyState.querySelector("h3").textContent = "Unable to Load Reports");
            emptyState.querySelector("p") &&
                (emptyState.querySelector("p").textContent = error.message || "Please refresh the page.");

            return;

        }

    }

    const history = data !== null ? data : allViolations;

    historyList.innerHTML = "";

    if(history.length === 0){

        emptyState.style.display = "flex";

        return;
    }

    emptyState.style.display = "none";

    history.forEach(function(item){

        const date = item.dateTime
            ? new Date(item.dateTime).toLocaleString("en-US",{
                month:"short",
                day:"numeric",
                year:"numeric",
                hour:"numeric",
                minute:"2-digit"
            })
            : "Recent";

        historyList.innerHTML += `
            <div class="history-card">

                <div class="history-header">

                    <div>
                        <div class="record-id">
                            ${escapeHtml((item._id || "").slice(-8).toUpperCase() || "N/A")}
                        </div>

                        <div class="plate-number">
                            ${escapeHtml(item.plateNumber || "Unknown Plate")}
                        </div>
                    </div>

                    <div class="violation-badge">
                        ${escapeHtml(item.violationType || "Violation")}
                    </div>

                </div>

                <div class="history-details">

                    <div class="detail-row">
                        <span class="detail-label">Location</span>
                        <span class="detail-value">${escapeHtml(item.location || "-")}</span>
                    </div>

                    <div class="detail-row">
                        <span class="detail-label">Date</span>
                        <span class="detail-value">${escapeHtml(date)}</span>
                    </div>

                    <div class="detail-row">
                        <span class="detail-label">Status</span>
                        <span class="detail-value">${escapeHtml(item.status || "pending")}</span>
                    </div>

                </div>

                <div class="card-actions">

                    <button
                    class="view-btn"
                    type="button"
                    onclick="viewRecord('${item._id}')">

                        <i class="fa-solid fa-eye"></i>
                        View

                    </button>

                </div>

            </div>
        `;

    });

}

// ==========================================
// SEARCH + FILTER
// ==========================================

function applyFilters(){

    const keyword =
    document
    .getElementById("searchInput")
    .value
    .trim()
    .toLowerCase();

    const filter =
    document
    .getElementById("violationFilter")
    .value;

    const filtered = allViolations.filter(function(item){

        const plate = (item.plateNumber || "").toLowerCase();
        const location = (item.location || "").toLowerCase();

        const matchKeyword =
        plate.includes(keyword) ||
        location.includes(keyword);

        const matchViolation =
        filter === "" ||
        item.violationType === filter;

        return matchKeyword && matchViolation;

    });

    const token = getEnforcerToken();

    loadHistory(token, filtered);

}

// ==========================================
// VIEW RECORD (looked up by backend _id)
// ==========================================

function viewRecord(violationId){

    const item = allViolations.find(function(record){
        return record._id === violationId;
    });

    if(!item){
        return;
    }

    const imageBox =
    document.getElementById("capturedDetailImage");

    if(item.photoUrl){

        imageBox.innerHTML = `
            <img
            src="${item.photoUrl}"
            alt="Captured vehicle evidence">
        `;

    }
    else{

        imageBox.innerHTML = `
            <div class="no-image-box">
                <i class="fa-solid fa-camera"></i>
                <p>No captured image available</p>
            </div>
        `;

    }

    const date = item.dateTime
        ? new Date(item.dateTime).toLocaleString("en-US",{
            month:"long",
            day:"numeric",
            year:"numeric",
            hour:"numeric",
            minute:"2-digit"
        })
        : "-";

    document.getElementById("detailRecordId").textContent =
    (item._id || "").slice(-8).toUpperCase() || "N/A";

    document.getElementById("detailPlate").textContent =
    item.plateNumber || "-";

    document.getElementById("detailVehicle").textContent = "-";

    document.getElementById("detailColor").textContent = "-";

    document.getElementById("detailViolation").textContent =
    item.violationType || "-";

    document.getElementById("detailLocation").textContent =
    item.location || "-";

    document.getElementById("detailDate").textContent =
    date;

    document.getElementById("detailNotes").textContent =
    item.notes && item.notes.trim() !== ""
    ? item.notes
    : "No additional remarks.";

    document.getElementById("detailsModal").style.display =
    "flex";

}

// ==========================================
// CLOSE DETAILS MODAL
// ==========================================

function closeDetailsModal(){

    document.getElementById("detailsModal").style.display =
    "none";

}

// ==========================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ==========================================

window.addEventListener("click",function(event){

    const modal =
    document.getElementById("detailsModal");

    if(event.target === modal){

        closeDetailsModal();

    }

});

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
