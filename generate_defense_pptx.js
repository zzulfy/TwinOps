const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "罗飞云";
pres.title = "数据中心数字孪生智能运维平台的开发与实现";

// ============================================================
// Color Palette — Midnight Tech
// ============================================================
const C = {
  bgDark:    "0B1120",
  bgMid:     "111827",
  bgCard:    "1E293B",
  accent:    "0EA5E9",
  accent2:   "06B6D4",
  accent3:   "3B82F6",
  green:     "10B981",
  orange:    "F59E0B",
  red:       "EF4444",
  purple:    "8B5CF6",
  textWhite: "F8FAFC",
  textMuted: "94A3B8",
  textDark:  "0F172A",
  lightBg:   "F1F5F9",
  lightCard: "FFFFFF",
};
const FT = "Arial";
const FB = "Arial";
const mkShadow = () => ({ type: "outer", blur: 4, offset: 2, angle: 135, color: "000000", opacity: 0.25 });

// ============================================================
// Helpers
// ============================================================
function darkHeader(s, section, title) {
  s.background = { color: C.bgDark };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.accent } });
  s.addText(section ? `${section}  ${title}` : title, {
    x: 0.7, y: 0.3, w: 8.6, h: 0.55,
    fontSize: 24, fontFace: FT, color: C.textWhite, bold: true, margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}

function lightHeader(s, section, title) {
  s.background = { color: C.lightBg };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.accent } });
  s.addText(section ? `${section}  ${title}` : title, {
    x: 0.7, y: 0.3, w: 8.6, h: 0.55,
    fontSize: 24, fontFace: FT, color: C.textDark, bold: true, margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}

function darkCard(s, x, y, w, h, accentColor) {
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: C.bgCard }, shadow: mkShadow() });
  if (accentColor) s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.05, fill: { color: accentColor } });
}

function lightCard(s, x, y, w, h, accentColor) {
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: C.lightCard }, shadow: mkShadow() });
  if (accentColor) s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.05, fill: { color: accentColor } });
}

// Bullet text helper
function addBullets(s, x, y, w, h, items, opts = {}) {
  const color = opts.color || C.textMuted;
  const fontSize = opts.fontSize || 11;
  const spacing = opts.spacing || 1.3;
  s.addText(items.map(item => ({
    text: item, options: { breakLine: true, fontSize, color, fontFace: FB }
  })), { x, y, w, h, lineSpacingMultiple: spacing, margin: 0 });
}

// ============================================================
// Slide 1 — 封面
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bgDark };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.accent } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.0, w: 0.04, h: 2.6, fill: { color: C.accent } });
  s.addText("数据中心数字孪生\n智能运维平台的开发与实现", {
    x: 1.0, y: 1.0, w: 8.0, h: 1.8, fontSize: 36, fontFace: FT, color: C.textWhite, bold: true, lineSpacingMultiple: 1.2, margin: 0
  });
  s.addText("Development and Implementation of a Data Center Digital Twin\nIntelligent Operation and Maintenance Platform", {
    x: 1.0, y: 2.7, w: 8.0, h: 0.7, fontSize: 13, fontFace: FB, color: C.textMuted, italic: true, lineSpacingMultiple: 1.3, margin: 0
  });
  s.addText("答辩人：罗飞云    指导教师：吴云鹏 副教授", {
    x: 1.0, y: 3.8, w: 8.0, h: 0.4, fontSize: 14, fontFace: FB, color: C.textMuted, margin: 0
  });
  s.addText("计算机科学与技术  |  计算机与人工智能学院  |  郑州大学", {
    x: 1.0, y: 4.2, w: 8.0, h: 0.35, fontSize: 12, fontFace: FB, color: C.textMuted, margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 1.0, y: 4.75, w: 1.0, h: 0.35, fill: { color: C.accent } });
  s.addText("2026", {
    x: 1.0, y: 4.75, w: 1.0, h: 0.35, fontSize: 12, fontFace: FB, color: C.bgDark, bold: true, align: "center", valign: "middle", margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}


// ============================================================
// Slide 2 — 目录
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "", "目录");
  const items = [
    { num: "01", title: "研究背景与意义", desc: "四大运维痛点与研究目标" },
    { num: "02", title: "问题描述", desc: "研究现状、不足与系统架构" },
    { num: "03", title: "巡检低效→三维可视化", desc: "程序化场景与状态驱动视觉" },
    { num: "04", title: "数据孤岛→统一数据平台", desc: "数据汇聚与异步架构" },
    { num: "05", title: "诊断靠经验→AERCA因果发现", desc: "特征工程与因果推理" },
    { num: "06", title: "报告靠人工→LLM智能报告", desc: "双模型策略与降级容错" },
    { num: "07", title: "测试验证", desc: "四个痛点的验证结果" },
    { num: "08", title: "结论与致谢", desc: "贡献总结" },
  ];
  items.forEach((item, i) => {
    const yBase = 1.0 + i * 0.55;
    s.addShape(pres.shapes.OVAL, { x: 0.7, y: yBase, w: 0.38, h: 0.38, fill: { color: i === 0 ? C.accent : C.bgCard } });
    s.addText(item.num, {
      x: 0.7, y: yBase, w: 0.38, h: 0.38, fontSize: 12, fontFace: FB, color: i === 0 ? C.bgDark : C.accent, bold: true, align: "center", valign: "middle", margin: 0
    });
    s.addText(item.title, { x: 1.25, y: yBase - 0.02, w: 2.5, h: 0.24, fontSize: 14, fontFace: FB, color: C.textWhite, bold: true, margin: 0 });
    s.addText(item.desc, { x: 1.25, y: yBase + 0.2, w: 4.0, h: 0.18, fontSize: 10, fontFace: FB, color: C.textMuted, margin: 0 });
  });
  // Right panel — problem→solution mapping
  s.addShape(pres.shapes.RECTANGLE, { x: 6.0, y: 0.9, w: 3.5, h: 4.3, fill: { color: C.bgCard } });
  s.addShape(pres.shapes.RECTANGLE, { x: 6.0, y: 0.9, w: 0.06, h: 4.3, fill: { color: C.accent } });
  s.addText("核心主线", { x: 6.2, y: 1.1, w: 3.1, h: 0.35, fontSize: 16, fontFace: FT, color: C.accent, bold: true, margin: 0 });
  const mappings = [
    "巡检低效 → 三维可视化",
    "数据孤岛 → 统一数据平台",
    "诊断靠经验 → 因果发现",
    "报告靠人工 → LLM智能报告",
  ];
  mappings.forEach((m, i) => {
    s.addText(m, { x: 6.2, y: 1.7 + i * 0.55, w: 3.1, h: 0.4, fontSize: 12, fontFace: FB, color: C.textWhite, margin: 0 });
    if (i < 3) s.addText("↓", { x: 6.2, y: 2.0 + i * 0.55, w: 3.1, h: 0.25, fontSize: 14, fontFace: FB, color: C.accent, align: "center", margin: 0 });
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}


// ============================================================
// Slide 3 — 研究背景
// ============================================================
{
  const s = pres.addSlide();
  lightHeader(s, "01", "研究背景");
  const stats = [
    { val: "1000万+", label: "标准机架", color: C.accent },
    { val: "32台", label: "电力设备", color: C.accent2 },
    { val: "10项", label: "遥测指标", color: C.accent3 },
    { val: "9项", label: "核心功能", color: C.green },
  ];
  stats.forEach((st, i) => {
    const x = 0.7 + i * 2.25;
    lightCard(s, x, 1.0, 2.0, 1.2, st.color);
    s.addText(st.val, { x, y: 1.15, w: 2.0, h: 0.5, fontSize: 24, fontFace: FB, color: st.color, bold: true, align: "center", margin: 0 });
    s.addText(st.label, { x, y: 1.65, w: 2.0, h: 0.3, fontSize: 12, fontFace: FB, color: "475569", align: "center", margin: 0 });
  });
  addBullets(s, 0.7, 2.5, 8.6, 2.5, [
    "全国在用机架规模持续增长，数据中心数量和规模快速扩张",
    "电力设备（高压开关柜、UPS、精密配电柜等）运行状态直接决定供电可靠性",
    "传统运维模式已难以满足现代数据中心对高可靠性和智能化管理的需求",
    "数字孪生技术有望构建从数据感知到决策辅助的完整运维闭环",
  ], { color: C.textDark, fontSize: 12, spacing: 1.5 });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}


// ============================================================
// Slide 4 — 四大运维痛点
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "01", "四大运维痛点");
  const pains = [
    { num: "01", title: "巡检低效", desc: "设备种类繁多，人工巡检难以全覆盖，漏检率高", color: C.accent },
    { num: "02", title: "数据孤岛", desc: "运维数据分散在多个独立子系统，缺乏统一汇聚平台", color: C.accent2 },
    { num: "03", title: "诊断靠经验", desc: "缺乏因果推理手段，难以区分故障根源与级联受害者", color: C.orange },
    { num: "04", title: "报告靠人工", desc: "运维报告人工撰写，效率低、质量参差不齐", color: C.red },
  ];
  pains.forEach((p, i) => {
    const x = 0.7 + i * 2.25;
    darkCard(s, x, 1.0, 2.0, 2.5, p.color);
    s.addShape(pres.shapes.OVAL, { x: x + 0.7, y: 1.25, w: 0.5, h: 0.5, fill: { color: p.color } });
    s.addText(p.num, { x: x + 0.7, y: 1.25, w: 0.5, h: 0.5, fontSize: 16, fontFace: FB, color: C.bgDark, bold: true, align: "center", valign: "middle", margin: 0 });
    s.addText(p.title, { x: x + 0.15, y: 1.9, w: 1.7, h: 0.3, fontSize: 14, fontFace: FB, color: C.textWhite, bold: true, align: "center", margin: 0 });
    s.addText(p.desc, { x: x + 0.15, y: 2.3, w: 1.7, h: 1.0, fontSize: 10.5, fontFace: FB, color: C.textMuted, align: "center", lineSpacingMultiple: 1.35, margin: 0 });
  });
  s.addText("这四个问题是运维人员反映最集中的痛点，本课题的工作就是围绕如何解决它们展开", {
    x: 0.7, y: 4.0, w: 8.6, h: 0.5, fontSize: 12, fontFace: FB, color: C.accent, align: "center", margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}


// ============================================================
// Slide 5 — 核心目标
// ============================================================
{
  const s = pres.addSlide();
  lightHeader(s, "01", "研究目标");
  s.addText("总目标：构建一个平台，同时解决四大运维痛点", {
    x: 0.7, y: 1.0, w: 8.6, h: 0.45, fontSize: 16, fontFace: FB, color: C.textDark, bold: true, margin: 0
  });
  const goals = [
    { pain: "巡检低效", solution: "三维数字孪生可视化", desc: "直观掌握设备状态与位置", color: C.accent },
    { pain: "数据孤岛", solution: "统一数据平台", desc: "汇聚32台设备10项指标", color: C.accent2 },
    { pain: "诊断靠经验", solution: "AERCA因果发现", desc: "自动识别故障根源", color: C.orange },
    { pain: "报告靠人工", solution: "LLM智能报告", desc: "自动生成分析报告", color: C.green },
  ];
  goals.forEach((g, i) => {
    const y = 1.7 + i * 0.9;
    lightCard(s, 0.7, y, 8.6, 0.75, g.color);
    s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y, w: 0.06, h: 0.75, fill: { color: g.color } });
    s.addText(g.pain, { x: 0.95, y, w: 1.8, h: 0.75, fontSize: 13, fontFace: FB, color: g.color, bold: true, valign: "middle", margin: 0 });
    s.addText("→", { x: 2.8, y, w: 0.5, h: 0.75, fontSize: 18, fontFace: FB, color: C.textMuted, align: "center", valign: "middle", margin: 0 });
    s.addText(g.solution, { x: 3.3, y, w: 2.5, h: 0.75, fontSize: 14, fontFace: FB, color: C.textDark, bold: true, valign: "middle", margin: 0 });
    s.addText(g.desc, { x: 5.8, y, w: 3.3, h: 0.75, fontSize: 12, fontFace: FB, color: "475569", valign: "middle", margin: 0 });
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}


// ============================================================
// Slide 6 — 研究现状与不足
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "01", "研究现状与不足");
  darkCard(s, 0.7, 1.0, 4.1, 2.0, C.accent3);
  s.addText("国内研究", { x: 0.9, y: 1.15, w: 2, h: 0.3, fontSize: 14, fontFace: FB, color: C.accent3, bold: true, margin: 0 });
  addBullets(s, 0.9, 1.5, 3.7, 1.3, [
    "曾至诚等 — 云网智能运维体系",
    "许俊等 — 基于BIM的数据中心方案",
    "张晨等 — 智能告警与根因分析",
  ], { color: C.textMuted, fontSize: 11, spacing: 1.35 });
  darkCard(s, 5.2, 1.0, 4.1, 2.0, C.accent2);
  s.addText("国际研究", { x: 5.4, y: 1.15, w: 2, h: 0.3, fontSize: 14, fontFace: FB, color: C.accent2, bold: true, margin: 0 });
  addBullets(s, 5.4, 1.5, 3.7, 1.3, [
    "Grieves — 数字孪生概念首次提出",
    "Tao等 — 五维模型理论框架",
    "Han等 — AERCA因果发现模型",
  ], { color: C.textMuted, fontSize: 11, spacing: 1.35 });
  darkCard(s, 0.7, 3.3, 8.6, 1.8, C.red);
  s.addText("现有工作不足", { x: 0.9, y: 3.45, w: 3, h: 0.3, fontSize: 14, fontFace: FB, color: C.red, bold: true, margin: 0 });
  addBullets(s, 0.9, 3.8, 8.2, 1.2, [
    "缺乏将可视化、数据汇聚、因果推理、智能报告整合为端到端闭环的工作",
    "缺乏异构指标适配至因果模型输入的工程方法",
    "各环节依赖人工衔接，缺乏自动化编排",
    "缺乏多AI服务协作的降级策略与容错机制",
  ], { color: C.textWhite, fontSize: 11.5, spacing: 1.3 });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}


