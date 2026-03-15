/**
* Aplicativo Frontend TaskFlow
* Gerencia o cadastro de usuários e o gerenciamento de tarefas
 */

// Constantes de configuração
const API_BASE = 'http://localhost:5000';
const TIMEOUT = 5000; // 5 seconds

/**
 * uxiliar: Exibir mensagens de alerta
 */
function showMessage(message, type = 'danger', elementId = 'message') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.textContent = message;
    element.className = `alert alert-${type}`;
    element.style.display = 'block';
    
    // Ocultar automaticamente as mensagens de informação/sucesso após 5 segundos.
    if (type === 'info' || type === 'success') {
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
}

/**
 * Auxiliar: Buscar com tempo limite
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = TIMEOUT) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout. Make sure the backend is running on http://localhost:5000');
        }
        throw error;
    }
}

/**
 * Auxiliar: Validar formato de e-mail
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ============= LÓGICA DA PÁGINA DE REGISTRO =============

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // Validation
        if (!name) {
            showMessage('Please enter your name', 'warning');
            return;
        }
        if (!isValidEmail(email)) {
            showMessage('Please enter a valid email address', 'warning');
            return;
        }
        if (!password || password.length < 3) {
            showMessage('Password must be at least 3 characters', 'warning');
            return;
        }
        
        try {
            showMessage('Registering...', 'info');
            
            const response = await fetchWithTimeout(`${API_BASE}/users`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json; charset=UTF-8'},
                body: JSON.stringify({name, email, password})
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                showMessage(data.error || `Registration failed (${response.status})`, 'danger');
                return;
            }
            
            // Sucesso: exibir ID do usuário e link para as tarefas
            const userId = data.user.id;
            document.getElementById('userId').textContent = userId;
            
            const tasksLink = document.getElementById('tasksLink');
            tasksLink.href = `tasks.html?user_id=${userId}`;
            
            document.getElementById('successMessage').style.display = 'block';
            registerForm.reset();
            
        } catch (error) {
            console.error('Registration error:', error);
            showMessage(`Error: ${error.message}`, 'danger');
        }
    });
}

// ============= LÓGICA DA PÁGINA DE TAREFAS =============

let currentUserId = null;
const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const alertMessage = document.getElementById('alertMessage');
const emptyState = document.getElementById('emptyState');

/**
 * Carregar e exibir tarefas para o usuário atual
 */
async function loadTasks() {
    if (!currentUserId) {
        if (alertMessage) {
            alertMessage.textContent = 'Nenhum ID de usuário fornecido. Por favor, registre-se primeiro.';
            alertMessage.className = 'alert alert-danger';
            alertMessage.style.display = 'block';
        }
        return;
    }
    
    try {
        const response = await fetchWithTimeout(
            `${API_BASE}/tasks?user_id=${currentUserId}`
        );
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        const tasks = data.tasks || [];
        
        // Limpar lista de tarefas
        taskList.innerHTML = '';
        
        if (tasks.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';
        
        // Renderizar cada tarefa
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `list-group-item task-item ${task.status === 'completed' ? 'completed' : ''}`;
            li.dataset.id = task.id;
            
            const createdDate = new Date(task.created_at).toLocaleDateString();
            
            li.innerHTML = `
                <div class="task-content">
                    <div class="task-title">${escapeHtml(task.title)}</div>
                    ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
                    <div class="task-created">Created: ${createdDate}</div>
                </div>
                <div class="task-actions">
                    <button class="btn btn-sm btn-outline-success complete-btn" title="Mark as ${task.status === 'completed' ? 'pending' : 'completed'}">
                        ${task.status === 'completed' ? '↺' : '✓'}
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-btn" title="Delete task">
                        🗑
                    </button>
                </div>
            `;
            
            taskList.appendChild(li);
        });
        
        attachTaskButtons();
        
    } catch (error) {
        console.error('Error loading tasks:', error);
        if (alertMessage) {
            alertMessage.textContent = `Error loading tasks: ${error.message}`;
            alertMessage.className = 'alert alert-danger';
            alertMessage.style.display = 'block';
        }
    }
}

/**
 * Anexar ouvintes de evento aos botões de ação da tarefa
 */
function attachTaskButtons() {
    // Botões de completar/pendente
    document.querySelectorAll('.complete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const taskElement = e.target.closest('.task-item');
            const taskId = taskElement.dataset.id;
            const isCompleted = taskElement.classList.contains('completed');
            const newStatus = isCompleted ? 'pending' : 'completed';
            
            try {
                const response = await fetchWithTimeout(`${API_BASE}/tasks/${taskId}`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({status: newStatus})
                });
                
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to update task');
                }
                
                loadTasks();
                
            } catch (error) {
                console.error('Error updating task:', error);
                if (alertMessage) {
                    alertMessage.textContent = `Error: ${error.message}`;
                    alertMessage.className = 'alert alert-danger';
                    alertMessage.style.display = 'block';
                }
            }
        });
    });
    
    // Botões de deletar tarefa
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (!confirm('Are you sure you want to delete this task?')) {
                return;
            }
            
            const taskId = e.target.closest('.task-item').dataset.id;
            
            try {
                const response = await fetchWithTimeout(`${API_BASE}/tasks/${taskId}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to delete task');
                }
                
                loadTasks();
                
                if (alertMessage) {
                    alertMessage.textContent = 'Task deleted successfully';
                    alertMessage.className = 'alert alert-success';
                    alertMessage.style.display = 'block';
                    setTimeout(() => {
                        alertMessage.style.display = 'none';
                    }, 3000);
                }
                
            } catch (error) {
                console.error('Error deleting task:', error);
                if (alertMessage) {
                    alertMessage.textContent = `Error: ${error.message}`;
                    alertMessage.className = 'alert alert-danger';
                    alertMessage.style.display = 'block';
                }
            }
        });
    });
}

/**
 * Inicializar página de tarefas
 */
if (taskForm && taskList) {
    // Extrair user_id da string de consulta
    const params = new URLSearchParams(window.location.search);
    currentUserId = params.get('user_id');
    
    // Validar user_id
    if (!currentUserId || isNaN(currentUserId) || currentUserId <= 0) {
        if (alertMessage) {
            alertMessage.innerHTML = `
                <strong>ID de usuário inválido</strong><br>
                Por favor, registre-se primeiro ou utilize um link válido.
                <a href="index.html" class="btn btn-primary btn-sm mt-2">← Acesse a página de inscrição.</a>
            `;
            alertMessage.className = 'alert alert-warning';
            alertMessage.style.display = 'block';
        }
        taskForm.style.display = 'none';
    } else {
        // Carregar tarefas para o usuário
        loadTasks();
        
        // gerenciar o envio do formulário de nova tarefa
        taskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const title = document.getElementById('title').value.trim();
            const description = document.getElementById('description').value.trim();
            
            if (!title) {
                showMessage('Please enter a task title', 'warning', 'alertMessage');
                return;
            }
            
            try {
                showMessage('Adding task...', 'info', 'alertMessage');
                
                const response = await fetchWithTimeout(`${API_BASE}/tasks`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        title,
                        description,
                        user_id: parseInt(currentUserId)
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || `Failed to create task (${response.status})`);
                }
                
                taskForm.reset();
                loadTasks();
                showMessage('Task created successfully!', 'success', 'alertMessage');
                
            } catch (error) {
                console.error('Error creating task:', error);
                showMessage(`Error: ${error.message}`, 'danger', 'alertMessage');
            }
        });
    }
}

/**
 * Auxiliar: Escape HTML para evitar XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

