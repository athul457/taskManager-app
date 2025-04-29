// DOM Elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const filterButtons = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const clearAllBtn = document.getElementById('clear-all-btn');

// Task Data
let tasks = [];
let currentFilter = 'all';
let editingTaskId = null;

// Load tasks from localStorage
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    renderTasks();
});

// Event Listeners
taskForm.addEventListener('submit', addTask);
taskList.addEventListener('click', handleTaskAction);
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        setFilter(button.getAttribute('data-filter'));
    });
});
clearCompletedBtn.addEventListener('click', clearCompletedTasks);
clearAllBtn.addEventListener('click', clearAllTasks);

// Functions
function addTask(e) {
    e.preventDefault();
    
    const taskText = taskInput.value.trim();
    if (!taskText) return;
    
    if (editingTaskId !== null) {
        // Update existing task
        const taskIndex = tasks.findIndex(task => task.id === editingTaskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].text = taskText;
            saveTasks();
            renderTasks();
            
            // Reset editing state
            editingTaskId = null;
            document.getElementById('add-task-btn').innerHTML = '<i class="fas fa-plus"></i> Add Task';
        }
    } else {
        // Add new task
        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date()
        };
        
        tasks.push(newTask);
        saveTasks();
        renderTasks();
    }
    
    taskInput.value = '';
    taskInput.focus();
}

function handleTaskAction(e) {
    const target = e.target;
    const taskItem = target.closest('.task-item');
    
    if (!taskItem) return;
    
    const taskId = parseInt(taskItem.getAttribute('data-id'));
    
    // Handle checkbox click
    if (target.classList.contains('task-checkbox')) {
        toggleTaskStatus(taskId);
    }
    
    // Handle edit button click
    if (target.classList.contains('edit-btn') || target.parentElement.classList.contains('edit-btn')) {
        editTask(taskId);
    }
    
    // Handle delete button click
    if (target.classList.contains('delete-btn') || target.parentElement.classList.contains('delete-btn')) {
        deleteTask(taskId);
    }
}

function toggleTaskStatus(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks();
        renderTasks();
    }
}

function editTask(taskId) {
    const task = tasks.find(task => task.id === taskId);
    if (task) {
        editingTaskId = taskId;
        taskInput.value = task.text;
        taskInput.focus();
        document.getElementById('add-task-btn').innerHTML = '<i class="fas fa-save"></i> Update Task';
    }
}

function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    
    // If we were editing this task, reset the editing state
    if (editingTaskId === taskId) {
        editingTaskId = null;
        taskInput.value = '';
        document.getElementById('add-task-btn').innerHTML = '<i class="fas fa-plus"></i> Add Task';
    }
    
    saveTasks();
    renderTasks();
}

function setFilter(filter) {
    currentFilter = filter;
    
    // Update active filter button
    filterButtons.forEach(button => {
        if (button.getAttribute('data-filter') === filter) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    renderTasks();
}

function clearCompletedTasks() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
}

function clearAllTasks() {
    tasks = [];
    saveTasks();
    renderTasks();
    
    // Reset editing state if active
    if (editingTaskId !== null) {
        editingTaskId = null;
        taskInput.value = '';
        document.getElementById('add-task-btn').innerHTML = '<i class="fas fa-plus"></i> Add Task';
    }
}

function renderTasks() {
    taskList.innerHTML = '';
    
    // Filter tasks based on current filter
    let filteredTasks = tasks;
    if (currentFilter === 'pending') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }
    
    // Sort tasks by creation date (newest first)
    filteredTasks.sort((a, b) => b.createdAt - a.createdAt);
    
    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'task-item empty-message';
        emptyMessage.textContent = 'No tasks to display';
        taskList.appendChild(emptyMessage);
        return;
    }
    
    filteredTasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskItem.setAttribute('data-id', task.id);
        
        taskItem.innerHTML = `
            <div class="task-content">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${escapeHTML(task.text)}</span>
            </div>
            <div class="task-actions-btn">
                <button class="edit-btn" title="Edit Task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" title="Delete Task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        taskList.appendChild(taskItem);
    });
}

// Helper function to escape HTML to prevent XSS
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag]));
}

// Local Storage Functions
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
        
        // Convert date strings back to Date objects
        tasks.forEach(task => {
            task.createdAt = new Date(task.createdAt);
        });
    }
}
