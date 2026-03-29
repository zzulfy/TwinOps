import axios from 'axios';
import * as cheerio from 'cheerio';

async function testApp() {
    try {
        console.log('🚀 开始测试应用程序...');

        // 测试页面访问
        console.log('\n1. 测试页面访问...');
        const response = await axios.get('http://localhost:8091/');
        console.log(`✅ 页面访问成功，状态码: ${response.status}`);

        // 解析 HTML
        const $ = cheerio.load(response.data);
        console.log(`✅ 页面标题: ${$('title').text()}`);

        // 检查是否有 Vue app 容器
        if ($('#app').length > 0) {
            console.log('✅ Vue app 容器存在');
        } else {
            console.error('❌ Vue app 容器不存在');
        }

        // 检查是否加载了必要的资源
        const links = [];
        $('link').each((i, el) => {
            links.push($(el).attr('href'));
        });

        const scripts = [];
        $('script').each((i, el) => {
            if ($(el).attr('src')) {
                scripts.push($(el).attr('src'));
            }
        });

        console.log(`\n2. 资源加载检查:`);
        console.log(`   - CSS 资源数量: ${links.length}`);
        console.log(`   - JS 资源数量: ${scripts.length}`);

        // 检查是否有 Three.js 相关的加载
        const hasThree = scripts.some(script => script.includes('three') || script.includes('Three'));
        if (hasThree) {
            console.log('✅ Three.js 资源已加载');
        } else {
            console.warn('⚠️  Three.js 资源未在初始 HTML 中找到');
        }

        console.log('\n🎉 应用程序基本功能测试完成！');
        console.log('\n接下来请手动在浏览器中访问 http://localhost:8090/ 并检查：');
        console.log('1. 浏览器控制台是否有错误');
        console.log('2. Three.js 场景是否正确显示');
        console.log('3. 设备模型是否加载成功');
        console.log('4. 弹窗功能是否正常');
        console.log('5. 3D 交互是否流畅');

    } catch (error) {
        console.error('\n❌ 测试过程中出现错误:');
        if (error.response) {
            console.error(`状态码: ${error.response.status}`);
            console.error(`响应内容: ${error.response.data}`);
        } else if (error.request) {
            console.error('无响应，请检查服务器是否正在运行');
        } else {
            console.error('错误信息:', error.message);
        }
    }
}

testApp();
