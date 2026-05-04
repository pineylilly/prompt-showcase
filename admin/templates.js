let data = {
    metadata: { version: "1.0", categories: [] },
    templates: []
};

let editingId = null;

// Initialization
async function init() {
    try {
        const response = await fetch('../src/data.json');
        data = await response.json();
        renderCategories();
        renderTemplates();
    } catch (error) {
        console.error("Error loading data.json:", error);
        alert("Failed to load data.json. Make sure the file exists in /src/data.json");
    }
}

function renderCategories() {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;
    container.innerHTML = '';
    
    data.metadata.categories.forEach(cat => {
        if (cat === 'ทั้งหมด') return; // Skip "All" for editing
        const label = document.createElement('label');
        label.className = 'category-checkbox-item';
        label.innerHTML = `
            <input type="checkbox" value="${cat}" class="cat-checkbox">
            <span>${cat}</span>
        `;
        container.appendChild(label);
    });
}

let draggedIndex = null;
let draggedType = null; // 'template' or 'placeholder'

function renderTemplates(filter = '') {
    const tbody = document.getElementById('templateTableBody');
    tbody.innerHTML = '';
    
    const isFiltering = filter.trim() !== '';
    const filtered = data.templates.filter(t => 
        t.title_th.toLowerCase().includes(filter.toLowerCase()) || 
        t.id.toLowerCase().includes(filter.toLowerCase())
    );

    filtered.forEach((t, index) => {
        const tr = document.createElement('tr');
        
        if (!isFiltering) {
            tr.draggable = true;
            tr.addEventListener('dragstart', (e) => handleDragStart(e, index, 'template'));
            tr.addEventListener('dragover', (e) => handleDragOver(e, 'template'));
            tr.addEventListener('dragleave', (e) => handleDragLeave(e));
            tr.addEventListener('drop', (e) => handleDrop(e, index, 'template'));
            tr.addEventListener('dragend', (e) => handleDragEnd(e));
        }

        const moveControls = !isFiltering ? `
            <div class="move-controls">
                <div class="drag-handle" title="Drag to re-order">⠿</div>
            </div>
        ` : '';

        tr.innerHTML = `
            <td>${moveControls}</td>
            <td class="table-id">${t.id}</td>
            <td style="font-weight: 500;">${t.title_th}</td>
            <td><span class="table-category">${(t.categories || []).join(', ')}</span></td>
            <td>${t.placeholders ? t.placeholders.length : 0} items</td>
            <td>
                <button class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.7rem;" onclick="openEditModal('${t.id}')">แก้ไข</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Drag & Drop Handlers
function handleDragStart(e, index, type) {
    draggedIndex = index;
    draggedType = type;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e, type) {
    if (draggedType !== type) return;
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e, targetIndex, type) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    if (draggedType !== type || draggedIndex === targetIndex) return;

    if (type === 'template') {
        const item = data.templates.splice(draggedIndex, 1)[0];
        data.templates.splice(targetIndex, 0, item);
        renderTemplates(document.getElementById('searchInput').value);
        notifyChange();
    } else if (type === 'placeholder') {
        syncPlaceholdersFromDOM();
        const item = currentPlaceholders.splice(draggedIndex, 1)[0];
        currentPlaceholders.splice(targetIndex, 0, item);
        renderPlaceholders();
    }
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
}

function filterTemplates() {
    const query = document.getElementById('searchInput').value;
    renderTemplates(query);
}

// Modal Logic
let currentPlaceholders = [];

function openEditModal(id) {
    editingId = id;
    const template = data.templates.find(t => t.id === id);
    if (!template) return;

    document.getElementById('modalTitle').textContent = 'แก้ไขเทมเพลต';
    document.getElementById('modalSubId').textContent = id;
    document.getElementById('f-id').value = template.id;
    document.getElementById('f-id').disabled = true; // Don't allow ID change for existing
    document.getElementById('f-title').value = template.title_th;
    
    // Set checkboxes
    const checkboxes = document.querySelectorAll('.cat-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = (template.categories || []).includes(cb.value);
    });

    document.getElementById('f-thumbnail').value = template.thumbnail || '';
    document.getElementById('f-input_images').value = (template.input_images || []).join('\n');
    document.getElementById('f-raw').value = template.raw_template;

    currentPlaceholders = JSON.parse(JSON.stringify(template.placeholders || []));
    renderPlaceholders();
    
    document.getElementById('templateModal').classList.add('active');
}

function addNewTemplate() {
    editingId = 'NEW';
    document.getElementById('modalTitle').textContent = 'เพิ่มเทมเพลตใหม่';
    document.getElementById('modalSubId').textContent = 'NEW';
    document.getElementById('templateForm').reset();
    document.getElementById('f-id').disabled = false;
    currentPlaceholders = [];
    renderPlaceholders();
    
    document.getElementById('templateModal').classList.add('active');
}

function closeModal() {
    document.getElementById('templateModal').classList.remove('active');
}

// Placeholder Management
function renderPlaceholders() {
    const container = document.getElementById('placeholdersContainer');
    syncPlaceholdersFromDOM();

    container.innerHTML = '<label>Placeholders</label>';
    
    currentPlaceholders.forEach((ph, idx) => {
        const div = createPlaceholderElement(ph, idx);
        container.appendChild(div);
    });
}

function syncPlaceholdersFromDOM() {
    const items = document.querySelectorAll('.placeholder-item');
    items.forEach((item, idx) => {
        const pid = item.querySelector('.ph-id').value;
        const popts = item.querySelector('.ph-options').value.split('\n');
        if (currentPlaceholders[idx]) {
            currentPlaceholders[idx].id = pid;
            currentPlaceholders[idx].options = popts.filter(o => o.trim() !== '');
        }
    });
}

function createPlaceholderElement(ph, index) {
    const div = document.createElement('div');
    div.className = 'placeholder-item';
    div.draggable = true;
    
    div.addEventListener('dragstart', (e) => handleDragStart(e, index, 'placeholder'));
    div.addEventListener('dragover', (e) => handleDragOver(e, 'placeholder'));
    div.addEventListener('dragleave', (e) => handleDragLeave(e));
    div.addEventListener('drop', (e) => handleDrop(e, index, 'placeholder'));
    div.addEventListener('dragend', (e) => handleDragEnd(e));

    div.innerHTML = `
        <div class="placeholder-header">
            <div class="placeholder-move">
                <div class="drag-handle" style="font-size: 1.2rem;">⠿</div>
            </div>
            <input type="text" placeholder="ID (เช่น สีสูท)" value="${ph.id}" class="ph-id" style="font-weight: bold; flex: 1;">
            <div class="placeholder-actions">
                <button type="button" onclick="removePlaceholder(${index})" style="color: red; background: none; text-transform: none; font-size: 1.2rem; padding: 0;">&times;</button>
            </div>
        </div>
        <textarea placeholder="ตัวเลือก (บรรทัดละ 1 อัน)" class="ph-options">${ph.options.join('\n')}</textarea>
    `;
    return div;
}

function movePlaceholder(index, direction) {
    syncPlaceholdersFromDOM();
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= currentPlaceholders.length) return;
    
    const item = currentPlaceholders.splice(index, 1)[0];
    currentPlaceholders.splice(newIndex, 0, item);
    
    renderPlaceholders();
}

function removePlaceholder(index) {
    syncPlaceholdersFromDOM();
    currentPlaceholders.splice(index, 1);
    renderPlaceholders();
}

function addPlaceholder() {
    syncPlaceholdersFromDOM();
    currentPlaceholders.push({ id: '', options: [] });
    renderPlaceholders();
}

// Form Submission
document.getElementById('templateForm').addEventListener('submit', (e) => {
    e.preventDefault();
    syncPlaceholdersFromDOM();
    const id = document.getElementById('f-id').value;
    
    // Collect categories
    const selectedCategories = Array.from(document.querySelectorAll('.cat-checkbox'))
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    const updatedTemplate = {
        id: id,
        title_th: document.getElementById('f-title').value,
        categories: selectedCategories,
        thumbnail: document.getElementById('f-thumbnail').value,
        input_images: document.getElementById('f-input_images').value.split('\n').map(s => s.trim()).filter(s => s !== ''),
        raw_template: document.getElementById('f-raw').value,
        placeholders: currentPlaceholders
    };

    if (editingId === 'NEW') {
        if (data.templates.some(t => t.id === id)) {
            alert("ID นี้มีอยู่แล้ว กรุณาใช้ ID อื่น");
            return;
        }
        data.templates.push(updatedTemplate);
    } else {
        const index = data.templates.findIndex(t => t.id === editingId);
        data.templates[index] = updatedTemplate;
    }

    renderTemplates();
    closeModal();
    notifyChange();
});

function deleteTemplate() {
    if (editingId === 'NEW') {
        closeModal();
        return;
    }

    if (confirm(`คุณต้องการลบเทมเพลต ${editingId} หรือไม่?`)) {
        data.templates = data.templates.filter(t => t.id !== editingId);
        renderTemplates();
        closeModal();
        notifyChange();
    }
}

function notifyChange() {
    const status = document.getElementById('save-status');
    status.style.backgroundColor = '#aa0000';
    status.querySelector('p').textContent = '⚠️ ข้อมูลมีการเปลี่ยนแปลง! อย่าลืมกด "ดาวน์โหลด JSON ใหม่" เพื่อบันทึก';
}

// Download JSON
function downloadJSON() {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const status = document.getElementById('save-status');
    status.style.backgroundColor = '#1a1a1a';
    status.querySelector('p').textContent = '✅ ดาวน์โหลดแล้ว! นำไฟล์ไปทับ src/data.json ในเครื่องของคุณ';
}

init();
