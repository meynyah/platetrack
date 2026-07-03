// ===============================
// LOAD PAGE
// ===============================

window.onload = function () {

    // Load detected plate

    const plate = localStorage.getItem("detectedPlate");

    if (plate) {

        document.getElementById("plateNumber").value = plate;

    }

    // Fine Mapping

    const fineList = {

        "Driving Without a Valid License": 3000,
        "Reckless Driving": 2000,
        "Overspeeding": 1000,
        "Illegal Parking": 1000,
        "No Seatbelt": 1000,
        "Obstruction": 1000,
        "Beating the Red Light": 1000

    };

    // Automatic Fine

    document.getElementById("violation").addEventListener("change", function () {

        const amount = fineList[this.value] || 0;

        document.getElementById("fine").value =
            "₱" + amount.toLocaleString();

        clearError("violation", "violationError");

    });

    // Real-time validation

    document.getElementById("plateNumber").addEventListener("input", function () {

        if (this.value.trim() !== "") {

            clearError("plateNumber", "plateError");

        }

    });

    document.getElementById("location").addEventListener("input", function () {

        if (this.value.trim() !== "") {

            clearError("location", "locationError");

        }

    });

    document.getElementById("officer").addEventListener("input", function () {

        if (this.value.trim() !== "") {

            clearError("officer", "officerError");

        }

    });

    // Remarks Counter

    const remarks = document.getElementById("remarks");

    const counter = document.getElementById("remarksCounter");

    remarks.addEventListener("input", function () {

        const length = this.value.length;

        counter.textContent = `${length} / 250 characters`;

        if (length >= 250) {

            counter.style.color = "#ff4d4f";

        }

        else if (length >= 200) {

            counter.style.color = "#f59e0b";

        }

        else {

            counter.style.color = "#9db0d4";

        }

    });

};

// ===============================
// CLEAR ERROR
// ===============================

function clearError(inputId, errorId) {

    document.getElementById(inputId)
        .classList.remove("input-error");

    document.getElementById(errorId)
        .textContent = "";

}

// ===============================
// SUBMIT VIOLATION
// ===============================

function submitViolation() {

    const plate =
        document.getElementById("plateNumber").value.trim();

    const violation =
        document.getElementById("violation").value;

    const fine =
        document.getElementById("fine").value;

    const location =
        document.getElementById("location").value.trim();

    const officer =
        document.getElementById("officer").value.trim();

    const remarks =
        document.getElementById("remarks").value.trim();

    // Clear previous errors

    document.getElementById("plateError").textContent = "";
    document.getElementById("violationError").textContent = "";
    document.getElementById("locationError").textContent = "";
    document.getElementById("officerError").textContent = "";

    document.getElementById("plateNumber")
        .classList.remove("input-error");

    document.getElementById("violation")
        .classList.remove("input-error");

    document.getElementById("location")
        .classList.remove("input-error");

    document.getElementById("officer")
        .classList.remove("input-error");

    let valid = true;

    // Validation

    if (plate === "") {

        document.getElementById("plateError").textContent =
            "Plate Number is required.";

        document.getElementById("plateNumber")
            .classList.add("input-error");

        valid = false;

    }

    if (violation === "") {

        document.getElementById("violationError").textContent =
            "Please select a violation.";

        document.getElementById("violation")
            .classList.add("input-error");

        valid = false;

    }

    if (location === "") {

        document.getElementById("locationError").textContent =
            "Location is required.";

        document.getElementById("location")
            .classList.add("input-error");

        valid = false;

    }

    if (officer === "") {

        document.getElementById("officerError").textContent =
            "Officer Name is required.";

        document.getElementById("officer")
            .classList.add("input-error");

        valid = false;

    }

    if (!valid) {

        return;

    }

    // Create Record

    const record = {

        plate: plate,
        violation: violation,
        fine: fine,
        location: location,
        officer: officer,
        remarks: remarks,
        date: new Date().toLocaleString(),
        status: "Pending"

    };

    // Save History

    let history =
        JSON.parse(localStorage.getItem("history")) || [];

    history.push(record);

    localStorage.setItem(
        "history",
        JSON.stringify(history)
    );

    localStorage.removeItem("detectedPlate");

    // Success Modal

    document.getElementById("summaryPlate").textContent =
        plate;

    document.getElementById("summaryViolation").textContent =
        violation;

    document.getElementById("summaryFine").textContent =
        fine;

    document.getElementById("successModal").style.display =
        "flex";

}

// ===============================
// MODAL BUTTONS
// ===============================

function goHistory() {

    window.location.href = "history.html";

}

function goDashboard() {

    window.location.href = "enforcer-dashboard.html";

}

function closeSuccessModal() {

    document.getElementById("successModal").style.display =
        "none";

}