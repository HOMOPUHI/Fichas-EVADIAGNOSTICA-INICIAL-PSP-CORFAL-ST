document.addEventListener('DOMContentLoaded', () => {
    const userListEl = document.getElementById('user-list');
    const formEl = document.getElementById('user-form');
    const welcomeScreenEl = document.getElementById('welcome-screen');
    const addNewUserBtn = document.getElementById('add-new-user-btn');
    const printBtn = document.getElementById('print-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const fechaNacimientoInput = document.getElementById('fechaNacimiento');
    const edadInput = document.getElementById('edad');

    let users = [];
    let activeUserId = null;

    // --- DATA HANDLING ---
    function loadUsers() {
        const usersJSON = localStorage.getItem('psicoUsers');
        users = usersJSON ? JSON.parse(usersJSON) : [];
    }

    function saveUsers() {
        localStorage.setItem('psicoUsers', JSON.stringify(users));
    }

    // --- UI RENDERING ---
    function renderUserList() {
        userListEl.innerHTML = '';
        if (users.length === 0) {
            userListEl.innerHTML = '<p style="padding: 1.5rem;">No hay pacientes registrados.</p>';
            return;
        }
        users.forEach(user => {
            const userItem = document.createElement('div');
            userItem.classList.add('user-item');
            userItem.textContent = user.nombreCompleto || 'Paciente sin nombre';
            userItem.dataset.id = user.id;
            if(user.id === activeUserId) {
                userItem.classList.add('active');
            }
            userListEl.appendChild(userItem);
        });
    }

    function showForm() {
        welcomeScreenEl.classList.add('hidden');
        formEl.classList.remove('hidden');
    }

    function showWelcomeScreen() {
        formEl.classList.add('hidden');
        welcomeScreenEl.classList.remove('hidden');
        activeUserId = null;
        renderUserList();
    }

    // --- FORM LOGIC ---
    function handleNewUser() {
        activeUserId = null;
        formEl.reset();
        document.getElementById('userId').value = '';
        showForm();
        document.querySelector('.user-item.active')?.classList.remove('active');
    }
    
    function calculateAge() {
        if (!fechaNacimientoInput.value) {
            edadInput.value = '';
            return;
        }
        const birthDate = new Date(fechaNacimientoInput.value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        edadInput.value = age;
    }
    
    function loadUserIntoForm(userId) {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        activeUserId = userId;
        formEl.reset();

        Object.keys(user).forEach(key => {
            const input = formEl.elements[key];
            if (input) {
                if (input.type === 'radio') {
                    document.querySelector(`input[name="${key}"][value="${user[key]}"]`).checked = true;
                } else {
                    input.value = user[key];
                }
            }
        });
        calculateAge(); // Recalculate age when loading
        showForm();
        renderUserList();
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(formEl);
        const userData = Object.fromEntries(formData.entries());
        const userId = userData.userId;

        if (userId) { // Update existing user
            const userIndex = users.findIndex(u => u.id == userId);
            if (userIndex !== -1) {
                users[userIndex] = { ...users[userIndex], ...userData };
            }
        } else { // Create new user
            userData.id = Date.now();
            users.push(userData);
            activeUserId = userData.id;
        }
        saveUsers();
        renderUserList();
        alert('Ficha guardada correctamente.');
    }
    
    function handleDeleteUser() {
        if (!activeUserId) {
            alert('Por favor, seleccione un paciente para eliminar.');
            return;
        }
        
        if (confirm('¿Está seguro de que desea eliminar permanentemente esta ficha? Esta acción no se puede deshacer.')) {
            users = users.filter(u => u.id !== activeUserId);
            saveUsers();
            showWelcomeScreen();
        }
    }
    
    function handlePrint() {
        if (!activeUserId && !document.getElementById('nombreCompleto').value) {
             alert('Por favor, seleccione o cree un paciente antes de imprimir.');
             return;
        }
        window.print();
    }


    // --- EVENT LISTENERS ---
    addNewUserBtn.addEventListener('click', handleNewUser);
    
    userListEl.addEventListener('click', (e) => {
        if (e.target.classList.contains('user-item')) {
            const userId = parseInt(e.target.dataset.id, 10);
            loadUserIntoForm(userId);
        }
    });

    formEl.addEventListener('submit', handleFormSubmit);

    fechaNacimientoInput.addEventListener('change', calculateAge);
    
    printBtn.addEventListener('click', handlePrint);
    
    deleteBtn.addEventListener('click', handleDeleteUser);


    // --- INITIALIZATION ---
    function init() {
        loadUsers();
        renderUserList();
        showWelcomeScreen();
    }

    init();
});

