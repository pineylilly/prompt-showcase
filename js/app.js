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
    renderHeroCollage('hero-collage');
    renderHeroCollage('hero-collage-far');
    initDynamicHero();
}

function initDynamicHero() {
    // 1. Keyword Rotation
    const keywordEl = document.getElementById('dynamic-keyword');
    const keywords = ['ไม่เก่ง', 'ไม่คล่อง', 'ไม่ถนัด', 'ไม่เป็น', 'มือใหม่'];
    let kIdx = 0;

    setInterval(() => {
        if (!keywordEl) return;
        keywordEl.style.opacity = '0';
        keywordEl.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            kIdx = (kIdx + 1) % keywords.length;
            keywordEl.textContent = keywords[kIdx];
            keywordEl.style.opacity = '1';
            keywordEl.style.transform = 'translateY(0)';
        }, 500);
    }, 3000);
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
        templates = templates.filter(t => t.categories && t.categories.includes(filter));
    }
    
    if (query) {
        templates = templates.filter(t => t.title_th.toLowerCase().includes(query.toLowerCase()));
    }

    templates.forEach(t => {
        const categoriesHtml = (t.categories || []).map(cat => 
            `<span class="tag">${cat}</span>`
        ).join('');

        const div = document.createElement('div');
        div.className = 'card-2-3 relative group overflow-hidden rounded-2xl cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500';
        div.innerHTML = `
            <img src="${t.thumbnail}" alt="${t.title_th}" class="absolute inset-0 w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" 
                 onerror="this.src='https://picsum.photos/seed/${t.id}/600/900'" referrerpolicy="no-referrer">
            
            <!-- Overlay for legibility -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>
            
            <div class="absolute inset-0 p-6 flex flex-col justify-end">
                <div class="flex flex-wrap gap-2 mb-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    ${categoriesHtml}
                </div>
                <h3 class="font-serif italic text-2xl text-white mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">${t.title_th}</h3>
                
                ${(t.input_images && t.input_images.length > 0) ? `
                <div class="flex items-center -space-x-3 mb-4 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500 delay-75">
                    ${t.input_images.map((img, idx) => `
                        <div class="w-8 h-8 rounded-full border-2 border-black overflow-hidden shadow-lg relative" style="z-index: ${10-idx}">
                            <img src="${img}" class="w-full h-full object-cover" onerror="this.src='https://picsum.photos/seed/${t.id}_in_${idx}/100/100'">
                        </div>
                    `).join('')}
                    <span class="ml-5 text-[9px] text-white/50 font-bold uppercase tracking-widest">
                        ${t.input_images.length} Input${t.input_images.length > 1 ? 's' : ''}
                    </span>
                </div>
                ` : ''}
                
                <div class="flex items-center gap-2 text-white/40 group-hover:text-brand transition-colors duration-500">
                    <span class="text-[10px] uppercase tracking-widest font-bold">Explore Template</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
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
    
    // Hide Hero Section
    const hero = document.getElementById('gallery-hero');
    if (hero) hero.style.display = 'none';

    // Show fixed prompt bar
    const fixedBar = document.getElementById('fixed-prompt-bar');
    if (fixedBar) fixedBar.classList.add('active');
    document.body.classList.add('bar-active');
    
    renderDetail();
    window.scrollTo(0, 0);
}

function renderDetail() {
    const { thaiViewParts, englishPrompt } = parseTemplate(currentTemplate, currentSelections);
    
    document.getElementById('detail-title').textContent = currentTemplate.title_th;
    document.getElementById('detail-category').textContent = (currentTemplate.categories || []).join(' • ');
    document.getElementById('detail-image').src = currentTemplate.thumbnail;
    document.getElementById('detail-image').onerror = function() {
        this.src = `https://picsum.photos/seed/${currentTemplate.id}/800/600`;
    };

    const inputListContainer = document.getElementById('dynamic-input-list');
    const outputBadge = document.getElementById('output-badge');
    const instructionsContainer = document.getElementById('ai-instructions');
    const instructionContent = document.getElementById('instruction-content');

    if (inputListContainer && currentTemplate.input_images && currentTemplate.input_images.length > 0) {
        const count = currentTemplate.input_images.length;
        inputListContainer.innerHTML = '';
        // Change grid columns based on count
        inputListContainer.className = count > 1 ? 'grid grid-cols-2 sm:grid-cols-3 gap-4' : 'block';
        
        currentTemplate.input_images.forEach((src, idx) => {
            const div = document.createElement('div');
            // If multiple, make them smaller (square or 3/4)
            div.className = count > 1 ? 'aspect-square overflow-hidden shadow-sm border border-black/5 relative' : 'aspect-[3/4] overflow-hidden shadow-sm border border-black/5 relative mb-4';
            div.innerHTML = `
                <div class="absolute top-2 left-2 px-1.5 py-0.5 bg-white border border-black/10 text-[9px] text-black uppercase font-bold tracking-widest z-10">
                    รูป ${idx + 1}
                </div>
                <img src="${src}" alt="" class="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700" 
                     onerror="this.src='https://picsum.photos/seed/${currentTemplate.id}_input_${idx}/640/640'" referrerpolicy="no-referrer">
            `;
            inputListContainer.appendChild(div);
        });
        inputListContainer.classList.remove('hidden');
        if (outputBadge) outputBadge.classList.remove('hidden');
        
        // Update Instructions
        if (instructionsContainer && instructionContent) {
            instructionsContainer.classList.remove('hidden');
            if (count === 1) {
                instructionContent.innerHTML = `
                    <p>1. อัปโหลดรูปภาพอ้างอิงของคุณเข้าไปที่ AI ที่เลือกใช้</p>
                    <p>2. คัดลอกพรอมต์ด้านล่างไปวางเพื่อสั่งการให้ AI สร้างภาพตามตัวอย่าง</p>
                `;
            } else {
                instructionContent.innerHTML = `
                    <p>1. อัปโหลดรูปภาพอ้างอิงทั้งหมด (${count} รูป) เข้าไปที่ AI</p>
                    <p>2. คัดลอกพรอมต์ด้านล่างไปวางเพื่อให้ AI นำข้อมูลจากทุกรูปมาประมวลผลพร้อมกัน</p>
                `;
            }
        }
    } else if (inputListContainer) {
        inputListContainer.classList.add('hidden');
        if (outputBadge) outputBadge.classList.add('hidden');
        
        // Update Instructions for No Image
        if (instructionsContainer && instructionContent) {
            instructionsContainer.classList.remove('hidden');
            instructionContent.innerHTML = `
                <p>คัดลอกพรอมต์ด้านล่างไปวางใน AI ที่คุณต้องการเพื่อสร้างภาพได้ทันที โดยไม่ต้องใช้รูปภาพอ้างอิง</p>
            `;
        }
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
    
    // Show Hero Section back
    const hero = document.getElementById('gallery-hero');
    if (hero) hero.style.display = 'block';

    // Hide fixed prompt bar
    const fixedBar = document.getElementById('fixed-prompt-bar');
    if (fixedBar) fixedBar.classList.remove('active');
    document.body.classList.remove('bar-active');

    window.scrollTo(0, 0);
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

window.onload = init;

function renderHeroCollage(containerId) {
    const container = document.getElementById(containerId);
    if (!container || !appData) return;

    const thumbnails = appData.templates.map(t => t.thumbnail);
    // Duplicate some to fill space if needed
    const allImages = [...thumbnails, ...thumbnails, ...thumbnails]; 
    
    container.innerHTML = '';
    
    // Create 6 columns
    for (let i = 0; i < 6; i++) {
        const col = document.createElement('div');
        col.className = 'collage-col';
        
        // Pick random subset for each column and double it for seamless scroll
        const colImages = [];
        for (let j = 0; j < 8; j++) {
            colImages.push(allImages[Math.floor(Math.random() * allImages.length)]);
        }
        
        const finalImages = [...colImages, ...colImages];
        finalImages.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.className = 'collage-img';
            img.loading = 'lazy';
            img.onerror = () => img.remove();
            col.appendChild(img);
        });
        
        container.appendChild(col);
    }
}
