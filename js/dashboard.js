// ==========================================
// PLATETRACK DASHBOARD
// ==========================================


// ==========================================
// LIVE DATE & TIME
// ==========================================

function updateDateTime(){

    const now = new Date();

    const dateOptions = {

        year:"numeric",
        month:"long",
        day:"numeric"

    };

    const timeOptions = {

        hour:"numeric",
        minute:"2-digit",
        second:"2-digit"

    };

    document.getElementById("todayDate").textContent =
    now.toLocaleDateString("en-US",dateOptions);

    document.getElementById("liveTime").textContent =
    now.toLocaleTimeString("en-US",timeOptions);

}

setInterval(updateDateTime,1000);

updateDateTime();


// ==========================================
// GREETING
// ==========================================

function updateGreeting(){

    const hour = new Date().getHours();

    const greeting =
    document.getElementById("greeting");

    if(hour < 12){

        greeting.innerHTML =
        "Good Morning ☀️";

    }

    else if(hour < 18){

        greeting.innerHTML =
        "Good Afternoon 🌤";

    }

    else{

        greeting.innerHTML =
        "Good Evening 🌙";

    }

}

updateGreeting();


// ==========================================
// HEADER MENU
// ==========================================

function toggleMenu(){

    const menu =
    document.getElementById("headerMenu");

    if(menu.style.display==="block"){

        menu.style.display="none";

    }

    else{

        menu.style.display="block";

    }

}

window.addEventListener("click",function(e){

    if(
        !e.target.closest(".menu-wrapper")
    ){

        document
        .getElementById("headerMenu")
        .style.display="none";

    }

});

// ==========================================
// START DETECTION
// ==========================================

function startDetection(){

    showSuccess(

        "Opening Camera",

        "The camera will now open for license plate detection."

    );

    setTimeout(function(){

        window.location.href="camera.html";

    },1200);

}


// ==========================================
// NOTIFICATION MODAL
// ==========================================

function openNotificationModal(){

    document
    .getElementById("notificationModal")
    .style.display="flex";

}

function closeNotificationModal(){

    document
    .getElementById("notificationModal")
    .style.display="none";

}


// ==========================================
// LOGOUT
// ==========================================

function confirmLogout(){

    showConfirm(

        "Logout",

        "Are you sure you want to logout?",

        function(){

            window.location.href="enforcer-login.html";

        }

    );

}


// ==========================================
// SAMPLE DASHBOARD DATA
// ==========================================

const dashboardData={

    vehicles:24,

    violations:7,

    pending:2,

    notifications:3

};

function loadDashboardData(){

    document.getElementById("vehicleCount").textContent=
    dashboardData.vehicles;

    document.getElementById("violationCount").textContent=
    dashboardData.violations;

    document.getElementById("pendingReports").textContent=
    dashboardData.pending;

    const badge=
    document.getElementById("notificationCount");

    badge.textContent=
    dashboardData.notifications;

    if(dashboardData.notifications===0){

        badge.style.display="none";

    }

    else{

        badge.style.display="flex";

    }

}

loadDashboardData();


// ==========================================
// CLOSE NOTIFICATION
// ==========================================

window.addEventListener("click",function(e){

    const modal=
    document.getElementById("notificationModal");

    if(e.target===modal){

        closeNotificationModal();

    }

});


// ==========================================
// PAGE ANIMATION
// ==========================================

window.addEventListener("load",function(){

    document.body.style.opacity="0";

    setTimeout(function(){

        document.body.style.transition="opacity .35s ease";

        document.body.style.opacity="1";

    },50);

});


// ==========================================
// FUTURE DATABASE
// ==========================================

// TODO:
// Load Officer Name
// Load Badge Number
// Load Today's Statistics
// Load Recent Detections
// Load Notifications
// from Node.js + MongoDB