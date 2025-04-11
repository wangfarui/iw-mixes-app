// 首次运行时，执行以下命令
// node scripts/convert-svg-to-base64.js
// 后续运行时，执行以下命令
// npm run update-icons

const fs = require('fs');
const path = require('path');

// 递归获取目录下所有 SVG 文件
function getAllSvgFiles(dir) {
    let results = [];
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            results = results.concat(getAllSvgFiles(fullPath));
        } else if (file.endsWith('.svg')) {
            results.push(fullPath);
        }
    }

    return results;
}

// 将 SVG 文件转换为 Base64
function convertSvgToBase64(svgPath) {
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    const base64 = Buffer.from(svgContent).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
}

// 生成图标映射对象
function generateIconMap() {
    const svgDir = path.join(__dirname, '../static/bookkeeping');
    const svgFiles = getAllSvgFiles(svgDir);
    
    const iconMap = {};
    svgFiles.forEach(svgPath => {
        // 获取相对于 static/bookkeeping 的路径作为 key，并确保以 / 开头
        const relativePath = path.relative(svgDir, svgPath);
        const key = '/' + relativePath.replace(/\\/g, '/').replace('.svg', '');
        iconMap[key] = convertSvgToBase64(svgPath);
    });

    return iconMap;
}

// 生成最终的 JavaScript 文件
function generateIconJs() {
    const iconMap = generateIconMap();
    const jsContent = `// 自动生成的图标映射表
const iconMap = ${JSON.stringify(iconMap, null, 2)}

export function getIconUrl(icon) {
	// #ifdef MP-WEIXIN
	return iconMap[icon] || \`/static/bookkeeping/\${icon}.svg\`
	// #endif
	// #ifndef MP-WEIXIN
	return \`/static/bookkeeping/\${icon}.svg\`
	// #endif
}`;

    fs.writeFileSync(path.join(__dirname, '../utils/icon.js'), jsContent);
    console.log('图标映射表已生成！');
}

generateIconJs(); 