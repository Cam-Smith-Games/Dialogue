export async function loadImage(src:string):Promise<HTMLImageElement> {
    return await new Promise((resolve, _reject) => {
        var img = new Image();
        img.onload = () => resolve(img);
        img.src = src;
    });
}
