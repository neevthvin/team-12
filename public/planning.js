(function () {
  const page = document.querySelector(".planningPage")
  if (!page) return

  const groupID = page.dataset.groupId
  const isLeader = page.dataset.isLeader === "true"
  const base = "/groups/" + groupID + "/planning/tasks"

  const messageBox = document.getElementById("planningMessage")
  const modal = document.getElementById("cardModal")
  const form = document.getElementById("cardForm")
  const modalTitle = document.getElementById("cardModalTitle")
  const titleInput = document.getElementById("cardTitle")
  const descInput = document.getElementById("cardDescription")
  const dueInput = document.getElementById("cardDue")

  let editingID = null

  function showMessage(text) {
    messageBox.textContent = text
    messageBox.hidden = false
    setTimeout(function () { messageBox.hidden = true }, 4000)
  }

  async function send(url, data) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data || {})
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        showMessage(json.message || "Something went wrong")
        return false
      }
      return true
    } catch (err) {
      showMessage("Could not reach the server")
      return false
    }
  }

  /* ---------- add / edit modal ---------- */

  function openModal(card) {
    form.reset()
    if (card) {
      editingID = card.dataset.taskId
      modalTitle.textContent = "Edit Card"
      titleInput.value = card.dataset.title
      descInput.value = card.dataset.description
      dueInput.value = card.dataset.due
    } else {
      editingID = null
      modalTitle.textContent = "Add Card"
    }
    modal.hidden = false
    titleInput.focus()
  }

  function closeModal() {
    modal.hidden = true
    editingID = null
  }

  document.getElementById("cardCancel").addEventListener("click", closeModal)

  form.addEventListener("submit", async function (event) {
    event.preventDefault()
    const data = {
      title: titleInput.value,
      description: descInput.value,
      dueDate: dueInput.value
    }
    const url = editingID ? base + "/" + editingID + "/edit" : base
    if (await send(url, data)) location.reload()
  })

  const addBtn = document.getElementById("addCardBtn")
  if (addBtn) addBtn.addEventListener("click", function () { openModal(null) })

  /* ---------- card buttons (edit, move, delete) ---------- */

  document.addEventListener("click", async function (event) {
    const card = event.target.closest(".planningCard")
    if (!card) return
    const id = card.dataset.taskId

    if (event.target.closest(".planningEditBtn")) {
      openModal(card)
    } else if (event.target.closest(".planningMoveBtn")) {
      const target = event.target.closest(".planningMoveBtn").dataset.target
      if (await send(base + "/" + id + "/move", { status: target })) location.reload()
    } else if (event.target.closest(".planningDeleteBtn")) {
      if (!isLeader) return
      if (!confirm("Delete this card?")) return
      if (await send(base + "/" + id + "/delete")) location.reload()
    }
  })

  /* ---------- drag and drop ---------- */

  let dragged = null

  document.querySelectorAll(".planningCard").forEach(function (card) {
    card.addEventListener("dragstart", function (event) {
      dragged = card
      card.classList.add("dragging")
      event.dataTransfer.effectAllowed = "move"
      event.dataTransfer.setData("text/plain", card.dataset.taskId)
    })
    card.addEventListener("dragend", function () {
      card.classList.remove("dragging")
      document.querySelectorAll(".dragOver").forEach(function (el) { el.classList.remove("dragOver") })
    })
  })

  // finds the card the dragged card should go in front of
  function cardAfter(list, y) {
    const cards = Array.from(list.querySelectorAll(".planningCard:not(.dragging)"))
    let result = null
    let closest = Number.NEGATIVE_INFINITY
    cards.forEach(function (c) {
      const box = c.getBoundingClientRect()
      const offset = y - (box.top + box.height / 2)
      if (offset < 0 && offset > closest) {
        closest = offset
        result = c
      }
    })
    return result
  }

  document.querySelectorAll(".planningCardList").forEach(function (list) {
    list.addEventListener("dragover", function (event) {
      if (!dragged) return
      event.preventDefault()
      list.classList.add("dragOver")
      const after = cardAfter(list, event.clientY)
      if (after) list.insertBefore(dragged, after)
      else list.appendChild(dragged)
    })
    list.addEventListener("dragleave", function (event) {
      if (!list.contains(event.relatedTarget)) list.classList.remove("dragOver")
    })
    list.addEventListener("drop", async function (event) {
      event.preventDefault()
      if (!dragged) return
      const cards = Array.from(list.querySelectorAll(".planningCard"))
      const position = cards.indexOf(dragged)
      const ok = await send(base + "/" + dragged.dataset.taskId + "/move", {
        status: list.dataset.status,
        position: position
      })
      dragged = null
      location.reload()
      if (!ok) showMessage("Could not save the move")
    })
  })

  /* ---------- weekly calendar ---------- */

  const weekLabel = document.getElementById("weekLabel")
  const weekDays = document.getElementById("weekDays")
  const dayTasks = document.getElementById("dayTasks")
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // read every card on the page so the calendar needs no extra requests
  const allCards = Array.from(document.querySelectorAll(".planningCard")).map(function (card) {
    return { title: card.dataset.title, due: card.dataset.due }
  })

  function dateKey(d) {
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return d.getFullYear() + "-" + m + "-" + day
  }

  function startOfWeek(d) {
    const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    copy.setDate(copy.getDate() - copy.getDay())
    return copy
  }

  let weekStart = startOfWeek(new Date())
  let selected = dateKey(new Date())

  function renderCalendar() {
    const end = new Date(weekStart)
    end.setDate(end.getDate() + 6)
    weekLabel.textContent = weekStart.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
      " - " + end.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })

    weekDays.innerHTML = ""
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart)
      d.setDate(d.getDate() + i)
      const key = dateKey(d)
      const count = allCards.filter(function (c) { return c.due === key }).length

      const btn = document.createElement("button")
      btn.type = "button"
      btn.className = "planningDayBtn" + (key === selected ? " selected" : "")
      btn.textContent = dayNames[i] + " " + d.getDate() + (count ? " (" + count + ")" : "")
      btn.addEventListener("click", function () {
        selected = key
        renderCalendar()
      })
      weekDays.appendChild(btn)
    }

    dayTasks.innerHTML = ""
    const due = allCards.filter(function (c) { return c.due === selected })
    if (!due.length) {
      const empty = document.createElement("p")
      empty.textContent = "No tasks due on " + selected
      dayTasks.appendChild(empty)
    }
    due.forEach(function (c) {
      const item = document.createElement("div")
      item.className = "planningDayTask"
      item.textContent = c.title
      dayTasks.appendChild(item)
    })
  }

  document.getElementById("weekPrev").addEventListener("click", function () {
    weekStart.setDate(weekStart.getDate() - 7)
    renderCalendar()
  })
  document.getElementById("weekNext").addEventListener("click", function () {
    weekStart.setDate(weekStart.getDate() + 7)
    renderCalendar()
  })

  renderCalendar()
})()