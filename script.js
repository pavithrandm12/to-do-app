// DOM Elements
const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const filterBtns = document.querySelectorAll('.filter-btn');

// Stats Elements
const totalCountSpan = document.getElementById('total-count');
const completedCountSpan = document.getElementById('completed-count');
const pendingCountSpan = document.getElementById('pending-count');

// Modal Elements
const editModal = document.getElementById('edit-modal');
const editInput = document.getElementById('edit-input');
const closeModal = document.querySelector('.close-modal');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const saveEditBtn = document.getElementById('save-edit-btn');

// Date Display
const currentDateElement = document.getElementById('current-date');

// App State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let currentEditId = null;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    updateDate();
    renderTasks();
});

// Update Date
function updateDate() {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const today = new Date();
    currentDateElement.textContent = today.toLocaleDateString('en-US', options);
}

// Add Task Event Listener
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

// Filter Event Listeners
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all
        filterBtns.forEach(b => b.classList.remove('active'));
        // Add active to clicked
        btn.classList.add('active');
        // Set filter
        currentFilter = btn.getAttribute('data-filter');
        renderTasks();
    });
});

// Main Functions
function addTask() {
    const text = taskInput.value.trim();
    if (text === '') return;

    const newTask = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toLocaleString()
    };

    tasks.unshift(newTask); // Add to top
    saveAndRender();
    taskInput.value = '';
}

function deleteTask(id) {
    if(confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(task => task.id !== id);
        saveAndRender();
    }
}

function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveAndRender();
}

// Edit Modal Functions
function openEditModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    currentEditId = id;
    editInput.value = task.text;
    editModal.classList.add('show');
    editInput.focus();
}

function closeEditModal() {
    editModal.classList.remove('show');
    currentEditId = null;
}

function saveEdit() {
    if (!currentEditId) return;
    const newText = editInput.value.trim();
    
    if (newText) {
        tasks = tasks.map(task => {
            if (task.id === currentEditId) {
                return { ...task, text: newText };
            }
            return task;
        });
        saveAndRender();
    }
    closeEditModal();
}

// Modal Event Listeners
closeModal.addEventListener('click', closeEditModal);
cancelEditBtn.addEventListener('click', closeEditModal);
saveEditBtn.addEventListener('click', saveEdit);
editInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveEdit();
});
window.addEventListener('click', (e) => {
    if (e.target === editModal) closeEditModal();
});

// Core Logic
function saveAndRender() {
    saveToLocalStorage();
    renderTasks();
}

function saveToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    totalCountSpan.textContent = total;
    completedCountSpan.textContent = completed;
    pendingCountSpan.textContent = pending;
}

function renderTasks() {
    updateStats();
    
    taskList.innerHTML = '';

    // Filter Logic
    let filteredTasks = tasks;
    if (currentFilter === 'pending') {
        filteredTasks = tasks.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(t => t.completed);
    }

    // Empty State
    if (filteredTasks.length === 0) {
        emptyState.style.display = 'flex';
        // Adjust empty message based on filter?
        const p = emptyState.querySelector('p');
        if (currentFilter === 'completed') p.textContent = "No completed tasks yet.";
        else if (currentFilter === 'pending') p.textContent = "No pending tasks! Good job.";
        else p.textContent = "You have no tasks on your list.";
    } else {
        emptyState.style.display = 'none';
    }

    // Create Elements
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <div class="task-checkbox-wrapper">
                <input type="checkbox" class="task-checkbox" 
                    ${task.completed ? 'checked' : ''} 
                    onchange="toggleTask(${task.id})">
            </div>
            <div class="task-content">
                ${escapeHtml(task.text)}
            </div>
            <div class="task-actions">
                <button class="action-btn edit-btn" onclick="openEditModal(${task.id})" aria-label="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteTask(${task.id})" aria-label="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        taskList.appendChild(li);
    });
}

// Security: Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Expose functions to window for onclick handlers in HTML
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.openEditModal = openEditModal;
