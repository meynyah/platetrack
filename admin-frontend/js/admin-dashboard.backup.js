Auth.requireAuth();

/* ----------------------------- Navigation ----------------------------- */

const views = document.querySelectorAll(".view");
const navItems = document.querySelectorAll(".nav-item[data-view]");

function switchView(viewName) {
  views.forEach((v) => v.classList.toggle("active", v.id === `view-${viewName}`));
  navItems.forEach((n) => n.classList.toggle("active", n.dataset.view === viewName));
  loadViewData(viewName);
}

navItems.forEach((item) => {
  item.addEventListener("click", () => switchView(item.dataset.view));
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  Auth.clearSession();
  window.location.href = "admin-login.html";
});

/* ------------------------------ Admin chip ----------------------------- */

const admin = Auth.getUser();
if (admin) {
  document.getElementById("adminName").textContent = admin.fullName || admin.email;
  document.getElementById("adminInitial").textContent = (admin.fullName || admin.email || "A").charAt(0).toUpperCase();
}

/* ------------------------------ Data loading ---------------------------- */

function loadViewData(viewName) {
  switch (viewName) {
    case "overview": return loadOverview();
    case "enforcer-approvals": return loadEnforcerApprovals();
    case "owner-approvals": return loadOwnerApprovals();
    case "enforcer-monitor": return loadEnforcerMonitor();
    case "owner-monitor": return loadOwnerMonitor();
    case "violations": return loadViolations();
    case "appeals": return loadAppeals();
    case "announcements": return loadAnnouncements();
  }
}

function statusChip(status) {
  return `<span class="status-chip status-${status}">${status.replace("_", " ")}</span>`;
}

/* --------------------------------- OVERVIEW ------------------------------ */

