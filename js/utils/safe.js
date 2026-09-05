// Text from profiles, storage, and AI is always encoded before HTML rendering.
export const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export const textList = (items = []) => `<ul class="space-y-2">${items.map(item => `<li class="flex gap-2"><span class="text-brand-600">•</span><span>${escapeHtml(item)}</span></li>`).join('')}</ul>`;
