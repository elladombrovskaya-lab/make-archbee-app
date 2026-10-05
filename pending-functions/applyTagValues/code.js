function applyTagValues(content, parameters) {
    if (!content) return content;
    let result = content;
    Object.keys(parameters || {}).forEach((key) => {
        if (key === 'docId') return;
        const val = parameters[key];
        if (val !== undefined && val !== null && val !== '') {
            const escaped = String(key).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const pattern = new RegExp('\\{\\{\\s*' + escaped + '\\s*\\}\\}', 'g');
            result = result.replace(pattern, String(val));
        }
    });
    return result;
}
