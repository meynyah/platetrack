// ==========================================
// PLATETRACK
// UNIFIED VIOLATION FORM
// ==========================================

let isCameraMode = false;

// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener("DOMContentLoaded",function(){

    initializeForm();

    setupViolationDropdown();

    updateDateTime();

    setInterval(updateDateTime,1000);

});

// ==========================================
// INITIALIZE FORM
// ==========================================

function initializeForm(){

    const detectionData = JSON.parse(

        localStorage.getItem("plateTrackDetectionResult")

    );

    if(detectionData){

        isCameraMode = true;

        document.getElementById("formTitle").textContent =
        "Violation Form";

        document.getElementById("formSubtitle").textContent =
        "Review the detected vehicle and record the violation.";

        document.getElementById("formModeText").textContent =
        "Vehicle information was detected automatically.";

        document.getElementById("plateNumber").value =
        detectionData.plateNumber || "";

        document.getElementById("vehicleType").value =
        detectionData.vehicleType || "";

        document.getElementById("vehicleColor").value =
        detectionData.vehicleColor || "";

        document.getElementById("plateNumber").readOnly = true;
        document.getElementById("vehicleType").readOnly = true;
        document.getElementById("vehicleColor").readOnly = true;

    }

    else{

        isCameraMode = false;

        document.getElementById("formTitle").textContent =
        "Manual Violation";

        document.getElementById("formSubtitle").textContent =
        "Record a traffic violation manually.";

        document.getElementById("formModeText").textContent =
        "Fill in the vehicle information below.";

    }

}

// ==========================================
// AUTO DATE & TIME
// ==========================================

function updateDateTime(){

    document.getElementById("recordDateTime").value =

    new Intl.DateTimeFormat("en-US",{

        month:"long",

        day:"numeric",

        year:"numeric",

        hour:"numeric",

        minute:"2-digit",

        second:"2-digit",

        hour12:true

    }).format(new Date());

}

// ==========================================
// VIOLATION DROPDOWN
// ==========================================

function setupViolationDropdown(){

    const violationType =
    document.getElementById("violationType");

    const otherGroup =
    document.getElementById("otherViolationGroup");

    const otherInput =
    document.getElementById("otherViolation");

    violationType.addEventListener("change",function(){

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
// GO BACK
// ==========================================

function goBack(){

    if(isCameraMode){
        window.location.href = "detection-result.html";
    }
    else{
        window.location.href = "enforcer-dashboard.html";
    }

}

// ==========================================
// VALIDATION HELPER
// ==========================================

function getCleanValue(id){

    return document.getElementById(id).value.trim();

}

function validateForm(){

    if(getCleanValue("plateNumber") === ""){

        showError(
            "Missing Plate Number",
            "Please enter the vehicle plate number."
        );

        return false;

    }

    if(getCleanValue("vehicleType") === ""){

        showError(
            "Missing Vehicle Type",
            "Please enter the vehicle type or model."
        );

        return false;

    }

    if(getCleanValue("vehicleColor") === ""){

        showError(
            "Missing Vehicle Color",
            "Please enter the vehicle color."
        );

        return false;

    }

    if(getCleanValue("violationType") === ""){

        showError(
            "Missing Violation",
            "Please select a traffic violation."
        );

        return false;

    }

    if(getCleanValue("violationType") === "Others" &&
       getCleanValue("otherViolation") === ""){

        showError(
            "Specify Violation",
            "Please specify the traffic violation."
        );

        return false;

    }

    return true;

}

// ==========================================
// SAVE VIOLATION
// ==========================================

function saveViolation(){

    if(!validateForm()){
        return;
    }

    let violation = getCleanValue("violationType");

    if(violation === "Others"){
        violation = getCleanValue("otherViolation");
    }

    let history =
    JSON.parse(localStorage.getItem("plateTrackHistory")) || [];

    const year = new Date().getFullYear();

    const recordId =
    `PT-${year}-${String(history.length + 1).padStart(6,"0")}`;

    const violationData = {

        recordId:recordId,

        plateNumber:getCleanValue("plateNumber").toUpperCase(),

        vehicleType:getCleanValue("vehicleType"),

        vehicleColor:getCleanValue("vehicleColor"),

        violation:violation,

        notes:getCleanValue("officerNotes"),

        location:getCleanValue("location"),

        officerName:getCleanValue("officerName"),

        badgeNumber:getCleanValue("badgeNumber"),

        date:getCleanValue("recordDateTime"),

        source:isCameraMode ? "Camera Detection" : "Manual Entry"

    };

    history.unshift(violationData);

    localStorage.setItem(
        "plateTrackHistory",
        JSON.stringify(history)
    );

    localStorage.removeItem("plateTrackDetectionResult");
    localStorage.removeItem("plateTrackCapturedImage");

    showSuccess(
        "Violation Saved",
        "The violation record has been saved successfully."
    );

    setTimeout(function(){
        window.location.href = "history.html";
    },1500);

}