// ============================================================
// Slide 7 — 不足与展望
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "01", "不足与展望");
  darkCard(s, 0.7, 1.0, 8.6, 2.0, C.orange);
  s.addText("研究不足", { x: 0.9, y: 1.1, w: 3, h: 0.3, fontSize: 14, fontFace: FB, color: C.orange, bold: true, margin: 0 });
  addBullets(s, 0.9, 1.5, 8.2, 1.3, [
    "AERCA超参数未针对本场景调优，缺乏标注数据无法系统搜索",
    "根源定位准确率评估受缺乏因果图真值制约，定量评估是后续方向",
    "特征工程权重为静态预设，未实现数据驱动优化",
  ], { color: C.textMuted, fontSize: 11.5, spacing: 1.4 });
  darkCard(s, 0.7, 3.3, 8.6, 2.0, C.accent);
  s.addText("未来工作", { x: 0.9, y: 3.4, w: 3, h: 0.3, fontSize: 14, fontFace: FB, color: C.accent, bold: true, margin: 0 });
  addBullets(s, 0.9, 3.8, 8.2, 1.3, [
    "积累标注数据后进行AERCA超参数系统调优，优化因果发现精度",
    "扩展至多数据中心联邦监控场景，支持跨站点因果分析",
    "引入强化学习实现自适应运维决策，从被动响应到主动预防",
  ], { color: C.textMuted, fontSize: 11.5, spacing: 1.4 });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}


// ============================================================
// Slide 8 — 系统技术架构
// ============================================================
{
  const s = pres.addSlide();
  lightHeader(s, "01", "系统技术架构");
  const archLayers = [
    { name: "表示层", tech: "React 19 SPA + Vite + Three.js 3D + ECharts", color: "3B82F6" },
    { name: "API网关层", tech: "Spring MVC · 20个RESTful端点 · Bearer Token认证", color: "6366F1" },
    { name: "AI推理层", tech: "LangChain4j LLM适配器(JVM) + FastAPI AERCA引擎(Python)", color: "8B5CF6" },
    { name: "业务逻辑层", tech: "Spring Boot模块化单体 · 7个限界上下文", color: "A855F7" },
    { name: "消息中间件层", tech: "Apache Kafka 3.8.1 · 单分区analysis.request", color: "D946EF" },
    { name: "数据存储层", tech: "MySQL 8.0 · 5张核心表 · InnoDB + utf8mb4", color: "EC4899" },
  ];
  archLayers.forEach((l, i) => {
    const y = 1.05 + i * 0.72;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y, w: 8.6, h: 0.58, fill: { color: C.lightCard }, shadow: mkShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y, w: 0.06, h: 0.58, fill: { color: l.color } });
    s.addText(l.name, { x: 0.95, y, w: 1.6, h: 0.58, fontSize: 13, fontFace: FB, color: l.color, bold: true, valign: "middle", margin: 0 });
    s.addText(l.tech, { x: 2.7, y, w: 6.4, h: 0.58, fontSize: 11, fontFace: FB, color: "475569", valign: "middle", margin: 0 });
  });
  s.addText("B/S架构 · 前后端分离 · Docker Compose容器化编排 · 各层通过接口契约松耦合通信", {
    x: 0.7, y: 5.1, w: 8.6, h: 0.3, fontSize: 11, fontFace: FB, color: C.textMuted, align: "center", margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}


// ============================================================
// Slide 9 — 为什么用三维可视化
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "02", "为什么用三维可视化");
  darkCard(s, 0.7, 1.0, 4.1, 2.2, C.red);
  s.addText("传统DCIM的不足", { x: 0.9, y: 1.1, w: 3, h: 0.3, fontSize: 14, fontFace: FB, color: C.red, bold: true, margin: 0 });
  addBullets(s, 0.9, 1.5, 3.7, 1.5, [
    "二维列表展示，无法直观感知设备空间位置",
    "状态变更依赖人工刷新，实时性差",
    "告警与设备位置割裂，定位效率低",
  ], { color: C.textMuted, fontSize: 11, spacing: 1.4 });
  darkCard(s, 5.2, 1.0, 4.1, 2.2, C.green);
  s.addText("三维数字孪生的优势", { x: 5.4, y: 1.1, w: 3, h: 0.3, fontSize: 14, fontFace: FB, color: C.green, bold: true, margin: 0 });
  addBullets(s, 5.4, 1.5, 3.7, 1.5, [
    "虚拟空间还原真实机房，一目了然",
    "32台设备实时状态可视",
    "支持交互操作，场景与数据库同步",
  ], { color: C.textMuted, fontSize: 11, spacing: 1.4 });
  darkCard(s, 0.7, 3.5, 8.6, 1.5, C.accent);
  s.addText("核心设计要求", { x: 0.9, y: 3.6, w: 3, h: 0.3, fontSize: 14, fontFace: FB, color: C.accent, bold: true, margin: 0 });
  addBullets(s, 0.9, 4.0, 8.2, 0.9, [
    '运维人员需要快速判断"哪台设备有问题、在哪里"，三维场景比列表直观得多',
    "程序化构建，无外部模型文件依赖，减少网络请求",
    "状态驱动视觉语言，颜色+脉冲频率双重编码",
  ], { color: C.textMuted, fontSize: 11, spacing: 1.3 });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}


