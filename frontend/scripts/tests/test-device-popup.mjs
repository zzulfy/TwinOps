import puppeteer from 'puppeteer';

const testDevicePopup = async () => {
    console.log('=== 测试设备信息弹窗功能 ===');

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
        await new Promise(resolve => setTimeout(resolve, 5000));

        console.log('=== 页面已加载 ===');

        // 检查页面标题
        const title = await page.title();
        console.log(`✅ 页面标题: ${title}`);

        // 测试点击设备标签打开弹窗
        console.log('=== 点击设备标签打开弹窗 ===');
        try {
            // 查找并点击标签
            const labelSelector = '.label';
            await page.waitForSelector(labelSelector, { timeout: 5000 });
            console.log('✅ 设备标签已找到');

            // 获取标签元素
            const labels = await page.$$(labelSelector);
            if (labels.length > 0) {
                // 使用 JavaScript 点击，避免元素不在视口内的问题
                await page.evaluate(el => el.click(), labels[0]);
                console.log('✅ 已点击设备标签');

                // 等待弹窗出现
                const popupSelector = '.device-detail-panel';
                await page.waitForSelector(popupSelector, { timeout: 5000 });
                console.log('✅ 设备信息弹窗已显示');

                // 测试文字是否可以复制
                console.log('=== 测试文字是否可以复制 ===');
                const titleSelector = '.device-detail-panel .header .title';
                const titleElement = await page.$(titleSelector);
                if (titleElement) {
                    // 尝试选中文字
                    await page.evaluate((el) => {
                        const range = document.createRange();
                        range.selectNode(el);
                        const selection = window.getSelection();
                        selection?.removeAllRanges();
                        selection?.addRange(range);
                    }, titleElement);

                    // 模拟复制操作
                    await page.keyboard.down('Control');
                    await page.keyboard.press('C');
                    await page.keyboard.up('Control');
                    console.log('✅ 文字复制操作已执行');
                }

                // 测试点击关闭按钮
                console.log('=== 点击关闭按钮 ===');
                const closeSelector = '.close-btn';
                await page.waitForSelector(closeSelector, { timeout: 5000 });
                // 使用 JavaScript 点击关闭按钮
                await page.evaluate(() => {
                    const closeBtn = document.querySelector('.close-btn');
                    if (closeBtn) {
                        closeBtn.click();
                    }
                });
                console.log('✅ 已点击关闭按钮');

                // 等待弹窗消失
                await page.waitForSelector(popupSelector, { hidden: true, timeout: 5000 });
                console.log('✅ 设备信息弹窗已成功关闭');
            } else {
                console.error('❌ 未找到设备标签');
            }

        } catch (error) {
            console.error('❌ 弹窗测试失败:', error);
            // 截图保存
            await page.screenshot({ path: 'device-popup-error.png', fullPage: true });
            console.log('✅ 错误截图已保存到: device-popup-error.png');
        }

        // 最后截图
        await page.screenshot({ path: 'final-device-page.png', fullPage: true });
        console.log('✅ 最终页面截图已保存到: final-device-page.png');

        console.log('');
        console.log('=== 测试完成 ===');

    } catch (error) {
        console.error('❌ 测试过程中出错:', error);
    } finally {
        await browser.close();
    }
};

testDevicePopup();
