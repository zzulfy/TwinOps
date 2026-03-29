import puppeteer from 'puppeteer';

const testPopupVisual = async () => {
    console.log('=== 可视化测试设备信息弹窗功能 ===');

    const browser = await puppeteer.launch({
        headless: false, // 可视化模式
        defaultViewport: { width: 1920, height: 1080 },
        args: ['--start-maximized'] // 最大化窗口
    });

    try {
        const page = await browser.newPage();
        page.setDefaultTimeout(30000);

        // 访问页面
        await page.goto('http://localhost:8091/');

        // 等待页面加载
        await new Promise(resolve => setTimeout(resolve, 5000));

        console.log('=== 页面已加载 ===');

        // 检查页面标题
        const title = await page.title();
        console.log(`✅ 页面标题: ${title}`);

        // 查找设备标签
        const labels = await page.$$('.label');
        console.log(`✅ 找到设备标签数量: ${labels.length}`);

        if (labels.length > 0) {
            // 点击第一个设备标签
            console.log('=== 点击第一个设备标签 ===');
            await page.evaluate(el => el.click(), labels[0]);

            // 等待弹窗出现
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 检查弹窗是否存在
            const popup = await page.$('.device-detail-panel');
            if (popup) {
                console.log('✅ 设备信息弹窗已显示');

                // 获取弹窗的位置和尺寸
                const popupBoundingBox = await popup.boundingBox();
                if (popupBoundingBox) {
                    console.log(`✅ 弹窗位置: (${Math.round(popupBoundingBox.x)}, ${Math.round(popupBoundingBox.y)})`);
                    console.log(`✅ 弹窗尺寸: ${Math.round(popupBoundingBox.width)}x${Math.round(popupBoundingBox.height)}`);
                }

                // 截图保存（包含弹窗）
                await page.screenshot({ path: 'popup-visual.png', fullPage: true });
                console.log('✅ 弹窗截图已保存到: popup-visual.png');

                // 点击关闭按钮
                console.log('=== 点击关闭按钮 ===');
                const closeBtn = await page.$('.close-btn');
                if (closeBtn) {
                    await page.evaluate(el => el.click(), closeBtn);
                    console.log('✅ 已点击关闭按钮');

                    // 等待弹窗消失
                    await new Promise(resolve => setTimeout(resolve, 500));

                    // 检查弹窗是否仍然存在
                    const popupVisible = await page.$('.device-detail-panel');
                    if (!popupVisible) {
                        console.log('✅ 设备信息弹窗已成功关闭');
                    } else {
                        console.error('❌ 设备信息弹窗未关闭');
                    }
                } else {
                    console.error('❌ 未找到关闭按钮');
                }
            } else {
                console.error('❌ 未找到设备信息弹窗');
                await page.screenshot({ path: 'no-popup.png', fullPage: true });
                console.log('✅ 无弹窗截图已保存到: no-popup.png');
            }
        } else {
            console.error('❌ 未找到设备标签');
            await page.screenshot({ path: 'no-labels.png', fullPage: true });
            console.log('✅ 无设备标签截图已保存到: no-labels.png');
        }

        // 最后截图
        await page.screenshot({ path: 'final-visual-test.png', fullPage: true });
        console.log('✅ 最终截图已保存到: final-visual-test.png');

        console.log('');
        console.log('=== 测试完成 ===');

    } catch (error) {
        console.error('❌ 测试过程中出错:', error);
    } finally {
        await browser.close();
    }
};

testPopupVisual();
