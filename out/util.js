export async function loadImage(src) {
    return await new Promise((resolve, _reject) => {
        var img = new Image();
        img.onload = () => resolve(img);
        img.src = src;
    });
}
//# sourceMappingURL=util.js.map