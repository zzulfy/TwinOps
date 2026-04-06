import axios from 'axios';

async function simpleCheck() {
  console.log('🚀 简单的页面资源检查...');

  try {
    // 测试页面加载
    console.log('\n1. 测试页面访问...');
    const pageResponse = await axios.get('http://localhost:8090/');
    console.log(`✅ 页面访问成功，状态码: ${pageResponse.status}`);

    // 检查页面内容
    const hasVueApp = pageResponse.data.includes('<div id="app"');
    console.log(`✅ Vue 应用容器存在: ${hasVueApp}`);

    // 测试模型文件访问
    const models = [
      { name: '建筑模型', path: '/models/base.glb' },
      { name: '设备模型', path: '/models/devices.glb' },
      { name: '线路模型', path: '/models/lines.gltf' }
    ];

    console.log('\n2. 测试模型文件访问...');
    for (const model of models) {
      try {
        const response = await axios.get(`http://localhost:8090${model.path}`, {
          responseType: 'arraybuffer',
          validateStatus: (status) => status < 400
        });
        const size = (response.headers['content-length'] / 1024 / 1024).toFixed(2);
        console.log(`✅ ${model.name} 可访问，大小: ${size} MB`);
      } catch (error) {
        console.error(`❌ ${model.name} 访问失败:`, error.message);
      }
    }

    // 测试 DRACO 压缩库访问
    const dracoFiles = [
      'draco_decoder.js',
      'draco_decoder.wasm',
      'draco_encoder.js',
      'draco_wasm_wrapper.js'
    ];

    console.log('\n3. 测试 DRACO 压缩库访问...');
    for (const file of dracoFiles) {
      try {
        const response = await axios.get(`http://localhost:8090/js/draco/gltf/${file}`, {
          validateStatus: (status) => status < 400
        });
        const size = (response.headers['content-length'] / 1024).toFixed(1);
        console.log(`✅ ${file} 可访问，大小: ${size} KB`);
      } catch (error) {
        console.error(`❌ ${file} 访问失败:`, error.message);
      }
    }

    // 检查页面标题
    const titleMatch = pageResponse.data.match(/<title>(.*?)<\/title>/);
    if (titleMatch) {
      console.log(`\n✅ 页面标题: ${titleMatch[1]}`);
    }

    console.log('\n🎉 简单检查完成！');
    console.log('现在请在浏览器中访问 http://localhost:8090/ 并检查控制台错误。');

  } catch (error) {
    console.error('\n❌ 检查过程中出现错误:');
    if (error.response) {
      console.error(`状态码: ${error.response.status}`);
    } else if (error.request) {
      console.error('无响应，请检查服务器是否正在运行');
    } else {
      console.error('错误信息:', error.message);
    }
  }
}

simpleCheck();
