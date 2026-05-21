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
// Helper: slide header on dark bg
// ============================================================
function darkHeader(s, section, title) {
  s.background = { color: C.bgDark };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.accent } });
  s.addText(`${section}  ${title}`, {
    x: 0.7, y: 0.3, w: 8.6, h: 0.55,
    fontSize: 24, fontFace: FT, color: C.textWhite, bold: true, margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}

// Helper: slide header on light bg
function lightHeader(s, section, title) {
  s.background = { color: C.lightBg };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.accent } });
  s.addText(`${section}  ${title}`, {
    x: 0.7, y: 0.3, w: 8.6, h: 0.55,
    fontSize: 24, fontFace: FT, color: C.textDark, bold: true, margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}

// Helper: card on dark bg
function darkCard(s, x, y, w, h, accentColor) {
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: C.bgCard }, shadow: mkShadow() });
  if (accentColor) s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.05, fill: { color: accentColor } });
}

// Helper: card on light bg
function lightCard(s, x, y, w, h, accentColor) {
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: C.lightCard }, shadow: mkShadow() });
  if (accentColor) s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.05, fill: { color: accentColor } });
}

// ============================================================
// Slide 1 — Title
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
// Slide 2 — Outline
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "", "目录");
  const items = [
    { num: "01", title: "研究背景与问题", desc: "数据中心运维现状、研究现状与核心研究问题" },
    { num: "02", title: "相关技术", desc: "前后端技术栈、因果发现、LLM集成、容器化" },
    { num: "03", title: "系统分析与设计", desc: "需求分析、架构设计、数据库设计、接口设计" },
    { num: "04", title: "核心技术创新", desc: "特征工程、AERCA因果发现模型、LLM集成与降级容错" },
    { num: "05", title: "系统实现", desc: "数字孪生可视化、分析中心、智能分析与故障预测" },
    { num: "06", title: "测试与结果", desc: "功能测试、性能基准、根源定位验证、降级鲁棒性" },
    { num: "07", title: "结论与展望", desc: "贡献总结与未来工作方向" },
  ];
  items.forEach((item, i) => {
    const yBase = 1.0 + i * 0.62;
    s.addShape(pres.shapes.OVAL, { x: 0.7, y: yBase, w: 0.42, h: 0.42, fill: { color: i === 0 ? C.accent : C.bgCard } });
    s.addText(item.num, {
      x: 0.7, y: yBase, w: 0.42, h: 0.42, fontSize: 13, fontFace: FB, color: i === 0 ? C.bgDark : C.accent, bold: true, align: "center", valign: "middle", margin: 0
    });
    s.addText(item.title, { x: 1.3, y: yBase - 0.02, w: 3.0, h: 0.26, fontSize: 15, fontFace: FB, color: C.textWhite, bold: true, margin: 0 });
    s.addText(item.desc, { x: 1.3, y: yBase + 0.22, w: 4.5, h: 0.2, fontSize: 10.5, fontFace: FB, color: C.textMuted, margin: 0 });
  });
  // Right panel
  s.addShape(pres.shapes.RECTANGLE, { x: 6.5, y: 0.9, w: 3.0, h: 4.2, fill: { color: C.bgCard } });
  s.addShape(pres.shapes.RECTANGLE, { x: 6.5, y: 0.9, w: 0.06, h: 4.2, fill: { color: C.accent } });
  s.addText("TwinOps", { x: 6.7, y: 1.2, w: 2.6, h: 0.5, fontSize: 22, fontFace: FT, color: C.accent, bold: true, margin: 0 });
  s.addText("Digital Twin\nIntelligent\nOperations\nPlatform", { x: 6.7, y: 1.8, w: 2.6, h: 2.0, fontSize: 18, fontFace: FB, color: C.textMuted, lineSpacingMultiple: 1.5, margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}

// ============================================================
// Slide 3 — Research Background
// ============================================================
{
  const s = pres.addSlide();
  lightHeader(s, "01", "研究背景");
  const painPoints = [
    { icon: "01", title: "巡检效率低下", desc: "设备种类繁多（高压开关柜、UPS、精密配电柜、SVG、APF等），人工巡检难以全覆盖，漏检率高" },
    { icon: "02", title: "数据孤岛严重", desc: "运维数据分散在多个独立子系统，格式不统一，缺乏统一汇聚与分析平台" },
    { icon: "03", title: "故障诊断依赖经验", desc: "缺乏系统化因果推理手段，难以区分故障根源与级联受害者" },
    { icon: "04", title: "报告质量不一", desc: "运维报告依靠人工撰写，效率低、质量参差不齐，缺乏结构化分析" },
  ];
  painPoints.forEach((p, i) => {
    const x = 0.7 + i * 2.25;
    lightCard(s, x, 1.1, 2.0, 2.2, C.accent);
    s.addText(p.icon, { x: x + 0.15, y: 1.3, w: 0.4, h: 0.35, fontSize: 18, fontFace: FB, color: C.accent, bold: true, margin: 0 });
    s.addText(p.title, { x: x + 0.15, y: 1.7, w: 1.7, h: 0.3, fontSize: 13, fontFace: FB, color: C.textDark, bold: true, margin: 0 });
    s.addText(p.desc, { x: x + 0.15, y: 2.05, w: 1.7, h: 1.0, fontSize: 10.5, fontFace: FB, color: "475569", lineSpacingMultiple: 1.3, margin: 0 });
  });
  // Stats bar
  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 3.6, w: 8.6, h: 0.65, fill: { color: C.bgDark } });
  s.addText([
    { text: "1000万+ ", options: { bold: true, color: C.accent, fontSize: 18 } },
    { text: "标准机架     ", options: { color: C.textMuted, fontSize: 12 } },
    { text: "32台 ", options: { bold: true, color: C.accent, fontSize: 18 } },
    { text: "电力设备     ", options: { color: C.textMuted, fontSize: 12 } },
    { text: "6项 ", options: { bold: true, color: C.accent, fontSize: 18 } },
    { text: "异构指标     ", options: { color: C.textMuted, fontSize: 12 } },
    { text: "9项 ", options: { bold: true, color: C.accent, fontSize: 18 } },
    { text: "核心功能", options: { color: C.textMuted, fontSize: 12 } },
  ], { x: 0.7, y: 3.6, w: 8.6, h: 0.65, align: "center", valign: "middle", margin: 0 });
  s.addText("数字孪生技术通过构建物理实体的虚拟映射模型实现实时监测与优化控制，将三维可视化、因果推理和LLM技术结合，有望构建从数据感知到决策辅助的完整运维闭环", {
    x: 0.7, y: 4.5, w: 8.6, h: 0.6, fontSize: 12, fontFace: FB, color: C.textDark, align: "center", lineSpacingMultiple: 1.3, margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}

// ============================================================
// Slide 4 — Research Status (研究现状)
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "01", "研究现状");
  // Domestic
  darkCard(s, 0.7, 1.0, 4.1, 2.0, C.accent3);
  s.addText("国内研究", { x: 0.9, y: 1.15, w: 2, h: 0.3, fontSize: 14, fontFace: FB, color: C.accent3, bold: true, margin: 0 });
  s.addText([
    { text: "曾至诚等", options: { bold: true, color: C.textWhite, breakLine: false } },
    { text: " — 基于数字孪生的云网智能运维体系", options: { color: C.textMuted, breakLine: true } },
    { text: "郭占杰", options: { bold: true, color: C.textWhite, breakLine: false } },
    { text: " — 数字孪生在数据中心的适用性", options: { color: C.textMuted, breakLine: true } },
    { text: "许俊等", options: { bold: true, color: C.textWhite, breakLine: false } },
    { text: " — 基于BIM的数据中心数字孪生方案", options: { color: C.textMuted, breakLine: true } },
    { text: "张晨等", options: { bold: true, color: C.textWhite, breakLine: false } },
    { text: " — 面向数据中心的智能告警与根因分析", options: { color: C.textMuted, breakLine: true } },
  ], { x: 0.9, y: 1.5, w: 3.7, h: 1.3, fontSize: 11, fontFace: FB, lineSpacingMultiple: 1.35, margin: 0 });
  // International
  darkCard(s, 5.2, 1.0, 4.1, 2.0, C.accent2);
  s.addText("国际研究", { x: 5.4, y: 1.15, w: 2, h: 0.3, fontSize: 14, fontFace: FB, color: C.accent2, bold: true, margin: 0 });
  s.addText([
    { text: "Grieves (2003)", options: { bold: true, color: C.textWhite, breakLine: false } },
    { text: " — 数字孪生概念首次提出", options: { color: C.textMuted, breakLine: true } },
    { text: "Tao等 (2019)", options: { bold: true, color: C.textWhite, breakLine: false } },
    { text: " — 五维模型理论框架", options: { color: C.textMuted, breakLine: true } },
    { text: "Tank等 (2022)", options: { bold: true, color: C.textWhite, breakLine: false } },
    { text: " — 神经Granger因果框架cMLP/cLSTM", options: { color: C.textMuted, breakLine: true } },
    { text: "Han等 (2025)", options: { bold: true, color: C.textWhite, breakLine: false } },
    { text: " — AERCA因果发现模型 (ICLR Oral)", options: { color: C.textMuted, breakLine: true } },
  ], { x: 5.4, y: 1.5, w: 3.7, h: 1.3, fontSize: 11, fontFace: FB, lineSpacingMultiple: 1.35, margin: 0 });
  // Gap analysis
  darkCard(s, 0.7, 3.3, 8.6, 1.8, C.red);
  s.addText("现有工作不足", { x: 0.9, y: 3.45, w: 3, h: 0.3, fontSize: 14, fontFace: FB, color: C.red, bold: true, margin: 0 });
  s.addText([
    { text: "缺乏将三维可视化、遥测监控、因果分析和LLM报告整合为端到端闭环的工作", options: { bullet: true, breakLine: true } },
    { text: "缺乏异构指标（温度℃、功率W、CPU%等）适配至因果模型输入的工程方法", options: { bullet: true, breakLine: true } },
    { text: "各环节依赖人工衔接，缺乏自动化编排", options: { bullet: true, breakLine: true } },
    { text: "缺乏多AI服务协作的降级策略与容错机制", options: { bullet: true } },
  ], { x: 0.9, y: 3.8, w: 8.2, h: 1.15, fontSize: 11.5, fontFace: FB, color: C.textWhite, lineSpacingMultiple: 1.3, margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}

// ============================================================
// Slide 5 — Core Research Problem
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "01", "核心研究问题");
  // Core question
  darkCard(s, 0.7, 1.05, 8.6, 0.8, C.accent);
  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.05, w: 0.06, h: 0.8, fill: { color: C.accent } });
  s.addText("如何通过数字孪生平台实现基于Granger因果分析的设备故障根源自动识别，\n并将异构运维数据适配至因果模型输入约束，同时将推理结果通过可视化与自然语言双通道传达给运维人员？", {
    x: 1.0, y: 1.05, w: 8.1, h: 0.8, fontSize: 12.5, fontFace: FB, color: C.textWhite, lineSpacingMultiple: 1.4, margin: 0
  });
  // Three sub-problems
  const subs = [
    { num: "子问题一", title: "异构指标统一表征", desc: "如何将量纲不同、数量级悬殊的多维遥测指标统一映射为因果模型可接受的表征，同时保留差异化贡献权重？", color: C.accent },
    { num: "子问题二", title: "无标注因果结构发现", desc: "如何在缺乏因果图标注的条件下，利用自解释神经网络自动学习Granger因果结构与根源排序？", color: C.accent2 },
    { num: "子问题三", title: "因果结果语义化呈现", desc: "如何将因果系数、根源得分等抽象结果通过三维视觉语言和LLM报告双通道输出，降低认知转换成本？", color: C.accent3 },
  ];
  subs.forEach((sp, i) => {
    const x = 0.7 + i * 3.0;
    darkCard(s, x, 2.2, 2.7, 2.6, sp.color);
    s.addText(sp.num, { x: x + 0.2, y: 2.4, w: 2.3, h: 0.28, fontSize: 12, fontFace: FB, color: sp.color, bold: true, margin: 0 });
    s.addText(sp.title, { x: x + 0.2, y: 2.7, w: 2.3, h: 0.32, fontSize: 15, fontFace: FB, color: C.textWhite, bold: true, margin: 0 });
    s.addText(sp.desc, { x: x + 0.2, y: 3.1, w: 2.3, h: 1.4, fontSize: 11, fontFace: FB, color: C.textMuted, lineSpacingMultiple: 1.4, margin: 0 });
  });
  s.addText("数据表征  →  因果发现  →  语义呈现", {
    x: 0.7, y: 5.0, w: 8.6, h: 0.35, fontSize: 14, fontFace: FB, color: C.accent, align: "center", bold: true, margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}

// ============================================================
// Slide 6 — Related Tech: Backend & Frontend
// ============================================================
{
  const s = pres.addSlide();
  lightHeader(s, "02", "相关技术 — 前后端与数据层");
  // Backend
  lightCard(s, 0.7, 1.0, 4.2, 2.5, C.accent3);
  s.addText("服务端技术", { x: 0.9, y: 1.15, w: 3, h: 0.3, fontSize: 14, fontFace: FB, color: C.accent3, bold: true, margin: 0 });
  s.addText([
    { text: "Spring Boot 3.3.4", options: { bold: true, color: C.textDark, breakLine: false } },
    { text: " — 模块化单体架构，7个限界上下文", options: { color: "475569", breakLine: true } },
    { text: "MyBatis-Plus 3.5.7", options: { bold: true, color: C.textDark, breakLine: false } },
    { text: " — 通用CRUD + Lambda条件构造器", options: { color: "475569", breakLine: true } },
    { text: "MySQL 8.0", options: { bold: true, color: C.textDark, breakLine: false } },
    { text: " — InnoDB + utf8mb4，原生JSON类型", options: { color: "475569", breakLine: true } },
    { text: "Apache Kafka 3.8.1", options: { bold: true, color: C.textDark, breakLine: false } },
    { text: " — 单分区analysis.request异步调度", options: { color: "475569", breakLine: true } },
    { text: "LangChain4j 1.3.0", options: { bold: true, color: C.textDark, breakLine: false } },
    { text: " — LLM集成（DeepSeek, OpenAI兼容）", options: { color: "475569" } },
  ], { x: 0.9, y: 1.5, w: 3.8, h: 1.8, fontSize: 11, fontFace: FB, lineSpacingMultiple: 1.3, margin: 0 });
  // Frontend
  lightCard(s, 5.2, 1.0, 4.2, 2.5, C.accent);
  s.addText("前端技术", { x: 5.4, y: 1.15, w: 3, h: 0.3, fontSize: 14, fontFace: FB, color: C.accent, bold: true, margin: 0 });
  s.addText([
    { text: "React 19 + TypeScript 5.9", options: { bold: true, color: C.textDark, breakLine: false } },
    { text: " — SPA单页应用", options: { color: "475569", breakLine: true } },
    { text: "Vite 7.3", options: { bold: true, color: C.textDark, breakLine: false } },
    { text: " — 开发与构建，manualChunks分片", options: { color: "475569", breakLine: true } },
    { text: "Three.js 0.170", options: { bold: true, color: C.textDark, breakLine: false } },
    { text: " — 程序化3D场景（无外部GLB）", options: { color: "475569", breakLine: true } },
    { text: "ECharts 5.4", options: { bold: true, color: C.textDark, breakLine: false } },
    { text: " — Canvas渲染，故障率趋势图表", options: { color: "475569", breakLine: true } },
    { text: "GSAP 3.12 + Tween.js 19.0", options: { bold: true, color: C.textDark, breakLine: false } },
    { text: " — 动画效果", options: { color: "475569" } },
  ], { x: 5.4, y: 1.5, w: 3.8, h: 1.8, fontSize: 11, fontFace: FB, lineSpacingMultiple: 1.3, margin: 0 });
  // Dev environment
  lightCard(s, 0.7, 3.8, 8.6, 1.4, C.purple);
  s.addText("开发与运行环境", { x: 0.9, y: 3.9, w: 3, h: 0.3, fontSize: 14, fontFace: FB, color: C.purple, bold: true, margin: 0 });
  s.addText("Ubuntu (WSL2, Linux 6.6)  |  OpenJDK 17  |  Maven 3.x  |  CPython 3.11  |  PyTorch 2.x  |  FastAPI + Uvicorn  |  Docker Compose容器化编排", {
    x: 0.9, y: 4.25, w: 8.2, h: 0.35, fontSize: 11.5, fontFace: FB, color: "475569", margin: 0
  });
  s.addText("六个容器：mysql (3306) · kafka (9092, KRaft) · kafka-init · backend (8080) · frontend (8090, Nginx) · rca (8091)  —  twinops-net桥接网络", {
    x: 0.9, y: 4.65, w: 8.2, h: 0.35, fontSize: 11, fontFace: FB, color: "475569", margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}

// ============================================================
// Slide 7 — Related Tech: Causal Discovery & LLM
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "02", "相关技术 — 因果发现与LLM");
  // AERCA
  darkCard(s, 0.7, 1.0, 4.2, 2.3, C.accent2);
  s.addText("AERCA因果发现模型", { x: 0.9, y: 1.15, w: 3, h: 0.3, fontSize: 14, fontFace: FB, color: C.accent2, bold: true, margin: 0 });
  s.addText([
    { text: "Han等 (ICLR 2025 Oral)", options: { bold: true, color: C.textWhite, breakLine: true } },
    { text: "", options: { breakLine: true, fontSize: 4 } },
    { text: "基于自解释神经网络（SENNGC）与Granger因果性的多变量时间序列异常根源定位方法", options: { color: C.textMuted, breakLine: true } },
    { text: "", options: { breakLine: true, fontSize: 4 } },
    { text: "通过广义向量自回归机制学习设备间的动态因果系数矩阵，利用重构残差的Z-score偏差实现无标注根源排序", options: { color: C.textMuted } },
  ], { x: 0.9, y: 1.5, w: 3.8, h: 1.6, fontSize: 11, fontFace: FB, lineSpacingMultiple: 1.25, margin: 0 });
  // LLM
  darkCard(s, 5.2, 1.0, 4.2, 2.3, C.green);
  s.addText("大语言模型集成", { x: 5.4, y: 1.15, w: 3, h: 0.3, fontSize: 14, fontFace: FB, color: C.green, bold: true, margin: 0 });
  s.addText([
    { text: "LangChain4j 1.3.0 + DeepSeek", options: { bold: true, color: C.textWhite, breakLine: true } },
    { text: "", options: { breakLine: true, fontSize: 4 } },
    { text: "双模型实例策略：预测模型(maxTokens=512)生成结构化JSON，报告模型(maxTokens=2048)撰写Markdown分析报告", options: { color: C.textMuted, breakLine: true } },
    { text: "", options: { breakLine: true, fontSize: 4 } },
    { text: "三层降级链：RCA+LLM → LLM独立 → 规则引擎+预置模板，确保分析管道连续可用", options: { color: C.textMuted } },
  ], { x: 5.4, y: 1.5, w: 3.8, h: 1.6, fontSize: 11, fontFace: FB, lineSpacingMultiple: 1.25, margin: 0 });
  // Docker
  darkCard(s, 0.7, 3.6, 8.6, 1.6, C.accent3);
  s.addText("容器化与编排", { x: 0.9, y: 3.7, w: 3, h: 0.3, fontSize: 14, fontFace: FB, color: C.accent3, bold: true, margin: 0 });
  s.addText("Docker容器化 + Docker Compose声明式编排。平台包含六个容器：mysql（MySQL 8.0, 端口3306）、kafka（Kafka 3.8.1, KRaft模式, 端口9092）、kafka-init（创建主题后退出）、backend（端口8080）、frontend（Nginx托管SPA, 端口8090）、rca（Python推理, 端口8091）。服务通过twinops-net桥接网络通信，healthcheck机制实现有序启动。", {
    x: 0.9, y: 4.05, w: 8.2, h: 1.0, fontSize: 11, fontFace: FB, color: C.textMuted, lineSpacingMultiple: 1.3, margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}

// ============================================================
// Slide 8 — Requirements Analysis
// ============================================================
{
  const s = pres.addSlide();
  lightHeader(s, "03", "系统分析 — 需求与可行性");
  // Functional requirements
  lightCard(s, 0.7, 1.0, 5.5, 3.0, C.accent);
  s.addText("九项核心功能需求", { x: 0.9, y: 1.1, w: 4, h: 0.3, fontSize: 14, fontFace: FB, color: C.accent, bold: true, margin: 0 });
  const funcs = [
    "管理员认证与鉴权（Bearer Token）",
    "设备列表与详情查询（32台设备）",
    "模拟设备一致性校验（自动修复）",
    "三维场景交互可视化（射线投射）",
    "遥测数据查询与故障率统计",
    "仪表盘聚合看板（自动刷新）",
    "告警管理（new→resolved闭环）",
    "智能分析与报告生成（手动/定时）",
    "管理员关注列表（决策闭环）",
  ];
  s.addText(funcs.map((f, i) => ({
    text: `${i + 1}. ${f}`,
    options: { breakLine: true, fontSize: 11, color: C.textDark, fontFace: FB }
  })), { x: 0.9, y: 1.5, w: 5.1, h: 2.3, lineSpacingMultiple: 1.25, margin: 0 });
  // Non-functional & Feasibility
  lightCard(s, 6.5, 1.0, 2.8, 1.3, C.accent2);
  s.addText("性能需求", { x: 6.7, y: 1.1, w: 2.4, h: 0.25, fontSize: 13, fontFace: FB, color: C.accent2, bold: true, margin: 0 });
  s.addText("仪表盘 ≤ 3秒\n三维渲染 ≥ 30fps\n报告生成 ≤ 2分钟\n支持32+台设备监控", {
    x: 6.7, y: 1.4, w: 2.4, h: 0.8, fontSize: 10.5, fontFace: FB, color: "475569", lineSpacingMultiple: 1.3, margin: 0
  });
  lightCard(s, 6.5, 2.5, 2.8, 1.5, C.green);
  s.addText("可行性分析", { x: 6.7, y: 2.6, w: 2.4, h: 0.25, fontSize: 13, fontFace: FB, color: C.green, bold: true, margin: 0 });
  s.addText([
    { text: "技术：", options: { bold: true, color: C.textDark, breakLine: false } },
    { text: "成熟开源组件", options: { color: "475569", breakLine: true } },
    { text: "操作：", options: { bold: true, color: C.textDark, breakLine: false } },
    { text: "学习成本低", options: { color: "475569", breakLine: true } },
    { text: "经济：", options: { bold: true, color: C.textDark, breakLine: false } },
    { text: "全部开源免费", options: { color: "475569", breakLine: true } },
    { text: "硬件：", options: { bold: true, color: C.textDark, breakLine: false } },
    { text: "4核CPU/16GB/100GB", options: { color: "475569" } },
  ], { x: 6.7, y: 2.9, w: 2.4, h: 1.0, fontSize: 10.5, fontFace: FB, lineSpacingMultiple: 1.2, margin: 0 });
  // Development method
  lightCard(s, 0.7, 4.25, 8.6, 0.95, C.purple);
  s.addText("开发方法：敏捷迭代 + DDD思想", { x: 0.9, y: 4.35, w: 4, h: 0.25, fontSize: 13, fontFace: FB, color: C.purple, bold: true, margin: 0 });
  s.addText("两周迭代周期，优先构建基础模块，依次交付可视化、告警、分析管道和三维场景。核心业务流程：设备巡检→状态监控→异常发现→告警通知→根因分析→报告生成→闭环处置。", {
    x: 0.9, y: 4.65, w: 8.2, h: 0.4, fontSize: 11, fontFace: FB, color: "475569", margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}

// ============================================================
// Slide 9 — System Architecture (6-layer)
// ============================================================
{
  const s = pres.addSlide();
  lightHeader(s, "03", "系统设计 — 六层技术架构");
  const layers = [
    { name: "表示层", tech: "React 19 SPA + Vite + Three.js 3D场景 + ECharts图表，HashRouter路由 + AuthGuard", color: "3B82F6" },
    { name: "API网关层", tech: "Spring MVC Controller · 20个RESTful端点 · AdminAuthInterceptor Bearer Token认证 · ApiResponse统一封装", color: "6366F1" },
    { name: "AI推理层", tech: "LangChain4j LLM适配器(JVM内) + FastAPI AERCA引擎(独立Python微服务, POST /infer/device-rca)", color: "8B5CF6" },
    { name: "业务逻辑层", tech: "Spring Boot模块化单体 · 7个限界上下文(package) · Service通过MyBatis-Plus Mapper交互", color: "A855F7" },
    { name: "消息中间件层", tech: "Apache Kafka 3.8.1 · 单分区主题analysis.request · 幂等键分区 · 异步解耦分析任务", color: "D946EF" },
    { name: "数据存储层", tech: "MySQL 8.0 · 5张核心表(devices/device_metrics/alarms/analysis_reports/admin_watchlist) · InnoDB + utf8mb4", color: "EC4899" },
  ];
  layers.forEach((l, i) => {
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
// Slide 10 — Logical Architecture & DB Design
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "03", "系统设计 — 逻辑架构与数据库");
  // Logical layers
  const logLayers = [
    { name: "基础设施层", desc: "MyBatis-Plus Mapper · Kafka Template/Listener · RestClient(RCA侧车) · LangChain4j ChatModel · 认证拦截器", color: C.accent },
    { name: "领域层", desc: "设备聚合根 · 遥测查询聚合 · 告警生命周期(new→resolved) · 报告幂等创建与状态流转 · 加权Z-score · AERCA解析", color: C.accent2 },
    { name: "应用层", desc: "DashboardService聚合 · AnalysisService编排(筛选→组装→RCA→LLM→持久化) · TriggerService手动/定时触发", color: C.accent3 },
    { name: "用户界面层", desc: "DashboardPage(3D+统计) · AnalysisCenterPage(报告列表+详情) · DeviceDetailPage(遥测+告警) · LoginPage", color: C.green },
  ];
  logLayers.forEach((l, i) => {
    const y = 1.05 + i * 0.55;
    darkCard(s, 0.7, y, 5.5, 0.45, l.color);
    s.addText(l.name, { x: 0.9, y, w: 1.3, h: 0.45, fontSize: 11.5, fontFace: FB, color: l.color, bold: true, valign: "middle", margin: 0 });
    s.addText(l.desc, { x: 2.3, y, w: 3.7, h: 0.45, fontSize: 10, fontFace: FB, color: C.textMuted, valign: "middle", margin: 0 });
  });
  // DB tables
  darkCard(s, 6.5, 1.05, 2.8, 4.1, C.purple);
  s.addText("五张核心表", { x: 6.7, y: 1.15, w: 2.4, h: 0.3, fontSize: 13, fontFace: FB, color: C.purple, bold: true, margin: 0 });
  const tables = [
    { name: "devices", desc: "32台设备信息（聚合根）" },
    { name: "device_metrics", desc: "每分钟10项遥测快照\n约1.8万行" },
    { name: "alarms", desc: "告警及处置状态\n(new/resolved)" },
    { name: "analysis_reports", desc: "分析结果（JSON列存储\nRCA+LLM输出）" },
    { name: "admin_watchlist", desc: "关注关系\n(复合唯一约束)" },
  ];
  tables.forEach((t, i) => {
    const y = 1.55 + i * 0.7;
    s.addText(t.name, { x: 6.7, y, w: 2.4, h: 0.22, fontSize: 11, fontFace: FB, color: C.accent, bold: true, margin: 0 });
    s.addText(t.desc, { x: 6.7, y: y + 0.22, w: 2.4, h: 0.4, fontSize: 10, fontFace: FB, color: C.textMuted, lineSpacingMultiple: 1.2, margin: 0 });
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}

// ============================================================
// Slide 11 — API Design
// ============================================================
{
  const s = pres.addSlide();
  lightHeader(s, "03", "系统设计 — API接口");
  // API table
  const apiData = [
    [
      { text: "方法", options: { fill: { color: C.accent }, color: C.bgDark, bold: true, fontSize: 10, align: "center" } },
      { text: "路径", options: { fill: { color: C.accent }, color: C.bgDark, bold: true, fontSize: 10, align: "center" } },
      { text: "认证", options: { fill: { color: C.accent }, color: C.bgDark, bold: true, fontSize: 10, align: "center" } },
      { text: "功能描述", options: { fill: { color: C.accent }, color: C.bgDark, bold: true, fontSize: 10, align: "center" } },
    ],
    [
      { text: "POST", options: { fill: { color: C.lightCard }, fontSize: 10, align: "center" } },
      { text: "/api/auth/login", options: { fill: { color: C.lightCard }, fontSize: 9.5 } },
      { text: "否", options: { fill: { color: C.lightCard }, fontSize: 10, align: "center" } },
      { text: "管理员登录，返回访问令牌", options: { fill: { color: C.lightCard }, fontSize: 9.5 } },
    ],
    [
      { text: "GET", options: { fill: { color: C.lightCard }, fontSize: 10, align: "center" } },
      { text: "/api/dashboard/summary", options: { fill: { color: C.lightCard }, fontSize: 9.5 } },
      { text: "是", options: { fill: { color: C.lightCard }, fontSize: 10, align: "center" } },
      { text: "仪表盘聚合摘要数据", options: { fill: { color: C.lightCard }, fontSize: 9.5 } },
    ],
    [
      { text: "GET", options: { fill: { color: C.lightCard }, fontSize: 10, align: "center" } },
      { text: "/api/devices/{code}", options: { fill: { color: C.lightCard }, fontSize: 9.5 } },
      { text: "是", options: { fill: { color: C.lightCard }, fontSize: 10, align: "center" } },
      { text: "设备详情（含遥测与告警）", options: { fill: { color: C.lightCard }, fontSize: 9.5 } },
    ],
    [
      { text: "GET", options: { fill: { color: C.lightCard }, fontSize: 10, align: "center" } },
      { text: "/api/devices/simulation-consistency", options: { fill: { color: C.lightCard }, fontSize: 9.5 } },
      { text: "是", options: { fill: { color: C.lightCard }, fontSize: 10, align: "center" } },
      { text: "校验并自动修复设备一致性", options: { fill: { color: C.lightCard }, fontSize: 9.5 } },
    ],
    [
      { text: "POST", options: { fill: { color: C.lightCard }, fontSize: 10, align: "center" } },
      { text: "/api/analysis/reports/trigger", options: { fill: { color: C.lightCard }, fontSize: 9.5 } },
      { text: "是", options: { fill: { color: C.lightCard }, fontSize: 10, align: "center" } },
      { text: "手动触发聚合分析", options: { fill: { color: C.lightCard }, fontSize: 9.5 } },
    ],
    [
      { text: "GET", options: { fill: { color: C.lightCard }, fontSize: 10, align: "center" } },
      { text: "/api/analysis/reports/{id}", options: { fill: { color: C.lightCard }, fontSize: 9.5 } },
      { text: "是", options: { fill: { color: C.lightCard }, fontSize: 10, align: "center" } },
      { text: "查询分析报告详情", options: { fill: { color: C.lightCard }, fontSize: 9.5 } },
    ],
    [
      { text: "PATCH", options: { fill: { color: C.lightCard }, fontSize: 10, align: "center" } },
      { text: "/api/alarms/{id}/status", options: { fill: { color: C.lightCard }, fontSize: 9.5 } },
      { text: "是", options: { fill: { color: C.lightCard }, fontSize: 10, align: "center" } },
      { text: "更新告警状态 (new→resolved)", options: { fill: { color: C.lightCard }, fontSize: 9.5 } },
    ],
  ];
  s.addTable(apiData, {
    x: 0.7, y: 1.05, w: 8.6, h: 3.2,
    colW: [0.8, 3.0, 0.7, 4.1],
    border: { pt: 0.5, color: "CBD5E1" },
    rowH: [0.32, 0.36, 0.36, 0.36, 0.36, 0.36, 0.36, 0.36],
  });
  // Response format
  lightCard(s, 0.7, 4.45, 8.6, 0.8, C.accent);
  s.addText("统一响应格式", { x: 0.9, y: 4.5, w: 2, h: 0.25, fontSize: 12, fontFace: FB, color: C.accent, bold: true, margin: 0 });
  s.addText('{ "success": true, "message": "操作成功", "data": { ... } }    —    共20个RESTful端点，受保护接口统一Bearer Token认证，AdminAuthInterceptor拦截', {
    x: 0.9, y: 4.8, w: 8.2, h: 0.3, fontSize: 11, fontFace: FB, color: "475569", margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}

// ============================================================
// Slide 12 — Analysis Pipeline Design (7 steps)
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "03", "系统设计 — 分析管道七步流程");
  const steps = [
    { num: "1", name: "触发", desc: "手动(页面按钮)\n定时(cron零点/正午)\n查询warning/error设备", color: C.accent3 },
    { num: "2", name: "预创建", desc: "插入status=processing\nidempotency_key唯一约束\n幂等防重复分析", color: C.accent3 },
    { num: "3", name: "消息发布", desc: "序列化JSON发布Kafka\nanalysis.request主题\n幂等键为分区键，5s超时", color: C.accent },
    { num: "4", name: "异步消费", desc: "Consumer路由至批量处理\n查询异常设备1h遥测\n组装复合压力指标矩阵", color: C.accent },
    { num: "5", name: "RCA推理", desc: "特征工程归一化应力序列\n时间×设备矩阵→AERCA\n不可用时降级LLM独立分析", color: C.accent2 },
    { num: "6", name: "LLM生成", desc: "预测模型→结构化JSON\n报告模型→Markdown报告\n双模型实例策略", color: C.green },
    { num: "7", name: "状态更新", desc: "结果写回analysis_reports\nsuccess或failed\n超10min自动回收为failed", color: C.green },
  ];
  steps.forEach((st, i) => {
    const x = 0.45 + i * 1.32;
    darkCard(s, x, 1.1, 1.18, 2.6, st.color);
    s.addShape(pres.shapes.OVAL, { x: x + 0.4, y: 1.3, w: 0.38, h: 0.38, fill: { color: st.color } });
    s.addText(st.num, { x: x + 0.4, y: 1.3, w: 0.38, h: 0.38, fontSize: 14, fontFace: FB, color: C.bgDark, bold: true, align: "center", valign: "middle", margin: 0 });
    s.addText(st.name, { x: x + 0.05, y: 1.75, w: 1.08, h: 0.28, fontSize: 12, fontFace: FB, color: C.textWhite, bold: true, align: "center", margin: 0 });
    s.addText(st.desc, { x: x + 0.05, y: 2.1, w: 1.08, h: 1.3, fontSize: 9.5, fontFace: FB, color: C.textMuted, align: "center", lineSpacingMultiple: 1.3, margin: 0 });
  });
  for (let i = 0; i < 6; i++) {
    const x = 0.45 + (i + 1) * 1.32 - 0.12;
    s.addText("→", { x, y: 1.7, w: 0.24, h: 0.3, fontSize: 16, fontFace: FB, color: C.accent, align: "center", valign: "middle", margin: 0 });
  }
  // Key design decisions
  darkCard(s, 0.7, 4.0, 8.6, 1.2, C.purple);
  s.addText("关键设计决策", { x: 0.9, y: 4.1, w: 3, h: 0.25, fontSize: 13, fontFace: FB, color: C.purple, bold: true, margin: 0 });
  s.addText("幂等性：idempotency_key基于时间戳构造，唯一约束防止重复分析，冲突时返回已有报告ID。异步解耦：Kafka将耗时计算从同步HTTP周期中解耦。自动回收：超过10分钟的processing报告自动回收为failed，确保管道不阻塞。设备筛选：error优先于warning，最多取前10台设备参与分析。", {
    x: 0.9, y: 4.4, w: 8.2, h: 0.7, fontSize: 11, fontFace: FB, color: C.textMuted, lineSpacingMultiple: 1.3, margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}

// ============================================================
// Slide 13 — Innovation: Feature Engineering (Z-score)
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "04", "加权正向Z-score特征工程");
  // Problem
  darkCard(s, 0.7, 1.0, 4.1, 1.8, C.red);
  s.addText("问题", { x: 0.9, y: 1.1, w: 1.5, h: 0.28, fontSize: 14, fontFace: FB, color: C.red, bold: true, margin: 0 });
  s.addText([
    { text: "六项异构指标无法直接输入AERCA模型：", options: { bold: true, color: C.textWhite, breakLine: true, fontSize: 11.5 } },
    { text: "温度(℃) · 功率(W) · CPU负载(%) · 内存(%) · 磁盘(%) · 网络(Mbps)", options: { breakLine: true, fontSize: 11, color: C.textMuted } },
    { text: "", options: { breakLine: true, fontSize: 4 } },
    { text: "物理量纲、数量级和波动特征存在显著差异，AERCA系数矩阵偏向量级较大的变量", options: { fontSize: 11, color: C.textMuted } },
  ], { x: 0.9, y: 1.4, w: 3.7, h: 1.2, lineSpacingMultiple: 1.2, margin: 0 });
  // Solution
  darkCard(s, 5.2, 1.0, 4.1, 1.8, C.green);
  s.addText("方案（四步归一化）", { x: 5.4, y: 1.1, w: 3, h: 0.28, fontSize: 14, fontFace: FB, color: C.green, bold: true, margin: 0 });
  s.addText([
    { text: "① Z-score归一化", options: { bold: true, color: C.textWhite, breakLine: false } },
    { text: " → 消除量级差异", options: { color: C.textMuted, breakLine: true } },
    { text: "② 正向截断", options: { bold: true, color: C.textWhite, breakLine: false } },
    { text: " → 仅保留高于均值的偏差", options: { color: C.textMuted, breakLine: true } },
    { text: "③ 差异化加权", options: { bold: true, color: C.textWhite, breakLine: false } },
    { text: " → 体现领域优先级", options: { color: C.textMuted, breakLine: true } },
    { text: "④ 加权求和", options: { bold: true, color: C.textWhite, breakLine: false } },
    { text: " → 一维复合应力序列", options: { color: C.textMuted, breakLine: true } },
    { text: "每一步操作均有明确运维语义对应", options: { italic: true, color: C.accent, fontSize: 10.5 } },
  ], { x: 5.4, y: 1.4, w: 3.7, h: 1.25, lineSpacingMultiple: 1.2, margin: 0 });
  // Weight table
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
  // Bottom note card
  darkCard(s, 0.7, 4.4, 8.6, 0.85, null);
  s.addText("权重为基于领域知识的预设值（非数据自动学习），牺牲数据驱动优化换取可解释性和无需标注数据的工程可行性。正向截断将运维领域\"只有偏高才需关注\"的经验直觉转化为数学操作，避免正常低负载波动稀释异常信号。", {
    x: 0.9, y: 4.5, w: 8.2, h: 0.65, fontSize: 11, fontFace: FB, color: C.textMuted, lineSpacingMultiple: 1.3, margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}

// ============================================================
// Slide 14 — AERCA Model Principle
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "04", "AERCA因果发现模型 — 模型原理");
  // Three components
  const comps = [
    { name: "SENNGC编码器", desc: "每个滞后步k学习p×p系数矩阵\nΘ_k(x) = reshape(f_ψk(x))\n系数网络：Linear→ReLU→4×残差块→Tanh\n系数θ_ij直接量化Granger因果强度", color: C.accent },
    { name: "GVAR预测与残差", desc: "x̂_t = Σ Θ_k(x)·x_{t-k-1}\nu_t = x̂_t - x_t (创新项)\n正常：u_t ≈ N(0,I)\n异常：u_t显著偏离正态分布", color: C.accent2 },
    { name: "根源评分与因果边", desc: "z_i(t) = -(u_i(t)-μ_i)/σ_i\n正向截断 → 90%分位数 → 归一化\nroot_score_i ∈ [0,1]\nTop-8有向因果边输出", color: C.accent3 },
  ];
  comps.forEach((c, i) => {
    const x = 0.7 + i * 3.0;
    darkCard(s, x, 1.05, 2.7, 2.3, c.color);
    s.addText(c.name, { x: x + 0.15, y: 1.2, w: 2.4, h: 0.3, fontSize: 14, fontFace: FB, color: c.color, bold: true, margin: 0 });
    s.addText(c.desc, { x: x + 0.15, y: 1.55, w: 2.4, h: 1.6, fontSize: 10.5, fontFace: FB, color: C.textMuted, lineSpacingMultiple: 1.35, margin: 0 });
  });
  // Training loss
  darkCard(s, 0.7, 3.6, 8.6, 0.75, C.purple);
  s.addText("训练损失函数：L = L_recon + λ₁·L_sparsity + λ₂·L_smooth + λ₃·L_KL", {
    x: 0.9, y: 3.65, w: 8.2, h: 0.3, fontSize: 13, fontFace: FB, color: C.accent, bold: true, margin: 0
  });
  s.addText("重构误差 + 弹性网正则化(稀疏因果边) + 时序平滑性(因果结构短时稳定) + KL散度(创新项趋近标准正态)", {
    x: 0.9, y: 3.95, w: 8.2, h: 0.3, fontSize: 11, fontFace: FB, color: C.textMuted, margin: 0
  });
  // Key advantage
  s.addText("无标注学习 · 可解释系数矩阵 · 非线性因果建模 · SWaT工业数据集验证优于VAR/cMLP/cLSTM/TCDF", {
    x: 0.7, y: 4.6, w: 8.6, h: 0.4, fontSize: 13, fontFace: FB, color: C.green, align: "center", bold: true, margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}

// ============================================================
// Slide 15 — AERCA Hyperparameters & Selection
// ============================================================
{
  const s = pres.addSlide();
  lightHeader(s, "04", "AERCA模型 — 超参数配置与选型依据");
  // Hyperparameter table
  const hpData = [
    [
      { text: "参数类别", options: { fill: { color: C.accent }, color: C.bgDark, bold: true, fontSize: 10, align: "center" } },
      { text: "参数名称", options: { fill: { color: C.accent }, color: C.bgDark, bold: true, fontSize: 10, align: "center" } },
      { text: "取值", options: { fill: { color: C.accent }, color: C.bgDark, bold: true, fontSize: 10, align: "center" } },
      { text: "说明", options: { fill: { color: C.accent }, color: C.bgDark, bold: true, fontSize: 10, align: "center" } },
    ],
    [
      { text: "滑动窗口", options: { fill: { color: C.lightCard }, fontSize: 10 } },
      { text: "滞后步数K", options: { fill: { color: C.lightCard }, fontSize: 10 } },
      { text: "1", options: { fill: { color: C.lightCard }, fontSize: 11, bold: true, align: "center" } },
      { text: "仅依赖上一时刻，1分钟因果窗口", options: { fill: { color: C.lightCard }, fontSize: 10 } },
    ],
    [
      { text: "正则化", options: { fill: { color: C.lightCard }, fontSize: 10 } },
      { text: "alpha / lambda / gamma", options: { fill: { color: C.lightCard }, fontSize: 10 } },
      { text: "0.5", options: { fill: { color: C.lightCard }, fontSize: 11, bold: true, align: "center" } },
      { text: "L1/L2等权混合，抑制虚假边", options: { fill: { color: C.lightCard }, fontSize: 10 } },
    ],
    [
      { text: "网络结构", options: { fill: { color: C.lightCard }, fontSize: 10 } },
      { text: "隐层维度/层数", options: { fill: { color: C.lightCard }, fontSize: 10 } },
      { text: "1000/4", options: { fill: { color: C.lightCard }, fontSize: 11, bold: true, align: "center" } },
      { text: "ReLU激活，Tanh输出", options: { fill: { color: C.lightCard }, fontSize: 10 } },
    ],
    [
      { text: "训练", options: { fill: { color: C.lightCard }, fontSize: 10 } },
      { text: "学习率/最大轮次", options: { fill: { color: C.lightCard }, fontSize: 10 } },
      { text: "1e-6/5000", options: { fill: { color: C.lightCard }, fontSize: 11, bold: true, align: "center" } },
      { text: "Adam，早停耐心值20轮", options: { fill: { color: C.lightCard }, fontSize: 10 } },
    ],
    [
      { text: "异常检测", options: { fill: { color: C.lightCard }, fontSize: 10 } },
      { text: "Z-score分位数", options: { fill: { color: C.lightCard }, fontSize: 10 } },
      { text: "90%", options: { fill: { color: C.lightCard }, fontSize: 11, bold: true, align: "center" } },
      { text: "聚合高于90%分位数的正偏差", options: { fill: { color: C.lightCard }, fontSize: 10 } },
    ],
    [
      { text: "因果边", options: { fill: { color: C.lightCard }, fontSize: 10 } },
      { text: "Top-K边数", options: { fill: { color: C.lightCard }, fontSize: 10 } },
      { text: "8", options: { fill: { color: C.lightCard }, fontSize: 11, bold: true, align: "center" } },
      { text: "覆盖典型故障传播链(2~5台)", options: { fill: { color: C.lightCard }, fontSize: 10 } },
    ],
  ];
  s.addTable(hpData, {
    x: 0.7, y: 1.05, w: 8.6, h: 2.8,
    colW: [1.4, 2.0, 1.2, 4.0],
    border: { pt: 0.5, color: "CBD5E1" },
    rowH: [0.32, 0.35, 0.35, 0.35, 0.35, 0.35, 0.35],
  });
  // Selection rationale
  lightCard(s, 0.7, 4.1, 8.6, 1.2, C.accent2);
  s.addText("选型依据（AERCA vs 替代方案）", { x: 0.9, y: 4.2, w: 4, h: 0.25, fontSize: 13, fontFace: FB, color: C.accent2, bold: true, margin: 0 });
  s.addText("① 可解释系数矩阵 — 系数直接量化因果强度（VAR可解释性的非线性推广）  ② 无标注学习 — u-space创新项排序根源，无需因果图真值  ③ 工业验证 — SWaT数据集优于cMLP/cLSTM/TCDF  ④ 创新项机制 — 适合\"正常数据多、故障数据少\"场景。配置沿用MSDS默认值，缺乏标注数据故未调优。", {
    x: 0.9, y: 4.5, w: 8.2, h: 0.7, fontSize: 11, fontFace: FB, color: "475569", lineSpacingMultiple: 1.3, margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}

// ============================================================
// Slide 16 — AERCA Applicability Analysis
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "04", "AERCA模型 — 适用性与局限性分析");
  const issues = [
    { title: "非时序因素", desc: "人为操作、环境变化、计划性维护等无法显式建模。应对：仅选取设备自身运行指标作为输入以减少混杂影响，LLM结合告警时间戳标注提示可能的人为因素", color: C.orange },
    { title: "数据质量", desc: "传感器故障、固件差异导致数据缺失或异常。应对：线性插值填补短时缺失(≤3个连续时间步)，长时缺失标记设备暂不参与分析", color: C.orange },
    { title: "设备异构性", desc: "不同设备指标量纲和数量级差异大。应对：加权正向Z-score归一化消除量级差异，差异化权重体现领域优先级", color: C.accent },
    { title: "模型局限性", desc: "Granger因果性要求弱平稳性，故障传播中可能出现结构性断点。应对：合理异常窗口长度(60步)平衡信号与噪声，不可用时降级LLM分析", color: C.red },
  ];
  issues.forEach((iss, i) => {
    const x = (i % 2 === 0) ? 0.7 : 5.2;
    const y = (i < 2) ? 1.05 : 3.2;
    darkCard(s, x, y, 4.1, 1.85, iss.color);
    s.addText(iss.title, { x: x + 0.2, y: y + 0.1, w: 3.7, h: 0.3, fontSize: 14, fontFace: FB, color: iss.color, bold: true, margin: 0 });
    s.addText(iss.desc, { x: x + 0.2, y: y + 0.45, w: 3.7, h: 1.2, fontSize: 11, fontFace: FB, color: C.textMuted, lineSpacingMultiple: 1.35, margin: 0 });
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}

// ============================================================
// Slide 17 — LLM Integration Design
// ============================================================
{
  const s = pres.addSlide();
  lightHeader(s, "04", "大语言模型集成设计");
  // LLM roles — top full-width card
  lightCard(s, 0.7, 1.0, 8.6, 1.35, C.green);
  s.addText("LLM职责定位 — 语义翻译与风险评估，不做因果推理", { x: 0.9, y: 1.08, w: 8, h: 0.28, fontSize: 14, fontFace: FB, color: C.green, bold: true, margin: 0 });
  s.addText([
    { text: "故障率预测：", options: { bold: true, color: C.textDark, breakLine: false } },
    { text: "逻辑增长模型外推趋势，LLM输出风险等级和置信度，转换为±12%调整因子叠加于统计曲线", options: { color: "475569", breakLine: true } },
    { text: "根因分析：", options: { bold: true, color: C.textDark, breakLine: false } },
    { text: "AERCA完成因果发现，LLM将根源得分和因果边翻译为Markdown报告（指标摘要+根源解读+因果传播+运维建议）", options: { color: "475569", breakLine: true } },
    { text: "结构化预测：", options: { bold: true, color: C.textDark, breakLine: false } },
    { text: "LLM将遥测摘要翻译为JSON对象（prediction/confidence/riskLevel/recommendedAction）", options: { color: "475569" } },
  ], { x: 0.9, y: 1.38, w: 8.2, h: 0.85, fontSize: 10.5, fontFace: FB, lineSpacingMultiple: 1.2, margin: 0 });
  // Dual model — bottom-left card
  lightCard(s, 0.7, 2.6, 4.1, 2.6, C.accent);
  s.addText("双模型实例策略", { x: 0.9, y: 2.7, w: 3, h: 0.28, fontSize: 14, fontFace: FB, color: C.accent, bold: true, margin: 0 });
  s.addText([
    { text: "预测模型", options: { bold: true, color: C.textDark, breakLine: true, fontSize: 12 } },
    { text: "maxTokens=512, temperature=0.2", options: { color: "475569", breakLine: true } },
    { text: "系统提示：工业运维分析助手，仅返回JSON", options: { color: "475569", breakLine: true } },
    { text: "防御性解析：缺失prediction触发重试", options: { color: "475569", breakLine: true } },
    { text: "confidence默认70夹紧[0,100]", options: { color: "475569", breakLine: true } },
    { text: "", options: { breakLine: true, fontSize: 4 } },
    { text: "报告模型", options: { bold: true, color: C.textDark, breakLine: true, fontSize: 12 } },
    { text: "maxTokens=2048", options: { color: "475569", breakLine: true } },
    { text: "中文系统提示，严格遵循格式规范", options: { color: "475569", breakLine: true } },
    { text: "输入7参数：设备编码、遥测摘要、根源排序、因果边、预测、风险、建议", options: { color: "475569" } },
  ], { x: 0.9, y: 3.0, w: 3.7, h: 2.05, fontSize: 10.5, fontFace: FB, lineSpacingMultiple: 1.15, margin: 0 });
  // Fault tolerance — bottom-right card
  lightCard(s, 5.2, 2.6, 4.1, 2.6, C.purple);
  s.addText("容错与重试机制", { x: 5.4, y: 2.7, w: 3, h: 0.28, fontSize: 14, fontFace: FB, color: C.purple, bold: true, margin: 0 });
  s.addText([
    { text: "超时控制", options: { bold: true, color: C.textDark, breakLine: true, fontSize: 12 } },
    { text: "CompletableFuture 15秒总体超时(PROVIDER_TIMEOUT)", options: { color: "475569", breakLine: true } },
    { text: "HTTP单次调用10秒超时", options: { color: "475569", breakLine: true } },
    { text: "", options: { breakLine: true, fontSize: 4 } },
    { text: "重试策略", options: { bold: true, color: C.textDark, breakLine: true, fontSize: 12 } },
    { text: "最多重试3次(MAX_RETRY=2)", options: { color: "475569", breakLine: true } },
    { text: "上层统一控制，避免与LangChain4j嵌套", options: { color: "475569", breakLine: true } },
    { text: "", options: { breakLine: true, fontSize: 4 } },
    { text: "超时回收", options: { bold: true, color: C.textDark, breakLine: true, fontSize: 12 } },
    { text: "超10分钟processing自动回收为failed", options: { color: "475569" } },
  ], { x: 5.4, y: 3.0, w: 3.7, h: 2.05, fontSize: 10.5, fontFace: FB, lineSpacingMultiple: 1.15, margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}

// ============================================================
// Slide 18 — Degradation Chain
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "04", "三层降级容错链");
  // Four layers
  const layers = [
    { level: "L1", name: "RCA + LLM 综合模式", desc: "AnalysisAggregationService编排RCA侧车与LLM联合调用。AERCA输出根源排序与因果边，LLM翻译为Markdown报告。完整因果推理+智能报告。", color: C.green, tag: "最优" },
    { level: "L2", name: "LLM 独立分析", desc: "RCA侧车不可用时，AnalysisRcaPayload.fallback()返回engine=llm_only、rcaStatus=fallback的空载荷，主管道跳过因果推理直接进入LLM报告生成。", color: C.orange, tag: "RCA不可用" },
    { level: "L3", name: "规则引擎 + 预置模板", desc: "LLM调用失败时，LlmProviderAdapter.fallback()通过关键词匹配(overload/critical)按high/medium/low三级生成预测，纯Java字符串拼接构建完整Markdown报告。", color: C.red, tag: "LLM不可用" },
    { level: "L4", name: "最终兜底", desc: "所有降级均失败时，AnalysisService.buildReportSafe()返回最简硬编码报告文本。降级链由llm.yml的fallbackToMock标志控制，默认开启。", color: C.red, tag: "全部失败" },
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
// Slide 19 — Implementation: Auth & Overview
// ============================================================
{
  const s = pres.addSlide();
  lightHeader(s, "05", "系统实现 — 总体架构与认证");
  // Overall
  lightCard(s, 0.7, 1.0, 8.6, 1.5, C.accent);
  s.addText("系统总体实现", { x: 0.9, y: 1.1, w: 3, h: 0.28, fontSize: 14, fontFace: FB, color: C.accent, bold: true, margin: 0 });
  s.addText("三个服务容器通过Docker Compose编排，共享MySQL和Kafka。后端按领域分为七个package（auth/dashboard/device/telemetry/alarm/watchlist/analysis/common），统一ApiResponse格式。前端含四个主要页面，仪表盘集成Three.js 3D场景和ECharts图表。RCA侧车独立运行，不可用时自动降级为LLM模式。", {
    x: 0.9, y: 1.45, w: 8.2, h: 0.8, fontSize: 11, fontFace: FB, color: "475569", lineSpacingMultiple: 1.3, margin: 0
  });
  // Auth
  lightCard(s, 0.7, 2.8, 4.2, 2.4, C.accent3);
  s.addText("用户认证与访问控制", { x: 0.9, y: 2.9, w: 3, h: 0.28, fontSize: 14, fontFace: FB, color: C.accent3, bold: true, margin: 0 });
  s.addText([
    { text: "管理员单一角色认证", options: { bold: true, color: C.textDark, breakLine: true } },
    { text: "登录后签发12小时有效期令牌", options: { color: "475569", breakLine: true } },
    { text: "前端存储于localStorage", options: { color: "475569", breakLine: true } },
    { text: "每次请求自动附加Authorization头", options: { color: "475569", breakLine: true } },
    { text: "AdminAuthInterceptor拦截验证", options: { color: "475569", breakLine: true } },
    { text: "未通过返回401，前端跳转登录页", options: { color: "475569" } },
  ], { x: 0.9, y: 3.25, w: 3.8, h: 1.7, fontSize: 11, fontFace: FB, lineSpacingMultiple: 1.25, margin: 0 });
  // Module structure
  lightCard(s, 5.2, 2.8, 4.2, 2.4, C.purple);
  s.addText("后端模块结构", { x: 5.4, y: 2.9, w: 3, h: 0.28, fontSize: 14, fontFace: FB, color: C.purple, bold: true, margin: 0 });
  const modules = ["auth — 认证鉴权", "dashboard — 仪表盘聚合", "device — 设备管理", "telemetry — 遥测数据", "alarm — 告警管理", "watchlist — 关注列表", "analysis — 分析管道", "common — 通用DTO/工具"];
  s.addText(modules.map((m, i) => ({
    text: m, options: { breakLine: true, fontSize: 11, color: "475569", fontFace: FB }
  })), { x: 5.4, y: 3.25, w: 3.8, h: 1.8, lineSpacingMultiple: 1.2, margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}

// ============================================================
// Slide 20 — Implementation: 3D Visualization
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "05", "数字孪生三维可视化");
  // Features
  const features = [
    { title: "程序化三维场景", desc: "13种机柜模型族，32台交互式设备\nBoxGeometry等基础几何体程序化组合\n无外部模型文件，减少网络请求", color: C.accent },
    { title: "状态驱动视觉语言", desc: "正常绿色慢闪(1.4Hz)\n预警橙色快闪(2.2Hz)\n故障红色高频闪烁(4.4Hz)\n颜色+脉冲频率差异化", color: C.accent2 },
    { title: "射线投射交互", desc: "Raycaster射线检测点击设备\n弹出信息对话框(编码/名称/类型/状态)\n轨道控制器OrbitControls", color: C.accent3 },
    { title: "一致性校验", desc: "GLB模型CSV映射 vs 数据库\n仪表盘初始化时自动调用\n不匹配时自动修复(删除/补充)", color: C.green },
  ];
  features.forEach((f, i) => {
    const x = 0.7 + (i % 2) * 4.5;
    const y = 1.05 + Math.floor(i / 2) * 2.1;
    darkCard(s, x, y, 4.1, 1.85, f.color);
    s.addShape(pres.shapes.OVAL, { x: x + 0.15, y: y + 0.15, w: 0.35, h: 0.35, fill: { color: f.color } });
    s.addText(String(i + 1), { x: x + 0.15, y: y + 0.15, w: 0.35, h: 0.35, fontSize: 14, fontFace: FB, color: C.bgDark, bold: true, align: "center", valign: "middle", margin: 0 });
    s.addText(f.title, { x: x + 0.65, y: y + 0.12, w: 3.2, h: 0.3, fontSize: 14, fontFace: FB, color: f.color, bold: true, margin: 0 });
    s.addText(f.desc, { x: x + 0.2, y: y + 0.5, w: 3.7, h: 1.2, fontSize: 10.5, fontFace: FB, color: C.textMuted, lineSpacingMultiple: 1.35, margin: 0 });
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}

// ============================================================
// Slide 21 — Implementation: Analysis Center
// ============================================================
{
  const s = pres.addSlide();
  lightHeader(s, "05", "分析中心与智能分析");
  // Analysis center
  lightCard(s, 0.7, 1.0, 4.2, 2.5, C.accent);
  s.addText("分析中心页面", { x: 0.9, y: 1.1, w: 3, h: 0.28, fontSize: 14, fontFace: FB, color: C.accent, bold: true, margin: 0 });
  s.addText([
    { text: "左右分栏布局", options: { bold: true, color: C.textDark, breakLine: true } },
    { text: "左侧：报告列表（编号、时间、状态、风险等级）", options: { color: "475569", breakLine: true } },
    { text: "右侧：报告详情（Markdown报告、根因排名、因果路径、预测和建议）", options: { color: "475569", breakLine: true } },
    { text: "处理中报告1秒自动刷新", options: { color: "475569", breakLine: true } },
    { text: "触发按钮发起聚合分析", options: { color: "475569", breakLine: true } },
    { text: "完成后自动刷新并定位新报告", options: { color: "475569" } },
  ], { x: 0.9, y: 1.45, w: 3.8, h: 1.8, fontSize: 11, fontFace: FB, lineSpacingMultiple: 1.25, margin: 0 });
  // Smart analysis
  lightCard(s, 5.2, 1.0, 4.2, 2.5, C.accent2);
  s.addText("智能分析与根因定位", { x: 5.4, y: 1.1, w: 3, h: 0.28, fontSize: 14, fontFace: FB, color: C.accent2, bold: true, margin: 0 });
  s.addText([
    { text: "类协作：", options: { bold: true, color: C.textDark, breakLine: true } },
    { text: "RcaFeatureAssembler → 转换遥测为数值矩阵", options: { color: "475569", breakLine: true } },
    { text: "RcaEngineClient → 封装RCA侧车HTTP通信", options: { color: "475569", breakLine: true } },
    { text: "OpenAiLlmProviderAdapter → 管理两个ChatModel", options: { color: "475569", breakLine: true } },
    { text: "AnalysisService → 编排三者，超时/重试/降级", options: { color: "475569", breakLine: true } },
    { text: "", options: { breakLine: true, fontSize: 5 } },
    { text: "数据流：Kafka消息→查询异常设备→组装特征→RCA推理→LLM生成报告", options: { color: "475569" } },
  ], { x: 5.4, y: 1.45, w: 3.8, h: 1.8, fontSize: 11, fontFace: FB, lineSpacingMultiple: 1.25, margin: 0 });
  // Feature engineering details
  lightCard(s, 0.7, 3.8, 8.6, 1.4, C.purple);
  s.addText("特征工程实现（buildWindow四步）", { x: 0.9, y: 3.9, w: 4, h: 0.28, fontSize: 14, fontFace: FB, color: C.purple, bold: true, margin: 0 });
  s.addText("① 筛选error优先于warning，取前10台设备  →  ② 每台查最近30条遥测记录  →  ③ 六项指标正向Z-score（标准差小时防除零，截断负值），按权重加权求和  →  ④ 不足30点左填充，转置为时间×设备矩阵。RCA通信：检查enabled标志，false返回Optional.empty()触发降级。启用时HttpClient POST至/infer/device-rca。", {
    x: 0.9, y: 4.2, w: 8.2, h: 0.8, fontSize: 11, fontFace: FB, color: "475569", lineSpacingMultiple: 1.3, margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}

// ============================================================
// Slide 22 — Implementation: Fault Rate Prediction
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "05", "故障率趋势预测与数据模型");
  // Fault rate prediction — top-left
  darkCard(s, 0.7, 1.0, 5.5, 2.0, C.accent);
  s.addText("故障率趋势预测", { x: 0.9, y: 1.1, w: 4, h: 0.28, fontSize: 14, fontFace: FB, color: C.accent, bold: true, margin: 0 });
  s.addText([
    { text: "故障率 = error设备数 / 总设备数 × 100%", options: { bold: true, color: C.textWhite, breakLine: true } },
    { text: "以分钟粒度构建时间序列", options: { color: C.textMuted, breakLine: true } },
    { text: "Logistic增长模型外推：dr/dt = k·r·(1-r/100)", options: { bold: true, color: C.accent, breakLine: true } },
    { text: "低故障率时增长慢，接近全部时趋于饱和", options: { color: C.textMuted, breakLine: true } },
    { text: "LLM评估风险等级和置信度，高风险放大预测值提前预警", options: { color: C.textMuted, breakLine: true } },
    { text: "前端：实线=历史，虚线=预测，支持自定义时间范围", options: { color: C.textMuted } },
  ], { x: 0.9, y: 1.4, w: 5.1, h: 1.45, fontSize: 10.5, fontFace: FB, lineSpacingMultiple: 1.2, margin: 0 });
  // Data model — top-right
  darkCard(s, 6.5, 1.0, 2.8, 2.0, C.purple);
  s.addText("数据模型要点", { x: 6.7, y: 1.1, w: 2.4, h: 0.25, fontSize: 13, fontFace: FB, color: C.purple, bold: true, margin: 0 });
  s.addText([
    { text: "MyBatis-Plus 3.5.7", options: { bold: true, color: C.textWhite, breakLine: true, fontSize: 10.5 } },
    { text: "每表BaseMapper + Lambda条件构造器", options: { color: C.textMuted, breakLine: true, fontSize: 10 } },
    { text: "JSON字段：Jackson ObjectMapper", options: { color: C.textMuted, breakLine: true, fontSize: 10 } },
    { text: "@TableField(typeHandler)", options: { color: C.textMuted, breakLine: true, fontSize: 10 } },
    { text: "唯一约束：", options: { bold: true, color: C.textWhite, breakLine: true, fontSize: 10 } },
    { text: "device_metrics(code, time)", options: { color: C.textMuted, breakLine: true, fontSize: 10 } },
    { text: "analysis_reports(idempotency_key)", options: { color: C.textMuted, fontSize: 10 } },
  ], { x: 6.7, y: 1.4, w: 2.4, h: 1.45, fontSize: 10, fontFace: FB, lineSpacingMultiple: 1.2, margin: 0 });
  // LLM role clarification — bottom full-width
  darkCard(s, 0.7, 3.25, 8.6, 1.9, C.green);
  s.addText("LLM职责边界 — 语义翻译而非数值预测", { x: 0.9, y: 3.35, w: 5, h: 0.28, fontSize: 14, fontFace: FB, color: C.green, bold: true, margin: 0 });
  s.addText("LLM本质上是基于Transformer解码器的自回归语言模型，擅长语言模式的匹配与生成。将其限定在语义翻译层面既发挥了自然语言生成优势，又避免了数值预测可能带来的不确定性。在故障率预测场景中，LLM仅输出风险等级和置信度，经aiForecastProfile()方法转换为最大±12%的调整因子叠加于统计预测曲线之上，起到辅助修正作用。", {
    x: 0.9, y: 3.7, w: 8.2, h: 0.7, fontSize: 11, fontFace: FB, color: C.textMuted, lineSpacingMultiple: 1.3, margin: 0
  });
  // Additional detail
  s.addText("数据访问：通用CRUD通过MyBatis-Plus内置方法完成，复杂查询通过LambdaQueryChainWrapper类型安全链式查询。JSON字段通过Jackson序列化写入、注解自动反序列化。", {
    x: 0.9, y: 4.45, w: 8.2, h: 0.5, fontSize: 11, fontFace: FB, color: "475569", lineSpacingMultiple: 1.3, margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}

// ============================================================
// Slide 23 — Testing: Functional
// ============================================================
{
  const s = pres.addSlide();
  lightHeader(s, "06", "测试 — 功能测试与验证");
  // Test targets
  lightCard(s, 0.7, 1.0, 8.6, 0.8, C.accent);
  s.addText("测试目标：功能正确性、接口一致性、性能指标、容错能力四方面验证九项需求", {
    x: 0.9, y: 1.1, w: 8.2, h: 0.25, fontSize: 13, fontFace: FB, color: C.accent, bold: true, margin: 0
  });
  s.addText("三层次测试：单元测试(JUnit 5 + Mockito) · 集成测试(Spring Boot Test + 嵌入式Kafka) · 端到端(Shell冒烟 + Docker Compose全栈手动测试)", {
    x: 0.9, y: 1.4, w: 8.2, h: 0.25, fontSize: 11, fontFace: FB, color: "475569", margin: 0
  });
  // Functional test items
  const testGroups = [
    { title: "认证鉴权", items: ["正确凭证获令牌", "错误密码→401", "无令牌→401", "过期令牌→401", "登出后令牌移除"], color: C.accent3 },
    { title: "设备与三维", items: ["32台设备与种子一致", "指示灯颜色↔status", "点击弹出对话框", "一致性校验自动修复"], color: C.accent },
    { title: "分析管道", items: ["60秒内→success", "无异常设备→空", "重复触发幂等", "RCA不可用→降级", "超10min→failed"], color: C.accent2 },
    { title: "告警与关注", items: ["按设备+状态筛选", "resolved后不出活动列表", "关注后可查询", "重复关注→错误", "不同管理员隔离"], color: C.green },
  ];
  testGroups.forEach((g, i) => {
    const x = 0.7 + i * 2.25;
    lightCard(s, x, 2.05, 2.0, 2.8, g.color);
    s.addShape(pres.shapes.RECTANGLE, { x, y: 2.05, w: 2.0, h: 0.05, fill: { color: g.color } });
    s.addText(g.title, { x: x + 0.12, y: 2.2, w: 1.76, h: 0.28, fontSize: 12, fontFace: FB, color: g.color, bold: true, margin: 0 });
    s.addText(g.items.map((item, j) => ({
      text: `· ${item}`, options: { breakLine: true, fontSize: 10, color: "475569", fontFace: FB }
    })), { x: x + 0.12, y: 2.55, w: 1.76, h: 2.0, lineSpacingMultiple: 1.25, margin: 0 });
  });
  // RCA test
  lightCard(s, 0.7, 5.05, 8.6, 0.35, C.purple);
  s.addText("RCA推理引擎：9项校验用例全部通过（空设备/超上限/维度不一致/时间步不足/NaN替换/正常推理等）", {
    x: 0.9, y: 5.08, w: 8.2, h: 0.25, fontSize: 11, fontFace: FB, color: C.purple, margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}

// ============================================================
// Slide 24 — Testing: Performance
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "06", "测试 — 性能基准与降级验证");
  // Performance stats
  const stats = [
    { val: "21.3s", label: "端到端分析延迟", sub: "需求 ≤ 2min", color: C.green },
    { val: "155ms", label: "RCA推理延迟", sub: "4设备×30步 CPU", color: C.green },
    { val: "100%", label: "Top-1命中率", sub: "可控故障注入3轮", color: C.green },
    { val: "≥30fps", label: "三维渲染帧率", sub: "<5000三角面", color: C.green },
  ];
  stats.forEach((st, i) => {
    const x = 0.7 + i * 2.25;
    darkCard(s, x, 1.0, 2.0, 1.5, st.color);
    s.addText(st.val, { x, y: 1.15, w: 2.0, h: 0.55, fontSize: 28, fontFace: FB, color: C.textWhite, bold: true, align: "center", margin: 0 });
    s.addText(st.label, { x, y: 1.7, w: 2.0, h: 0.25, fontSize: 12, fontFace: FB, color: C.textWhite, bold: true, align: "center", margin: 0 });
    s.addText(st.sub, { x, y: 1.95, w: 2.0, h: 0.25, fontSize: 10, fontFace: FB, color: C.textMuted, align: "center", margin: 0 });
  });
  // Degradation table
  darkCard(s, 0.7, 2.8, 8.6, 1.3, C.orange);
  s.addText("降级链鲁棒性验证", { x: 0.9, y: 2.9, w: 3, h: 0.25, fontSize: 13, fontFace: FB, color: C.orange, bold: true, margin: 0 });
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
    x: 0.9, y: 3.2, w: 8.2, h: 0.8,
    colW: [1.6, 1.4, 1.2, 1.2, 2.8],
    border: { pt: 0.5, color: "334155" },
    rowH: [0.2, 0.2, 0.2, 0.2],
  });
  // Root cause accuracy
  darkCard(s, 0.7, 4.3, 8.6, 0.95, C.accent);
  s.addText("根源定位准确性验证", { x: 0.9, y: 4.35, w: 3, h: 0.25, fontSize: 13, fontFace: FB, color: C.accent, bold: true, margin: 0 });
  s.addText("可控故障注入：4设备仿真序列，DEV009为根源（第18步起+0.3），DEV013为一级级联。三轮Top-1命中率100%，根源得分1.000，与第二名差距0.34-0.42。生产数据排序与物理事实一致（功率、CPU、温度、内存最高者排首位），模型能区分真正高应力设备与仅标记为error的设备。", {
    x: 0.9, y: 4.65, w: 8.2, h: 0.5, fontSize: 11, fontFace: FB, color: C.textMuted, lineSpacingMultiple: 1.3, margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}

// ============================================================
// Slide 25 — DCIM Comparison
// ============================================================
{
  const s = pres.addSlide();
  lightHeader(s, "06", "与传统DCIM系统能力对比");
  const compData = [
    [
      { text: "能力维度", options: { fill: { color: C.accent }, color: C.bgDark, bold: true, fontSize: 11, align: "center" } },
      { text: "传统DCIM", options: { fill: { color: C.accent }, color: C.bgDark, bold: true, fontSize: 11, align: "center" } },
      { text: "TwinOps", options: { fill: { color: C.accent }, color: C.bgDark, bold: true, fontSize: 11, align: "center" } },
    ],
    [
      { text: "状态可视化", options: { fill: { color: C.lightCard }, bold: true, fontSize: 10.5 } },
      { text: "二维列表展示", options: { fill: { color: C.lightCard }, fontSize: 10.5, align: "center" } },
      { text: "三维程序化场景，状态驱动视觉语言（颜色+脉冲频率）", options: { fill: { color: C.lightCard }, color: C.green, bold: true, fontSize: 10.5 } },
    ],
    [
      { text: "故障诊断", options: { fill: { color: C.lightCard }, bold: true, fontSize: 10.5 } },
      { text: "静态阈值告警，依赖个人经验排查", options: { fill: { color: C.lightCard }, fontSize: 10.5, align: "center" } },
      { text: "Granger因果发现自动排序根源，输出有向因果图", options: { fill: { color: C.lightCard }, color: C.green, bold: true, fontSize: 10.5 } },
    ],
    [
      { text: "数据整合", options: { fill: { color: C.lightCard }, bold: true, fontSize: 10.5 } },
      { text: "多个独立子系统，数据孤岛", options: { fill: { color: C.lightCard }, fontSize: 10.5, align: "center" } },
      { text: "统一MySQL汇聚32台设备10项指标，单一面板聚合展示", options: { fill: { color: C.lightCard }, color: C.green, bold: true, fontSize: 10.5 } },
    ],
    [
      { text: "运维报告", options: { fill: { color: C.lightCard }, bold: true, fontSize: 10.5 } },
      { text: "预置模板统计，人工撰写", options: { fill: { color: C.lightCard }, fontSize: 10.5, align: "center" } },
      { text: "LLM自动生成Markdown报告，含预测和建议动作", options: { fill: { color: C.lightCard }, color: C.green, bold: true, fontSize: 10.5 } },
    ],
    [
      { text: "故障预测", options: { fill: { color: C.lightCard }, bold: true, fontSize: 10.5 } },
      { text: "无或简单趋势外推", options: { fill: { color: C.lightCard }, fontSize: 10.5, align: "center" } },
      { text: "逻辑增长模型+LLM双重预测，含置信度标注", options: { fill: { color: C.lightCard }, color: C.green, bold: true, fontSize: 10.5 } },
    ],
    [
      { text: "降级容错", options: { fill: { color: C.lightCard }, bold: true, fontSize: 10.5 } },
      { text: "单一监控通道", options: { fill: { color: C.lightCard }, fontSize: 10.5, align: "center" } },
      { text: "三层降级链，任一可用即产出报告", options: { fill: { color: C.lightCard }, color: C.green, bold: true, fontSize: 10.5 } },
    ],
    [
      { text: "数字孪生一致性", options: { fill: { color: C.lightCard }, bold: true, fontSize: 10.5 } },
      { text: "场景与数据分离维护", options: { fill: { color: C.lightCard }, fontSize: 10.5, align: "center" } },
      { text: "自动一致性校验与修复，双向同步", options: { fill: { color: C.lightCard }, color: C.green, bold: true, fontSize: 10.5 } },
    ],
  ];
  s.addTable(compData, {
    x: 0.7, y: 1.0, w: 8.6, h: 3.7,
    colW: [1.8, 3.0, 3.8],
    border: { pt: 0.5, color: "CBD5E1" },
    rowH: [0.35, 0.45, 0.45, 0.45, 0.45, 0.45, 0.45, 0.45],
  });
  s.addText("在七个能力维度上实现从传统DCIM的改进，为数据中心运维数字化转型提供可行方案（注：定性能力对照，非定量A/B实验）", {
    x: 0.7, y: 4.95, w: 8.6, h: 0.35, fontSize: 11, fontFace: FB, color: C.textDark, align: "center", margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}

// ============================================================
// Slide 26 — Conclusion
// ============================================================
{
  const s = pres.addSlide();
  darkHeader(s, "07", "结论与展望");
  s.addText("主要贡献", { x: 0.7, y: 1.0, w: 3, h: 0.35, fontSize: 16, fontFace: FB, color: C.accent, bold: true, margin: 0 });
  const contribs = [
    "提出加权正向Z-score特征工程方法，解决异构电力设备指标到因果模型的适配问题",
    "首次实现数字孪生场景下AERCA因果推理与LLM报告的端到端集成",
    "构建三层降级容错链（RCA→LLM→规则引擎），保障分析管道连续可用",
    "提出三维视觉语言与自然语言报告的双通道语义化输出机制",
  ];
  contribs.forEach((c, i) => {
    const y = 1.5 + i * 0.6;
    s.addShape(pres.shapes.OVAL, { x: 0.7, y: y + 0.05, w: 0.25, h: 0.25, fill: { color: C.accent } });
    s.addText(String(i + 1), { x: 0.7, y: y + 0.05, w: 0.25, h: 0.25, fontSize: 10, fontFace: FB, color: C.bgDark, bold: true, align: "center", valign: "middle", margin: 0 });
    s.addText(c, { x: 1.1, y: y, w: 8.0, h: 0.45, fontSize: 12.5, fontFace: FB, color: C.textWhite, lineSpacingMultiple: 1.2, margin: 0 });
  });
  s.addText("未来工作", { x: 0.7, y: 4.0, w: 3, h: 0.35, fontSize: 16, fontFace: FB, color: C.accent2, bold: true, margin: 0 });
  const futures = [
    "积累标注数据后进行AERCA超参数系统调优，优化因果发现精度",
    "扩展至多数据中心联邦监控场景，支持跨站点因果分析",
    "引入强化学习实现自适应运维决策，从被动响应到主动预防",
  ];
  futures.forEach((f, i) => {
    const y = 4.45 + i * 0.38;
    s.addText("▸", { x: 0.7, y, w: 0.3, h: 0.3, fontSize: 12, fontFace: FB, color: C.accent2, margin: 0 });
    s.addText(f, { x: 1.0, y, w: 8.0, h: 0.3, fontSize: 12, fontFace: FB, color: C.textMuted, margin: 0 });
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.accent } });
}

// ============================================================
// Slide 27 — Thank You
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
