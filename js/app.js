let appData = null;
let currentTemplate = null;
let currentSelections = {};
let activePlaceholderId = null;

async function init() {
    try {
        const response = await fetch('/src/data.json');
        appData = await response.json();
    } catch (e) {
        console.error("Failed to fetch data, using fallback", e);
        // Fallback data would go here if needed
    }
    
    renderCategoryFilters();
    renderGallery();
}

function renderCategoryFilters() {
    const container = document.getElementById('category-filters');
    if (!container) return;
    
    container.innerHTML = '';
    appData.metadata.categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `px-0 py-2 border-b-2 transition-all text-sm tracking-widest uppercase font-bold whitespace-nowrap ${cat === 'ทั้งหมด' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-brand'}`;
        btn.textContent = cat;
        btn.onclick = () => {
            container.querySelectorAll('button').forEach(b => {
                b.className = 'px-0 py-2 border-b-2 border-transparent text-gray-500 hover:text-brand transition-all text-sm tracking-widest uppercase font-bold whitespace-nowrap';
            });
            btn.className = 'px-0 py-2 border-b-2 border-brand text-brand transition-all text-sm tracking-widest uppercase font-bold whitespace-nowrap';
            renderGallery(cat);
        };
        container.appendChild(btn);
    });
}

function renderGallery(filter = 'ทั้งหมด', query = '') {
    const container = document.getElementById('gallery-grid');
    if (!container) return;
    
    container.innerHTML = '';
    let templates = appData.templates;
    
    if (filter !== 'ทั้งหมด') {
        templates = templates.filter(t => t.category === filter);
    }
    
    if (query) {
        templates = templates.filter(t => t.title_th.toLowerCase().includes(query.toLowerCase()));
    }

    templates.forEach(t => {
        const div = document.createElement('div');
        div.className = 'card relative group border-black/5';
        div.innerHTML = `
            <div class="aspect-[4/3] overflow-hidden bg-gray-50">
                <img src="${t.thumbnail}" alt="${t.title_th}" class="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700" 
                     onerror="this.src='https://picsum.photos/seed/${t.id}/800/600'" referrerpolicy="no-referrer">
                <div class="absolute top-4 left-4 px-2 py-1 bg-white border border-black/10 text-[11px] text-black uppercase font-bold tracking-widest">
                    ${t.category}
                </div>
            </div>
            <div class="p-6 flex justify-between items-start">
                <div>
                    <h3 class="font-serif italic text-xl mb-1">${t.title_th}</h3>
                    ${t.input_image ? '<p class="text-gray-500 font-mono text-[11px] uppercase tracking-widest">ต้องใช้รูปตั้งต้น</p>' : ''}
                </div>
                <div class="text-gray-300 group-hover:text-black transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </div>
            </div>
        `;
        div.onclick = () => openDetail(t);
        container.appendChild(div);
    });
}

function openDetail(template) {
    currentTemplate = template;
    currentSelections = {};
    template.placeholders.forEach(p => {
        currentSelections[p.id] = typeof p.options[0] === 'string' ? p.options[0] : p.options[0].value_en;
    });
    
    document.getElementById('gallery-view').style.display = 'none';
    document.getElementById('detail-view').style.display = 'block';
    document.getElementById('back-btn').style.display = 'flex';
    document.getElementById('header-logo').style.transform = 'scale(0.5)';
    
    renderDetail();
}

