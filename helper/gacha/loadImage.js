module.exports = (url) => {
    const { Canvas, Image } = require('canvas');
    
    return new Promise((resolve, reject) => {
        const img = new Image();
  
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));

        img.src = url;
    })
}