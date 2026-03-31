// Map each product to its image filename
// Place image files in: public/images/
// Supported formats: jpg, jpeg, png, webp
const PRODUCT_IMAGES = {
  NATURE:   'nature.jpg',
  HAPPY:    'happy.jpg',
  CALM:     'calm.jpg',
  PEACE:    'peace.jpg',
  TROPICAL: 'tropical.jpg',
  LOVE:     'love.jpg',
};

const IMAGE_KEYWORDS = ['foto', 'fotos', 'imagem', 'imagens', 'image', 'photo', 'ver', 'mostra', 'manda', 'como é', 'como e'];

const PRODUCT_KEYWORDS = Object.keys(PRODUCT_IMAGES).map(p => p.toLowerCase());

// Returns product name (e.g. 'NATURE') if message is an image request, otherwise null
function detectImageRequest(message) {
  const msg = message.toLowerCase();
  const isImageRequest = IMAGE_KEYWORDS.some(k => msg.includes(k));
  if (!isImageRequest) return null;

  for (const product of PRODUCT_KEYWORDS) {
    if (msg.includes(product)) return product.toUpperCase();
  }

  return null; // image request but no specific product mentioned
}

function getImageFilename(product) {
  return PRODUCT_IMAGES[product] || null;
}

module.exports = { detectImageRequest, getImageFilename, PRODUCT_IMAGES };
