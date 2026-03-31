let skills = [];

function addSkill() {
    const input = document.getElementById("skillInput");
    const skill = input.value.trim();

    if (!skill) return;

    if (skills.includes(skill)) {
        input.value = "";
        return;
    }

    skills.push(skill);
    input.value = "";

    renderSkills();
}

function renderSkills() {
    const container = document.getElementById("enteredSkills");
    container.innerHTML = "";

    skills.forEach((skill, index) => {
        const skillEl = document.createElement("span");
        skillEl.textContent = skill;
        skillEl.classList.add("skill-tag");

        skillEl.onclick = () => {
            skills.splice(index, 1);
            renderSkills();
        };

        container.appendChild(skillEl);
    });
}

async function submitSkills() {
    if (skills.length === 0) {
        alert("Please add at least one skill");
        return;
    }

    const res = await fetch("/skills-selection", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ skills })
    });

    const data = await res.json();

    if (data.success) {
        window.location.href = "/dashboard";
    } else {
        alert("Error saving skills");
    }
}