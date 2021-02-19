module.exports = msgAttach => {
    const url = msgAttach.url;

    const isPng = url.indexOf("png", url.length - "png".length);
    const isJpg = url.indexOf("jpg", url.length - "jpg".length);
    const isJpeg = url.indexOf("jpeg", url.length - "jpeg".length);

    isImage = false;
    if ((isPng !== -1) || (isJpg !== -1) || (isJpeg !== -1)) {
        isImage = true;
    }

    return isImage;
}