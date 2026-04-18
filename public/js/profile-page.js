const profilePicturePreview = document.getElementById("profilePicturePreview");
const profilePictureInput = document.getElementById("profilePictureInput");
const changePhotoBtn = document.getElementById("changePhotoBtn");
const pictureStatus = document.getElementById("pictureStatus");

const displayNameText = document.getElementById("displayNameText");
const organizationText = document.getElementById("organizationText");
const currentRoleText = document.getElementById("currentRoleText");

const displayNameInput = document.getElementById("displayName");
const organizationInput = document.getElementById("organization");
const currentRoleInput = document.getElementById("currentRole");
const bioInput = document.getElementById("bio");
const bioCount = document.getElementById("bioCount");
const bioViewText = document.getElementById("bioViewText");
const bioView = document.getElementById("bioView");

const profileForm = document.getElementById("profileForm");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const editProfileBtn = document.getElementById("editProfileBtn");

const newSkillInput = document.getElementById("newSkillInput");
const addSkillBtn = document.getElementById("addSkillBtn");
const updateSkillsBtn = document.getElementById("updateSkillsBtn");
const skillsList = document.getElementById("skillsList");

const availabilityList = document.getElementById("availabilityList");
const updateAvailabilityBtn = document.getElementById("updateAvailabilityBtn");

const profileStatus = document.getElementById("profileStatus");
const skillsStatus = document.getElementById("skillsStatus");

let isEditing = false;
let currentSkills = [];

function formatTime(value) {
  if (!value || typeof value !== "string") return "";

  const parts = value.split(":");
  if (parts.length < 2) return value;

  const hours = Number(parts[0]);
  const minutes = parts[1];
  if (Number.isNaN(hours)) return value;

  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = ((hours + 11) % 12) + 1;
  return `${hour12}:${minutes} ${suffix}`;
}

