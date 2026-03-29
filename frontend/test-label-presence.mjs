import puppeteer from 'puppeteer';

const testLabelPresence = async () => {
    console.log('=== 测试设备标签存在性 ===');

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

        // 检查 Three.js DOM 元素
        console.log('=== Three.js 渲染器信息 ===');
        const canvas = await page.$('canvas');
        if (canvas) {
            const canvasBoundingBox = await canvas.boundingBox();
            if (canvasBoundingBox) {
                console.log(`✅ Canvas 尺寸: ${canvasBoundingBox.width}x${canvasBoundingBox.height}`);
            }
        } else {
            console.error('❌ 未找到 Three.js 渲染器');
        }

        // 检查 CSS2DRenderer 中的元素
        console.log('=== CSS2DRenderer 信息 ===');
        const cssRenderer = await page.$('.css2d-renderer');
        if (cssRenderer) {
            const rendererBoundingBox = await cssRenderer.boundingBox();
            if (rendererBoundingBox) {
                console.log(`✅ CSS2DRenderer 尺寸: ${rendererBoundingBox.width}x${rendererBoundingBox.height}`);
            }

            // 检查设备标签是否在 CSS2DRenderer 中
            const deviceLabels = await page.$$('.css2d-renderer .label');
            console.log(`✅ 找到设备标签数量: ${deviceLabels.length}`);

            // 如果找到设备标签，检查它们的内容
            if (deviceLabels.length > 0) {
                console.log('=== 设备标签内容 ===');
                for (let i = 0; i < Math.min(5, deviceLabels.length); i++) {
                    const text = await page.evaluate(el => el.textContent, deviceLabels[i]);
                    console.log(`标签 ${i + 1}: ${text}`);
                }

                // 尝试点击第一个设备标签
                console.log('=== 尝试点击设备标签 ===');
                try {
                    await deviceLabels[0].click();
                    console.log('✅ 成功点击设备标签');

                    // 检查是否有弹窗出现
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    const popup = await page.$('.device-detail-panel');
                    if (popup) {
                        console.log('✅ 设备信息弹窗已显示');

                        // 测试点击关闭按钮
                        const closeBtn = await page.$('.close-btn');
                        if (closeBtn) {
                            await closeBtn.click();
                            console.log('✅ 成功点击关闭按钮');

                            // 检查弹窗是否关闭
                            await new Promise(resolve => setTimeout(resolve, 500));
                            const popupVisible = await page.$('.device-detail-panel');
                            if (!popupVisible) {
                                console.log('✅ 设备信息弹窗已成功关闭');
                            } else {
                                console.error('❌ 设备信息弹窗未关闭');
                            }
                        }
                    } else {
                        console.error('❌ 未找到设备信息弹窗');
                    }
                } catch (error) {
                    console.error('❌ 点击设备标签时出错:', error);
                }
            }
        } else {
            console.error('❌ 未找到 CSS2DRenderer');
        }

        // 截图保存
        await page.screenshot({ path: 'label-presence.png', fullPage: true });
        console.log('✅ 页面截图已保存到: label-presence.png');

        console.log('');
        console.log('=== 测试完成 ===');

    } catch (error) {
        console.error('❌ 测试过程中出错:', error);
    } finally {
        await browser.close();
    }
};

testLabelPresence();
