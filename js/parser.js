function parseTemplate(template, selections) {
    let englishPrompt = template.raw_template;
    
    const parts = template.raw_template.split(/(\[[^\]]+\])/g);
    
    const thaiViewParts = parts.map(part => {
        const match = part.match(/\[([^\]]+)\]/);
        if (match) {
            const placeholderId = match[1];
            const placeholder = template.placeholders.find(p => p.id === placeholderId);
            const selectedValue = selections[placeholderId];
            
            let displayTh;
            if (placeholder?.options && typeof placeholder.options[0] === 'string') {
                displayTh = selectedValue;
            } else {
                const option = placeholder?.options?.find(o => o.value_en === selectedValue);
                displayTh = option?.display_th || placeholder?.label_th || placeholderId;
            }
            
            return {
                type: 'placeholder',
                id: placeholderId,
                label: placeholder?.label_th || '',
                display: displayTh,
                value: selectedValue
            };
        }
        return {
            type: 'text',
            content: part
        };
    });

    Object.entries(selections).forEach(([id, value]) => {
        englishPrompt = englishPrompt.replace(`[${id}]`, value);
    });

    return {
        thaiViewParts,
        englishPrompt
    };
}
