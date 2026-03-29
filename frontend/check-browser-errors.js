import puppeteer from 'puppeteer';

async function checkBrowserErrors() {
  console.log('🚀 启动浏览器检查...');

  try {
    // 启动浏览器 - 使用 headless 模式
    const browser = await puppeteer.launch({
      headless: 'new', // 使用新的 headless 模式
      executablePath: 'C:\\Users\\luofeiyun\\.cache\\puppeteer\\chrome-headless-shell\\win64-144.0.7559.96\\chrome-headless-shell-win64\\chrome-headless-shell.exe',
      args: ['--window-size=1200,800'],
      defaultViewport: null
    });

    // 打开新页面
    const page = await browser.newPage();

    // 监听控制台消息
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('❌ 控制台错误:', msg.text());
      } else if (msg.type() === 'warning') {
        console.warn('⚠️  控制台警告:', msg.text());
      } else {
        console.log('ℹ️  控制台信息:', msg.text());
      }
    });

    // 监听页面错误
    page.on('pageerror', (error) => {
      console.error('❌ 页面错误:', error);
    });

    console.log('📱 访问页面 http://localhost:8090/');
    await page.goto('http://localhost:8090/', {
      waitUntil: 'load', // 只等待页面加载完成
      timeout: 120000 // 120秒超时
    });

    console.log('✅ 页面加载完成');

    // 等待 3 秒让模型有足够时间加载
    console.log('⏳ 等待 3 秒让模型加载...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 检查页面标题
    const title = await page.title();
    console.log(`📄 页面标题: ${title}`);

    // 检查是否有 Vue 应用
    const hasApp = await page.evaluate(() => {
      return document.getElementById('app') !== null;
    });
    console.log(`🎯 Vue 应用容器存在: ${hasApp}`);

    // 检查 Three.js 相关元素是否存在
    const hasCanvas = await page.evaluate(() => {
      const canvases = document.querySelectorAll('canvas');
      return canvases.length > 0;
    });
    console.log(`🎨 Canvas 元素存在: ${hasCanvas}`);

    // 检查是否有模型加载失败的迹象
    const hasLoadingError = await page.evaluate(() => {
      const errors = window.__errors || [];
      return errors.some(err =>
        err.includes('模型') ||
        err.includes('加载失败') ||
        err.includes('Three.js') ||
        err.includes('GLTF')
      );
    });

    console.log(`🔍 模型加载失败检查: ${hasLoadingError ? '❌ 有模型加载失败' : '✅ 模型加载成功'}`);

    // 截图保存
    const screenshotPath = 'screenshots/browser-check.png';
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    console.log(`📸 截图已保存: ${screenshotPath}`);

    // 保持浏览器打开供用户观察
    console.log('\n🎉 检查完成！');
    console.log('请在浏览器窗口中观察：');
    console.log('1. 3D 场景是否正常显示');
    console.log('2. 设备模型是否加载');
    console.log('3. 控制台是否有其他错误');
    console.log('4. 交互是否流畅');

    console.log('\n按 Ctrl+C 停止并关闭浏览器');

  } catch (error) {
    console.error('❌ 检查过程中出现错误:', error);
    process.exit(1);
  }
}

checkBrowserErrors();
