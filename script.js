/**
 * Class: Todo
 * Merepresentasikan satu item To-Do
 */
class Todo {
  constructor(id, title, completed = false) {
    this.id = id;
    this.title = title.trim();
    this.completed = completed;
  }

  toggle() {
    this.completed = !this.completed;
  }

  render() {
    const li = document.createElement('li');
    li.dataset.id = this.id;
    if (this.completed) li.classList.add('completed');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = this.completed;
    checkbox.setAttribute('aria-label', `Tandai ${this.title} selesai`);

    const span = document.createElement('span');
    span.textContent = this.title;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Hapus';
    deleteBtn.className = 'delete-btn';
    deleteBtn.setAttribute('aria-label', `Hapus ${this.title}`);

    // Event Listeners
    checkbox.addEventListener('change', () => {
      this.toggle();
      li.classList.toggle('completed', this.completed);
    });

    span.addEventListener('click', () => {
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change'));
    });

    deleteBtn.addEventListener('click', () => todoApp.remove(this.id));

    li.append(checkbox, span, deleteBtn);
    return li;
  }
}

/**
 * Class: TodoList (TodoApp)
 * Mengelola kumpulan Todo, Fetch API, Validasi, dan DOM
 */
class TodoList {
  constructor() {
    this.todos = [];
    this.apiUrl = 'https://jsonplaceholder.typicode.com/todos?_limit=8';
    
    // DOM Elements
    this.form = document.getElementById('todo-form');
    this.input = document.getElementById('todo-input');
    this.listEl = document.getElementById('todo-list');
    this.loadingEl = document.getElementById('loading-state');
    this.errorEl = document.getElementById('error-state');
    this.emptyEl = document.getElementById('empty-state');
    this.retryBtn = document.getElementById('retry-btn');

    this.init();
  }

  init() {
    this.form.addEventListener('submit', (e) => this.handleAdd(e));
    this.retryBtn.addEventListener('click', () => this.fetchTodos());
    
    // Fetch data saat halaman dibuka
    this.fetchTodos();
  }

  // 2 & 3. Async/Await + Try/Catch untuk Fetch API
  async fetchTodos() {
    this.showState('loading');
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      
      // Mapping data API ke instance Class Todo
      this.todos = data.map(item => new Todo(item.id, item.title, item.completed));
      this.showState('list');
    } catch (error) {
      console.error('Fetch gagal:', error);
      this.showState('error', error.message);
      this.todos = []; // Reset jika gagal
    }
  }

  // 4. Validasi Input
  validateInput(value) {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      this.showState('error', 'Input tidak boleh kosong atau hanya spasi.');
      return false;
    }
    if (this.todos.some(t => t.title.toLowerCase() === trimmed.toLowerCase())) {
      this.showState('error', 'Tugas sudah ada di daftar.');
      return false;
    }
    return true;
  }

  handleAdd(e) {
    e.preventDefault();
    if (!this.validateInput(this.input.value)) return;

    const newTodo = new Todo(Date.now(), this.input.value);
    this.todos.push(newTodo);
    this.render();
    this.input.value = '';
  }

  remove(id) {
    this.todos = this.todos.filter(todo => todo.id !== id);
    this.render();
  }

  // 5. Render & 6. Edge Case Handling
  render() {
    this.listEl.innerHTML = '';
    
    // Edge Case: List kosong
    if (this.todos.length === 0) {
      this.showState('empty');
      return;
    }

    this.todos.forEach(todo => {
      this.listEl.appendChild(todo.render());
    });
  }

  // Helper: Manajemen UI State
  showState(state, message = '') {
    this.loadingEl.classList.add('hidden');
    this.errorEl.classList.add('hidden');
    this.emptyEl.classList.add('hidden');
    this.listEl.classList.add('hidden');

    const isDisabled = state === 'loading';
    this.input.disabled = isDisabled;
    this.form.querySelector('button').disabled = isDisabled;

    switch (state) {
      case 'loading':
        this.loadingEl.classList.remove('hidden');
        break;
      case 'error':
        this.errorEl.classList.remove('hidden');
        this.errorEl.querySelector('p').textContent = `❌ ${message || 'Terjadi kesalahan.'}`;
        break;
      case 'empty':
        this.emptyEl.classList.remove('hidden');
        break;
      case 'list':
      default:
        this.listEl.classList.remove('hidden');
        this.render();
        break;
    }
  }
}

// Inisialisasi aplikasi setelah DOM siap
document.addEventListener('DOMContentLoaded', () => {
  window.todoApp = new TodoList();
});