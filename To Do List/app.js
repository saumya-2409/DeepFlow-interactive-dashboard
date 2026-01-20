// Select DOM elements
const input = document.querySelector("#input");
const addBtn = document.querySelector("#add");
const removeBtn = document.querySelector("#remove");
const list = document.querySelector("#list");

// Load tasks from LocalStorage on startup
document.addEventListener("DOMContentLoaded", loadTasks);

// 1. ADD TASK FUNCTION
addBtn.addEventListener("click", () => {
    const text = input.value.trim();
    if (text !== "") {
        addTaskToDOM(text, false);
        saveTaskToStorage(text, false);
        input.value = ""; // Clear input
    }
});

// Allow pressing "Enter" to add task
input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        addBtn.click();
    }
});

// 2. REMOVE COMPLETED TASKS
removeBtn.addEventListener("click", () => {
    // Get all items currently in the list
    const items = document.querySelectorAll(".task-item");
    
    items.forEach(item => {
        // If the checkbox inside is checked, remove the whole item
        if (item.querySelector("input").checked) {
            item.remove();
        }
    });
    
    updateLocalStorage(); // Sync changes
});

// --- HELPER FUNCTIONS ---

function addTaskToDOM(text, isCompleted) {
    const li = document.createElement("li");
    li.classList.add("task-item");
    if (isCompleted) li.classList.add("completed");

    // Create Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = isCompleted;
    
    // Toggle strikethrough on click
    checkbox.addEventListener("change", () => {
        li.classList.toggle("completed");
        updateLocalStorage();
    });

    // Create Label
    const span = document.createElement("span");
    span.innerText = text;
    
    // Allow clicking text to check box
    span.addEventListener("click", () => {
        checkbox.checked = !checkbox.checked;
        li.classList.toggle("completed");
        updateLocalStorage();
    });

    // Append to list item, then to list
    li.appendChild(checkbox);
    li.appendChild(span);
    list.appendChild(li);
}

// LOCAL STORAGE LOGIC
function saveTaskToStorage(text, isCompleted) {
    let tasks = getTasksFromStorage();
    tasks.push({ text, isCompleted });
    localStorage.setItem("myTodoList", JSON.stringify(tasks));
}

function getTasksFromStorage() {
    let tasks;
    if (localStorage.getItem("myTodoList") === null) {
        tasks = [];
    } else {
        tasks = JSON.parse(localStorage.getItem("myTodoList"));
    }
    return tasks;
}

function loadTasks() {
    let tasks = getTasksFromStorage();
    tasks.forEach(task => addTaskToDOM(task.text, task.isCompleted));
}

function updateLocalStorage() {
    let tasks = [];
    const items = document.querySelectorAll(".task-item");
    
    items.forEach(item => {
        tasks.push({
            text: item.querySelector("span").innerText,
            isCompleted: item.querySelector("input").checked
        });
    });
    
    localStorage.setItem("myTodoList", JSON.stringify(tasks));
}