async function loadOverview() {
  try {
    const [stats, leaderboard] = await Promise.all([
      apiRequest("/admin/stats"),
      apiRequest("/admin/enforcers/leaderboard"),
    ]);

    document.getElementById("statGrid").innerHTML = `
      <div class="stat-card"><div class="num">${stats.totalEnforcers}</div><div class="label">Approved Enforcers</div></div>
      <div class="stat-card warn"><div class="num">${stats.pendingEnforcers}</div><div class="label">Enforcer Approvals Pending</div></div>
      <div class="stat-card"><div class="num">${stats.totalOwners}</div><div class="label">Approved Vehicle Owners</div></div>
      <div class="stat-card warn"><div class="num">${stats.pendingOwners}</div><div class="label">Owner Approvals Pending</div></div>
      <div class="stat-card danger"><div class="num">${stats.flaggedOwners}</div><div class="label">Flagged Owner Accounts</div></div>
      <div class="stat-card good"><div class="num">${stats.totalViolations}</div><div class="label">Total Violation Reports</div></div>
      <div class="stat-card"><div class="num">${stats.violationsToday}</div><div class="label">Reports Filed Today</div></div>
      <div class="stat-card warn"><div class="num">${stats.pendingAppeals}</div><div class="label">Appeals Awaiting Action</div></div>
    `;

    updateSidebarCounts(stats);

    const body = document.getElementById("leaderboardBody");
    if (!leaderboard.length) {
      body.innerHTML = `<tr><td colspan="5" class="empty-state">No violation reports have been filed yet.</td></tr>`;
    } else {
      body.innerHTML = leaderboard.map((row) => `
        <tr>
          <td>${escapeHtml(row.fullName)}</td>
          <td class="mono">${escapeHtml(row.badgeNumber)}</td>
          <td>${escapeHtml(row.station || "—")}</td>
          <td>${statusChip(row.status)}</td>
          <td class="mono">${row.totalReports}</td>
        </tr>
      `).join("");
    }
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function updateSidebarCounts(stats) {
  setCount("countEnforcerPending", stats.pendingEnforcers);
  setCount("countOwnerPending", stats.pendingOwners);
  setCount("countAppealsPending", stats.pendingAppeals);
}
function setCount(id, n) {
  const el = document.getElementById(id);
  if (n > 0) { el.style.display = "inline-block"; el.textContent = n; }
  else { el.style.display = "none"; }
}

document.getElementById("refreshOverview").addEventListener("click", loadOverview);

/* ---------------------------- ENFORCER APPROVALS -------------------------- */

async function loadEnforcerApprovals() {
  const body = document.getElementById("enforcerApprovalsBody");
  try {
    const list = await apiRequest("/admin/enforcers?status=pending");
    if (!list.length) {
      body.innerHTML = `<tr><td colspan="6" class="empty-state">No pending enforcer registrations.</td></tr>`;
      return;
    }
    body.innerHTML = list.map((e) => `
      <tr>
        <td>${escapeHtml(e.fullName)}</td>
        <td class="mono">${escapeHtml(e.email)}</td>
        <td class="mono">${escapeHtml(e.badgeNumber)}</td>
        <td>${escapeHtml(e.station || "—")}</td>
        <td class="text-muted">${formatDate(e.createdAt)}</td>
        <td>
          <div class="row-actions">
            <button class="btn btn-outline btn-sm" onclick="rejectEnforcer('${e._id}')">Reject</button>
            <button class="btn btn-amber btn-sm" onclick="approveEnforcer('${e._id}')">Approve</button>
          </div>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function approveEnforcer(id) {
  try {
    await apiRequest(`/admin/enforcers/${id}/approve`, { method: "PATCH" });
    showToast("Enforcer approved.");
    loadEnforcerApprovals();
  } catch (err) {
    showToast(err.message, "error");
  }
}

function rejectEnforcer(id) {
  openReasonModal({
    title: "Reject enforcer registration",
    sub: "The applicant will be notified by email.",
    onConfirm: async (reason) => {
      try {
        await apiRequest(`/admin/enforcers/${id}/reject`, { method: "PATCH", body: { reason } });
        showToast("Enforcer registration rejected.");
        loadEnforcerApprovals();
      } catch (err) {
        showToast(err.message, "error");
      }
    },
  });
}

/* ------------------------------ OWNER APPROVALS --------------------------- */

async function loadOwnerApprovals() {
  const body = document.getElementById("ownerApprovalsBody");
  try {
    const list = await apiRequest("/admin/owners?status=pending");
    if (!list.length) {
      body.innerHTML = `<tr><td colspan="5" class="empty-state">No pending owner registrations.</td></tr>`;
      return;
    }
    body.innerHTML = list.map((o) => `
      <tr>
        <td>${escapeHtml(o.fullName)}</td>
        <td class="mono">${escapeHtml(o.email)}</td>
        <td><span class="plate-chip">${escapeHtml(o.plateNumber)}</span></td>
        <td class="text-muted">${formatDate(o.createdAt)}</td>
        <td>
          <div class="row-actions">
            <button class="btn btn-outline btn-sm" onclick="rejectOwner('${o._id}')">Reject</button>
            <button class="btn btn-amber btn-sm" onclick="approveOwner('${o._id}')">Approve</button>
          </div>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function approveOwner(id) {
  try {
    await apiRequest(`/admin/owners/${id}/approve`, { method: "PATCH" });
    showToast("Vehicle owner approved.");
    loadOwnerApprovals();
  } catch (err) {
    showToast(err.message, "error");
  }
}

function rejectOwner(id) {
  openReasonModal({
    title: "Reject owner registration",
    sub: "The applicant will not be notified automatically by email.",
    onConfirm: async (reason) => {
      try {
        await apiRequest(`/admin/owners/${id}/reject`, { method: "PATCH", body: { reason } });
        showToast("Owner registration rejected.");
        loadOwnerApprovals();
      } catch (err) {
        showToast(err.message, "error");
      }
    },
  });
}

/* ------------------------------ ENFORCER MONITOR --------------------------- */

async function loadEnforcerMonitor() {
  const body = document.getElementById("enforcerMonitorBody");
  try {
    const list = await apiRequest("/admin/enforcers");
    if (!list.length) {
      body.innerHTML = `<tr><td colspan="5" class="empty-state">No enforcer accounts yet.</td></tr>`;
      return;
    }
    body.innerHTML = list.map((e) => `
      <tr>
        <td>${escapeHtml(e.fullName)}</td>
        <td class="mono">${escapeHtml(e.email)}</td>
        <td class="mono">${escapeHtml(e.badgeNumber)}</td>
        <td>${escapeHtml(e.station || "—")}</td>
        <td>${statusChip(e.status)}</td>
      </tr>
    `).join("");
  } catch (err) {
    showToast(err.message, "error");
  }
}

/* ------------------------------- OWNER MONITOR ----------------------------- */

async function loadOwnerMonitor() {
  const body = document.getElementById("ownerMonitorBody");
  try {
    const list = await apiRequest("/admin/owners");
    if (!list.length) {
      body.innerHTML = `<tr><td colspan="5" class="empty-state">No vehicle owner accounts yet.</td></tr>`;
      return;
    }
    body.innerHTML = list.map((o) => `
      <tr>
        <td>${escapeHtml(o.fullName)}</td>
        <td class="mono">${escapeHtml(o.email)}</td>
        <td><span class="plate-chip">${escapeHtml(o.plateNumber)}</span></td>
        <td>${statusChip(o.status)}</td>
        <td>
          <div class="row-actions">
            ${o.status === "flagged"
              ? `<button class="btn btn-outline btn-sm" onclick="unflagOwner('${o._id}')">Unflag</button>`
              : `<button class="btn btn-outline btn-sm" onclick="flagOwner('${o._id}')">Flag as suspicious</button>`
            }
          </div>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    showToast(err.message, "error");
  }
}

function flagOwner(id) {
  openReasonModal({
    title: "Flag account for monitoring",
    sub: "This marks the account as suspicious for closer review. It does not block sign-in.",
    onConfirm: async (reason) => {
      try {
        await apiRequest(`/admin/owners/${id}/flag`, { method: "PATCH", body: { reason } });
        showToast("Owner account flagged.");
        loadOwnerMonitor();
      } catch (err) {
        showToast(err.message, "error");
      }
    },
  });
}

async function unflagOwner(id) {
  try {
    await apiRequest(`/admin/owners/${id}/unflag`, { method: "PATCH" });
    showToast("Owner account unflagged.");
    loadOwnerMonitor();
  } catch (err) {
    showToast(err.message, "error");
  }
}

/* --------------------------------- VIOLATIONS ------------------------------- */

async function loadViolations() {
  const body = document.getElementById("violationsBody");
  try {
    const list = await apiRequest("/admin/violations");
    if (!list.length) {
      body.innerHTML = `<tr><td colspan="6" class="empty-state">No violation reports submitted yet.</td></tr>`;
      return;
    }
    body.innerHTML = list.map((v) => `
      <tr>
        <td><span class="plate-chip">${escapeHtml(v.plateNumber)}</span></td>
        <td>${escapeHtml(v.violationType)}</td>
        <td>${v.enforcer ? escapeHtml(v.enforcer.fullName) : "—"}</td>
        <td>${escapeHtml(v.location || "—")}</td>
        <td class="text-muted">${formatDate(v.dateTime)}</td>
        <td>${statusChip(v.status)}</td>
      </tr>
    `).join("");
  } catch (err) {
    showToast(err.message, "error");
  }
}

/* ---------------------------------- APPEALS --------------------------------- */

let appealsCache = [];

async function loadAppeals() {
  const body = document.getElementById("appealsBody");
  try {
    appealsCache = await apiRequest("/admin/appeals");
    if (!appealsCache.length) {
      body.innerHTML = `<tr><td colspan="6" class="empty-state">No appeals submitted yet.</td></tr>`;
      return;
    }
    body.innerHTML = appealsCache.map((a) => `
      <tr>
        <td>${a.owner ? escapeHtml(a.owner.fullName) : "—"}</td>
        <td><span class="plate-chip">${a.violation ? escapeHtml(a.violation.plateNumber) : "—"}</span></td>
        <td>${a.violation ? escapeHtml(a.violation.violationType) : "—"}</td>
        <td style="max-width:220px;">${escapeHtml(a.reason)}</td>
        <td>${statusChip(a.status)}</td>
        <td>
          <div class="row-actions">
            ${a.status === "submitted" || a.status === "under_review"
              ? `<button class="btn btn-outline btn-sm" onclick="openAppealUnderReview('${a._id}')">Under review</button>
                 <button class="btn btn-danger btn-sm" onclick="openAppealResolve('${a._id}','denied')">Deny</button>
                 <button class="btn btn-amber btn-sm" onclick="openAppealResolve('${a._id}','approved')">Approve</button>`
              : `<span class="text-muted">Closed</span>`
            }
          </div>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    showToast(err.message, "error");
  }
}

const DEFAULT_UNDER_REVIEW_MESSAGE =
  "Your appeal is under review, please go to the LTO Antipolo Station to clarify the issue and bring your Driver's License and OR/CR for checking.";

function openAppealUnderReview(appealId) {
  const modal = document.getElementById("appealModal");
  const input = document.getElementById("appealModalInput");
  input.value = DEFAULT_UNDER_REVIEW_MESSAGE;
  modal.classList.add("show");

  document.getElementById("appealModalCancel").onclick = () => modal.classList.remove("show");
  document.getElementById("appealModalConfirm").onclick = async () => {
    try {
      await apiRequest(`/admin/appeals/${appealId}/under-review`, {
        method: "PATCH",
        body: { feedback: input.value.trim() },
      });
      modal.classList.remove("show");
      showToast("Owner notified — appeal marked under review.");
      loadAppeals();
    } catch (err) {
      showToast(err.message, "error");
    }
  };
}

function openAppealResolve(appealId, decision) {
  const modal = document.getElementById("resolveModal");
  const input = document.getElementById("resolveModalInput");
  document.getElementById("resolveModalTitle").textContent =
    decision === "approved" ? "Approve appeal" : "Deny appeal";
  input.value =
    decision === "approved"
      ? "Your appeal has been approved. The violation has been voided."
      : "Your appeal has been reviewed and denied. The violation stands.";
  modal.classList.add("show");

  document.getElementById("resolveModalCancel").onclick = () => modal.classList.remove("show");
  document.getElementById("resolveModalConfirm").onclick = async () => {
    try {
      await apiRequest(`/admin/appeals/${appealId}/resolve`, {
        method: "PATCH",
        body: { decision, feedback: input.value.trim() },
      });
      modal.classList.remove("show");
      showToast("Owner notified of the decision.");
      loadAppeals();
    } catch (err) {
      showToast(err.message, "error");
    }
  };
}

/* ------------------------------- ANNOUNCEMENTS ------------------------------- */

async function loadAnnouncements() {
  const body = document.getElementById("announcementsBody");
  try {
    const list = await apiRequest("/admin/announcements");
    if (!list.length) {
      body.innerHTML = `<tr><td colspan="3" class="empty-state">No announcements sent yet.</td></tr>`;
      return;
    }
    body.innerHTML = list.map((a) => `
      <tr>
        <td>${escapeHtml(a.title)}</td>
        <td style="max-width:340px;">${escapeHtml(a.message)}</td>
        <td class="text-muted">${formatDate(a.createdAt)}</td>
      </tr>
    `).join("");
  } catch (err) {
    showToast(err.message, "error");
  }
}

document.getElementById("announcementForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = document.getElementById("annSubmitBtn");
  const title = document.getElementById("annTitle").value.trim();
  const message = document.getElementById("annMessage").value.trim();

  btn.disabled = true;
  btn.textContent = "Sending...";
  try {
    const result = await apiRequest("/admin/announcements", { method: "POST", body: { title, message } });
    showToast(result.message);
    document.getElementById("announcementForm").reset();
    loadAnnouncements();
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Send to all enforcers";
  }
});

/* ------------------------------- REASON MODAL (shared) ------------------------------- */

function openReasonModal({ title, sub, onConfirm }) {
  const modal = document.getElementById("reasonModal");
  document.getElementById("reasonModalTitle").textContent = title;
  document.getElementById("reasonModalSub").textContent = sub;
  const input = document.getElementById("reasonModalInput");
  input.value = "";
  modal.classList.add("show");

  document.getElementById("reasonModalCancel").onclick = () => modal.classList.remove("show");
  document.getElementById("reasonModalConfirm").onclick = () => {
    modal.classList.remove("show");
    onConfirm(input.value.trim());
  };
}

/* ------------------------------------ Init ------------------------------------ */

loadOverview();

/* ==========================================================
   SHOW BACK BUTTON ONLY OUTSIDE DASHBOARD
========================================================== */

const dashboardBackButton =
    document.getElementById("dashboardBackButton");

function updateDashboardBackButton(view){

    if(!dashboardBackButton){
        return;
    }

    if(view === "overview"){

        dashboardBackButton.style.display = "none";

    }else{

        dashboardBackButton.style.display = "flex";

    }

}

/* Back → Dashboard */

if(dashboardBackButton){

    dashboardBackButton.addEventListener("click",function(){

        switchView("overview");

        updateDashboardBackButton("overview");

        window.scrollTo({
            top:0,
            behavior:"smooth"
        });

    });

}