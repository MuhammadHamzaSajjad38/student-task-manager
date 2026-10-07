const STORAGE_KEY = "student-task-manager.tasks";

function createTask(title, description = "", completed = false) {
    return {
        id: Date.now() + Math.random(),
        title: title.trim(),
        description: description.trim(),
        completed,
    };
}

function updateTask(tasks, index, title, description) {
    return tasks.map((task, taskIndex) => {
        if (taskIndex !== index) return task;

        return {
            ...task,
            title: title.trim(),
            description: description.trim(),
        };
    });
}

function toggleTask(tasks, index) {
    return tasks.map((task, taskIndex) => (
        taskIndex === index ? { ...task, completed: !task.completed } : task
    ));
}

function deleteTask(tasks, index) {
    return tasks.filter((_, taskIndex) => taskIndex !== index);
}

function filterTasks(tasks, query) {
    const searchTerm = query.trim().toLowerCase();

    if (!searchTerm) return tasks;

    return tasks.filter((task) =>
        task.title.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm)
    );
}

function readTasks() {
    try {
        const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(savedTasks) ? savedTasks : [];
    } catch (error) {
        return [];
    }
}

function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function renderTasks(tasks, query = "") {
    const list = document.getElementById("taskList");
    const emptyState = document.getElementById("emptyState");
    const filteredTasks = filterTasks(tasks, query);

    if (!list) return;

    list.innerHTML = filteredTasks
        .map((task) => `
            <article class="task-card ${task.completed ? "is-completed" : ""}" data-id="${task.id}">
                <button class="task-toggle" type="button" data-action="toggle" aria-label="${task.completed ? "Mark as incomplete" : "Mark as complete"}">
                    <span aria-hidden="true">${task.completed ? "✓" : ""}</span>
                </button>

                <div class="task-content">
                    <div class="task-meta">
                        <span class="task-badge">${task.completed ? "Completed" : "To do"}</span>
                    </div>
                    <h4>${task.title}</h4>
                    ${task.description ? `<p>${task.description}</p>` : ""}
                </div>

                <button class="task-delete" type="button" data-action="delete" aria-label="Delete ${task.title}">Delete</button>
            </article>
        `)
        .join("");

    emptyState.hidden = filteredTasks.length > 0;
    updateSummary(tasks);
}

function updateSummary(tasks) {
    const taskCount = document.getElementById("taskCount");
    const completedCount = document.getElementById("completedCount");

    if (taskCount) {
        const total = tasks.length;
        taskCount.textContent = `${total} task${total === 1 ? "" : "s"}`;
    }

    if (completedCount) {
        const completed = tasks.filter((task) => task.completed).length;
        completedCount.textContent = completed;
    }
}

function attachEventListeners() {
    const form = document.getElementById("taskForm");
    const titleInput = document.getElementById("taskTitle");
    const descriptionInput = document.getElementById("taskDescription");
    const searchInput = document.getElementById("taskSearch");
    const list = document.getElementById("taskList");

    form?.addEventListener("submit", (event) => {
        event.preventDefault();
        const title = titleInput.value;

        if (!title.trim()) {
            titleInput.focus();
            return;
        }

        const tasks = readTasks();
        tasks.push(createTask(title, descriptionInput.value));
        saveTasks(tasks);
        form.reset();
        titleInput.focus();
        renderTasks(tasks);
    });

    searchInput?.addEventListener("input", (event) => {
        renderTasks(readTasks(), event.target.value);
    });

    list?.addEventListener("click", (event) => {
        const action = event.target.closest("[data-action]");
        if (!action) return;

        const article = action.closest(".task-card");
        const taskId = article.dataset.id;
        const tasks = readTasks();
        const taskIndex = tasks.findIndex((task) => task.id === Number(taskId));

        if (taskIndex === -1) return;

        if (action.dataset.action === "toggle") {
            saveTasks(toggleTask(tasks, taskIndex));
        }

        if (action.dataset.action === "delete") {
            saveTasks(deleteTask(tasks, taskIndex));
        }

        renderTasks(readTasks(), document.getElementById("taskSearch")?.value || "");
    });
}

if (typeof document !== "undefined") {
    attachEventListeners();
    renderTasks(readTasks());
}

if (typeof module !== "undefined") {
    module.exports = {
        createTask,
        updateTask,
        toggleTask,
        deleteTask,
        filterTasks,
    };
}
