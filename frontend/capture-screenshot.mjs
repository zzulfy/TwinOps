import puppeteer from 'puppeteer';
import { existsSync, statSync } from 'fs';

const captureScreenshot = async () => {
    console.log('=== 开始捕获项目截图 ===');

    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: { width: 1920, height: 1080 }
    });

    try {
        const page = await browser.newPage();
        page.setDefaultTimeout(30000);

        // 访问页面
        await page.goto('http://localhost:8090/');

        // 等待页面加载完成
        await new Promise(resolve => setTimeout(resolve, 5000));

        console.log('=== 页面加载完成 ===');

        // 检查页面标题
        const title = await page.title();
        console.log(`✅ 页面标题: ${title}`);

        // 截图保存
        await page.screenshot({ path: 'screenshot01.png', fullPage: true });
        console.log('✅ 项目截图已保存到: screenshot01.png');

        // 检查截图文件是否存在
        if (existsSync('screenshot01.png')) {
            console.log('✅ 截图文件已成功创建');
            const stats = statSync('screenshot01.png');
            console.log(`✅ 截图文件大小: ${(stats.size / 1024).toFixed(2)} KB`);
        } else {
            console.error('❌ 截图文件未创建');
        }

        console.log('');
        console.log('=== 截图完成 ===');

    } catch (error) {
        console.error('❌ 截图过程中出错:', error);
    } finally {
        await browser.close();
    }
};

captureScreenshot();
