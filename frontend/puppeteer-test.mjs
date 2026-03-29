import puppeteer from 'puppeteer';

const testThreeScene = async () => {
    console.log('=== 使用 Puppeteer 测试 Three.js 场景初始化 ===');

    // 启动浏览器
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: { width: 1920, height: 1080 }
    });

    try {
        // 打开新页面
        const page = await browser.newPage();

        // 设置请求超时
        page.setDefaultTimeout(30000);

        // 监听页面日志
        page.on('console', (msg) => {
            const text = msg.text();
            if (text.includes('Three.js') || text.includes('初始化')) {
                console.log(msg.text());
            }
        });

        // 监听错误
        page.on('pageerror', (err) => {
            console.error('❌ 页面错误:', err);
        });

        // 访问页面
        console.log('访问页面: http://localhost:8095/');
        await page.goto('http://localhost:8095/');

        // 等待页面加载
        console.log('等待页面加载完成...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // 检查 DOM 中的容器元素
        const containerExists = await page.evaluate(() => {
            return !!document.querySelector('.main-middle');
        });

        if (containerExists) {
            console.log('✅ Three.js 容器元素存在');
        } else {
            console.error('❌ 未找到 Three.js 容器元素');
        }

        // 截图保存
        const screenshotPath = 'scene-screenshot.png';
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`✅ 页面截图已保存到: ${screenshotPath}`);

        // 检查页面标题
        const title = await page.title();
        console.log(`✅ 页面标题: ${title}`);

        console.log('');
        console.log('=== 测试完成 ===');
        console.log('请查看 console 输出和截图');

    } catch (error) {
        console.error('❌ 测试过程中出错:', error);
    } finally {
        await browser.close();
    }
};

testThreeScene();