// ============================================================
// Slide 10 — 程序化三维场景构建
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "02", "程序化三维场景构建");
  const features = [
    { title: "13种机柜模型族", desc: "32台交互式设备(DEV001-DEV032)\n不同设备类型对应不同尺寸配色", color: C.accent },
    { title: "程序化几何体构建", desc: "BoxGeometry等基础几何体组合\n无外部GLB文件，减少网络请求", color: C.accent2 },
    { title: "四层结构", desc: "机身 + 面板 + 指示灯 + 信标\n每层独立控制样式与动画", color: C.accent3 },
    { title: "灵活可配置", desc: "类型与尺寸可灵活配置\n模型均为程序化几何体组合", color: C.green },
  ];
  features.forEach((f, i) => {
    const x = (i % 2 === 0) ? 0.7 : 5.2;
    const y = (i < 2) ? 1.0 : 3.2;
    darkCard(s, x, y, 4.1, 1.85, f.color);
    s.addText(f.title, { x: x + 0.2, y: y + 0.12, w: 3.7, h: 0.3, fontSize: 14, fontFace: FB, color: f.color, bold: true, margin: 0 });
    s.addText(f.desc, { x: x + 0.2, y: y + 0.5, w: 3.7, h: 1.1, fontSize: 11, fontFace: FB, color: C.textMuted, lineSpacingMultiple: 1.35, margin: 0 });
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}


// ============================================================
// Slide 11 — 状态驱动视觉语言
// ============================================================
{
  const s = pres.addSlide();
  lightHeader(s, "02", "状态驱动视觉语言");
  const states = [
    { status: "正常", color: C.green, freq: "1.4Hz", desc: "绿色慢闪\n运维人员一眼识别设备运行正常" },
    { status: "预警", color: C.orange, freq: "2.2Hz", desc: "橙色快闪\n提示需要关注，可能存在潜在风险" },
    { status: "故障", color: C.red, freq: "4.4Hz", desc: "红色高频闪烁\n紧急告警，需要立即处理" },
  ];
  states.forEach((st, i) => {
    const x = 0.7 + i * 3.0;
    lightCard(s, x, 1.0, 2.7, 2.8, st.color);
    s.addShape(pres.shapes.OVAL, { x: x + 1.0, y: 1.3, w: 0.6, h: 0.6, fill: { color: st.color } });
    s.addText(st.status, { x, y: 2.05, w: 2.7, h: 0.35, fontSize: 18, fontFace: FB, color: st.color, bold: true, align: "center", margin: 0 });
    s.addText(st.freq, { x, y: 2.4, w: 2.7, h: 0.3, fontSize: 14, fontFace: FB, color: "475569", align: "center", margin: 0 });
    s.addText(st.desc, { x: x + 0.2, y: 2.8, w: 2.3, h: 0.8, fontSize: 11, fontFace: FB, color: "475569", align: "center", lineSpacingMultiple: 1.3, margin: 0 });
  });
  s.addText("颜色 + 脉冲频率双重编码，运维人员无需看数据就能感知异常", {
    x: 0.7, y: 4.3, w: 8.6, h: 0.5, fontSize: 13, fontFace: FB, color: C.textDark, bold: true, align: "center", margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}


// ============================================================
// Slide 12 — 交互与一致性校验
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "02", "交互与一致性校验");
  darkCard(s, 0.7, 1.0, 4.1, 2.5, C.accent);
  s.addText("射线投射交互", { x: 0.9, y: 1.1, w: 3, h: 0.3, fontSize: 14, fontFace: FB, color: C.accent, bold: true, margin: 0 });
  addBullets(s, 0.9, 1.5, 3.7, 1.8, [
    "Raycaster射线检测点击设备",
    "弹出信息对话框（编码/名称/类型/状态/位置）",
    "轨道控制器OrbitControls支持旋转、平移、缩放",
  ], { color: C.textMuted, fontSize: 11, spacing: 1.4 });
  darkCard(s, 5.2, 1.0, 4.1, 2.5, C.green);
  s.addText("一致性校验", { x: 5.4, y: 1.1, w: 3, h: 0.3, fontSize: 14, fontFace: FB, color: C.green, bold: true, margin: 0 });
  addBullets(s, 5.4, 1.5, 3.7, 1.8, [
    "仪表盘初始化时自动比对仿真设备目录与数据库",
    "不一致时自动修复（删除多余、补充缺失）",
    "确保场景与数据库双向同步",
  ], { color: C.textMuted, fontSize: 11, spacing: 1.4 });
  darkCard(s, 0.7, 3.8, 8.6, 1.2, C.purple);
  s.addText("关键设计决策", { x: 0.9, y: 3.9, w: 3, h: 0.3, fontSize: 14, fontFace: FB, color: C.purple, bold: true, margin: 0 });
  s.addText("一致性校验是数字孪生可信性的前提。如果三维场景和数据库不一致，后续的因果分析和告警都会出错。所以每次加载仪表盘都会自动校验并修复。", {
    x: 0.9, y: 4.25, w: 8.2, h: 0.6, fontSize: 11, fontFace: FB, color: C.textMuted, lineSpacingMultiple: 1.3, margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}


// ============================================================
// Slide 13 — 为什么统一数据平台
// ============================================================
{
  const s = pres.addSlide();
  lightHeader(s, "03", "为什么要统一数据平台");
  darkCard(s, 0.7, 1.0, 4.1, 2.2, C.red);
  s.addText("数据孤岛的现状", { x: 0.9, y: 1.1, w: 3, h: 0.3, fontSize: 14, fontFace: FB, color: C.red, bold: true, margin: 0 });
  addBullets(s, 0.9, 1.5, 3.7, 1.5, [
    "运维数据分散在多个独立子系统",
    "数据格式不统一，无法关联分析",
    "告警、遥测、设备信息各自为政",
  ], { color: C.textMuted, fontSize: 11, spacing: 1.4 });
  darkCard(s, 5.2, 1.0, 4.1, 2.2, C.green);
  s.addText("统一平台的目标", { x: 5.4, y: 1.1, w: 3, h: 0.3, fontSize: 14, fontFace: FB, color: C.green, bold: true, margin: 0 });
  addBullets(s, 5.4, 1.5, 3.7, 1.5, [
    "统一汇聚32台设备10项指标",
    "单一面板聚合展示所有运维数据",
    "为因果发现和智能报告提供数据基础",
  ], { color: C.textMuted, fontSize: 11, spacing: 1.4 });
  darkCard(s, 0.7, 3.5, 8.6, 1.5, C.accent);
  s.addText("数据不统一，因果发现和智能报告都无从谈起", {
    x: 0.9, y: 3.6, w: 8.2, h: 0.4, fontSize: 14, fontFace: FB, color: C.accent, bold: true, align: "center", margin: 0
  });
  s.addText("数据孤岛是所有后续分析的基础障碍，必须先打通数据层，才能支撑上层的智能分析", {
    x: 0.9, y: 4.1, w: 8.2, h: 0.5, fontSize: 12, fontFace: FB, color: C.textMuted, align: "center", lineSpacingMultiple: 1.3, margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}


// ============================================================
// Slide 14 — 数据层设计
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "03", "数据层设计");
  const tables = [
    { name: "devices", desc: "32台设备信息（聚合根）", color: C.accent },
    { name: "device_metrics", desc: "每分钟10项遥测快照，约1.8万行", color: C.accent2 },
    { name: "alarms", desc: "告警及处置状态(new/resolved)", color: C.orange },
    { name: "analysis_reports", desc: "分析结果，JSON列存储RCA+LLM输出", color: C.accent3 },
    { name: "admin_watchlist", desc: "关注关系，复合唯一约束防重复", color: C.purple },
  ];
  tables.forEach((t, i) => {
    const x = 0.7 + (i % 3) * 3.0;
    const y = 1.0 + Math.floor(i / 3) * 1.7;
    darkCard(s, x, y, 2.7, 1.4, t.color);
    s.addText(t.name, { x: x + 0.15, y: y + 0.12, w: 2.4, h: 0.3, fontSize: 13, fontFace: FB, color: t.color, bold: true, margin: 0 });
    s.addText(t.desc, { x: x + 0.15, y: y + 0.5, w: 2.4, h: 0.7, fontSize: 10.5, fontFace: FB, color: C.textMuted, lineSpacingMultiple: 1.3, margin: 0 });
  });
  darkCard(s, 0.7, 4.4, 8.6, 0.85, C.green);
  s.addText("设计原则：MySQL 8.0 + MyBatis-Plus 3.5.7，单列自增主键、查询字段建索引、唯一字段设唯一索引、MySQL原生JSON类型存储半结构化数据", {
    x: 0.9, y: 4.5, w: 8.2, h: 0.6, fontSize: 11, fontFace: FB, color: C.textMuted, lineSpacingMultiple: 1.3, margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}


// ============================================================
// Slide 15 — 异步架构设计
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "03", "异步架构设计 — 分析管道七步流程");
  const steps = [
    { num: "1", name: "触发", desc: "手动/定时\n查询异常设备", color: C.accent3 },
    { num: "2", name: "预创建", desc: "幂等键唯一约束\n防重复分析", color: C.accent3 },
    { num: "3", name: "消息发布", desc: "Kafka analysis.request\n5秒超时", color: C.accent },
    { num: "4", name: "异步消费", desc: "查询1h遥测\n组装指标矩阵", color: C.accent },
    { num: "5", name: "RCA推理", desc: "特征工程归一化\nAERCA因果发现", color: C.accent2 },
    { num: "6", name: "LLM生成", desc: "预测JSON\nMarkdown报告", color: C.green },
    { num: "7", name: "状态更新", desc: "success/failed\n超10min自动回收", color: C.green },
  ];
  steps.forEach((st, i) => {
    const x = 0.45 + i * 1.32;
    darkCard(s, x, 1.1, 1.18, 2.4, st.color);
    s.addShape(pres.shapes.OVAL, { x: x + 0.4, y: 1.25, w: 0.38, h: 0.38, fill: { color: st.color } });
    s.addText(st.num, { x: x + 0.4, y: 1.25, w: 0.38, h: 0.38, fontSize: 14, fontFace: FB, color: C.bgDark, bold: true, align: "center", valign: "middle", margin: 0 });
    s.addText(st.name, { x: x + 0.05, y: 1.7, w: 1.08, h: 0.25, fontSize: 12, fontFace: FB, color: C.textWhite, bold: true, align: "center", margin: 0 });
    s.addText(st.desc, { x: x + 0.05, y: 2.0, w: 1.08, h: 1.2, fontSize: 9.5, fontFace: FB, color: C.textMuted, align: "center", lineSpacingMultiple: 1.3, margin: 0 });
  });
  for (let i = 0; i < 6; i++) {
    const x = 0.45 + (i + 1) * 1.32 - 0.12;
    s.addText("→", { x, y: 1.5, w: 0.24, h: 0.3, fontSize: 16, fontFace: FB, color: C.accent, align: "center", valign: "middle", margin: 0 });
  }
  darkCard(s, 0.7, 3.8, 8.6, 1.35, C.purple);
  s.addText("关键设计决策", { x: 0.9, y: 3.9, w: 3, h: 0.25, fontSize: 13, fontFace: FB, color: C.purple, bold: true, margin: 0 });
  s.addText("幂等性：idempotency_key基于时间戳构造，唯一约束防止重复分析。异步解耦：Kafka将耗时计算从同步HTTP周期中解耦。自动回收：超过10分钟的processing报告自动回收为failed。设备筛选：error优先于warning，最多取前10台设备。", {
    x: 0.9, y: 4.2, w: 8.2, h: 0.8, fontSize: 11, fontFace: FB, color: C.textMuted, lineSpacingMultiple: 1.3, margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}


// ============================================================
// Slide 16 — 仪表盘聚合与故障率预测
// ============================================================
{
  const s = pres.addSlide();
  lightHeader(s, "03", "仪表盘聚合与故障率预测");
  lightCard(s, 0.7, 1.0, 5.5, 2.0, C.accent);
  s.addText("仪表盘聚合看板", { x: 0.9, y: 1.1, w: 4, h: 0.28, fontSize: 14, fontFace: FB, color: C.accent, bold: true, margin: 0 });
  addBullets(s, 0.9, 1.45, 5.1, 1.3, [
    "设备统计（总数/正常/预警/故障）",
    "活动告警列表，按时间降序",
    "故障率趋势图表，支持自定义时间范围",
    "资源使用率图表，每60秒自动刷新",
  ], { color: "475569", fontSize: 11, spacing: 1.25 });
  lightCard(s, 6.5, 1.0, 2.8, 2.0, C.purple);
  s.addText("故障率定义", { x: 6.7, y: 1.1, w: 2.4, h: 0.25, fontSize: 13, fontFace: FB, color: C.purple, bold: true, margin: 0 });
  s.addText("error设备数 / 总设备数 × 100%", { x: 6.7, y: 1.45, w: 2.4, h: 0.3, fontSize: 11, fontFace: FB, color: "475569", margin: 0 });
  s.addText("分钟粒度时间序列", { x: 6.7, y: 1.8, w: 2.4, h: 0.25, fontSize: 11, fontFace: FB, color: "475569", margin: 0 });
  s.addText("Logistic增长模型外推", { x: 6.7, y: 2.1, w: 2.4, h: 0.25, fontSize: 11, fontFace: FB, color: C.accent, bold: true, margin: 0 });
  lightCard(s, 0.7, 3.3, 8.6, 1.9, C.green);
  s.addText("故障率趋势预测", { x: 0.9, y: 3.4, w: 4, h: 0.28, fontSize: 14, fontFace: FB, color: C.green, bold: true, margin: 0 });
  addBullets(s, 0.9, 3.75, 8.2, 1.2, [
    "Logistic增长模型：dr/dt = k·r·(1-r/100)，捕捉级联传播特征",
    "LLM评估风险等级和置信度，转换为±12%调整因子叠加于统计曲线",
    "前端实线=历史数据，虚线=预测数据",
    "统计模型为主，LLM只做辅助修正而非替代数值预测",
  ], { color: "475569", fontSize: 11, spacing: 1.25 });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}


// ============================================================
// Slide 17 — 为什么需要因果发现
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "04", "为什么需要因果发现");
  darkCard(s, 0.7, 1.0, 8.6, 1.5, C.orange);
  s.addText("核心矛盾", { x: 0.9, y: 1.1, w: 3, h: 0.3, fontSize: 14, fontFace: FB, color: C.orange, bold: true, margin: 0 });
  s.addText('多台设备同时告警时，运维人员逐台排查效率低。静态阈值告警只能识别异常，无法解释"谁导致了谁"。AERCA面向同构指标设计，而数据中心遥测数据本质异构，无法直接输入。', {
    x: 0.9, y: 1.5, w: 8.2, h: 0.7, fontSize: 12, fontFace: FB, color: C.textMuted, lineSpacingMultiple: 1.3, margin: 0
  });
  darkCard(s, 0.7, 2.8, 4.1, 2.3, C.red);
  s.addText("级联故障场景", { x: 0.9, y: 2.9, w: 3, h: 0.3, fontSize: 14, fontFace: FB, color: C.red, bold: true, margin: 0 });
  s.addText("UPS电源异常 → 下游配电柜告警 → 服务器相继告警\n\n如果只按告警时间排序，很难区分真正的起因和级联受害者", {
    x: 0.9, y: 3.3, w: 3.7, h: 1.5, fontSize: 11, fontFace: FB, color: C.textMuted, lineSpacingMultiple: 1.4, margin: 0
  });
  darkCard(s, 5.2, 2.8, 4.1, 2.3, C.green);
  s.addText("目标", { x: 5.4, y: 2.9, w: 3, h: 0.3, fontSize: 14, fontFace: FB, color: C.green, bold: true, margin: 0 });
  addBullets(s, 5.4, 3.3, 3.7, 1.5, [
    "自动识别故障根源设备",
    "输出因果传播路径",
    "将异构指标适配至因果模型",
    "无标注条件下完成因果学习",
  ], { color: C.textMuted, fontSize: 11, spacing: 1.4 });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}


// ============================================================
// Slide 18 — 加权正向Z-score特征工程
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "04", "加权正向Z-score特征工程");
  darkCard(s, 0.7, 1.0, 4.1, 1.8, C.red);
  s.addText("问题", { x: 0.9, y: 1.1, w: 1.5, h: 0.28, fontSize: 14, fontFace: FB, color: C.red, bold: true, margin: 0 });
  s.addText("六项异构指标无法直接输入AERCA模型：\n温度(℃) · 功率(W) · CPU(%) · 内存(%) · 磁盘(%) · 网络(Mbps)\n物理量纲、数量级和波动特征存在显著差异", {
    x: 0.9, y: 1.4, w: 3.7, h: 1.2, fontSize: 11, fontFace: FB, color: C.textMuted, lineSpacingMultiple: 1.3, margin: 0
  });
  darkCard(s, 5.2, 1.0, 4.1, 1.8, C.green);
  s.addText("四步归一化", { x: 5.4, y: 1.1, w: 3, h: 0.28, fontSize: 14, fontFace: FB, color: C.green, bold: true, margin: 0 });
  s.addText([
    { text: "① Z-score归一化", options: { bold: true, color: C.textWhite, breakLine: false } },
    { text: " → 消除量级差异", options: { color: C.textMuted, breakLine: true } },
    { text: "② 正向截断", options: { bold: true, color: C.textWhite, breakLine: false } },
    { text: " → 仅保留高于均值的偏差", options: { color: C.textMuted, breakLine: true } },
    { text: "③ 差异化加权", options: { bold: true, color: C.textWhite, breakLine: false } },
    { text: " → 体现领域优先级", options: { color: C.textMuted, breakLine: true } },
    { text: "④ 加权求和", options: { bold: true, color: C.textWhite, breakLine: false } },
    { text: " → 一维复合应力序列", options: { color: C.textMuted } },
  ], { x: 5.4, y: 1.4, w: 3.7, h: 1.2, fontSize: 11, fontFace: FB, lineSpacingMultiple: 1.25, margin: 0 });
  s.addText("差异化权重分配 — \"电力核心 > IT附属 > 网络外围\"", {
    x: 0.7, y: 3.05, w: 8.6, h: 0.3, fontSize: 13, fontFace: FB, color: C.accent, bold: true, margin: 0
  });
  const wtData = [
    [
      { text: "指标", options: { fill: { color: C.accent }, color: C.bgDark, bold: true, fontSize: 11, align: "center" } },
      { text: "功率", options: { fill: { color: C.accent }, color: C.bgDark, bold: true, fontSize: 11, align: "center" } },
      { text: "温度", options: { fill: { color: C.accent }, color: C.bgDark, bold: true, fontSize: 11, align: "center" } },
      { text: "CPU", options: { fill: { color: C.accent }, color: C.bgDark, bold: true, fontSize: 11, align: "center" } },
      { text: "内存", options: { fill: { color: C.accent }, color: C.bgDark, bold: true, fontSize: 11, align: "center" } },
      { text: "磁盘", options: { fill: { color: C.accent }, color: C.bgDark, bold: true, fontSize: 11, align: "center" } },
      { text: "网络", options: { fill: { color: C.accent }, color: C.bgDark, bold: true, fontSize: 11, align: "center" } },
    ],
    [
      { text: "权重", options: { fill: { color: C.bgCard }, color: C.textWhite, bold: true, fontSize: 11, align: "center" } },
      { text: "0.22", options: { fill: { color: C.bgCard }, color: C.textWhite, fontSize: 14, bold: true, align: "center" } },
      { text: "0.20", options: { fill: { color: C.bgCard }, color: C.textWhite, fontSize: 14, bold: true, align: "center" } },
      { text: "0.18", options: { fill: { color: C.bgCard }, color: C.textWhite, fontSize: 14, bold: true, align: "center" } },
      { text: "0.16", options: { fill: { color: C.bgCard }, color: C.textWhite, fontSize: 14, bold: true, align: "center" } },
      { text: "0.12", options: { fill: { color: C.bgCard }, color: C.textMuted, fontSize: 14, align: "center" } },
      { text: "0.12", options: { fill: { color: C.bgCard }, color: C.textMuted, fontSize: 14, align: "center" } },
    ],
  ];
  s.addTable(wtData, {
    x: 0.7, y: 3.4, w: 8.6, h: 0.75,
    colW: [1.2, 1.23, 1.23, 1.23, 1.23, 1.23, 1.23],
    border: { pt: 0.5, color: "334155" },
    rowH: [0.32, 0.38],
  });
  darkCard(s, 0.7, 4.4, 8.6, 0.85, null);
  s.addText('每一步操作均有明确运维语义对应。正向截断将"只有偏高才需关注"的经验直觉转化为数学操作，避免正常低负载波动稀释异常信号。', {
    x: 0.9, y: 4.5, w: 8.2, h: 0.65, fontSize: 11, fontFace: FB, color: C.textMuted, lineSpacingMultiple: 1.3, margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}


// ============================================================
// Slide 19 — AERCA因果发现模型原理
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "04", "AERCA因果发现模型原理");
  const comps = [
    { name: "SENNGC编码器", desc: "每个滞后步k学习p×p系数矩阵\nΘ_k(x) = reshape(f_ψk(x))\n系数θ_ij量化Granger因果强度", color: C.accent },
    { name: "GVAR预测与残差", desc: "x̂_t = Σ Θ_k(x)·x_{t-k-1}\nu_t = x̂_t - x_t (创新项)\n异常时u_t显著偏离正态分布", color: C.accent2 },
    { name: "根源评分与因果边", desc: "z_i(t) = -(u_i(t)-μ_i)/σ_i\n正向截断→90%分位数→归一化\nTop-8有向因果边输出", color: C.accent3 },
  ];
  comps.forEach((c, i) => {
    const x = 0.7 + i * 3.0;
    darkCard(s, x, 1.05, 2.7, 2.3, c.color);
    s.addText(c.name, { x: x + 0.15, y: 1.2, w: 2.4, h: 0.3, fontSize: 14, fontFace: FB, color: c.color, bold: true, margin: 0 });
    s.addText(c.desc, { x: x + 0.15, y: 1.55, w: 2.4, h: 1.6, fontSize: 10.5, fontFace: FB, color: C.textMuted, lineSpacingMultiple: 1.35, margin: 0 });
  });
  darkCard(s, 0.7, 3.6, 8.6, 0.75, C.purple);
  s.addText("训练损失函数：L = L_recon + λ₁·L_sparsity + λ₂·L_smooth + λ₃·L_KL", {
    x: 0.9, y: 3.65, w: 8.2, h: 0.3, fontSize: 13, fontFace: FB, color: C.accent, bold: true, margin: 0
  });
  s.addText("重构误差 + 弹性网正则化(稀疏因果边) + 时序平滑性(因果结构短时稳定) + KL散度(创新项趋近标准正态)", {
    x: 0.9, y: 3.95, w: 8.2, h: 0.3, fontSize: 11, fontFace: FB, color: C.textMuted, margin: 0
  });
  s.addText("ICLR 2025 Oral · 无标注学习 · 可解释系数矩阵 · 非线性因果建模", {
    x: 0.7, y: 4.6, w: 8.6, h: 0.4, fontSize: 13, fontFace: FB, color: C.green, align: "center", bold: true, margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}


// ============================================================
// Slide 20 — 根源评分与因果边发现
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "04", "根源评分与因果边发现");
  darkCard(s, 0.7, 1.0, 4.1, 2.5, C.accent);
  s.addText("根源评分机制", { x: 0.9, y: 1.1, w: 3, h: 0.3, fontSize: 14, fontFace: FB, color: C.accent, bold: true, margin: 0 });
  addBullets(s, 0.9, 1.5, 3.7, 1.8, [
    "z_i(t) = -(u_i(t)-μ_i)/σ_i",
    "正向截断：仅保留异常升高信号",
    "取90%上尾分位数作为聚合指标",
    "归一化至[0,1]区间",
    "根源得分降序排列即为故障优先级",
  ], { color: C.textMuted, fontSize: 11, spacing: 1.3 });
  darkCard(s, 5.2, 1.0, 4.1, 2.5, C.accent2);
  s.addText("因果边发现", { x: 5.4, y: 1.1, w: 3, h: 0.3, fontSize: 14, fontFace: FB, color: C.accent2, bold: true, margin: 0 });
  addBullets(s, 5.4, 1.5, 3.7, 1.8, [
    "取各滞后步系数中位数绝对值最大值",
    "作为有向因果边的权重w_ij",
    "输出Top-8有向因果边",
    "覆盖典型故障传播链(2~5台设备)",
    "边权重直接量化Granger因果强度",
  ], { color: C.textMuted, fontSize: 11, spacing: 1.3 });
  darkCard(s, 0.7, 3.8, 8.6, 1.35, C.green);
  s.addText("可解释性", { x: 0.9, y: 3.9, w: 3, h: 0.25, fontSize: 13, fontFace: FB, color: C.green, bold: true, margin: 0 });
  s.addText('根源评分的负号方向设计有明确运维语义——指标异常升高时z值为正，对应过热、过载等典型故障。因果边权重直接量化"设备j对设备i的Granger因果影响强度"，运维人员可以直观理解。', {
    x: 0.9, y: 4.2, w: 8.2, h: 0.8, fontSize: 11, fontFace: FB, color: C.textMuted, lineSpacingMultiple: 1.3, margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}


// ============================================================
// Slide 21 — AERCA选型与适用性
// ============================================================
{
  const s = pres.addSlide();
  lightHeader(s, "04", "AERCA选型与适用性分析");
  const compData = [
    [
      { text: "维度", options: { fill: { color: C.accent }, color: C.bgDark, bold: true, fontSize: 10, align: "center" } },
      { text: "AERCA", options: { fill: { color: C.accent }, color: C.bgDark, bold: true, fontSize: 10, align: "center" } },
      { text: "VAR/cMLP/cLSTM", options: { fill: { color: C.accent }, color: C.bgDark, bold: true, fontSize: 10, align: "center" } },
      { text: "TCDF", options: { fill: { color: C.accent }, color: C.bgDark, bold: true, fontSize: 10, align: "center" } },
    ],
    [
      { text: "可解释性", options: { fill: { color: C.lightCard }, fontSize: 10 } },
      { text: "显式系数矩阵", options: { fill: { color: C.lightCard }, color: C.green, bold: true, fontSize: 10 } },
      { text: "VAR可解释/cMLP黑箱", options: { fill: { color: C.lightCard }, fontSize: 10 } },
      { text: "注意力权重", options: { fill: { color: C.lightCard }, fontSize: 10 } },
    ],
    [
      { text: "无标注学习", options: { fill: { color: C.lightCard }, fontSize: 10 } },
      { text: "u-space创新项排序", options: { fill: { color: C.lightCard }, color: C.green, bold: true, fontSize: 10 } },
      { text: "需要标注", options: { fill: { color: C.lightCard }, fontSize: 10 } },
      { text: "需要长序列", options: { fill: { color: C.lightCard }, fontSize: 10 } },
    ],
    [
      { text: "工业验证", options: { fill: { color: C.lightCard }, fontSize: 10 } },
      { text: "SWaT数据集验证", options: { fill: { color: C.lightCard }, color: C.green, bold: true, fontSize: 10 } },
      { text: "合成数据为主", options: { fill: { color: C.lightCard }, fontSize: 10 } },
      { text: "需1000+时间步", options: { fill: { color: C.lightCard }, fontSize: 10 } },
    ],
    [
      { text: "非线性建模", options: { fill: { color: C.lightCard }, fontSize: 10 } },
      { text: "动态系数矩阵", options: { fill: { color: C.lightCard }, color: C.green, bold: true, fontSize: 10 } },
      { text: "VAR线性/cMLP非线性", options: { fill: { color: C.lightCard }, fontSize: 10 } },
      { text: "卷积注意力", options: { fill: { color: C.lightCard }, fontSize: 10 } },
    ],
  ];
  s.addTable(compData, {
    x: 0.7, y: 1.0, w: 8.6, h: 2.0,
    colW: [1.4, 2.4, 2.4, 2.4],
    border: { pt: 0.5, color: "CBD5E1" },
    rowH: [0.32, 0.38, 0.38, 0.38, 0.38],
  });
  lightCard(s, 0.7, 3.3, 8.6, 1.9, C.orange);
  s.addText("适用性应对措施", { x: 0.9, y: 3.4, w: 3, h: 0.25, fontSize: 13, fontFace: FB, color: C.orange, bold: true, margin: 0 });
  addBullets(s, 0.9, 3.7, 8.2, 1.3, [
    "非时序因素 → 仅选设备自身指标，LLM标注提示人为因素",
    "数据质量 → 线性插值填补短时缺失(≤3步)，长时缺失暂不参与分析",
    "设备异构性 → 加权Z-score消除量级差异，差异化权重体现领域优先级",
    "模型局限 → 60步窗口平衡信号与噪声，不可用时降级LLM分析",
  ], { color: "475569", fontSize: 11, spacing: 1.3 });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}


// ============================================================
// Slide 22 — 为什么用LLM生成报告
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "05", "为什么用LLM生成报告");
  darkCard(s, 0.7, 1.0, 4.1, 2.2, C.red);
  s.addText("报告靠人工的问题", { x: 0.9, y: 1.1, w: 3, h: 0.3, fontSize: 14, fontFace: FB, color: C.red, bold: true, margin: 0 });
  addBullets(s, 0.9, 1.5, 3.7, 1.5, [
    "人工撰写效率低，耗时长",
    "质量参差不齐，缺乏标准化",
    "因果推理输出是抽象数值，运维人员难以直接理解",
  ], { color: C.textMuted, fontSize: 11, spacing: 1.4 });
  darkCard(s, 5.2, 1.0, 4.1, 2.2, C.green);
  s.addText("LLM的定位", { x: 5.4, y: 1.1, w: 3, h: 0.3, fontSize: 14, fontFace: FB, color: C.green, bold: true, margin: 0 });
  addBullets(s, 5.4, 1.5, 3.7, 1.5, [
    "语义翻译与风险评估",
    "不做因果推理和数值预测",
    "将抽象结果翻译为结构化Markdown报告",
  ], { color: C.textMuted, fontSize: 11, spacing: 1.4 });
  darkCard(s, 0.7, 3.5, 8.6, 1.5, C.accent);
  s.addText("设计依据", { x: 0.9, y: 3.6, w: 3, h: 0.3, fontSize: 14, fontFace: FB, color: C.accent, bold: true, margin: 0 });
  s.addText("LLM本质上是基于Transformer解码器的自回归语言模型，擅长语言模式的匹配与生成。将其限定在语义翻译层面既发挥了自然语言生成优势，又避免了数值预测可能带来的不确定性。", {
    x: 0.9, y: 4.0, w: 8.2, h: 0.7, fontSize: 11, fontFace: FB, color: C.textMuted, lineSpacingMultiple: 1.3, margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}


// ============================================================
// Slide 23 — 双模型实例策略
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "05", "双模型实例策略");
  darkCard(s, 0.7, 1.0, 4.1, 2.8, C.accent);
  s.addText("预测模型", { x: 0.9, y: 1.1, w: 3, h: 0.3, fontSize: 14, fontFace: FB, color: C.accent, bold: true, margin: 0 });
  addBullets(s, 0.9, 1.5, 3.7, 2.0, [
    "maxTokens=512，temperature=0.2",
    "输出：prediction、confidence、riskLevel、recommendedAction",
    "三层约束：角色设定 + 字段清单 + 规则列表",
    "防御性解析：缺失字段触发重试",
    "confidence默认70，夹紧[0,100]",
  ], { color: C.textMuted, fontSize: 10.5, spacing: 1.3 });
  darkCard(s, 5.2, 1.0, 4.1, 2.8, C.green);
  s.addText("报告模型", { x: 5.4, y: 1.1, w: 3, h: 0.3, fontSize: 14, fontFace: FB, color: C.green, bold: true, margin: 0 });
  addBullets(s, 5.4, 1.5, 3.7, 2.0, [
    "maxTokens=2048",
    "输出：指标摘要+根源解读+因果传播+运维建议",
    "四项规范：格式规范+内容要求+禁止客套话+仅输出正文",
    "中文系统提示，严格遵循Markdown格式",
    "7参数输入：设备编码、遥测摘要、根源排序等",
  ], { color: C.textMuted, fontSize: 10.5, spacing: 1.3 });
  darkCard(s, 0.7, 4.1, 8.6, 1.1, C.purple);
  s.addText("两个模型共享同一API端点和密钥，但maxTokens独立配置。预测模型用低temperature确保输出稳定，报告模型用高token上限容纳完整报告。", {
    x: 0.9, y: 4.2, w: 8.2, h: 0.8, fontSize: 11, fontFace: FB, color: C.textMuted, lineSpacingMultiple: 1.3, margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}


// ============================================================
// Slide 24 — 三层降级容错链
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "05", "三层降级容错链");
  const layers = [
    { level: "L1", name: "RCA + LLM 综合模式", desc: "AERCA输出因果结果，LLM翻译为Markdown报告", color: C.green, tag: "最优" },
    { level: "L2", name: "LLM 独立分析", desc: "RCA不可用时，3秒超时自动降级，LLM直接分析遥测数据", color: C.orange, tag: "RCA不可用" },
    { level: "L3", name: "规则引擎 + 预置模板", desc: "LLM不可用时，关键词匹配按high/medium/low三级生成预测", color: C.red, tag: "LLM不可用" },
    { level: "L4", name: "最终兜底", desc: "所有降级失败时，返回最简硬编码报告文本", color: C.red, tag: "全部失败" },
  ];
  layers.forEach((l, i) => {
    const y = 1.05 + i * 1.05;
    darkCard(s, 0.7, y, 8.6, 0.9, l.color);
    s.addShape(pres.shapes.OVAL, { x: 0.9, y: y + 0.22, w: 0.38, h: 0.38, fill: { color: l.color } });
    s.addText(l.level, { x: 0.9, y: y + 0.22, w: 0.38, h: 0.38, fontSize: 11, fontFace: FB, color: C.bgDark, bold: true, align: "center", valign: "middle", margin: 0 });
    s.addText(l.name, { x: 1.5, y: y + 0.08, w: 3.5, h: 0.3, fontSize: 14, fontFace: FB, color: C.textWhite, bold: true, margin: 0 });
    s.addText(l.tag, { x: 8.0, y: y + 0.08, w: 1.1, h: 0.3, fontSize: 10, fontFace: FB, color: l.color, align: "right", margin: 0 });
    s.addText(l.desc, { x: 1.5, y: y + 0.4, w: 7.6, h: 0.4, fontSize: 10.5, fontFace: FB, color: C.textMuted, lineSpacingMultiple: 1.2, margin: 0 });
  });
  s.addText("任一层次可用即产出报告 — 确保分析管道100%连续可用", {
    x: 0.7, y: 5.15, w: 8.6, h: 0.3, fontSize: 13, fontFace: FB, color: C.accent, align: "center", bold: true, margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}


// ============================================================
// Slide 25 — 测试方案
// ============================================================
{
  const s = pres.addSlide();
  lightHeader(s, "06", "测试方案");
  lightCard(s, 0.7, 1.0, 4.2, 2.5, C.accent);
  s.addText("三层次测试", { x: 0.9, y: 1.1, w: 3, h: 0.3, fontSize: 14, fontFace: FB, color: C.accent, bold: true, margin: 0 });
  addBullets(s, 0.9, 1.5, 3.8, 1.8, [
    "单元测试：JUnit 5 + Mockito",
    "集成测试：Spring Boot Test + 嵌入式Kafka",
    "端到端验证：Docker Compose全栈环境",
    "Shell冒烟测试：后端可达性、分析管道触发",
  ], { color: "475569", fontSize: 11, spacing: 1.3 });
  lightCard(s, 5.2, 1.0, 4.2, 2.5, C.accent2);
  s.addText("四个验证维度", { x: 5.4, y: 1.1, w: 3, h: 0.3, fontSize: 14, fontFace: FB, color: C.accent2, bold: true, margin: 0 });
  addBullets(s, 5.4, 1.5, 3.8, 1.8, [
    "功能正确性：九项核心需求",
    "接口一致性：20个API端点",
    "性能指标：仪表盘≤3秒等",
    "容错能力：降级策略生效",
  ], { color: "475569", fontSize: 11, spacing: 1.3 });
  lightCard(s, 0.7, 3.8, 8.6, 1.4, C.green);
  s.addText("RCA推理引擎测试", { x: 0.9, y: 3.9, w: 3, h: 0.25, fontSize: 13, fontFace: FB, color: C.green, bold: true, margin: 0 });
  s.addText("9项校验用例全部通过：空设备/超上限/维度不一致/时间步不足/NaN替换/正常推理等。覆盖模型生成、接口校验、输入边界和集成联调四层面。", {
    x: 0.9, y: 4.2, w: 8.2, h: 0.8, fontSize: 11, fontFace: FB, color: "475569", lineSpacingMultiple: 1.3, margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}


// ============================================================
// Slide 26 — 验证一：三维可视化效果
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "06", "验证一：三维可视化效果");
  const stats = [
    { val: "32台", label: "设备渲染正确", sub: "位置与种子数据一致", color: C.green },
    { val: "≥30fps", label: "三维渲染帧率", sub: "<5000三角面", color: C.green },
    { val: "100%", label: "状态对应率", sub: "颜色↔status一一对应", color: C.green },
  ];
  stats.forEach((st, i) => {
    const x = 0.7 + i * 3.0;
    darkCard(s, x, 1.0, 2.7, 1.5, st.color);
    s.addText(st.val, { x, y: 1.15, w: 2.7, h: 0.5, fontSize: 24, fontFace: FB, color: C.textWhite, bold: true, align: "center", margin: 0 });
    s.addText(st.label, { x, y: 1.65, w: 2.7, h: 0.25, fontSize: 12, fontFace: FB, color: C.textWhite, bold: true, align: "center", margin: 0 });
    s.addText(st.sub, { x, y: 1.9, w: 2.7, h: 0.25, fontSize: 10, fontFace: FB, color: C.textMuted, align: "center", margin: 0 });
  });
  darkCard(s, 0.7, 2.8, 8.6, 2.3, C.accent);
  s.addText("验证结果", { x: 0.9, y: 2.9, w: 3, h: 0.25, fontSize: 13, fontFace: FB, color: C.accent, bold: true, margin: 0 });
  addBullets(s, 0.9, 3.2, 8.2, 1.7, [
    "32台设备渲染正确，位置与种子数据一致",
    "指示灯颜色与status一一对应（normal→绿、warning→橙、error→红）",
    "脉冲频率差异化（1.4Hz/2.2Hz/4.4Hz）验证通过",
    "一致性校验自动修复功能正常",
    '直接解决了"巡检低效"痛点，运维人员无需逐台巡检',
  ], { color: C.textMuted, fontSize: 11, spacing: 1.3 });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}


// ============================================================
// Slide 27 — 验证二：数据汇聚与异步架构
// ============================================================
{
  const s = pres.addSlide();
  lightHeader(s, "06", "验证二：数据汇聚与异步架构");
  const stats = [
    { val: "32台", label: "设备监控", sub: "10项指标正常采集", color: C.green },
    { val: "≤3秒", label: "仪表盘加载", sub: "前端2.5s+后端<500ms", color: C.green },
    { val: "168ms", label: "触发延迟", sub: "Kafka异步解耦", color: C.green },
    { val: "100%", label: "幂等性", sub: "重复触发返回同一报告", color: C.green },
  ];
  stats.forEach((st, i) => {
    const x = 0.7 + i * 2.25;
    lightCard(s, x, 1.0, 2.0, 1.5, st.color);
    s.addText(st.val, { x, y: 1.15, w: 2.0, h: 0.5, fontSize: 22, fontFace: FB, color: st.color, bold: true, align: "center", margin: 0 });
    s.addText(st.label, { x, y: 1.65, w: 2.0, h: 0.22, fontSize: 11, fontFace: FB, color: C.textDark, bold: true, align: "center", margin: 0 });
    s.addText(st.sub, { x, y: 1.87, w: 2.0, h: 0.22, fontSize: 9.5, fontFace: FB, color: "475569", align: "center", margin: 0 });
  });
  lightCard(s, 0.7, 2.8, 8.6, 2.4, C.accent);
  s.addText("验证结果", { x: 0.9, y: 2.9, w: 3, h: 0.25, fontSize: 13, fontFace: FB, color: C.accent, bold: true, margin: 0 });
  addBullets(s, 0.9, 3.2, 8.2, 1.7, [
    "32台设备10项指标正常采集、存储与展示",
    "故障率趋势预测正常工作（Logistic模型+LLM辅助修正）",
    "Kafka异步解耦验证：触发延迟约168ms，高度一致",
    "幂等性验证：重复触发返回同一报告ID",
    '直接解决了"数据孤岛"痛点，所有数据统一存储和展示',
  ], { color: "475569", fontSize: 11, spacing: 1.3 });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}


// ============================================================
// Slide 28 — 验证三：因果发现准确性
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "06", "验证三：因果发现准确性");
  const verData = [
    [
      { text: "测试轮次", options: { fill: { color: C.accent }, color: C.bgDark, bold: true, fontSize: 10, align: "center" } },
      { text: "Top-1根源", options: { fill: { color: C.accent }, color: C.bgDark, bold: true, fontSize: 10, align: "center" } },
      { text: "Top-1得分", options: { fill: { color: C.accent }, color: C.bgDark, bold: true, fontSize: 10, align: "center" } },
      { text: "Top-2设备", options: { fill: { color: C.accent }, color: C.bgDark, bold: true, fontSize: 10, align: "center" } },
      { text: "Top-2得分", options: { fill: { color: C.accent }, color: C.bgDark, bold: true, fontSize: 10, align: "center" } },
      { text: "命中", options: { fill: { color: C.accent }, color: C.bgDark, bold: true, fontSize: 10, align: "center" } },
    ],
    [
      { text: "第1轮", options: { fill: { color: C.bgCard }, color: C.textWhite, fontSize: 10, align: "center" } },
      { text: "DEV009", options: { fill: { color: C.bgCard }, color: C.textWhite, fontSize: 10, align: "center" } },
      { text: "1.000", options: { fill: { color: C.bgCard }, color: C.green, bold: true, fontSize: 10, align: "center" } },
      { text: "DEV013", options: { fill: { color: C.bgCard }, color: C.textWhite, fontSize: 10, align: "center" } },
      { text: "0.582", options: { fill: { color: C.bgCard }, color: C.textWhite, fontSize: 10, align: "center" } },
      { text: "✓", options: { fill: { color: C.bgCard }, color: C.green, bold: true, fontSize: 12, align: "center" } },
    ],
    [
      { text: "第2轮", options: { fill: { color: C.bgCard }, color: C.textWhite, fontSize: 10, align: "center" } },
      { text: "DEV009", options: { fill: { color: C.bgCard }, color: C.textWhite, fontSize: 10, align: "center" } },
      { text: "1.000", options: { fill: { color: C.bgCard }, color: C.green, bold: true, fontSize: 10, align: "center" } },
      { text: "DEV013", options: { fill: { color: C.bgCard }, color: C.textWhite, fontSize: 10, align: "center" } },
      { text: "0.645", options: { fill: { color: C.bgCard }, color: C.textWhite, fontSize: 10, align: "center" } },
      { text: "✓", options: { fill: { color: C.bgCard }, color: C.green, bold: true, fontSize: 12, align: "center" } },
    ],
    [
      { text: "第3轮", options: { fill: { color: C.bgCard }, color: C.textWhite, fontSize: 10, align: "center" } },
      { text: "DEV009", options: { fill: { color: C.bgCard }, color: C.textWhite, fontSize: 10, align: "center" } },
      { text: "1.000", options: { fill: { color: C.bgCard }, color: C.green, bold: true, fontSize: 10, align: "center" } },
      { text: "DEV013", options: { fill: { color: C.bgCard }, color: C.textWhite, fontSize: 10, align: "center" } },
      { text: "0.663", options: { fill: { color: C.bgCard }, color: C.textWhite, fontSize: 10, align: "center" } },
      { text: "✓", options: { fill: { color: C.bgCard }, color: C.green, bold: true, fontSize: 12, align: "center" } },
    ],
  ];
  s.addTable(verData, {
    x: 0.7, y: 1.0, w: 8.6, h: 1.2,
    colW: [1.0, 1.4, 1.4, 1.4, 1.4, 1.0],
    border: { pt: 0.5, color: "334155" },
    rowH: [0.28, 0.3, 0.3, 0.3],
  });
  const perfStats = [
    { val: "100%", label: "Top-1命中率", color: C.green },
    { val: "155ms", label: "RCA推理延迟", color: C.green },
    { val: "0.34-0.42", label: "与第二名差距", color: C.accent },
  ];
  perfStats.forEach((st, i) => {
    const x = 0.7 + i * 3.0;
    darkCard(s, x, 2.5, 2.7, 1.0, st.color);
    s.addText(st.val, { x, y: 2.55, w: 2.7, h: 0.45, fontSize: 22, fontFace: FB, color: C.textWhite, bold: true, align: "center", margin: 0 });
    s.addText(st.label, { x, y: 3.0, w: 2.7, h: 0.25, fontSize: 11, fontFace: FB, color: C.textMuted, align: "center", margin: 0 });
  });
  darkCard(s, 0.7, 3.8, 8.6, 1.35, C.accent);
  s.addText("可控故障注入验证：4设备仿真序列，DEV009为根源（第18步起+0.3），DEV013为一级级联。三轮测试Top-1命中率100%。生产数据排序与物理事实一致，模型能区分真正高应力设备与仅标记为error的设备。", {
    x: 0.9, y: 3.9, w: 8.2, h: 1.0, fontSize: 11, fontFace: FB, color: C.textMuted, lineSpacingMultiple: 1.3, margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}


// ============================================================
// Slide 29 — 验证四：LLM报告与降级容错
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "06", "验证四：LLM报告与降级容错");
  const dgData = [
    [
      { text: "场景", options: { fill: { color: C.orange }, color: C.bgDark, bold: true, fontSize: 10, align: "center" } },
      { text: "RCA延迟", options: { fill: { color: C.orange }, color: C.bgDark, bold: true, fontSize: 10, align: "center" } },
      { text: "总延迟", options: { fill: { color: C.orange }, color: C.bgDark, bold: true, fontSize: 10, align: "center" } },
      { text: "报告产出", options: { fill: { color: C.orange }, color: C.bgDark, bold: true, fontSize: 10, align: "center" } },
      { text: "根源数据", options: { fill: { color: C.orange }, color: C.bgDark, bold: true, fontSize: 10, align: "center" } },
    ],
    [
      { text: "正常运行", options: { fill: { color: C.bgCard }, color: C.textWhite, fontSize: 10, align: "center" } },
      { text: "155ms", options: { fill: { color: C.bgCard }, color: C.textWhite, fontSize: 10, align: "center" } },
      { text: "21.3s", options: { fill: { color: C.bgCard }, color: C.textWhite, fontSize: 10, align: "center" } },
      { text: "成功", options: { fill: { color: C.bgCard }, color: C.green, bold: true, fontSize: 10, align: "center" } },
      { text: "完整(4根源+8边)", options: { fill: { color: C.bgCard }, color: C.textWhite, fontSize: 10, align: "center" } },
    ],
    [
      { text: "RCA停止", options: { fill: { color: C.bgCard }, color: C.textWhite, fontSize: 10, align: "center" } },
      { text: "3s超时", options: { fill: { color: C.bgCard }, color: C.orange, fontSize: 10, align: "center" } },
      { text: "24.3s", options: { fill: { color: C.bgCard }, color: C.textWhite, fontSize: 10, align: "center" } },
      { text: "成功", options: { fill: { color: C.bgCard }, color: C.green, bold: true, fontSize: 10, align: "center" } },
      { text: "无(降级载荷)", options: { fill: { color: C.bgCard }, color: C.orange, fontSize: 10, align: "center" } },
    ],
    [
      { text: "RCA恢复", options: { fill: { color: C.bgCard }, color: C.textWhite, fontSize: 10, align: "center" } },
      { text: "160ms", options: { fill: { color: C.bgCard }, color: C.textWhite, fontSize: 10, align: "center" } },
      { text: "21.3s", options: { fill: { color: C.bgCard }, color: C.textWhite, fontSize: 10, align: "center" } },
      { text: "成功", options: { fill: { color: C.bgCard }, color: C.green, bold: true, fontSize: 10, align: "center" } },
      { text: "完整(4根源+8边)", options: { fill: { color: C.bgCard }, color: C.textWhite, fontSize: 10, align: "center" } },
    ],
  ];
  s.addTable(dgData, {
    x: 0.7, y: 1.0, w: 8.6, h: 0.88,
    colW: [1.6, 1.4, 1.2, 1.2, 2.8],
    border: { pt: 0.5, color: "334155" },
    rowH: [0.22, 0.22, 0.22, 0.22],
  });
  const perfStats = [
    { val: "21.3s", label: "端到端延迟", sub: "需求≤2分钟", color: C.green },
    { val: "100%", label: "报告成功率", sub: "三个场景均成功", color: C.green },
    { val: "3秒", label: "降级额外延迟", sub: "RCA HTTP超时", color: C.orange },
  ];
  perfStats.forEach((st, i) => {
    const x = 0.7 + i * 3.0;
    darkCard(s, x, 2.2, 2.7, 1.3, st.color);
    s.addText(st.val, { x, y: 2.3, w: 2.7, h: 0.5, fontSize: 24, fontFace: FB, color: C.textWhite, bold: true, align: "center", margin: 0 });
    s.addText(st.label, { x, y: 2.8, w: 2.7, h: 0.22, fontSize: 11, fontFace: FB, color: C.textWhite, bold: true, align: "center", margin: 0 });
    s.addText(st.sub, { x, y: 3.0, w: 2.7, h: 0.22, fontSize: 9.5, fontFace: FB, color: C.textMuted, align: "center", margin: 0 });
  });
  darkCard(s, 0.7, 3.8, 8.6, 1.35, C.accent);
  s.addText('降级链验证了三个特性：自动触发（无需人工干预）、可逆恢复（RCA重启后自动恢复）、不影响报告产出（成功率均为100%）。直接解决了"报告靠人工"痛点。', {
    x: 0.9, y: 3.9, w: 8.2, h: 1.0, fontSize: 11, fontFace: FB, color: C.textMuted, lineSpacingMultiple: 1.3, margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}


// ============================================================
// Slide 30 — 与传统DCIM对比
// ============================================================
{
  const s = pres.addSlide();
  lightHeader(s, "06", "与传统DCIM系统能力对比");
  const compData = [
    [
      { text: "能力维度", options: { fill: { color: C.accent }, color: C.bgDark, bold: true, fontSize: 10, align: "center" } },
      { text: "传统DCIM", options: { fill: { color: C.accent }, color: C.bgDark, bold: true, fontSize: 10, align: "center" } },
      { text: "TwinOps", options: { fill: { color: C.accent }, color: C.bgDark, bold: true, fontSize: 10, align: "center" } },
    ],
    [
      { text: "状态可视化", options: { fill: { color: C.lightCard }, bold: true, fontSize: 10 } },
      { text: "二维列表展示", options: { fill: { color: C.lightCard }, fontSize: 10, align: "center" } },
      { text: "三维程序化场景，状态驱动视觉语言", options: { fill: { color: C.lightCard }, color: C.green, bold: true, fontSize: 10 } },
    ],
    [
      { text: "故障诊断", options: { fill: { color: C.lightCard }, bold: true, fontSize: 10 } },
      { text: "静态阈值告警，依赖经验排查", options: { fill: { color: C.lightCard }, fontSize: 10, align: "center" } },
      { text: "Granger因果发现自动排序根源", options: { fill: { color: C.lightCard }, color: C.green, bold: true, fontSize: 10 } },
    ],
    [
      { text: "数据整合", options: { fill: { color: C.lightCard }, bold: true, fontSize: 10 } },
      { text: "多个独立子系统，数据孤岛", options: { fill: { color: C.lightCard }, fontSize: 10, align: "center" } },
      { text: "统一MySQL汇聚，单一面板聚合展示", options: { fill: { color: C.lightCard }, color: C.green, bold: true, fontSize: 10 } },
    ],
    [
      { text: "报告生成", options: { fill: { color: C.lightCard }, bold: true, fontSize: 10 } },
      { text: "预置模板，人工撰写", options: { fill: { color: C.lightCard }, fontSize: 10, align: "center" } },
      { text: "LLM自动生成Markdown报告", options: { fill: { color: C.lightCard }, color: C.green, bold: true, fontSize: 10 } },
    ],
    [
      { text: "故障预测", options: { fill: { color: C.lightCard }, bold: true, fontSize: 10 } },
      { text: "无或简单趋势外推", options: { fill: { color: C.lightCard }, fontSize: 10, align: "center" } },
      { text: "Logistic+LLM双重预测", options: { fill: { color: C.lightCard }, color: C.green, bold: true, fontSize: 10 } },
    ],
    [
      { text: "降级容错", options: { fill: { color: C.lightCard }, bold: true, fontSize: 10 } },
      { text: "单一监控通道", options: { fill: { color: C.lightCard }, fontSize: 10, align: "center" } },
      { text: "三层降级链，任一可用即产出报告", options: { fill: { color: C.lightCard }, color: C.green, bold: true, fontSize: 10 } },
    ],
    [
      { text: "一致性保障", options: { fill: { color: C.lightCard }, bold: true, fontSize: 10 } },
      { text: "场景与数据分离维护", options: { fill: { color: C.lightCard }, fontSize: 10, align: "center" } },
      { text: "自动校验修复，双向同步", options: { fill: { color: C.lightCard }, color: C.green, bold: true, fontSize: 10 } },
    ],
  ];
  s.addTable(compData, {
    x: 0.7, y: 1.0, w: 8.6, h: 3.7,
    colW: [1.8, 3.0, 3.8],
    border: { pt: 0.5, color: "CBD5E1" },
    rowH: [0.35, 0.45, 0.45, 0.45, 0.45, 0.45, 0.45, 0.45],
  });
  s.addText("定性能力对照，非定量A/B实验 — 旨在展示功能维度上的改进", {
    x: 0.7, y: 4.95, w: 8.6, h: 0.35, fontSize: 11, fontFace: FB, color: C.textDark, align: "center", margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}


// ============================================================
// Slide 31 — 结论
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "07", "结论");
  s.addText("四个痛点，四套方案，形成完整运维闭环", {
    x: 0.7, y: 1.0, w: 8.6, h: 0.4, fontSize: 16, fontFace: FB, color: C.accent, bold: true, margin: 0
  });
  const contribs = [
    { pain: "巡检低效", solution: "三维数字孪生可视化", detail: "程序化场景 + 状态驱动视觉语言", color: C.accent },
    { pain: "数据孤岛", solution: "统一数据平台", detail: "MySQL汇聚 + Kafka异步解耦", color: C.accent2 },
    { pain: "诊断靠经验", solution: "AERCA因果发现", detail: "加权Z-score特征工程 + 无标注根源排序", color: C.orange },
    { pain: "报告靠人工", solution: "LLM智能报告", detail: "双模型策略 + 三层降级容错链", color: C.green },
  ];
  contribs.forEach((c, i) => {
    const y = 1.7 + i * 0.85;
    darkCard(s, 0.7, y, 8.6, 0.7, c.color);
    s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y, w: 0.06, h: 0.7, fill: { color: c.color } });
    s.addText(c.pain, { x: 0.95, y, w: 1.6, h: 0.7, fontSize: 12, fontFace: FB, color: c.color, bold: true, valign: "middle", margin: 0 });
    s.addText("→", { x: 2.6, y, w: 0.4, h: 0.7, fontSize: 16, fontFace: FB, color: C.textMuted, align: "center", valign: "middle", margin: 0 });
    s.addText(c.solution, { x: 3.0, y, w: 2.2, h: 0.7, fontSize: 13, fontFace: FB, color: C.textWhite, bold: true, valign: "middle", margin: 0 });
    s.addText(c.detail, { x: 5.3, y, w: 3.8, h: 0.7, fontSize: 11, fontFace: FB, color: C.textMuted, valign: "middle", margin: 0 });
  });
  s.addText('平台为数据中心运维从"被动响应"到"主动预防"提供了可行的技术方案', {
    x: 0.7, y: 5.1, w: 8.6, h: 0.3, fontSize: 13, fontFace: FB, color: C.accent, align: "center", bold: true, margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}


// ============================================================
// Slide 32 — Docker Compose部署
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "07", "Docker Compose容器化部署");
  const containers = [
    { name: "mysql", port: "3306", desc: "MySQL 8.0", color: C.accent },
    { name: "kafka", port: "9092", desc: "Kafka 3.8.1 KRaft", color: C.accent2 },
    { name: "kafka-init", port: "-", desc: "创建主题后退出", color: C.textMuted },
    { name: "backend", port: "8080", desc: "Spring Boot", color: C.accent3 },
    { name: "frontend", port: "8090", desc: "Nginx SPA", color: C.green },
    { name: "rca", port: "8091", desc: "Python FastAPI", color: C.purple },
  ];
  containers.forEach((c, i) => {
    const x = 0.7 + (i % 3) * 3.0;
    const y = 1.0 + Math.floor(i / 3) * 1.7;
    darkCard(s, x, y, 2.7, 1.4, c.color);
    s.addText(c.name, { x: x + 0.15, y: y + 0.12, w: 2.4, h: 0.3, fontSize: 14, fontFace: FB, color: c.color, bold: true, margin: 0 });
    s.addText(`端口 ${c.port}`, { x: x + 0.15, y: y + 0.45, w: 2.4, h: 0.25, fontSize: 11, fontFace: FB, color: C.textWhite, margin: 0 });
    s.addText(c.desc, { x: x + 0.15, y: y + 0.75, w: 2.4, h: 0.4, fontSize: 10.5, fontFace: FB, color: C.textMuted, margin: 0 });
  });
  darkCard(s, 0.7, 4.4, 8.6, 0.85, C.accent);
  s.addText("twinops-net桥接网络通信 · healthcheck有序启动 · 一键部署：docker compose up -d --build", {
    x: 0.9, y: 4.5, w: 8.2, h: 0.6, fontSize: 12, fontFace: FB, color: C.textWhite, align: "center", margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}


// ============================================================
// Slide 33 — 致谢
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bgDark };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.accent } });
  s.addText("感谢聆听", {
    x: 1, y: 1.5, w: 8, h: 1.2, fontSize: 48, fontFace: FT, color: C.textWhite, bold: true, align: "center", margin: 0
  });
  s.addText("Thank You", {
    x: 1, y: 2.6, w: 8, h: 0.6, fontSize: 24, fontFace: FB, color: C.textMuted, italic: true, align: "center", margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 3.5, y: 3.4, w: 3, h: 0.04, fill: { color: C.accent } });
  s.addText("答辩人：罗飞云", { x: 1, y: 3.8, w: 8, h: 0.35, fontSize: 14, fontFace: FB, color: C.textMuted, align: "center", margin: 0 });
  s.addText("指导教师：吴云鹏 副教授", { x: 1, y: 4.15, w: 8, h: 0.35, fontSize: 14, fontFace: FB, color: C.textMuted, align: "center", margin: 0 });
  s.addText("郑州大学 · 计算机与人工智能学院 · 2026", { x: 1, y: 4.55, w: 8, h: 0.3, fontSize: 12, fontFace: FB, color: "475569", align: "center", margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}

// ============================================================
// Write file
// ============================================================
pres.writeFile({ fileName: "/home/zzulfy/code/TwinOps/Thesis_Defense.pptx" })
  .then(() => console.log("✅ Thesis_Defense.pptx created successfully!"))
  .catch(err => console.error("❌ Error:", err));
