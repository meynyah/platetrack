// ==========================================
// PLATETRACK
// DETECTION RESULT
// ==========================================


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener("DOMContentLoaded",function(){

    loadDetectionData();

    loadCurrentLocation();

});


// ==========================================
// LOAD DETECTION DATA
// ==========================================

function loadDetectionData(){

    const demoVehicles=[

        {
            plate:"NAA 4821",
            vehicle:"Toyota Vios",
            color:"White"
        },

        {
            plate:"DBT 9176",
            vehicle:"Honda City",
            color:"Black"
        },

        {
            plate:"NCX 1458",
            vehicle:"Mitsubishi Montero",
            color:"Silver"
        },

        {
            plate:"GHT 3309",
            vehicle:"Toyota Fortuner",
            color:"Gray"
        },

        {
            plate:"KLM 8524",
            vehicle:"Ford Ranger",
            color:"Blue"
        },

        {
            plate:"RQP 6612",
            vehicle:"Nissan Navara",
            color:"Red"
        },

        {
            plate:"TUV 1945",
            vehicle:"Hyundai Accent",
            color:"White"
        },

        {
            plate:"MZX 2701",
            vehicle:"Toyota Innova",
            color:"Black"
        }

    ];

    let detectedVehicle=

    JSON.parse(

        sessionStorage.getItem("currentDetection")

    );

    if(!detectedVehicle){

        detectedVehicle=

        demoVehicles[

            Math.floor(

                Math.random()*demoVehicles.length

            )

        ];

        sessionStorage.setItem(

            "currentDetection",

            JSON.stringify(detectedVehicle)

        );

    }

    document.getElementById("plateNumber").textContent=

    detectedVehicle.plate;

    document.getElementById("vehicleType").textContent=

    detectedVehicle.vehicle;

    document.getElementById("vehicleColor").textContent=

    detectedVehicle.color;

    const now = new Date();

    const formattedDate = now.toLocaleDateString("en-US",{

    month:"long",

    day:"numeric",

    year:"numeric"

    });

    const formattedTime = now.toLocaleTimeString("en-US",{

    hour:"numeric",

    minute:"2-digit",

    hour12:true

    });

    document.getElementById("detectionTime").textContent =

    `${formattedDate} • ${formattedTime}`;

    }


// ==========================================
// CURRENT LOCATION
// ==========================================

function loadCurrentLocation(){

    if(!navigator.geolocation){

        document
        .getElementById("currentLocation")
        .textContent="Location unavailable";

        return;

    }

    navigator.geolocation.getCurrentPosition(

        function(position){

            // Backend:
            // Google Maps Reverse Geocoding API

            document
            .getElementById("currentLocation")
            .textContent="Antipolo City";

        },

        function(){

            document
            .getElementById("currentLocation")
            .textContent="Antipolo City";

        }

    );

}

// ==========================================
// SAVE VIOLATION
// ==========================================

function saveViolation(){

    const violation =
    document
    .getElementById("violationType")
    .value;

    const notes =
    document
    .getElementById("officerNotes")
    .value
    .trim();

    if(violation===""){

        showError(

            "Incomplete Information",

            "Please select a traffic violation."

        );

        return;

    }

    // ======================================
    // LOAD HISTORY
    // ======================================

    let history =

        JSON.parse(

            localStorage.getItem("plateTrackHistory")

        ) || [];

    // ======================================
    // GENERATE RECORD ID
    // ======================================

    const year = new Date().getFullYear();

    const recordId =

        `PT-${year}-${String(history.length+1).padStart(6,"0")}`;

    // ======================================
    // CREATE RECORD
    // ======================================

    const violationData={

        recordId:recordId,

        plateNumber:
        document.getElementById("plateNumber").textContent,

        vehicleType:
        document.getElementById("vehicleType").textContent,

        vehicleColor:
        document.getElementById("vehicleColor").textContent,

        violation:violation,

        notes:notes,

        location:
        document.getElementById("currentLocation").textContent,

        date: new Intl.DateTimeFormat("en-US",{

        month:"long",

        day:"numeric",

        year:"numeric",

        hour:"numeric",

        minute:"2-digit",

        hour12:true

        }).format(new Date())

    };

    // ======================================
    // SAVE TO LOCAL STORAGE
    // ======================================

    history.unshift(violationData);

    localStorage.setItem(

        "plateTrackHistory",

        JSON.stringify(history)

    );

    // ======================================
    // CLEAR CURRENT DETECTION
    // ======================================

    sessionStorage.removeItem(

        "currentDetection"

    );

    // ======================================
    // SUCCESS
    // ======================================

    showSuccess(

        "Violation Recorded",

        "The traffic violation has been saved successfully."

    );

    setTimeout(function(){

        window.location.href="history.html";

    },1800);

}


// ==========================================
// CLEAR NOTES
// ==========================================

function clearNotes(){

    document
    .getElementById("officerNotes")
    .value="";

}


// ==========================================
// READY FOR BACKEND
// ==========================================

/*

Future Backend Integration

POST
/api/violations

Example:

fetch("/api/violations",{

    method:"POST",

    headers:{

        "Content-Type":"application/json"

    },

    body:JSON.stringify(violationData)

});

The backend will save the record
to MongoDB instead of LocalStorage.

*/