// ==========================================
// PLATETRACK CAMERA
// ==========================================

let stream = null;

let scanning = false;


// ==========================================
// OPEN CAMERA
// ==========================================

async function openCamera(){

    try{

        stream = await navigator.mediaDevices.getUserMedia({

            video:{
                facingMode:"environment"
            },

            audio:false

        });

        const video =
        document.getElementById("camera");

        video.srcObject = stream;

        video.style.display = "block";

        document
        .getElementById("cameraPlaceholder")
        .style.display = "none";

        document
        .getElementById("cameraStatus")
        .textContent = "Active";

    }

    catch(error){

        showError(

            "Camera Error",

            "Unable to access the device camera."

        );

    }

}


// ==========================================
// CLOSE CAMERA
// ==========================================

function closeCamera(){

    if(stream){

        stream
        .getTracks()
        .forEach(track=>track.stop());

    }

}


// ==========================================
// START DETECTION
// ==========================================

function startDetection(){

    if(scanning){

        return;

    }

    scanning = true;

    openCamera();

    document
    .getElementById("scanStatus")
    .textContent = "Scanning...";

    document
    .getElementById("scanStatus")
    .className = "status-value scanning";

    document
    .getElementById("aiStatus")
    .textContent = "Scanning";

    document
    .getElementById("startDetectionBtn")
    .style.display = "none";

    document
    .getElementById("stopDetectionBtn")
    .style.display = "flex";

    simulateDetection();

}

// ==========================================
// SIMULATE AI DETECTION
// ==========================================

function simulateDetection(){

    setTimeout(function(){

        if(!scanning){

            return;

        }

        const samplePlates=[

            "NAA 1234",
            "ABC 5678",
            "XYZ 9012",
            "JKL 3456",
            "DEF 7890"

        ];

        const sampleVehicles=[

            "Toyota Vios",
            "Mitsubishi Mirage",
            "Honda City",
            "Toyota Fortuner",
            "Nissan Almera"

        ];

        const randomIndex=
        Math.floor(Math.random()*samplePlates.length);

        document
        .getElementById("plateNumber")
        .textContent=
        samplePlates[randomIndex];

        document
        .getElementById("vehicleType")
        .textContent=
        sampleVehicles[randomIndex];

        document
        .getElementById("scanStatus")
        .textContent=
        "Plate Detected";

        document
        .getElementById("scanStatus")
        .className=
        "status-value detected";

        document
        .getElementById("aiStatus")
        .textContent=
        "Completed";

        document
        .getElementById("detectionTime")
        .textContent=
        new Date().toLocaleTimeString();

        showSuccess(

            "Detection Successful",

            "License plate detected successfully."

        );

        setTimeout(function(){

            window.location.href=
            "detection-result.html";

        },1800);

    },4000);

}


// ==========================================
// STOP DETECTION
// ==========================================

function stopDetection(){

    scanning=false;

    closeCamera();

    document
    .getElementById("scanStatus")
    .textContent=
    "Ready to Scan";

    document
    .getElementById("scanStatus")
    .className=
    "status-value ready";

    document
    .getElementById("cameraStatus")
    .textContent=
    "Ready";

    document
    .getElementById("aiStatus")
    .textContent=
    "Waiting";

    document
    .getElementById("startDetectionBtn")
    .style.display="flex";

    document
    .getElementById("stopDetectionBtn")
    .style.display="none";

    document
    .getElementById("camera")
    .style.display="none";

    document
    .getElementById("cameraPlaceholder")
    .style.display="flex";

}


// ==========================================
// FLASH BUTTON (Placeholder)
// ==========================================

document
.getElementById("flashBtn")
.addEventListener("click",function(){

    showSuccess(

        "Flash",

        "Flash control will be available in the Android version."

    );

});


// ==========================================
// CLEANUP
// ==========================================

window.addEventListener("beforeunload",function(){

    closeCamera();

});