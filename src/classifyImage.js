export const CATEGORY_FROM_DISASTER = {
  flood: 'Flooding',
  wildfire: 'Wildfire',
  storm: 'Storm',
};

export async function classifyImageFile(file) {
  const body = new FormData();
  body.append('file', file);
  const response = await fetch('/api/classify', { method: 'POST', body });
  return readClassification(response);
}

export async function classifyImageUrl(imageUrl) {
  const response = await fetch('/api/classify-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl }),
  });
  return readClassification(response);
}

async function readClassification(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = payload.detail;
    throw new Error(typeof detail === 'string' ? detail : 'The classifier could not read that photo.');
  }
  return payload;
}

export function compressImageFile(file, maxEdge = 960, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not read that image file.'));
    };
    image.src = objectUrl;
  });
}
