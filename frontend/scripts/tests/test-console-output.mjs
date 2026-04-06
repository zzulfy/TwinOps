import puppeteer from 'puppeteer';

const testConsoleOutput = async () => {
    console.log('=== 测试页面控制台输出 ===');

    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: { width: 1920, height: 1080 }
    });

    try {
        const page = await browser.newPage();
        page.setDefaultTimeout(30000);

        // 监听页面的控制台输出
        page.on('console', (msg) => {
            console.log(`Page console [${msg.type() === 'warning' ? 'WARN' : msg.type() === 'error' ? 'ERROR' : 'INFO'}]:`, msg.text());
        });

        // 监听页面错误
        page.on('pageerror', (err) => {
            console.error('Page error:', err);
        });

        // 访问页面
        await page.goto('http://localhost:8090/');

        // 等待页面加载
        await new Promise(resolve => setTimeout(resolve, 10000));

        console.log('');
        console.log('=== 页面加载完成 ===');

        // 截图保存
        await page.screenshot({ path: 'console-output.png', fullPage: true });
        console.log('✅ 页面截图已保存到: console-output.png');

        console.log('');
        console.log('=== 测试完成 ===');

    } catch (error) {
        console.error('❌ 测试过程中出错:', error);
    } finally {
        await browser.close();
    }
};

testConsoleOutput();
