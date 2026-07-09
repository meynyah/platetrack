// ==========================================
// PLATETRACK CAMERA
// ==========================================

let stream = null;
let scanning = false;
let currentFacingMode = "environment";
let detectionTimer = null;

// ==========================================
// CAMERA HELPERS
// ==========================================

function getElement(id){

    return document.getElementById(id);

}

function setText(id,text){

    const element = getElement(id);

    if(element){
        element.textContent = text;
    }

}

function showElement(id,displayType = "flex"){

    const element = getElement(id);

    if(element){
        element.style.display = displayType;
    }

}

function hideElement(id){

    const element = getElement(id);

    if(element){
        element.style.display = "none";
    }

}

// ==========================================
// OPEN CAMERA
// ==========================================

async function openCamera(){

    try{

        closeCamera();

        stream = await navigator.mediaDevices.getUserMedia({

            video:{
                facingMode:currentFacingMode
            },

            audio:false

        });

        const video = getElement("camera");

        video.srcObject = stream;
        video.style.display = "block";

        hideElement("cameraPlaceholder");

        document.querySelector(".detection-frame").style.display = "block";

        setText("cameraStatus","Active");

        return true;

    }
    catch(error){

        showError(
            "Camera Error",
            "Unable to access the device camera. Please allow camera permission."
        );

        setText("cameraStatus","Blocked");
        setText("aiStatus","Waiting");

        return false;

    }

}

// ==========================================
// CLOSE CAMERA
// ==========================================

function closeCamera(){

    if(stream){

        stream.getTracks().forEach(function(track){
            track.stop();
        });

        stream = null;

    }

}

// ==========================================
// START DETECTION
// ==========================================

async function startDetection(){

    if(scanning){
        return;
    }

    scanning = true;

    const cameraOpened = await openCamera();

    if(!cameraOpened){
        scanning = false;
        return;
    }

    setText("scanStatus","Camera Active");
    getElement("scanStatus").className = "status-value scanning";

    setText("aiStatus","Ready");
    setText("plateNumber","--------");
    setText("vehicleType","Not Detected");
    setText("vehicleColor","Not Detected");
    setText("detectionTime","--:--:--");

    hideElement("startDetectionBtn");

    showElement("captureBtn");
    showElement("switchCameraBtn");
    showElement("stopDetectionBtn");

    document.querySelector(".detection-frame").style.display = "block";
    hideElement("scanLine");

}

// ==========================================
// CAPTURE PLATE
// ==========================================

function capturePlate(){

    if(!scanning){
        return;
    }

    showElement("processingOverlay");

    showElement("scanLine","block");

    setText("scanStatus","Scanning Plate...");
    getElement("scanStatus").className = "status-value scanning";

    setText("aiStatus","Processing");

    captureFrame();

    detectionTimer = setTimeout(function(){

        simulateDetection();

    },1800);

}

// ==========================================
// CAPTURE CURRENT FRAME
// ==========================================

function captureFrame(){

    const video = getElement("camera");
    const canvas = getElement("captureCanvas");

    if(!video || !canvas){
        return;
    }

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const context = canvas.getContext("2d");

    context.drawImage(video,0,0,canvas.width,canvas.height);

    try{

        const imageData = canvas.toDataURL("image/png");

        localStorage.setItem("plateTrackCapturedImage",imageData);

    }
    catch(error){

        console.warn("Unable to save captured frame.");

    }

}

// ==========================================
// SIMULATE AI DETECTION
// ==========================================

function simulateDetection(){

    if(!scanning){
        return;
    }

    const sampleData = [
        {
            plateNumber:"NAA 4821",
            vehicleType:"Toyota Vios",
            vehicleColor:"White"
        },
        {
            plateNumber:"DBT 9176",
            vehicleType:"Honda City",
            vehicleColor:"Black"
        },
        {
            plateNumber:"NCX 1458",
            vehicleType:"Mitsubishi Montero",
            vehicleColor:"Silver"
        },
        {
            plateNumber:"GHT 3309",
            vehicleType:"Toyota Fortuner",
            vehicleColor:"Gray"
        },
        {
            plateNumber:"KLM 8524",
            vehicleType:"Ford Ranger",
            vehicleColor:"Blue"
        }
    ];

    const randomIndex = Math.floor(Math.random() * sampleData.length);
    const result = sampleData[randomIndex];

    const detectionTime = new Date().toLocaleString("en-US",{
        month:"long",
        day:"numeric",
        year:"numeric",
        hour:"numeric",
        minute:"2-digit",
        hour12:true
    });

    setText("plateNumber",result.plateNumber);
    setText("vehicleType",result.vehicleType);
    setText("vehicleColor",result.vehicleColor);
    setText("detectionTime",detectionTime);

    setText("scanStatus","Plate Detected");
    getElement("scanStatus").className = "status-value detected";

    setText("aiStatus","Completed");

    hideElement("processingOverlay");

    hideElement("scanLine");

    localStorage.setItem(
        "plateTrackDetectionResult",
        JSON.stringify({
            plateNumber:result.plateNumber,
            vehicleType:result.vehicleType,
            vehicleColor:result.vehicleColor,
            detectionTime:detectionTime,
            source:"camera"
        })
    );

    showSuccess(
        "Detection Successful",
        "License plate detected successfully."
    );

    setTimeout(function(){
        window.location.href = "detection-result.html";
    },1500);

}

// ==========================================
// SWITCH CAMERA
// ==========================================

async function switchCamera(){

    if(!scanning){
        return;
    }

    currentFacingMode =
    currentFacingMode === "environment" ? "user" : "environment";

    setText("cameraStatus","Switching...");

    await openCamera();

    setText("cameraStatus","Active");

}

// ==========================================
// STOP DETECTION
// ==========================================

function stopDetection(){

    scanning = false;

    if(detectionTimer){
        clearTimeout(detectionTimer);
        detectionTimer = null;
    }

    closeCamera();

    hideElement("processingOverlay");

    setText("scanStatus","Ready to Scan");
    getElement("scanStatus").className = "status-value ready";

    setText("cameraStatus","Ready");
    setText("aiStatus","Waiting");

    setText("plateNumber","--------");
    setText("vehicleType","Not Detected");
    setText("vehicleColor","Not Detected");
    setText("detectionTime","--:--:--");

    hideElement("captureBtn");
    hideElement("switchCameraBtn");
    hideElement("stopDetectionBtn");

    showElement("startDetectionBtn");

    hideElement("camera");
    showElement("cameraPlaceholder");

    document.querySelector(".detection-frame").style.display = "none";

    hideElement("scanLine")

}

// ==========================================
// FLASH BUTTON
// ==========================================

document.addEventListener("DOMContentLoaded",function(){

    const flashBtn = getElement("flashBtn");

    if(flashBtn){

        flashBtn.addEventListener("click",function(){

            showSuccess(
                "Flash",
                "Flash control will be available in the Android version."
            );

        });

    }

});

// ==========================================
// CLEANUP
// ==========================================

window.addEventListener("beforeunload",function(){

    closeCamera();

});
