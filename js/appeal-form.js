// ==========================================
// PlateTrack | Appeal Form
// ==========================================

let currentOwner = null;
let currentRecord = null;

document.addEventListener("DOMContentLoaded", function(){

    currentOwner = requireOwnerSession();

    if(!currentOwner){
        return;
    }

    loadRecordForAppeal();
    setupReasonDropdown();

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
// LOAD VIOLATION RECORD
// ==========================================

function loadRecordForAppeal(){

    const recordId = localStorage.getItem("plateTrackCurrentAppealRecord");

    const history = JSON.parse(localStorage.getItem("plateTrackHistory")) || [];

    currentRecord = history.find(function(record){
        return record.recordId === recordId;
    });

    if(!currentRecord){

        showError(
            "No Violation Selected",
            "Please select a violation to appeal from your violations list."
        );

        setTimeout(function(){
            window.location.href = "owner-violations.html";
        }, 1500);

        return;
    }

    const appeals = JSON.parse(localStorage.getItem("plateTrackAppeals")) || [];

    const existingAppeal = appeals.find(function(appeal){
        return appeal.recordId === recordId;
    });

    if(existingAppeal){

        showInfo(
            "Appeal Already Filed",
            "You have already filed an appeal for this violation."
        );

        setTimeout(function(){
            window.location.href = "owner-violations.html";
        }, 1500);

        return;
    }

    document.getElementById("plateNumber").value = currentRecord.plateNumber || "";
    document.getElementById("recordId").value = currentRecord.recordId || "";
    document.getElementById("violationType").value = currentRecord.violation || "";
    document.getElementById("violationDate").value = currentRecord.date || "";
    document.getElementById("violationLocation").value = currentRecord.location || "";

}

// ==========================================
// REASON DROPDOWN
// ==========================================

function setupReasonDropdown(){

    const reason = document.getElementById("appealReason");
    const otherGroup = document.getElementById("otherReasonGroup");
    const otherInput = document.getElementById("otherReason");

    reason.addEventListener("change", function(){

        if(this.value === "Others"){
            otherGroup.style.display = "flex";
            otherInput.focus();
        }
        else{
            otherGroup.style.display = "none";
            otherInput.value = "";
        }

    });

}

// ==========================================
// SUBMIT APPEAL
// ==========================================

function submitAppeal(){

    if(!currentRecord){
        return;
    }

    let reason = document.getElementById("appealReason").value;
    const otherInput = document.getElementById("otherReason");
    const explanation = document.getElementById("explanation").value.trim();

    if(reason === ""){

        showError(
            "Missing Reason",
            "Please select a reason for your appeal."
        );

        return;
    }

    if(reason === "Others"){

        if(!otherInput || otherInput.value.trim() === ""){

            showError(
                "Specify Reason",
                "Please specify your reason for appeal."
            );

            return;
        }

        reason = otherInput.value.trim();
    }

    if(explanation === ""){

        showError(
            "Missing Explanation",
            "Please provide an explanation to support your appeal."
        );

        return;
    }

    const appeals = JSON.parse(localStorage.getItem("plateTrackAppeals")) || [];

    const year = new Date().getFullYear();

    const appealId = `AP-${year}-${String(appeals.length + 1).padStart(6,"0")}`;

    appeals.unshift({
        appealId: appealId,
        recordId: currentRecord.recordId,
        plateNumber: currentRecord.plateNumber,
        ownerEmail: currentOwner.email,
        reason: reason,
        explanation: explanation,
        dateFiled: new Intl.DateTimeFormat("en-US",{
            month:"long",
            day:"numeric",
            year:"numeric",
            hour:"numeric",
            minute:"2-digit",
            hour12:true
        }).format(new Date()),
        status: "Pending"
    });

    localStorage.setItem("plateTrackAppeals", JSON.stringify(appeals));

    localStorage.removeItem("plateTrackCurrentAppealRecord");

    showSuccess(
        "Appeal Submitted",
        "Your appeal has been submitted successfully.<br><br>It is now pending review. You can check its status from your violations list.",
        function(){
            window.location.href = "owner-violations.html";
        },
        "Back to Violations"
    );

}