function renderDetail() {
    const { thaiViewParts, englishPrompt } = parseTemplate(currentTemplate, currentSelections);
    
    document.getElementById('detail-title').textContent = currentTemplate.title_th;
    document.getElementById('detail-category').textContent = currentTemplate.category;
    document.getElementById('detail-image').src = currentTemplate.thumbnail;
    document.getElementById('detail-image').onerror = function() {
        this.src = `https://picsum.photos/seed/${currentTemplate.id}/800/600`;
    };

    const galleryContainer = document.getElementById('image-gallery-container');
    const inputContainer = document.getElementById('input-image-container');
    const outputBadge = document.getElementById('output-badge');
    const detailInputImg = document.getElementById('detail-input-image');

    if (currentTemplate.input_image) {
        detailInputImg.src = currentTemplate.input_image;
        detailInputImg.onerror = function() {
            this.src = `https://picsum.photos/seed/${currentTemplate.id}_input/800/600`;
        };
        inputContainer.classList.remove('hidden');
        outputBadge.classList.remove('hidden');
    } else {
        inputContainer.classList.add('hidden');
        outputBadge.classList.add('hidden');
    }
    
    const tagsContainer = document.getElementById('thai-tags');
    tagsContainer.innerHTML = '';
    tagsContainer.className = 'thai-tag-container';
    
    const openingQuote = document.createElement('span');
    openingQuote.textContent = '"';
    tagsContainer.appendChild(openingQuote);
    
    thaiViewParts.forEach(part => {
        if (part.type === 'placeholder') {
            const btn = document.createElement('button');
            btn.className = 'prompt-tag';
            // Show Thai value in the box
            btn.innerHTML = `[${part.display}] <span class="hand-icon">☝️</span>`;
            btn.onclick = () => openModal(part.id);
            tagsContainer.appendChild(btn);
        } else {
            const span = document.createElement('span');
            span.textContent = part.content;
            tagsContainer.appendChild(span);
        }
    });

    const closingQuote = document.createElement('span');
    closingQuote.textContent = '"';
    tagsContainer.appendChild(closingQuote);
    
    document.getElementById('english-output').textContent = englishPrompt;
}

function openModal(placeholderId) {
    activePlaceholderId = placeholderId;
    const placeholder = currentTemplate.placeholders.find(p => p.id === placeholderId);
    
    document.getElementById('modal-title').textContent = placeholder.label_th;
    const container = document.getElementById('modal-options');
    container.innerHTML = '';
    
    const currentVal = currentSelections[placeholderId];
    const isPredefined = placeholder.options.some(o => (typeof o === 'string' ? o : o.value_en) === currentVal);

    placeholder.options.forEach(opt => {
        const isString = typeof opt === 'string';
        const val = isString ? opt : opt.value_en;
        const display = isString ? opt : opt.display_th;
        
        const btn = document.createElement('button');
        btn.className = `option-btn ${currentVal === val ? 'selected' : ''}`;
        btn.innerHTML = `
            <span>${display}</span>
            ${currentVal === val ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>' : ''}
        `;
        btn.onclick = () => {
            currentSelections[placeholderId] = val;
            closeModal();
            renderDetail();
        }
        container.appendChild(btn);
    });

    // Custom input handling
    const customInput = document.getElementById('custom-input');
    const applyBtn = document.getElementById('apply-custom-btn');
    
    customInput.value = isPredefined ? '' : currentVal;
    
    applyBtn.onclick = () => {
        const val = customInput.value.trim();
        if (val) {
            currentSelections[placeholderId] = val;
            closeModal();
            renderDetail();
        }
    };

    customInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
            applyBtn.click();
        }
    };
    
    document.getElementById('modal').classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

function goBack() {
    document.getElementById('gallery-view').style.display = 'block';
    document.getElementById('detail-view').style.display = 'none';
    document.getElementById('back-btn').style.display = 'none';
    document.getElementById('header-logo').style.transform = 'scale(1)';
}

function handleCopy() {
    const text = document.getElementById('english-output').textContent;
    copyToClipboard(text).then(() => {
        const copyBtn = document.getElementById('copy-btn');
        const originalContent = copyBtn.innerHTML;
        copyBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg> ก๊อปปี้แล้ว!';
        copyBtn.classList.add('bg-green-500');
        setTimeout(() => {
            copyBtn.innerHTML = originalContent;
            copyBtn.classList.remove('bg-green-500');
        }, 2000);
    });
}

// Search
document.getElementById('search-input')?.addEventListener('input', (e) => {
    renderGallery('ทั้งหมด', e.target.value);
});

window.onload = init;
