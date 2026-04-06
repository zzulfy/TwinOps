import puppeteer from 'puppeteer';

const testPopupClose = async () => {
    console.log('=== 测试弹窗关闭功能 ===');

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1920, height: 1080 }
    });

    try {
        const page = await browser.newPage();
        page.setDefaultTimeout(30000);

        // 访问页面
        await page.goto('http://localhost:8092/');

        // 等待页面加载
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log('=== 页面已加载 ===');

        // 检查页面标题
        const title = await page.title();
        console.log(`✅ 页面标题: ${title}`);

        // 测试点击打开弹窗
        console.log('=== 点击 WidgetPanel06 打开弹窗 ===');
        const widgetSelector = '.wrap';
        try {
            await page.waitForSelector(widgetSelector, { timeout: 5000 });
            console.log('✅ WidgetPanel06 已找到');

            // 点击列表区域打开弹窗
            await page.click(widgetSelector);
            console.log('✅ 已点击 WidgetPanel06');

            // 等待弹窗出现
            const popupSelector = '.alarm-device-list';
            await page.waitForSelector(popupSelector, { timeout: 5000 });
            console.log('✅ 弹窗已显示');

            // 测试点击关闭按钮
            console.log('=== 点击关闭按钮 ===');
            const closeSelector = '.close-btn';
            await page.waitForSelector(closeSelector, { timeout: 5000 });
            await page.click(closeSelector);
            console.log('✅ 已点击关闭按钮');

            // 等待弹窗消失
            await page.waitForSelector(popupSelector, { hidden: true, timeout: 5000 });
            console.log('✅ 弹窗已成功关闭');

        } catch (error) {
            console.error('❌ 弹窗测试失败:', error);
            // 截图保存
            await page.screenshot({ path: 'popup-error.png', fullPage: true });
            console.log('✅ 错误截图已保存到: popup-error.png');
        }

        // 最后截图
        await page.screenshot({ path: 'final-page.png', fullPage: true });
        console.log('✅ 最终页面截图已保存到: final-page.png');

        console.log('');
        console.log('=== 测试完成 ===');

    } catch (error) {
        console.error('❌ 测试过程中出错:', error);
    } finally {
        await browser.close();
    }
};

testPopupClose();
