// ==========================================
// PlateTrack | Owner Violations
// ==========================================

let currentOwner = null;

document.addEventListener("DOMContentLoaded", function(){

    currentOwner = requireOwnerSession();

    if(!currentOwner){
        return;
    }

    loadViolations();

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

// ==========================================
// DATA HELPERS
// ==========================================

function getOwnerViolations(){

    const history = JSON.parse(localStorage.getItem("plateTrackHistory")) || [];

    const ownerPlates = (currentOwner.plates || []).map(function(plate){
        return plate.toUpperCase();
    });

    return history
        .map(function(record, index){
            return Object.assign({ historyIndex: index }, record);
        })
        .filter(function(record){
            return ownerPlates.includes((record.plateNumber || "").toUpperCase());
        });

}

function getAppeals(){

    return JSON.parse(localStorage.getItem("plateTrackAppeals")) || [];

}

function findAppealForRecord(recordId){

    const appeals = getAppeals();

    return appeals.find(function(appeal){
        return appeal.recordId === recordId;
    }) || null;

}

// ==========================================
// LOAD VIOLATIONS
// ==========================================

function loadViolations(data = null){

    const violations = data || getOwnerViolations();

    const historyList = document.getElementById("historyList");
    const emptyState = document.getElementById("emptyState");

    historyList.innerHTML = "";

    if(violations.length === 0){

        emptyState.style.display = "flex";

        return;

    }

    emptyState.style.display = "none";

    violations.forEach(function(item){

        const appeal = findAppealForRecord(item.recordId);

        let appealSection = "";

        if(appeal){

            const statusClass = appeal.status.toLowerCase();

            appealSection = `
                <div class="detail-row">
                    <span class="detail-label">Appeal Status</span>
                    <span class="appeal-badge ${statusClass}">${appeal.status}</span>
                </div>
            `;

        }

        historyList.innerHTML += `
            <div class="history-card">

                <div class="history-header">

                    <div>
                        <div class="record-id">
                            ${item.recordId || "N/A"}
                        </div>

                        <div class="plate-number">
                            ${item.plateNumber || "Unknown Plate"}
                        </div>
                    </div>

                    <div class="violation-badge">
                        ${item.violation || "Violation"}
                    </div>

                </div>

                <div class="history-details">

                    <div class="detail-row">
                        <span class="detail-label">Vehicle</span>
                        <span class="detail-value">${item.vehicleType || "-"}</span>
                    </div>

                    <div class="detail-row">
                        <span class="detail-label">Location</span>
                        <span class="detail-value">${item.location || "-"}</span>
                    </div>

                    <div class="detail-row">
                        <span class="detail-label">Date</span>
                        <span class="detail-value">${item.date || "-"}</span>
                    </div>

                    ${appealSection}

                </div>

                <div class="card-actions">

                    <button
                    class="view-btn"
                    type="button"
                    onclick="viewRecord('${item.recordId}')">

                        <i class="fa-solid fa-eye"></i>
                        View

                    </button>

                </div>

                ${appeal ? "" : `
                    <button
                    class="appeal-btn"
                    type="button"
                    onclick="startAppeal('${item.recordId}')">

                        <i class="fa-solid fa-file-pen"></i>
                        File an Appeal

                    </button>
                `}

            </div>
        `;

    });

}

// ==========================================
// SEARCH + FILTER
// ==========================================

function applyFilters(){

    const keyword = document.getElementById("searchInput").value.trim().toLowerCase();
    const filter = document.getElementById("appealFilter").value;

    const violations = getOwnerViolations().filter(function(item){

        const plate = (item.plateNumber || "").toLowerCase();
        const recordId = (item.recordId || "").toLowerCase();

        const matchKeyword =
            plate.includes(keyword) ||
            recordId.includes(keyword);

        const appeal = findAppealForRecord(item.recordId);

        let matchFilter = true;

        if(filter === "none"){
            matchFilter = !appeal;
        }
        else if(filter !== ""){
            matchFilter = appeal && appeal.status === filter;
        }

        return matchKeyword && matchFilter;

    });

    loadViolations(violations);

}

// ==========================================
// FILE APPEAL
// ==========================================

function startAppeal(recordId){

    localStorage.setItem("plateTrackCurrentAppealRecord", recordId);

    window.location.href = "appeal-form.html";

}

// ==========================================
// VIEW RECORD
// ==========================================

function viewRecord(recordId){

    const violations = getOwnerViolations();

    const item = violations.find(function(record){
        return record.recordId === recordId;
    });

    if(!item){
        return;
    }

    const imageBox = document.getElementById("capturedDetailImage");

    if(item.capturedImage){

        imageBox.innerHTML = `
            <img
            src="${item.capturedImage}"
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

    document.getElementById("detailRecordId").textContent = item.recordId || "N/A";
    document.getElementById("detailPlate").textContent = item.plateNumber || "-";
    document.getElementById("detailVehicle").textContent = item.vehicleType || "-";
    document.getElementById("detailColor").textContent = item.vehicleColor || "-";
    document.getElementById("detailViolation").textContent = item.violation || "-";
    document.getElementById("detailLocation").textContent = item.location || "-";
    document.getElementById("detailDate").textContent = item.date || "-";

    document.getElementById("detailNotes").textContent =
    item.notes && item.notes.trim() !== ""
    ? item.notes
    : "No additional remarks.";

    const appeal = findAppealForRecord(item.recordId);
    const appealSection = document.getElementById("detailAppealSection");

    if(appeal){

        appealSection.innerHTML = `
            <div class="detail-item">
                <span>Appeal Reason</span>
                <strong>${appeal.reason}</strong>
            </div>
            <div class="detail-item">
                <span>Appeal Status</span>
                <strong>${appeal.status}</strong>
            </div>
        `;

    }
    else{

        appealSection.innerHTML = "";

    }

    document.getElementById("detailsModal").style.display = "flex";

}

function closeDetailsModal(){

    document.getElementById("detailsModal").style.display = "none";

}

window.addEventListener("click", function(event){

    const modal = document.getElementById("detailsModal");

    if(event.target === modal){

        closeDetailsModal();

    }

});
