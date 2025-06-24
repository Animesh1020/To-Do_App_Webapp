// DOM Elements
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const totalTasks = document.getElementById('totalTasks');
const completedTasks = document.getElementById('completedTasks');
const pendingTasks = document.getElementById('pendingTasks');

// Task array to store all tasks
let tasks = [];
let taskIdCounter = 0;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Load tasks from localStorage if available
    loadTasks();
    updateUI();
    
    // Add event listeners
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    // Focus on input when page loads
    taskInput.focus();
});

// Add new task function
function addTask() {
    const taskText = taskInput.value.trim();
    
    // Validate input
    if (taskText === '') {
        alert('Please enter a task!');
        taskInput.focus();
        return;
    }
    
    if (taskText.length > 100) {
        alert('Task is too long! Please keep it under 100 characters.');
        taskInput.focus();
        return;
    }
    
    // Create new task object
    const newTask = {
        id: ++taskIdCounter,
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    // Add to tasks array
    tasks.push(newTask);
    
    // Clear input
    taskInput.value = '';
    taskInput.focus();
    
    // Update UI
    updateUI();
    saveTasks();
}

// Create task element
function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.dataset.taskId = task.id;
    
    li.innerHTML = `
        <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTask(${task.id})"></div>
        <span class="task-text">${escapeHtml(task.text)}</span>
        <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
    `;
    
    return li;
}

// Toggle task completion
function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        updateUI();
        saveTasks();
    }
}

// Delete task with animation
function deleteTask(taskId) {
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    
    if (taskElement) {
        // Add removing class for animation
        taskElement.classList.add('removing');
        
        // Remove from DOM after animation
        setTimeout(() => {
            // Remove from tasks array
            tasks = tasks.filter(t => t.id !== taskId);
            updateUI();
            saveTasks();
        }, 300);
    }
}

// Update the entire UI
function updateUI() {
    // Clear current tasks
    taskList.innerHTML = '';
    
    // Show/hide empty state
    if (tasks.length === 0) {
        emptyState.classList.remove('hidden');
        taskList.style.display = 'none';
    } else {
        emptyState.classList.add('hidden');
        taskList.style.display = 'block';
        
        // Sort tasks: pending first, then completed
        const sortedTasks = [...tasks].sort((a, b) => {
            if (a.completed === b.completed) {
                return new Date(b.createdAt) - new Date(a.createdAt); // Newest first
            }
            return a.completed - b.completed; // Pending first
        });
        
        // Create and append task elements
        sortedTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            taskList.appendChild(taskElement);
        });
    }
    
    // Update stats
    updateStats();
}

// Update statistics
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    
    totalTasks.textContent = `Total: ${total}`;
    completedTasks.textContent = `Completed: ${completed}`;
    pendingTasks.textContent = `Pending: ${pending}`;
}

// Save tasks to localStorage
function saveTasks() {
    try {
        localStorage.setItem('todoTasks', JSON.stringify(tasks));
        localStorage.setItem('todoTaskIdCounter', taskIdCounter.toString());
    } catch (error) {
        console.warn('Could not save tasks to localStorage:', error);
    }
}

// Load tasks from localStorage
function loadTasks() {
    try {
        const savedTasks = localStorage.getItem('todoTasks');
        const savedCounter = localStorage.getItem('todoTaskIdCounter');
        
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
        }
        
        if (savedCounter) {
            taskIdCounter = parseInt(savedCounter);
        }
    } catch (error) {
        console.warn('Could not load tasks from localStorage:', error);
        tasks = [];
        taskIdCounter = 0;
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Clear all completed tasks
function clearCompleted() {
    const completedCount = tasks.filter(t => t.completed).length;
    
    if (completedCount === 0) {
        alert('No completed tasks to clear!');
        return;
    }
    
    if (confirm(`Are you sure you want to delete ${completedCount} completed task(s)?`)) {
        tasks = tasks.filter(t => !t.completed);
        updateUI();
        saveTasks();
    }
}

// Add clear completed button functionality (optional enhancement)
document.addEventListener('DOMContentLoaded', function() {
    // You can add a "Clear Completed" button in HTML and use this function
    // Example: <button onclick="clearCompleted()">Clear Completed</button>
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to add task
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        addTask();
    }
    
    // Escape to clear input
    if (e.key === 'Escape') {
        taskInput.value = '';
        taskInput.blur();
    }
});

// Prevent form submission if wrapped in a form
document.addEventListener('submit', function(e) {
    e.preventDefault();
    addTask();
});