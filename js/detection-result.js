// ==========================================
// PLATETRACK DETECTION RESULT
// ==========================================

document.addEventListener("DOMContentLoaded",function(){

    loadDetectionData();
    loadCapturedImage();
    loadCurrentLocation();
    setupViolationDropdown();

});

function loadDetectionData(){

    const storedResult = JSON.parse(localStorage.getItem("plateTrackDetectionResult"));

    if(!storedResult){
        showError("No Detection Found","Please scan a license plate first.");

        setTimeout(function(){
            window.location.href = "camera.html";
        },1500);

        return;
    }

    document.getElementById("plateNumber").textContent =
    storedResult.plateNumber || "Unknown Plate";

    document.getElementById("vehicleType").textContent =
    storedResult.vehicleType || "Unknown Vehicle";

    document.getElementById("vehicleColor").textContent =
    storedResult.vehicleColor || "Unknown Color";

    document.getElementById("detectionTime").textContent =
    storedResult.detectionTime || getFormattedDateTime();

}

function loadCapturedImage(){

    const capturedImage = localStorage.getItem("plateTrackCapturedImage");
    const captureBox = document.querySelector(".capture-image");

    if(!captureBox || !capturedImage){
        return;
    }

    captureBox.innerHTML = `
        <img src="${capturedImage}" alt="Captured vehicle image" class="captured-photo">
    `;

}

function getFormattedDateTime(){

    return new Intl.DateTimeFormat("en-US",{
        month:"long",
        day:"numeric",
        year:"numeric",
        hour:"numeric",
        minute:"2-digit",
        hour12:true
    }).format(new Date());

}

function loadCurrentLocation(){

    const locationElement = document.getElementById("currentLocation");

    if(!navigator.geolocation){
        locationElement.textContent = "Antipolo City";
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function(){
            locationElement.textContent = "Antipolo City";
        },
        function(){
            locationElement.textContent = "Antipolo City";
        }
    );

}

function setupViolationDropdown(){

    const violation = document.getElementById("violationType");
    const otherGroup = document.getElementById("otherViolationGroup");
    const otherInput = document.getElementById("otherViolation");

    if(!violation || !otherGroup || !otherInput){
        return;
    }

    violation.addEventListener("change",function(){

        if(this.value === "Others"){
            otherGroup.style.display = "flex";
        }
        else{
            otherGroup.style.display = "none";
            otherInput.value = "";
        }

    });

}

function saveViolation(){

    let violation = document.getElementById("violationType").value;
    const otherInput = document.getElementById("otherViolation");

    if(violation === ""){

        showError(
            "Incomplete Information",
            "Please select a traffic violation."
        );

        return;
    }

    if(violation === "Others"){

        if(!otherInput || otherInput.value.trim() === ""){

            showError(
                "Specify Violation",
                "Please specify the traffic violation."
            );

            return;
        }

        violation = otherInput.value.trim();
    }

    const notes = document.getElementById("officerNotes").value.trim();

    let history = JSON.parse(localStorage.getItem("plateTrackHistory")) || [];

    const year = new Date().getFullYear();

    const recordId =
    `PT-${year}-${String(history.length + 1).padStart(6,"0")}`;

    const violationData = {

        recordId:recordId,

        plateNumber:document.getElementById("plateNumber").textContent,

        vehicleType:document.getElementById("vehicleType").textContent,

        vehicleColor:document.getElementById("vehicleColor").textContent,

        violation:violation,

        notes:notes,

        location:document.getElementById("currentLocation").textContent,

        capturedImage:localStorage.getItem("plateTrackCapturedImage") || "",

        date:getFormattedDateTime()

    };

    history.unshift(violationData);

    localStorage.setItem(
        "plateTrackHistory",
        JSON.stringify(history)
    );

    localStorage.removeItem("plateTrackDetectionResult");
    localStorage.removeItem("plateTrackCapturedImage");

    showSuccess(
        "Violation Recorded",
        "The traffic violation has been saved successfully."
    );

    setTimeout(function(){
        window.location.href = "history.html";
    },1500);

}

function clearNotes(){

    document.getElementById("officerNotes").value = "";

}