const http = require('http');
const fs = require('fs');

// 简单的测试脚本，用于检查页面是否能正常加载
console.log('=== 测试 Three.js 场景初始化 ===');
console.log(`服务器地址: http://localhost:8093/`);

// 检查页面响应
http.get('http://localhost:8093/', (res) => {
    console.log(`HTTP 状态码: ${res.statusCode}`);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        // 检查页面内容
        if (data.includes('TwinOps')) {
            console.log('✅ 页面标题正确');
        }

        if (data.includes('threeContainer')) {
            console.log('✅ Three.js 容器元素存在');
        }

        // 检查 Vue 相关内容
        if (data.includes('vue')) {
            console.log('✅ Vue 应用已加载');
        }

        console.log('');
        console.log('=== 测试说明 ===');
        console.log('此测试脚本只能检查页面是否能正常访问和基本内容');
        console.log('要完整验证 Three.js 场景是否正常初始化，需要在浏览器中访问');
        console.log('http://localhost:8093/ 并打开开发者工具查看控制台');
        console.log('');
        console.log('预期结果:');
        console.log('- 页面加载正常');
        console.log('- 控制台显示 "Three.js 场景初始化成功"');
        console.log('- 3D 场景可见');
    });

}).on('error', (err) => {
    console.error('❌ 无法访问页面:', err.message);
});
