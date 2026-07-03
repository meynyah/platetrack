// ==========================================
// PLATETRACK
// HISTORY PAGE
// ==========================================


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener("DOMContentLoaded",function(){

    loadHistory();

});

function formatDate(dateString){

    const date = new Date(dateString);

    if(isNaN(date)){

        return dateString;

    }

    const formattedDate = date.toLocaleDateString("en-US",{

        month:"long",

        day:"numeric",

        year:"numeric"

    });

    const formattedTime = date.toLocaleTimeString("en-US",{

        hour:"numeric",

        minute:"2-digit",

        hour12:true

    });

    return `${formattedDate} • ${formattedTime}`;

}


// ==========================================
// LOAD HISTORY
// ==========================================

function loadHistory(data = null){

    const history = data || JSON.parse(

    localStorage.getItem("plateTrackHistory")

    ) || [];   

    const historyList =
    document.getElementById("historyList");

    const emptyState =
    document.getElementById("emptyState");

    historyList.innerHTML = "";

    if(history.length===0){

        emptyState.style.display="flex";

        return;

    }

    emptyState.style.display="none";

    history.forEach(function(item,index){

        historyList.innerHTML += `

        <div class="history-card">

            <div class="history-header">

                <div>

                    <div class="record-id">

                        ${item.recordId || "N/A"}

                    </div>

                    <div class="plate-number">

                        ${item.plateNumber}

                    </div>

                </div>

                <div class="violation-badge">

                    ${item.violation}

                </div>

            </div>

            <div class="history-details">

                <div class="detail-row">

                    <span class="detail-label">

                        Vehicle

                    </span>

                    <span class="detail-value">

                        ${item.vehicleType}

                    </span>

                </div>

                <div class="detail-row">

                    <span class="detail-label">

                        Color

                    </span>

                    <span class="detail-value">

                        ${item.vehicleColor}

                    </span>

                </div>

                <div class="detail-row">

                    <span class="detail-label">

                        Location

                    </span>

                    <span class="detail-value">

                        ${item.location}

                    </span>

                </div>

                <div class="detail-row">

                    <span class="detail-label">

                        Date

                    </span>

                    <span class="detail-value">

                        ${(item.date)}

                    </span>

                </div>

            </div>

            <div class="card-actions">

                <button
                class="view-btn"
                onclick="viewRecord(${index})">

                    <i class="fa-solid fa-eye"></i>

                    View

                </button>

                <button
                class="delete-btn"
                onclick="deleteRecord(${index})">

                    <i class="fa-solid fa-trash"></i>

                    Delete

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

    const keyword = document
    .getElementById("searchInput")
    .value
    .trim()
    .toLowerCase();

    const filter = document
    .getElementById("violationFilter")
    .value;

    const history = JSON.parse(

        localStorage.getItem("plateTrackHistory")

    ) || [];

    const filteredHistory = history.filter(function(item){

        const matchPlate =
        item.plateNumber
        .toLowerCase()
        .includes(keyword);

        const matchViolation =
        filter === "" ||
        item.violation === filter;

        return matchPlate && matchViolation;

    });

    loadHistory(filteredHistory);

}

// ==========================================
// VIEW RECORD
// ==========================================

function viewRecord(index){

    const history = JSON.parse(

        localStorage.getItem("plateTrackHistory")

    ) || [];

    const item = history[index];

    if(!item){

        return;

    }

    document.getElementById("detailRecordId").textContent =
    item.recordId || "N/A";

    document.getElementById("detailPlate").textContent =
    item.plateNumber || "-";

    document.getElementById("detailVehicle").textContent =
    item.vehicleType || "-";

    document.getElementById("detailColor").textContent =
    item.vehicleColor || "-";

    document.getElementById("detailViolation").textContent =
    item.violation || "-";

    document.getElementById("detailLocation").textContent =
    item.location || "-";

    document.getElementById("detailDate").textContent =
    (item.date);

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
// DELETE RECORD
// ==========================================

function deleteRecord(index){

    showConfirm(

        "Delete Record",

        "Are you sure you want to delete this violation record?",

        function(){

            let history = JSON.parse(

                localStorage.getItem("plateTrackHistory")

            ) || [];

            history.splice(index,1);

            localStorage.setItem(

                "plateTrackHistory",

                JSON.stringify(history)

            );

            loadHistory();

            showSuccess(

                "Deleted",

                "Violation record deleted successfully."

            );

        }

    );

}


// ==========================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ==========================================

window.onclick = function(event){

    const modal = document.getElementById("detailsModal");

    if(event.target === modal){

        closeDetailsModal();

    }

}

