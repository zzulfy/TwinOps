import puppeteer from 'puppeteer';

(async () => {
  console.log('启动浏览器...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });

  try {
    const page = await browser.newPage();

    // 监听控制台错误
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('浏览器控制台错误:', msg.text());
      } else if (msg.type() === 'warning') {
        console.warn('浏览器控制台警告:', msg.text());
      } else {
        console.log('浏览器控制台信息:', msg.text());
      }
    });

    // 监听页面错误
    page.on('pageerror', (error) => {
      console.error('页面错误:', error);
    });

    console.log('访问页面 http://localhost:8091/...');
    await page.goto('http://localhost:8091/', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    console.log('页面标题:', await page.title());

    // 等待 5 秒让 Three.js 场景初始化和模型加载
    console.log('等待场景初始化和模型加载...');
    await page.waitForTimeout(5000);

    console.log('检查是否有 Three.js 相关的错误...');

    // 检查页面是否包含 Three.js 场景
    const hasThreeContainer = await page.evaluate(() => {
      return document.querySelector('.main-middle');
    });

    if (hasThreeContainer) {
      console.log('✅ Three.js 容器已找到');
    } else {
      console.error('❌ 未找到 Three.js 容器');
    }

    // 检查是否有弹窗相关的元素
    const hasPopupElements = await page.evaluate(() => {
      return document.querySelectorAll('.device-detail-panel, .alarm-device-list').length > 0;
    });

    if (hasPopupElements) {
      console.log('✅ 弹窗组件已找到');
    } else {
      console.error('❌ 未找到弹窗组件');
    }

    // 检查是否有加载完成的标志
    const isLoadingComplete = await page.evaluate(() => {
      return !document.querySelector('.layout-loading');
    });

    if (isLoadingComplete) {
      console.log('✅ 页面加载完成');
    } else {
      console.warn('⚠️ 页面仍在加载中');
    }

    console.log('检查完成');

  } catch (error) {
    console.error('访问页面时出错:', error);
  }

  await browser.close();
})();
