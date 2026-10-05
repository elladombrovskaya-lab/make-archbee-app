function extractTags(content) {
    if (!content) return [];
    const matches = content.match(/\{\{\s*([^{}]+?)\s*\}\}/g) || [];
    const tags = matches.map((m) => m.replace(/^\{\{\s*/, '').replace(/\s*\}\}$/, '').trim());
    return [...new Set(tags)].filter(Boolean);
}
