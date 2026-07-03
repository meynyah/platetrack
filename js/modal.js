// =========================================
// PlateTrack Global Modal System
// =========================================

const globalModal =
document.getElementById("globalModal");

const modalIcon =
document.getElementById("modalIcon");

const modalTitle =
document.getElementById("modalTitle");

const modalMessage =
document.getElementById("modalMessage");

const modalButtons =
document.getElementById("modalButtons");

// =========================================
// CLOSE MODAL
// =========================================

function closeModal(){

    globalModal.style.display = "none";

}

// =========================================
// SUCCESS MODAL
// =========================================

function showSuccess(title,message,callback=null){

    modalIcon.innerHTML = "✅";

    modalTitle.textContent = title;

    modalMessage.innerHTML =
    message.replace(/\n/g,"<br>");

    modalButtons.innerHTML = `

        <button
        class="modal-btn modal-ok"
        id="modalOkButton">

            OK

        </button>

    `;

    globalModal.style.display = "flex";

    document
    .getElementById("modalOkButton")
    .onclick = function(){

        closeModal();

        if(typeof callback === "function"){

            callback();

        }

    };

}

// =========================================
// ERROR MODAL
// =========================================

function showError(title,message){

    modalIcon.innerHTML = "❌";

    modalTitle.textContent = title;

    modalMessage.innerHTML =
    message.replace(/\n/g,"<br>");

    modalButtons.innerHTML = `

        <button
        class="modal-btn modal-ok"
        onclick="closeModal()">

            OK

        </button>

    `;

    globalModal.style.display = "flex";

}

// =========================================
// WARNING MODAL
// =========================================

function showWarning(title,message){

    modalIcon.innerHTML = "⚠️";

    modalTitle.textContent = title;

    modalMessage.innerHTML =
    message.replace(/\n/g,"<br>");

    modalButtons.innerHTML = `

        <button
        class="modal-btn modal-ok"
        onclick="closeModal()">

            OK

        </button>

    `;

    globalModal.style.display = "flex";

}

// =========================================
// CONFIRM MODAL
// =========================================

function showConfirm(title,message,onConfirm){

    modalIcon.innerHTML = "⚠️";

    modalTitle.textContent = title;

    modalMessage.innerHTML =
    message.replace(/\n/g,"<br>");

    modalButtons.innerHTML = `

        <button
        class="modal-btn modal-cancel"
        onclick="closeModal()">

            Cancel

        </button>

        <button
        class="modal-btn modal-danger"
        id="confirmButton">

            Confirm

        </button>

    `;

    globalModal.style.display = "flex";

    document
    .getElementById("confirmButton")
    .onclick = function(){

        closeModal();

        if(typeof onConfirm === "function"){

            onConfirm();

        }

    };

}

// =========================================
// CLOSE WHEN CLICKING OUTSIDE
// =========================================

window.addEventListener("click",function(e){

    if(e.target===globalModal){

        closeModal();

    }

});

// =========================================
// ESC KEY CLOSE
// =========================================

document.addEventListener("keydown",function(e){

    if(e.key==="Escape" && globalModal.style.display==="flex"){

        closeModal();

    }

});