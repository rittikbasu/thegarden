export function imageToBlob(image) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const blob = new Blob([reader.result], { type: image.type });
      resolve(blob);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(image);
  });
}

export function createImageUrls(images) {
  const newImages = [];
  images?.forEach((image) => {
    const imageUrl = URL.createObjectURL(image);
    newImages.push(imageUrl);
  });
  return newImages;
}
