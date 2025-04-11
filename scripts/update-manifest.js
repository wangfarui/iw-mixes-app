const fs = require('fs');
const path = require('path');

// 动态导入配置文件
const configPath = path.join(__dirname, '../config/index.js');
let mpConfig;
try {
    mpConfig = require(configPath);
} catch (error) {
    console.error('请先创建配置文件 config/index.js');
    process.exit(1);
}

// 读取模板文件
const templatePath = path.join(__dirname, '../manifest.template.json');
const manifestPath = path.join(__dirname, '../manifest.json');

// 如果 manifest.json 不存在，从模板创建
if (!fs.existsSync(manifestPath)) {
    fs.copyFileSync(templatePath, manifestPath);
    console.log('已从模板创建 manifest.json');
}

// 读取 manifest.json
let manifestContent = fs.readFileSync(manifestPath, 'utf8');

// 移除注释
manifestContent = manifestContent.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');

// 解析 JSON
const manifest = JSON.parse(manifestContent);

// 更新 appid
manifest['appid'] = mpConfig.mpConfig.appid;
manifest['mp-weixin']['appid'] = mpConfig.mpConfig.appid;

// 写入更新后的 manifest.json
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log('manifest.json 已更新！'); 