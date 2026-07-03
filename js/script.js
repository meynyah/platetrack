const password = document.getElementById("password");
const toggle = document.getElementById("togglePassword");

if(password && toggle){

    toggle.addEventListener("click",function(){

        if(password.type==="password"){

            password.type="text";
            toggle.innerHTML="🙈";

        }else{

            password.type="password";
            toggle.innerHTML="👁";

        }

    });

}

console.log("PlateTrack Loaded!");

function loginOfficer() {
    window.location.href = "enforcer-dashboard.html";
}