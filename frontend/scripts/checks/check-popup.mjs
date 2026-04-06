import puppeteer from 'puppeteer';

const checkPopup = async () => {
    console.log('=== 检查弹窗是否存在 ===');

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

                // 检查弹窗是否可见
                const isVisible = await page.evaluate(el => {
                    const style = window.getComputedStyle(el);
                    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
                }, popup);

                if (isVisible) {
                    console.log('✅ 弹窗可见');
                } else {
                    console.error('❌ 弹窗不可见');
                }

                // 检查是否可以复制文字
                const titleElement = await page.$('.device-detail-panel .header .title');
                if (titleElement) {
                    console.log('✅ 弹窗标题已找到');
                } else {
                    console.error('❌ 未找到弹窗标题');
                }

                // 截图保存（包含弹窗）
                await page.screenshot({ path: 'check-popup.png', fullPage: true });
                console.log('✅ 弹窗截图已保存到: check-popup.png');

                // 打印页面所有元素
                console.log('=== 页面所有元素 ===');
                const allElements = await page.evaluate(() => {
                    return Array.from(document.querySelectorAll('*')).map(el => {
                        return {
                            tagName: el.tagName,
                            className: el.className,
                            id: el.id
                        };
                    }).filter(el => el.className.includes('device') || el.className.includes('popup') || el.className.includes('detail'));
                });
                console.log(allElements);

            } else {
                console.error('❌ 未找到设备信息弹窗');
                await page.screenshot({ path: 'no-popup.png', fullPage: true });
                console.log('✅ 无弹窗截图已保存到: no-popup.png');

                // 打印页面所有元素
                console.log('=== 页面所有元素 ===');
                const allElements = await page.evaluate(() => {
                    return Array.from(document.querySelectorAll('*')).map(el => {
                        return {
                            tagName: el.tagName,
                            className: el.className,
                            id: el.id
                        };
                    }).filter(el => el.className.includes('device') || el.className.includes('popup') || el.className.includes('detail'));
                });
                console.log(allElements);
            }
        } else {
            console.error('❌ 未找到设备标签');
            await page.screenshot({ path: 'no-labels.png', fullPage: true });
            console.log('✅ 无设备标签截图已保存到: no-labels.png');
        }

        console.log('');
        console.log('=== 测试完成 ===');

    } catch (error) {
        console.error('❌ 测试过程中出错:', error);
    } finally {
        await browser.close();
    }
};

checkPopup();
