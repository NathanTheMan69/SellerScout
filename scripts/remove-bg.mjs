import { Jimp } from 'jimp';

const img = await Jimp.read('./public/logo.png');
const w = img.width;
const h = img.height;

// BFS flood fill from all edge pixels — mark connected dark pixels as "background"
const visited = new Uint8Array(w * h);
const queue = [];

const isDark = (x, y) => {
    const hex = img.getPixelColor(x, y);
    const r = (hex >>> 24) & 0xff;
    const g = (hex >>> 16) & 0xff;
    const b = (hex >>>  8) & 0xff;
    return r < 60 && g < 60 && b < 60;
};

// Seed from every edge pixel that is dark
for (let x = 0; x < w; x++) {
    for (const y of [0, h - 1]) {
        const idx = y * w + x;
        if (!visited[idx] && isDark(x, y)) { visited[idx] = 1; queue.push([x, y]); }
    }
}
for (let y = 0; y < h; y++) {
    for (const x of [0, w - 1]) {
        const idx = y * w + x;
        if (!visited[idx] && isDark(x, y)) { visited[idx] = 1; queue.push([x, y]); }
    }
}

const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
let i = 0;
while (i < queue.length) {
    const [cx, cy] = queue[i++];
    for (const [dx, dy] of dirs) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const idx = ny * w + nx;
        if (!visited[idx] && isDark(nx, ny)) {
            visited[idx] = 1;
            queue.push([nx, ny]);
        }
    }
}

// Make ALL dark pixels transparent (flood-filled outer bg + any remaining dark interior pockets)
for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
        if (visited[y * w + x] || isDark(x, y)) {
            img.setPixelColor(0x00000000, x, y);
        }
    }
}

await img.write('./public/logo.png');
console.log('Done — background removed via flood fill');
