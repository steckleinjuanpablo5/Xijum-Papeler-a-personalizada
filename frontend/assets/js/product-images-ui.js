import { PRODUCT_IMAGE_MAP, CATEGORY_IMAGE_FALLBACKS } from '../../data/product-images.js';

const normalizeKey = (value = '') =>
String(value)
.normalize('NFD')
.replace(/[\u0300-\u036f]/g, '')
.toLowerCase()
.trim()
.replace(/\s+/g, ' ');

const getCardTitle = (card) => normalizeKey(card.querySelector('h3')?.textContent || '');

const getCardCategory = (card) => {
const paragraphs = [...card.querySelectorAll('p')];
const categoryParagraph = paragraphs.find((p) => {
const text = normalizeKey(p.textContent || '');
return (
text === 'agendas y planeadores' ||
text === 'libretas' ||
text === 'regalos' ||
text === 'complementos'
);
});

return normalizeKey(categoryParagraph?.textContent || '');
};

const getImageForCard = (card) => {
const titleKey = getCardTitle(card);
const categoryKey = getCardCategory(card);

return PRODUCT_IMAGE_MAP[titleKey] || CATEGORY_IMAGE_FALLBACKS[categoryKey] || null;
};

const decorateCard = (card) => {
if (!card || card.querySelector('.product-card__image-wrap')) {
return;
}

const imageSrc = getImageForCard(card);
if (!imageSrc) {
return;
}

const title = card.querySelector('h3');
if (!title) {
return;
}

const wrap = document.createElement('div');
wrap.className = 'product-card__image-wrap';

if (card.closest('.cart-items') || card.closest('#checkout-items')) {
wrap.classList.add('product-card__image-wrap--compact');
}

const img = document.createElement('img');
img.className = 'product-card__image';
img.src = imageSrc;
img.alt = title.textContent.trim();
img.loading = 'lazy';
img.decoding = 'async';

wrap.appendChild(img);
card.insertBefore(wrap, card.firstChild);
};

const decorateAllCards = () => {
document.querySelectorAll('.product-card').forEach(decorateCard);
};

decorateAllCards();

const observer = new MutationObserver(() => {
decorateAllCards();
});

observer.observe(document.body, {
childList: true,
subtree: true
});