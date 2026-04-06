import puppeteer from 'puppeteer';

const testSceneStatus = async () => {
    console.log('=== 测试场景状态 ===');

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1920, height: 1080 }
    });

    try {
        const page = await browser.newPage();
        page.setDefaultTimeout(30000);

        // 访问页面
        await page.goto('http://localhost:8090/');

        // 等待页面加载
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log('=== 页面已加载 ===');

        // 检查页面标题
        const title = await page.title();
        console.log(`✅ 页面标题: ${title}`);

        // 检查页面中的关键元素
        console.log('=== 检查页面元素 ===');

        // 检查容器
        const container = await page.$('.main-middle');
        if (container) {
            console.log('✅ 3D场景容器已找到');
        } else {
            console.error('❌ 未找到3D场景容器');
        }

        // 检查Three.js渲染器
        const canvas = await page.$('canvas');
        if (canvas) {
            console.log('✅ Three.js渲染器已找到');
        } else {
            console.error('❌ 未找到Three.js渲染器');
        }

        // 检查所有DOM元素
        console.log('=== 页面DOM元素 ===');
        const html = await page.evaluate(() => document.body.innerHTML);
        console.log(html);

        // 检查控制台输出
        page.on('console', (msg) => {
            console.log('Page console:', msg.text());
        });

        // 截图保存
        await page.screenshot({ path: 'scene-status.png', fullPage: true });
        console.log('✅ 场景状态截图已保存到: scene-status.png');

        console.log('');
        console.log('=== 测试完成 ===');

    } catch (error) {
        console.error('❌ 测试过程中出错:', error);
    } finally {
        await browser.close();
    }
};

testSceneStatus();