function getOrderedDays(days) {
  const order = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return [...days].sort((a, b) => {
    const aIndex = order.indexOf(a);
    const bIndex = order.indexOf(b);

    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
}

function updateBioCount() {
  bioCount.textContent = `${bioInput.value.length}/150`;
}

function setEditableState(editable) {
  isEditing = editable;

  displayNameInput.readOnly = !editable;
  organizationInput.readOnly = !editable;
  currentRoleInput.readOnly = !editable;
  bioInput.readOnly = !editable;

  newSkillInput.disabled = !editable;
  addSkillBtn.disabled = !editable;
  updateSkillsBtn.disabled = !editable;
  saveProfileBtn.disabled = !editable;

  // Toggle visibility of form elements
  const editModeElements = document.querySelectorAll(".edit-mode");
  editModeElements.forEach((el) => {
    if (editable) {
      el.style.display = el.classList.contains("form-row") ? "grid" : "block";
    } else {
      el.style.display = "none";
    }
  });

  // Toggle bio view visibility
  bioView.style.display = editable ? "none" : "flex";

  // Toggle save button visibility
  if (saveProfileBtn) {
    if (editable) {
      saveProfileBtn.classList.add("visible");
    } else {
      saveProfileBtn.classList.remove("visible");
    }
  }

  // Toggle skill input row and button
  const skillInputRow = document.querySelector(".skill-input-row");
  const skillUpdateBtn = document.getElementById("updateSkillsBtn");
  if (skillInputRow) {
    skillInputRow.style.display = editable ? "flex" : "none";
  }
  if (skillUpdateBtn) {
    skillUpdateBtn.style.display = editable ? "block" : "none";
  }

  editProfileBtn.textContent = editable ? "Cancel" : "Edit Profile";
  renderSkills();
}

function renderSkills() {
  skillsList.innerHTML = "";

  if (currentSkills.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No skills added yet.";
    empty.style.color = "#999";
    skillsList.appendChild(empty);
    return;
  }

  currentSkills.forEach((skill, index) => {
    const pill = document.createElement("span");
    pill.className = "skill-pill";
    if (!isEditing) {
      pill.classList.add("view-mode");
    }

    const textNode = document.createElement("span");
    textNode.textContent = skill;
    pill.appendChild(textNode);

    if (isEditing) {
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "skill-remove-btn";
      removeBtn.textContent = "x";
      removeBtn.addEventListener("click", () => {
        currentSkills.splice(index, 1);
        renderSkills();
      });
      pill.appendChild(removeBtn);
    }

    skillsList.appendChild(pill);
  });
}

function renderAvailability(availability) {
  availabilityList.innerHTML = "";

  const days = getOrderedDays(Object.keys(availability || {}));
  if (days.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No availability saved yet.";
    empty.style.color = "#999";
    availabilityList.appendChild(empty);
    return;
  }

  days.forEach((day) => {
    const value = availability[day] || [];
    const row = document.createElement("div");
    row.className = "availability-row";

    const dayLabel = document.createElement("span");
    dayLabel.className = "availability-day";
    dayLabel.textContent = day;

    const timeLabel = document.createElement("span");
    timeLabel.className = "availability-time";
    timeLabel.textContent = `${formatTime(value[0])} - ${formatTime(value[1])}`;

    row.appendChild(dayLabel);
    row.appendChild(timeLabel);
    availabilityList.appendChild(row);
  });
}

function setProfileFields(data) {
  displayNameText.textContent = data.displayName || "No display name";
  currentRoleText.textContent = data.currentRole || "No current role";
  organizationText.textContent = data.organization || "No organization";

  displayNameInput.value = data.displayName || "";
  currentRoleInput.value = data.currentRole || "";
  organizationInput.value = data.organization || "";
  bioInput.value = data.bio || "";
  updateBioCount();

  // Update bio view text
  bioViewText.textContent = data.bio || "No bio added yet.";

  profilePicturePreview.src = data.profilePicture || "";
  pictureStatus.textContent = data.profilePicture ? "" : "No profile picture uploaded yet.";

  currentSkills = Array.isArray(data.skills) ? [...data.skills] : [];
  renderSkills();
  renderAvailability(data.availability || {});
}

async function loadProfile() {
  try {
    const response = await fetch("/profile/data");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to load profile");
    }

    setProfileFields(data);
    document.querySelector(".profile-content").classList.add("loaded");
  } catch (error) {
    profileStatus.textContent = error.message;
    document.querySelector(".profile-content").classList.add("loaded");
  }
}

editProfileBtn.addEventListener("click", async () => {
  if (isEditing) {
    setEditableState(false);
    profileStatus.textContent = "";
    skillsStatus.textContent = "";
    await loadProfile();
    return;
  }

  setEditableState(true);
});

changePhotoBtn.addEventListener("click", () => {
  if (!isEditing) return;
  profilePictureInput.click();
});

profilePictureInput.addEventListener("change", async () => {
  if (!isEditing) return;
  if (!profilePictureInput.files || profilePictureInput.files.length === 0) return;

  const formData = new FormData();
  formData.append("profilePicture", profilePictureInput.files[0]);

  try {
    const response = await fetch("/profile/upload-picture", {
      method: "PATCH",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to upload picture");
    }

    pictureStatus.textContent = "Profile picture updated.";
    await loadProfile();
  } catch (error) {
    pictureStatus.textContent = error.message;
  }
});

profileForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!isEditing) return;

  try {
    const response = await fetch("/profile/save", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: displayNameInput.value,
        organization: organizationInput.value,
        currentRole: currentRoleInput.value,
        bio: bioInput.value,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to save profile");
    }

    profileStatus.textContent = "Profile saved.";
    await loadProfile();
    setEditableState(false);
  } catch (error) {
    profileStatus.textContent = error.message;
  }
});

addSkillBtn.addEventListener("click", () => {
  if (!isEditing) return;

  const skill = newSkillInput.value.trim();
  if (!skill) return;

  currentSkills.push(skill);
  newSkillInput.value = "";
  renderSkills();
});

updateSkillsBtn.addEventListener("click", async () => {
  if (!isEditing) return;

  try {
    const response = await fetch("/profile/update-skills", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skills: currentSkills }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to update skills");
    }

    skillsStatus.textContent = "Skills updated.";
    await loadProfile();
  } catch (error) {
    skillsStatus.textContent = error.message;
  }
});

if (updateAvailabilityBtn) {
  updateAvailabilityBtn.addEventListener("click", () => {
    window.location.href = "/profile/availability";
  });
}

bioInput.addEventListener("input", updateBioCount);

setEditableState(false);
loadProfile();
