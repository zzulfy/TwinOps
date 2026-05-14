# 毕业论文

中图分类号 TP311.56

UDC分类号 681.3.04

学 校 代 码 10459

密 级 公开

学 士 学 位 论 文

**数据中心数字孪生智能运维平台的开发与实现**

作 者 姓 名：

学 号：

导 师 姓 名：副教授

学 科 门 类：工学

专 业 名 称：计算机科学与技术

培 养 单 位：计算机与人工智能学院

完 成 时 间：2026年05月

A Dissertation/Thesis Submitted to

Zhengzhou University

for Bachelor Degree

Development and Implementation of a Data Center Digital Twin Intelligent Operation and Maintenance Platform

By Feiyun Luo

Supervisor: Prof. YunPeng Wu

Computer Science and Technology

Computer Science and Artificial Intelligence

May, 2026

**郑州大学**

**学位论文原创性声明**

本人郑重声明：所呈交的学位论文，是本人在导师的指导下，独立进行研究工作所取得的成果。除文中已经注明引用的内容外，本论文不包含任何其他个人或集体已经发表或撰写过的作品成果。对本文的研究做出重要贡献的个人和集体，均已在文中以明确方式标明。本人完全知晓本声明的法律后果由本人承担。

学位论文作者签名： 指导教师签名：

日期： 2026年 5月 9日

**郑州大学**

**学位论文使用授权书**

本人同意学校保留并向国家有关部门或机构送交论文的复印件和电子版，允许论文被查阅和借阅。本人授权郑州大学可以将本学位论文的全部或部分编入有关数据库进行检索，可以采用影印、缩印或者其他复制手段保存论文和汇编本学位论文。

学位论文作者签名： 指导教师签名：

日期： 2026年 5月 9日

# 中 文 摘 要

随着云计算、大数据和人工智能技术的迅猛发展，全球数据中心的数量和规模持续快速增长，其内部电力设备（包括高压开关柜、不间断电源、精密配电柜、静止无功发生器等）的运行状态直接决定了数据中心的供电可靠性与服务可用性。然而，当前数据中心设备运维普遍面临设备种类繁多导致人工巡检效率低下、运维数据分散形成数据孤岛、故障诊断依赖个人经验缺乏系统化因果推理手段、运维报告依靠人工撰写效率低且质量不一致等突出问题。传统的人工巡检和被动式故障响应运维模式已难以满足现代数据中心对高可靠性和智能化管理的需求。本文开发并实现了数据中心数字孪生智能运维平台——TwinOps，以国家电网某数据中心机房为实际应用场景，覆盖32台电力设备的全方位监控与管理。

该平台融合了三维可视化、实时遥测数据采集、异常检测与告警、基于Granger因果发现的根源分析以及大语言模型驱动的智能报告生成等关键技术，构建了从数据感知、状态评估、故障定位到决策辅助的完整运维闭环。针对数据中心电力设备遥测数据的多源异构性——温度（℃）、功率（W）、CPU负载（%）、内存使用率（%）、磁盘使用率（%）、网络流量（Mbps）六项指标在物理量纲、数量级和波动特征上存在显著差异，无法直接作为因果发现模型输入的问题——本文提出加权正向Z-score特征工程方法，通过Z-score归一化消除量级差异，经正向截断保留高于均值的正向偏差，并按差异化权重（功率0.22、温度0.20、CPU 0.18、内存0.16、磁盘0.12、网络0.12）加权求和，将六项异构指标归一化为一维复合应力序列，解决了AERCA等因果发现模型从同构系统指标（如MSDS数据集中CPU、内存、磁盘等单位相近的计算机系统指标）向异构电力设备指标的适配问题。在因果发现层面，将复合应力序列组织为时间×设备矩阵后输入基于自解释神经网络（SENNGC）的AERCA模型，利用广义系数学习设备间的Granger因果结构，通过重构残差的Z-score偏差实现无标注条件下的根源设备排序。在智能决策层面，系统通过LangChain4j集成大语言模型，采用双模型实例策略分别生成结构化预测JSON与Markdown格式分析报告，并构建了完整的降级链（RCA不可用时降级为LLM独立分析，LLM不可用时降级为规则引擎与预置模板）。

平台采用前后端分离的B/S架构，后端基于Spring Boot 3.3与MyBatis-Plus构建模块化单体，通过Apache Kafka实现异步分析任务的解耦调度；前端基于React 19与Three.js实现数据中心32台设备的程序化三维场景渲染，通过状态驱动视觉语言（绿/黄/红三色指示灯与差异化脉冲频率）和射线投射交互实现设备状态的实时可视化；RCA因果推理引擎以Python FastAPI侧车模式独立部署，通过RESTful接口与后端协同。平台还实现了数字孪生一致性保障机制，确保三维场景与数据库的双向同步。

实验与部署结果表明，该平台能够有效整合多源异构运维数据，实现设备状态的实时可视化监控与智能故障诊断，因果发现模型能够正确识别故障设备间的因果依赖关系并给出可解释的根源排序，为数据中心运维管理从"被动式响应"向"主动式预防"的数字化转型提供了可行的技术方案。

**关键词：**数字孪生；智能运维；数据中心；因果发现；大语言模型；三维可视化；Granger因果性；特征工程

# ABSTRACT

With the rapid development of cloud computing, big data, and artificial intelligence technologies, the number and scale of data centers worldwide have been growing continuously. The operational status of electrical equipment within data centers—including high-voltage switchgear, uninterruptible power supplies, precision power distribution cabinets, static var generators, and active power filters—directly determines power supply reliability and service availability. However, current data center operations face significant challenges: the diversity and sheer volume of equipment render manual inspection inefficient; operational data scattered across isolated monitoring systems create severe data silos; fault diagnosis relies heavily on individual experience without systematic causal reasoning; and operational reports are manually written with inconsistent quality. This paper presents TwinOps, a digital twin intelligent operations platform for data centers, deployed in a real-world data center facility of the State Grid Corporation of China, covering comprehensive monitoring and management of 32 electrical devices.

The platform establishes a closed-loop operational workflow integrating 3D visualization, real-time telemetry data acquisition, anomaly detection and alarm management, Granger-causality-based root cause analysis, and large language model (LLM)-augmented intelligent report generation. To address the inherent heterogeneity of data center telemetry—where six key metrics including temperature (°C), power (W), CPU load (%), memory usage (%), disk usage (%), and network traffic (Mbps) differ fundamentally in physical dimensions, orders of magnitude, and fluctuation characteristics, rendering them incompatible as direct inputs to causal discovery models—this paper proposes a weighted positive Z-score feature engineering method. The approach normalizes each metric via Z-score transformation to eliminate magnitude disparities, applies positive truncation to retain only above-mean deviations reflecting anomalous stress, and computes a weighted summation with differentiated weights (power 0.22, temperature 0.20, CPU 0.18, memory 0.16, disk 0.12, network 0.12) to produce a one-dimensional composite stress series per device. This bridges the adaptation gap between homogeneous system metrics (as in the MSDS benchmark dataset, where CPU, memory, and disk metrics share comparable units and are directly scaled via MinMaxScaler) and heterogeneous electrical equipment metrics for causal discovery models. For root cause analysis, the composite stress series are organized into a time × device matrix and fed into the AERCA (Adversarial Estimation of Root Cause Analysis) model based on Self-Explaining Neural Networks with Generalized Coefficients (SENNGC), which learns Granger-causal coefficient matrices among devices and ranks root cause devices via Z-score deviations of reconstruction residuals, without requiring ground-truth causal graph annotations. For intelligent decision-making, the system integrates LLMs via LangChain4j with a dual-model instance strategy: a prediction model (max 512 tokens, temperature 0.2) generates structured fault prediction JSON, while a report generation model (max 2048 tokens) produces comprehensive Markdown analysis reports. A complete graceful degradation chain ensures operational continuity—fallback to LLM-only analysis when the RCA sidecar is unavailable, and fallback to rule-based heuristics and pre-configured templates when the LLM service is unavailable.

The platform adopts a modular architecture with a Java Spring Boot 3.3 backend, a React 19 TypeScript frontend, and a Python FastAPI RCA sidecar service, orchestrated via Docker Compose. The backend employs a modular monolith pattern with MyBatis-Plus for data persistence and Apache Kafka for asynchronous analysis task scheduling. The frontend constructs a fully programmatic 3D digital twin scene using Three.js, rendering 32 device cabinets with status-driven visual language (green/yellow/red indicator lights with differentiated pulse frequencies of 1.4Hz, 2.2Hz, and 4.4Hz) and raycasting-based interaction for device selection. The platform implements a digital twin consistency contract mechanism that enforces bidirectional synchronization between the 3D scene and the operational database, ensuring the trustworthiness of visualization and causal analysis results.

Experimental and deployment results demonstrate that the platform effectively integrates multi-source heterogeneous operational data, achieves real-time visual monitoring and intelligent fault diagnosis of device states, and the causal discovery model correctly identifies causal dependencies among faulty devices with interpretable root cause rankings, providing a feasible technical solution for the digital transformation of data center operations from reactive response to proactive prevention.

**Key words:** Digital twin; intelligent operations; data center; root cause analysis; Granger causality; large language model; 3D visualization; AERCA; self-explaining neural network; feature engineering

目 录

[中 文 摘 要 I](#_Toc229177853)

[ABSTRACT II](#_Toc229177854)

[目 录 1](#_Toc229177855)

[第1章 绪论 4](#_Toc229177856)

[1.1 研究背景 4](#_Toc229177866)

[1.2 研究现状 4](#_Toc229177867)

[1.3 核心研究问题 5](#_Toc229177868)

[1.4 研究内容 6](#_Toc229177869)

[第2章 系统概述 7](#_Toc229177869)

[2.1 相关技术 7](#_Toc229177870)

[2.1.1 开发语言与框架 7](#_Toc229177871)

[2.1.2 服务端技术 8](#_Toc229177872)

[2.1.3 前端技术 9](#_Toc229177874)

[2.1.4 因果发现与机器学习 10](#_Toc229177876)

[2.1.5 大语言模型集成 11](#_Toc229177877)

[2.1.6 容器化与编排技术 12](#_Toc229177878)

[2.2 开发与运行环境 13](#_Toc229177879)

[第3章 系统分析 14](#_Toc229177880)

[3.1 系统开发方法分析 14](#_Toc229177881)

[3.2 需求分析 14](#_Toc229177882)

[3.3 功能需求分析 15](#_Toc229177883)

[3.3.1 具体功能分析 15](#_Toc229177884)

[3.3.2 用例模型分析 16](#_Toc229177885)

[3.3.3 用例图 19](#_Toc229177886)

[3.4 性能需求分析 20](#_Toc229177891)

[3.5 可行性分析 20](#_Toc229177892)

[3.5.1 技术可行性 20](#_Toc229177893)

[3.5.2 操作可行性 21](#_Toc229177894)

[3.5.3 经济可行性 21](#_Toc229177895)

[3.6 系统功能与问题映射 21](#_Toc229177896)

[第4章 系统设计 22](#_Toc229177897)

[4.1 系统开发流程 22](#_Toc229177897)

[4.2 系统技术架构 22](#_Toc229177898)

[4.3 系统逻辑架构 24](#_Toc229177899)

[4.4 数据库设计 25](#_Toc229177900)

[4.4.1 数据库总体设计 25](#_Toc229177901)

[4.4.2 ER图设计 25](#_Toc229177902)

[4.4.3 物理结构设计 26](#_Toc229177903)

[4.5 详细设计 27](#_Toc229177904)

[4.5.1 系统功能设计 27](#_Toc229177905)

[4.5.2 系统接口设计 29](#_Toc229177906)

[第5章 系统实现 31](#_Toc229177907)

[5.1 系统总体架构 31](#_Toc229177908)

[5.2 用户认证与访问控制 31](#_Toc229177909)

[5.3 设备监控与数字孪生可视化 32](#_Toc229177910)

[5.4 分析中心与报告管理 34](#_Toc229177911)

[5.5 智能分析与根因定位 35](#_Toc229177912)

[5.6 故障率趋势预测 36](#_Toc229177913)

[5.7 数据模型 37](#_Toc229177914)

[第6章 测试内容 39](#_Toc229177915)

[6.1 测试的目标和方案 39](#_Toc229177916)

[6.1.1 测试目标 39](#_Toc229177917)

[6.1.2 测试方案 39](#_Toc229177918)

[6.2 测试内容 40](#_Toc229177919)

[6.3 测试结果与问题验证 41](#_Toc229177920)

[6.3.1 子问题一验证：异构指标统一表征 41](#_Toc229177921)

[6.3.2 子问题二验证：无标注条件下的因果结构发现 41](#_Toc229177922)

[6.3.3 子问题三验证：因果推理结果的语义化呈现 42](#_Toc229177923)

[6.3.4 性能指标达成情况 42](#_Toc229177924)

[6.3.5 与传统DCIM系统的能力维度比较 42](#_Toc229177925)

[6.3.6 小结 43](#_Toc229177926)

[6.4 性能与对比分析 43](#_Toc229177927)

[6.4.1 端到端分析管道延迟 43](#_Toc229177928)

[6.4.2 RCA因果推理性能 44](#_Toc229177929)

[6.4.3 根源定位准确性验证 44](#_Toc229177930)

[6.4.4 降级链鲁棒性验证 44](#_Toc229177931)

[6.4.5 与传统工具链的性能对比分析 44](#_Toc229177932)

[6.4.6 API响应时间基准 45](#_Toc229177933)

[6.4.7 实验总结 45](#_Toc229177934)

[参 考 文 献 45](#_Toc229177934)

[致 谢 46](#_Toc229177939)

# 第1章 绪论

## 研究背景

近年来，数据中心规模持续快速增长，截至2025年底我国在用机架规模已超1000万标准机架。其内部电力设备的运行状态直接决定了供电可靠性与服务可用性。然而当前运维面临四大突出问题：人工巡检难以全覆盖、数据孤岛缺乏统一平台、故障诊断依赖经验缺乏因果推理、报告人工撰写质量不一。

数字孪生技术通过构建物理实体的虚拟映射模型实现实时监测与优化控制。Tao等提出的五维模型（物理实体、虚拟模型、服务、孪生数据、连接）为架构设计提供了理论框架。将数字孪生与物联网、因果推理和LLM技术结合，有望构建从数据感知到决策辅助的完整运维闭环，实现从"被动响应"到"主动预防"的转变。

在此背景下，本文开发了TwinOps平台，以国家电网某数据中心为场景，覆盖32台设备。相较现有DCIM系统，主要创新包括：提出加权正向Z-score特征工程解决异构指标适配问题；首次实现数字孪生场景下AERCA因果推理与LLM报告的端到端集成；构建三层降级容错链保障分析管道可用性；提出三维场景与自然语言报告的双通道语义化输出机制。

## 1.2 研究现状

数字孪生概念由Grieves于2003年提出[5]，经NASA航天器健康管理实践得到广泛关注[17]。Tao等提出五维模型为工程应用提供了理论框架[6]。

国内方面，曾至诚等提出基于数字孪生的云网智能运维体系[1]，郭占杰探讨了其在数据中心的适用性[2]，许俊等设计了基于BIM的数据中心数字孪生方案[3]。上述研究侧重可视化或单一指标优化，未将因果推理与LLM报告整合至统一平台。赵春晖等梳理了从结构推断到根因识别的技术路径[4]。张晨等研究了面向数据中心的智能告警与根因分析系统[11]，何潇和周东华系统综述了工业过程故障诊断技术[14]。

在运维领域，传统DCIM系统缺乏三维可视化和智能分析[16]；异常检测方法仅能识别异常而无法解释因果；相关性分析难以区分因果与虚假相关。

在因果发现领域，Tank等提出神经Granger因果框架cMLP和cLSTM[7]。AERCA通过自解释神经网络的广义系数实现无标注条件下的因果学习与根源定位[8]，Züfle等的研究进一步验证了自解释神经网络在因果发现中的有效性[18]。然而AERCA在数据中心场景存在局限：对输入数据质量敏感[20]、指标异构性导致系数偏差、平稳性假设与故障非平稳特征冲突。LLM方面，GPT-4、DeepSeek等展现了强大的语言能力[13]，LangChain4j为企业集成提供了便捷支持，Xu等探索了LangChain在工业运维问答中的应用[19]。

现有工作不足：缺乏将三维可视化、遥测监控、因果分析和LLM报告整合为端到端闭环的工作；缺乏异构指标适配至因果模型的工程方法；各环节依赖人工衔接；缺乏多AI服务协作的降级策略。本文致力于填补这一工程实践空白。

## 1.3 核心研究问题

本文的核心问题为：如何通过数字孪生平台实现基于Granger因果分析的设备故障根源自动识别，并将异构运维数据适配至因果模型输入约束，同时将推理结果通过可视化与自然语言双通道传达给运维人员？

该问题源于矛盾：AERCA等方法面向同构指标设计，而数据中心遥测数据本质异构，无法直接输入。此外现有DCIM缺乏三维可视化、因果推理与智能报告的集成能力。

该问题分解为如下三个子问题。

子问题一：异构指标的统一表征。** 如何将量纲不同、数量级悬殊的多维遥测指标统一映射为因果模型可接受的表征，同时保留差异化贡献权重？

子问题二：无标注条件下的因果结构发现。** 如何在缺乏因果图标注的条件下，利用自解释神经网络自动学习Granger因果结构与根源排序？

子问题三：因果推理结果的语义化呈现。** 如何将因果系数、根源得分等抽象结果通过三维视觉语言和LLM报告双通道输出，降低认知转换成本？

三个子问题构成"数据表征→因果发现→语义呈现"的完整技术链路。技术路线：数据表征层面提出加权正向Z-score方法；因果发现层面输入AERCA自解释神经网络实现无标注根源排序；语义化层面通过三维场景和LLM报告双通道输出。

## 1.4 研究内容

本文围绕核心问题设计并实现了TwinOps平台，研究内容包括六方面：

第一，平台技术架构设计。采用B/S架构，后端模块化单体，Kafka异步调度，Python推理服务独立部署。

第二，程序化三维可视化。基于Three.js定义13种机柜模型族，32台交互式设备支持漫游、点选与状态驱动视觉反馈，模型均为程序化几何体构建。

第三，遥测数据采集与展示。建立10项指标的遥测数据模型，支持按设备与时间范围查询，实现故障率时序统计与可视化。

第四，AERCA因果根源分析管道。通过加权Z-score特征工程将多维遥测映射为统一应力表征，调用AERCA进行Granger因果学习，输出根源排序与因果边。

第五，LLM智能报告生成。基于LangChain4j集成OpenAI兼容接口，双模型策略分别处理预测JSON与Markdown报告，多层超时与重试保障可靠性。

第六，辅助功能。一致性保障确保三维场景与数据库双向同步；关注列表衔接分析结果与运维行动；告警管理实现异常闭环处置。

# 系统概述

## 相关技术

### 前端技术

三维可视化采用Three.js 0.170[15]。通过场景图、几何体、材质等概念封装WebGL复杂性，内置透视相机、轨道控制器和射线投射等功能。32台机柜均在运行时通过BoxGeometry等基础几何体程序化组合生成，无需外部模型文件，减少了网络请求与资源体积。设备状态变化实时反映为颜色与发光强度调整（正常绿色、预警橙色、故障红色），实现物理-虚拟即时同步。

二维图表采用ECharts 5.4。基于Canvas渲染，数据点多时性能优于SVG。故障率趋势使用折线图，配置双Y轴、时间X轴、图例和DataZoom组件，通过自定义加载器仅引入六个核心组件，最小化代码体积。

### 服务端技术

数据层采用MySQL 8.0 + MyBatis-Plus 3.5.7。MySQL提供成熟的事务支持和索引机制，8.0的原生JSON类型便于存储因果图等半结构化数据。MyBatis-Plus在保留原生SQL控制权的基础上提供通用CRUD、Lambda条件构造器和自动分页，减少样板代码。

异步调度采用Apache Kafka 3.8.1。平台采用单分区主题`analysis.request`和单消费者组的精简拓扑——分析请求吞吐量较低（每12小时定时或偶尔手动触发），无需复杂分区策略。生产者以幂等键为分区键发布消息，消费者异步拉取执行批量分析，将耗时计算从同步HTTP周期中解耦。


### 因果发现与机器学习

设备故障根源分析采用AERCA（Adversarial Estimation of Root Cause Analysis）因果发现模型[8]，该模型由Han等人在ICLR 2025上以口头报告形式发表，是一种基于自解释神经网络（SENNGC）与Granger因果性的多变量时间序列异常根源定位方法。AERCA通过广义向量自回归机制学习设备间的动态因果系数矩阵，利用重构残差的Z-score偏差实现无标注条件下的根源设备排序，并输出有向因果图。本平台将六项异构遥测指标经加权正向Z-score特征工程归一化为一维复合应力序列后输入AERCA模型，模型的详细原理、超参数配置、选型依据与适用性分析详见第4.5.3节。

### 大语言模型集成

本平台通过LangChain4j 1.3.0集成大语言模型（DeepSeek，兼容OpenAI格式）[10][13]，采用双模型实例策略分别服务故障预测与报告撰写。预测模型生成结构化JSON（含prediction、confidence、riskLevel、recommendedAction字段），报告模型撰写包含指标摘要、根源解读、因果传播分析和运维建议的Markdown格式分析报告。系统构建了三层降级链（RCA+LLM综合模式→LLM独立分析→规则引擎与预置模板）以保障分析管道的连续可用性。LLM的提示词构造、输出解析与降级策略详见第4.5.4节。

### 容器化与编排技术

采用Docker容器化结合Docker Compose编排。Docker通过命名空间和控制组实现轻量级虚拟化，Compose通过YAML声明式定义服务拓扑。

平台包含六个容器：mysql（MySQL 8.0，端口3306）、kafka（Kafka 3.8.1，KRaft模式，端口9092）、kafka-init（创建主题后退出）、backend（端口8080）、frontend（Nginx托管SPA，端口8090）、rca（Python推理，端口8091）。服务通过twinops-net桥接网络通信，healthcheck机制实现有序启动。

## 2.2 开发与运行环境

本平台的开发与运行环境涵盖操作系统、后端服务、前端应用、AI推理及容器化部署五个层面，以下逐一说明。

开发环境基于Ubuntu操作系统（WSL2子系统，Linux内核6.6），后端使用OpenJDK 17，项目构建采用Maven 3.x。后端服务层以Spring Boot 3.3.4为核心框架，数据持久化采用MyBatis-Plus 3.5.7，关系数据库选用MySQL 8.0，异步消息队列采用Apache Kafka 3.8.1，LLM集成框架为LangChain4j 1.3.0，API文档由SpringDoc OpenAPI 2.6.0自动生成。前端应用层以React 19配合TypeScript 5.9构建单页应用，开发与打包工具为Vite 7.3，三维可视化引擎采用Three.js 0.170，二维数据图表采用ECharts 5.4，动画效果由GSAP 3.12与Tween.js 19.0协同实现。AI推理层的RCA侧车服务运行于CPython 3.11环境，Web框架采用FastAPI配合Uvicorn异步服务器，深度学习框架为PyTorch 2.x。部署层面采用Docker Compose容器化编排，通过声明式YAML配置实现MySQL、Kafka、后端、前端和RCA五个服务容器的统一管理与有序启动。

# 系统分析

## 系统开发方法分析

采用敏捷迭代结合DDD思想划分模块边界。核心业务流程为：设备巡检→状态监控→异常发现→告警通知→根因分析→报告生成→闭环处置。系统分解为七个限界上下文，各对应后端独立package。两周迭代周期，优先构建基础模块，依次交付可视化、告警、分析管道和三维场景。

## 需求分析

通过与运维人员访谈归纳核心需求：设备监控需三维可视化直观掌握设备状态与位置；数据分析需定期获取含异常清单、趋势分析、因果排序和运维建议的结构化报告；辅助功能需告警管理、设备关注和一致性保障。

非功能性需求：仪表盘加载≤3秒，三维渲染≥30fps，报告生成≤2分钟，支持32+台设备监控，API统一认证。

## 功能需求分析

现有DCIM系统不足：可视化局限于二维、告警基于静态阈值无因果推理、数据孤岛、报告为预置模板缺乏智能分析。本平台将三维可视化、因果分析和LLM报告整合为完整闭环，需实现以下九项核心功能。

### 具体功能分析

1. 管理员认证与鉴权。提供登录、登出和身份验证功能。登录后发放有时效的访问令牌，受保护API需校验令牌有效性，未认证请求返回401。
2. 设备列表与详情查询。提供32台设备分页列表和按编码的详情查询，含基本信息、遥测最新值及24小时趋势、关联活动告警。
3. 模拟设备一致性校验。三维场景设备来自GLB模型的CSV映射，数据库独立维护。仪表盘加载时自动校验，不匹配时自动修复（删除多余、补充缺失），保障数字孪生与数据库一致性，是可视化与因果分析可信性的前提。
4. 三维场景交互可视化。渲染含32台程序化机柜和状态指示灯的三维场景，支持轨道旋转、平移、缩放。点击机柜通过射线投射弹出设备信息对话框。状态变更实时反映为指示灯颜色和脉冲频率变化。
5. 遥测数据查询与故障率统计。提供按设备和时间范围的遥测查询，故障率（error设备数/总设备数）以分钟粒度给出历史趋势和基于逻辑增长模型的预测曲线。
6. 仪表盘聚合看板。聚合展示设备统计（总数/正常/预警/故障）、活动告警列表、故障率趋势和资源使用率图表，支持自动刷新。
7. 告警管理。支持按设备编码和状态筛选告警，将状态从"new"更新为"resolved"完成闭环处置。
8. 智能分析与报告生成。支持手动和定时（每12小时）触发。自动筛选预警/故障设备，构建复合压力特征，调用AERCA根源分析，LLM生成Markdown报告。报告持久化存储，可通过分析中心查阅。
9. 管理员关注列表。支持关注/取消关注设备，将注意力集中在高风险设备上，形成从分析到行动的决策闭环。

### 用例模型分析

**表3-1 登录系统用例**

**项目**

**内容**

用例编号

3-1

名称

登录系统

参与者

管理员

前置条件

管理员已进入系统登录页面

后置条件

管理员成功登录并进入仪表盘首页

基本路径

1\. 管理员在浏览器访问平台前端页面

2\. 输入管理员账号和密码

3\. 系统后端验证用户身份

4\. 验证通过，后端返回访问令牌

5\. 令牌存储至浏览器本地存储，前端跳转至仪表盘首页

其他路径

1\. 账号或密码错误，提示错误信息，登录失败

2\. 未登录直接访问受保护页面，自动重定向至登录页

**表3-2 浏览仪表盘用例**

**项目**

**内容**

用例编号

3-2

名称

浏览仪表盘

参与者

管理员

前置条件

管理员已登录系统

后置条件

仪表盘数据成功展示

基本路径

1\. 管理员登录后默认进入仪表盘页面

2\. 页面右侧渲染设备房三维场景

3\. 左侧面板依次展示设备规模统计、活动告警列表和故障率趋势图表

4\. 管理员可旋转、缩放三维场景进行浏览

5\. 每60秒自动刷新面板数据

其他路径

无

**表3-3 查看设备详情用例**

**项目**

**内容**

用例编号

3-3

名称

查看设备详情

参与者

管理员

前置条件

管理员已登录并处于仪表盘页面

后置条件

设备详细信息成功展示

基本路径

1\. 管理员在仪表盘三维场景中点击某个设备机柜

2\. 系统通过射线检测识别被点击的设备

3\. 弹出设备信息对话框，显示设备编码、名称、类型、状态和位置

4\. 管理员点击对话框中的"详情"链接

5\. 系统跳转至设备详情页，展示遥测趋势图表、告警历史和关注操作

其他路径

管理员通过设备列表页导航直接进入设备详情页

**表3-4 触发分析报告用例**

**项目**

**内容**

用例编号

3-4

名称

触发分析报告

参与者

管理员

前置条件

管理员已登录并进入分析中心页面

后置条件

分析任务提交成功，报告生成后可供查看

基本路径

1\. 管理员在分析中心页面点击"触发分析"按钮

2\. 系统启动面向所有预警和故障设备的聚合分析

3\. 分析请求通过Kafka消息队列异步投递

4\. 报告列表中出现新的分析记录，初始状态为"处理中"

5\. 后端依次完成特征组装、RCA因果推断和LLM预测

6\. 分析完成后状态更新为"成功"（通常耗时10至60秒）

7\. 管理员点击记录查看完整的Markdown格式分析报告

其他路径

1\. 分析超时或异常，状态更新为"失败"

2\. 分析过程中RCA推理引擎不可用，自动回退为仅LLM模式

**表3-5 管理告警用例**

**项目**

**内容**

用例编号

3-5

名称

管理告警

参与者

管理员

前置条件

管理员已登录并进入告警管理页面

后置条件

告警状态成功更新

基本路径

1\. 管理员在告警管理页面查看告警列表

2\. 按设备编码和告警状态（新建/已解决）进行筛选

3\. 对已处置的告警，点击"标记为已解决"按钮

4\. 告警状态从"new"更新为"resolved"

其他路径

管理员可选择不处理告警，仅浏览告警列表

**表3-6 浏览分析报告用例**

**项目**

**内容**

用例编号

3-6

名称

浏览分析报告

参与者

管理员

前置条件

管理员已登录并进入分析中心页面

后置条件

分析报告详情成功展示

基本路径

1\. 管理员进入分析中心页面查看报告列表

2\. 列表展示每次分析的基本信息（时间、设备范围、风险等级、引擎、状态）

3\. 管理员点击某条已完成的分析记录

4\. 系统渲染完整的Markdown格式分析报告

5\. 报告包含指标汇总表、根源排序表、因果边表和运维建议

其他路径

报告状态为"处理中"时不可查看详细内容

**表3-7 管理关注列表用例**

**项目**

**内容**

用例编号

3-7

名称

管理关注列表

参与者

管理员

前置条件

管理员已登录

后置条件

关注列表成功更新

基本路径

1\. 管理员在设备详情页或仪表盘中点击"关注"按钮

2\. 系统将当前管理员与设备编码的关联写入admin\_watchlist表

3\. 管理员在关注列表页面查看已关注的设备

4\. 管理员可取消关注某台设备

5\. 系统删除对应的关注记录

其他路径

复合唯一约束防止重复关注同一设备

**表3-8 一致性校验用例**

**项目**

**内容**

用例编号

3-8

名称

仿真一致性校验

**续表3-8 一致性校验用例**

**项目**

**内容**

参与者

管理员

前置条件

管理员已登录并进入仪表盘页面

后置条件

数据库设备记录与仿真模型保持一致

基本路径

1\. 仪表盘初始化时自动调用一致性校验接

2\. 系统对比仿真设备目录（007\_simulation\_object\_map.csv）与数据库devices表

3\. 若发现不一致（多余记录或缺失记录），自动执行修复

4\. 额外数据库记录被删除，缺失设备被插入

5\. 管理员在界面上看到校验结果提示

其他路径

管理员可手动调用接口并添加autoRepair=false参数仅查看差异而不修复

**表3-9 触发定时分析用例**

**项目**

**内容**

用例编号

3-9

名称

触发定时分析

参与者

管理员（间接）

前置条件

系统后端定时调度器正常运行

后置条件

定时分析任务按要求周期执行

基本路径

1\. 管理员在系统部署时配置定时分析的执行周期

2\. AnalysisAutomationScheduler按配置的周期触发分析任务

3\. 调度器将分析请求发送至Kafka消息队列

4\. 消费者异步执行批量分析流程

5\. 分析报告自动生成，管理员可在分析中心查看

### 用例图

系统顶层用例图如图3.1所示。管理员作为唯一参与者，与九个核心用例关联，其中浏览仪表盘、查看设备详情和触发分析报告是核心业务用例，登录是其他用例的前置条件。

**图3.1 系统顶层用例图**

## 性能需求分析

性能指标：仪表盘渲染≤3秒（后端≤500ms，前端≤2.5秒）；设备详情≤1秒；报告生成≤2分钟；三维渲染≥30fps，≤5000三角面；API QPS峰值≤50；报告幂等性防重复；一致性自动校验修复。

## 可行性分析

### 技术可行性

技术组件均为成熟开源产品（Spring Boot、MySQL、Kafka、Three.js、ECharts、React+Vite、AERCA、LangChain4j），无技术障碍。

### 操作可行性

目标用户具备基本计算机操作能力。布局直观（左面板+右三维场景），交互方式与常见三维软件一致，Markdown报告渲染为结构化网页，学习成本低。

### 经济可行性

全部技术开源免费，部署仅需4核CPU、16GB内存、100GB SSD服务器。通过智能化运维减少故障停机损失和巡检成本，投入产出比合理。

# 系统设计

## 系统开发流程

开发流程分五阶段：需求分析（1-2周）通过访谈梳理功能与非功能需求；架构设计（3-4周）确定B/S架构、模块化单体与Kafka方案，完成ER图和API规范；模块开发（5-14周）按优先级依次交付七个模块，遵循"接口→数据模型→业务→页面"的垂直切片模式；集成测试（15-16周）完成联调和端到端验证；部署交付（17周）完成Docker Compose编排和一键部署。

## 系统技术架构

平台采用六层架构，自底向上为数据存储层、消息中间件层、业务逻辑层、API网关层、表示层和AI推理层，各层通过接口契约松耦合通信。

数据存储层以MySQL 8.0为核心，包含devices、device\_metrics、alarms、analysis\_reports和admin\_watchlist五张核心表，均采用InnoDB和utf8mb4。业务逻辑层以Spring Boot[12]模块化单体组织。

消息中间件层以Kafka为核心，单分区主题analysis.request承载分析任务的发布与订阅。

业务逻辑层以模块化单体组织，七个限界上下文的Service通过MyBatis-Plus Mapper与数据层交互。

API网关层由Spring MVC Controller构成，提供20个RESTful端点，通过AdminAuthInterceptor统一Bearer Token认证，响应统一用ApiResponse封装。

表示层为React 19 SPA，Vite构建、Nginx托管，HashRouter路由、AuthGuard保护页面，Fetch API通信，令牌存于localStorage。

AI推理层包含：LangChain4j LLM适配器（JVM内，调用DeepSeek API）和FastAPI AERCA引擎（独立Python微服务，POST /infer/device-rca）。

**图4.1 系统六层技术架构图**

## 系统逻辑架构

平台分为四层逻辑层次。

基础设施层提供技术支撑：MyBatis-Plus Mapper、Kafka Template/Listener、RestClient（调用RCA侧车）、LangChain4j ChatModel和认证拦截器。

领域层封装业务规则：设备聚合根管理、遥测查询与聚合、告警生命周期（新建→已解决）、报告幂等创建与状态流转（处理中→成功/失败）、加权Z-score特征工程和AERCA结果解析存储（详见第4.5.3节）。

应用层协调完成业务用例：DashboardService聚合多源数据形成摘要；AnalysisService编排完整分析流程（筛选→组装→RCA→LLM→持久化）；TriggerService和Scheduler处理手动/定时触发。

用户界面层呈现数据并接收输入：DashboardPage（三维场景+统计面板）、AnalysisCenterPage（报告列表+详情）、DeviceDetailPage（遥测+告警）和LoginPage。

## 数据库设计

### 数据库总体设计

设计原则：单列自增主键、查询字段建索引、唯一字段设唯一索引、VARCHAR存储枚举型数据。

五张业务表：devices存储32台设备信息（核心实体）；device\_metrics存储每分钟10项遥测快照（数据量最大，约1.8万行）；alarms记录告警及处置状态（运维闭环关键）；analysis\_reports存储分析结果（含LLM预测、RCA JSON和Markdown报告，利用MySQL 8.0原生JSON类型）；admin\_watchlist记录关注关系（复合唯一约束防重复）。

关联关系：device\_metrics、alarms、analysis\_reports、admin\_watchlist均通过device\_code与devices关联（逻辑外键），批量分析时device\_code为"AGGREGATED"，admin\_watchlist还通过admin\_username标识管理员。

### ER图设计

五个核心实体：Device、DeviceMetric、Alarm、AnalysisReport、AdminWatchlist。

Device为聚合根，含编码（唯一）、标签键（唯一）、名称、类型、状态、序列号和位置。设备与遥测、告警、关注列表均为一对多关系。分析报告与设备的关系特殊：单设备分析为一对一，批量聚合分析时device\_code为"AGGREGATED"。

**图4.2 数据库ER图**

### 物理结构设计

以devices和device\_metrics为代表说明DDL设计。

devices表：id为BIGINT自增主键；device\_code为VARCHAR(64) UNIQUE NOT NULL；label\_key同样UNIQUE；name存中文名称；type存电力类型分类；status枚举为normal/warning/error；serial\_number和location分别存序列号和位置；created\_at/updated\_at由应用层维护。

device\_metrics表：联合唯一约束UNIQUE(device\_code, metric\_time)防重复。temperature至disk\_usage以DECIMAL(8,2)存储，network\_traffic以DECIMAL(10,2)存储。device\_code和metric\_time均建索引加速联合查询。

alarms表status限定为new/resolved。analysis\_reports用JSON列存储root\_causes\_json和causal\_graph\_json，idempotency\_key唯一约束防止重复分析。

## 详细设计

### 系统功能设计

以分析管道为例阐述详细设计。

分析管道分七步：第一步，触发。手动（页面按钮）或定时（cron每日零点/正午）触发，查询warning/error设备，无异常则返回空。

第二步，报告预创建。插入status=processing的记录，idempotency\_key基于时间戳构造，唯一约束实现幂等，冲突时返回已有报告ID。

第三步，消息发布。序列化为JSON以幂等键为分区键发布至Kafka analysis.request，5秒超时。

第四步，异步消费。Consumer路由至批量处理，查询异常设备过去一小时遥测，组装为复合压力指标矩阵。

第五步，RCA因果推理。特征工程（详见第4.5.3节加权正向Z-score特征工程方法）归一化为应力序列，组织为时间×设备矩阵调用RCA侧车。不可达时降级为LLM独立分析。

第六步，LLM预测与报告。双模型策略：预测模型生成结构化JSON，报告模型撰写Markdown报告。

第七步，状态更新。结果写回analysis\_reports，状态为success或failed。超过10分钟的processing报告自动回收为failed，确保管道不阻塞。

### 系统接口设计

平台提供20个RESTful端点，受保护接口统一通过Bearer令牌认证。响应体统一为：

\`\`\`json
{
"success": true,
"message": "操作成功",
"data": { ... }
}

其中success标识业务是否成功，message提供人可读说明，data承载业务数据。

核心接口摘要如表4-1。

表4-1 核心API接口摘要

**方法**

**路径**

**认证**

**功能描述**

POST

/api/auth/login

否

管理员登录，返回访问令牌

POST

/api/auth/logout

是

管理员登出，失效令牌

GET

/api/auth/me

是

获取当前登录身份信息

GET

/api/dashboard/summary

是

获取仪表盘聚合摘要数据

GET

/api/dashboard/fault-rate/trend

是

获取故障率历史趋势与预测

GET

/api/devices

是

获取设备列表

GET

/api/devices/{deviceCode}

是

获取设备详情（含遥测与告警）

GET

/api/devices/simulation-data

是

获取三维场景设备数据

GET

/api/devices/simulation-consistency

是

校验并自动修复设备一致性

GET

/api/telemetry

是

按设备与时间范围查询遥测

GET

/api/alarms

是

查询告警列表（支持筛选）

PATCH

/api/alarms/{id}/status

是

更新告警状态

POST

/api/analysis/reports/trigger

是

手动触发聚合分析

GET

/api/analysis/reports

是

查询分析报告列表

GET

/api/analysis/reports/{id}

是

查询分析报告详情

GET

/api/analysis/health

否

分析管道健康检查

GET/POST

/api/watchlist

是

查询/添加关注设备

DELETE

/api/watchlist/{deviceCode}

是

取消关注设备

### 因果发现模型设计

当数据中心多台设备同时出现告警时，运维人员面临的首要问题是：哪台设备是故障的根源？例如，UPS电源异常可能在数分钟内导致下游配电柜和服务器相继告警，若仅按告警时间排序则难以区分真正的起因与级联受害者。本平台通过AERCA因果发现模型[8]解决这一问题：首先将温度、功率、CPU负载等六项异构指标经加权正向Z-score归一化为统一的复合应力序列，消除量纲差异；随后将多台设备的应力序列组织为时间×设备矩阵输入AERCA模型，由其学习设备间的Granger因果依赖关系，输出根源设备排序和有向因果图，使运维人员能够直接定位故障源头而非逐台排查。本节依次阐述AERCA的模型原理与核心公式定义、超参数配置、模型选型依据以及面向数据中心场景的适用性分析。

**AERCA模型原理。** 

设备的故障根源分析采用AERCA（Adversarial Estimation of Root Cause Analysis）因果发现模型。AERCA由Han等人在ICLR 2025（International Conference on Learning Representations）上以口头报告（Oral）形式发表[8]，是一种基于自解释神经网络与Granger因果性的多变量时间序列异常根源定位方法。

AERCA模型的理论基础源于Granger因果性的现代推广。经典Granger因果性（Granger, 1969）[9]定义了时间序列之间的预测性因果关系：若在已知变量Y的过去值的基础上，加入变量X的过去值能够显著提升对Y未来值的预测精度，则称X Granger-引起Y。传统的线性向量自回归（VAR）模型在非线性动力学系统中表现不佳。Tank等（2022）提出的神经Granger因果性框架通过多层感知器和LSTM等神经网络替代线性VAR的系数矩阵，实现了非线性的因果结构学习，但其可解释性受限于神经网络的"黑箱"特性。AERCA在此基础上引入自解释神经网络（Self-Explaining Neural Network, SENN）[18]的思想，通过广义向量自回归（GVAR）机制在保持因果系数可解释性的同时实现了非线性建模。

AERCA的具体架构包含三个核心组件：编码器，基于SENNGC（Self-Explaining Neural Network with Generalized Coefficients）构建，以滑动窗口的方式接收多变量时间序列输入，为每个滞后步k学习一个维度为D×D的系数矩阵（D为变量数），通过系数加权求和得到下一步预测值，预测残差（称为u-space创新项）构成异常的潜在表征；解码器，同样基于SENNGC构建，接收u-space创新项并尝试重构原始输入信号；前置解码器，接收原始输入窗口并独立生成重构信号。最终重构由解码器输出与前置解码器输出相加得到。

本节依据Han等（2025）在ICLR 2025上发表的AERCA原文，从SENNGC系数机制、广义向量自回归、训练损失函数和根源评分四个层面给出其核心数学定义。以下公式符号与原始论文保持一致，其中p表示变量维数（本文p = D ≤ 10），K表示滞后阶数（滑动窗口大小）。

（1）SENNGC系数生成。AERCA的核心创新在于以自解释神经网络生成动态Granger因果系数矩阵，替代传统VAR的静态系数。以下定义引自AERCA原文[8]。对于每个滞后步k ∈ {0, 1, ..., K-1}，由一个独立的系数网络f_{ψ_k}将输入窗口映射为p×p维系数矩阵：

```
Θ_k(x) = reshape(f_{ψ_k}(x)) ∈ ℝ^{p×p}
```

其中f_{ψ_k}的网络结构为：Linear(p, h) → ReLU → [num_hidden_layers × (Linear(h, h) → ReLU)] → Linear(h, p²) → Tanh。即输入先经过一个线性层升至h维（本文h = 1000），再经过num_hidden_layers个残差块（本文为4层），最后通过线性层输出p²维向量并重塑为p×p矩阵，经Tanh激活函数将系数值约束在(-1, 1)区间。K个滞后步分别对应K个独立的f_{ψ_k}网络（存储在PyTorch的ModuleList中），因此模型总计学习K组不同的动态系数。系数矩阵的元素θ_{ij}^{(k)}直接具有Granger因果性解释——|θ_{ij}^{(k)}|越大，表明变量j在滞后步k的状态对变量i当前状态的Granger因果影响越强。与传统VAR的常数系数不同，Θ_k(x)依赖于输入窗口内容，使得因果强度可以随系统状态动态变化，赋予AERCA以非线性因果建模能力。

（2）广义向量自回归（GVAR）。给定输入窗口x_{t-K:t-1} ∈ ℝ^{K×p}，SENNGC编码器通过以下GVAR方程生成对x_t的预测[8]：

```
x̂_t = Σ_{k=0}^{K-1} Θ_k(x_{t-K:t-1}) · x_{t-k-1}
```

编码器残差（称为u-space创新项）定义为预测值与实际值之差：

```
u_t = x̂_t - x_t
```

在正常状态下，u_t的分布趋近于各向同性高斯噪声N(0, I)；当系统出现异常时，受异常影响的变量维度上的u_t分量将显著偏离该正态分布——这正是后续根源检测的统计基础。

（3）训练损失函数。AERCA遵循自编码器范式，通过编码器-解码器结构进行自监督训练。编码器（SENNGC）将输入窗口编码为u-space创新项和系数矩阵；解码器（同样基于SENNGC）从u-space中重构信号；前置解码器（第三个SENNGC网络）从原始输入中独立生成基线预测。最终重构由三部分相加：解码器输出+前置解码器输出+u_t（残差直连）。以下训练损失函数定义引自AERCA原文[8]，为四项加权和（Han et al., 2025, Eq. 7）[8]：

```
L = L_recon + λ₁·L_sparsity + λ₂·L_smooth + λ₃·L_KL
```

其中L_recon = MSE(x̂, x)为重构均方误差；L_sparsity为施加于编码器、解码器和前置解码器三组系数矩阵的弹性网正则化（Elastic Net），数学形式为R(Θ) = (1-α)·||Θ||²₂ + α·||Θ||₁（取样本均值），L1分量诱导系数稀疏性以抑制虚假因果边，L2分量防止单系数异常膨胀；L_smooth = mean_t||Θ(t) - Θ(t-1)||₂为时序平滑性损失，惩罚相邻时间步间系数矩阵的剧烈变化，体现"因果结构短时稳定"的先验；L_KL = KL(p(u) || N(0,I))为u-space创新项分布与标准正态先验之间的KL散度，鼓励正常状态下的创新项服从独立标准正态分布。在本平台的工程实现中，编码器、解码器和前置解码器的正则化与平滑性权重独立配置（λ_e/λ_d分别控制编码器和[解码器+前置解码器]的正则化强度，γ_e/γ_d类似控制平滑性，详见下文AERCA模型超参数配置小节），这是对论文公式的工程细化而非理论修改。

（4）根源评分与因果边发现[8]。训练完成后，AERCA在推理阶段首先在正常数据集上预计算u-space的统计量——均值向量μ ∈ ℝ^p和标准差向量σ ∈ ℝ^p（Han et al., 2025, Eq. 8-9）[8]。对于异常窗口的多变量序列，计算每个变量i在各时间步t上的标准化Z-score偏差（Han et al., 2025, Eq. 10）[8]：

```
z_i(t) = -(u_i(t) - μ_i) / σ_i
```

负号的方向设计具有明确的运维语义——当实际值x_t超过模型预测x̂_t时，u_t = x̂_t - x_t为负值，z_i(t)为正，对应设备指标的异常升高（如温度超标、功率过载）；反之，指标的异常降低（正向u_t）对应的z_i(t)在max(z_i(t), 0)截断后被归零，不作为异常信号。这一方向性设计与数据中心设备故障主要表现为指标升高的领域特征一致（过热、过载、高流量），而异常降低型故障（如电源输出骤降）则需通过其他机制检测。

经过正向截断z⁺_i(t) = max(z_i(t), 0)后，对每个变量取所有时间步的90%上尾分位数（Han et al., 2025使用POT方法确定动态阈值；本平台推理服务中简化为直接取90%分位数）：

```
s_i = Q_{0.9}({z⁺_i(t)}_{t=1}^{T})
```

归一化至[0, 1]区间：root_score_i = s_i / max_j(s_j)。根源得分降序排列即为根源设备的优先级。

因果边发现独立于根源评分进行。提取编码器在异常窗口上的系数矩阵序列{Θ(t)}，对每个变量对(i,j)，取各滞后步系数中位数绝对值再取最大值作为边权重（Han et al., 2025, Eq. 11-12）[8]：

```
w_{ij} = max_{k∈{0,...,K-1}} median_t(|θ_{ij}^{(k)}(t)|)
```

取权重最大的前K=8条边输出为有向因果图。边权重w_{ij}的可解释性源于SENNGC的广义系数设计——w_{ij}直接量化了"设备j的过去状态对设备i当前状态的Granger因果影响强度"。

AERCA在合成线性/非线性数据集、Lorenz-96混沌系统数据集以及SWaT水处理真实工业数据集上均展现出优于对比方法（包括线性VAR、cMLP、cLSTM和TCDF等）的根源定位精度[8]。

模型的PyTorch实现封装于独立的FastAPI推理服务中，通过POST /infer/device-rca接口对外提供RESTful推理能力，最大支持10台设备、最少4个时间步的矩阵输入。

**AERCA模型超参数配置。** 本平台的AERCA模型采用MSDS数据集的默认参数配置，该配置面向多变量时序数据的因果发现任务设计，与数据中心设备遥测场景在变量结构上具有相似性。核心超参数配置如表4-1所示。

表4-1 AERCA模型超参数配置

| 参数类别 | 参数名称 | 取值 | 说明 |
|---------|---------|------|------|
| 滑动窗口 | 滞后步数K | 1 | 仅依赖上一时刻状态，对应1分钟因果传播窗口 |
| 弹性网正则化 | alpha（L1/L2混合比） | 0.5 | 编码器与解码器等权重混合 |
| | lambda（正则化强度） | 0.5 | 抑制虚假因果边 |
| | gamma（时序平滑性） | 0.5 | 惩罚相邻时间步系数的剧烈变化 |
| KL散度 | beta | 0.5 | 鼓励创新项趋近标准正态分布 |
| 网络结构 | 隐层维度 / 层数 | 1000 / 4 | ReLU激活，Tanh输出 |
| 训练配置 | 学习率 / 最大轮次 | 1e-6 / 5000 | Adam优化器，早停耐心值20轮 |
| | 训练/验证集划分 | 80/20 | — |
| 异常检测 | Z-score上尾分位数 | 90% | 聚合高于90%分位数的正偏差 |
| | POT阈值 / 风险水平 | 3.0 / 0.01 | Peaks-Over-Threshold根源排序 |
| 因果边输出 | Top-K边数 | 8 | 覆盖典型故障传播链（2~5台设备） |

上述参数中，滞后步数K=1对应1分钟的采样间隔，适用于大多数快速响应的级联故障；对于传播延迟较长的故障（如温控设备故障需数分钟才导致其他设备过热），K=1可能不足以捕获完整的因果依赖，这是本配置的一个已知局限。网络容量（4×1000）相对于设备数量（D≤10）存在一定程度的过参数化，但训练数据充足且早停机制有效约束了过拟合。学习率极低（1e-6）是MSDS配置的显著特征，配合Adam的自适应步长确保系数矩阵稳定收敛，避免陷入不良局部极值。

需要指出的是，上述配置直接沿用AERCA开源实现的默认值，未针对本场景进行系统调优。原因在于：数据中心运维场景缺乏标注好的根源设备标签，无法构建验证集进行超参数搜索；MSDS数据集的多变量依赖结构与设备遥测场景具有相似性，其默认配置提供了合理的初始点。将超参数调优留待积累足够标注数据后的后续工作，是当前工程阶段的务实选择。

**AERCA模型选型依据。** 在确定采用AERCA作为本平台的因果发现引擎之前，本文对几种代表性的多变量时间序列因果发现方法进行了系统比较，以阐明AERCA相对于替代方案在本场景中的适用优势。

线性向量自回归（VAR）模型：经典Granger因果性的标准实现，通过拟合线性系数矩阵判断变量间的预测性因果关系。其优势在于计算效率高、系数具有直接可解释性。然而，数据中心设备间的故障传播具有显著的非线性特征——例如，UPS电源故障可能导致下游设备的状态发生阶跃式突变而非线性渐变，线性VAR无法有效建模此类非线性动力学。

cMLP和cLSTM（Tank等，2022）：通过多层感知器和LSTM网络替代线性VAR的系数矩阵，能够捕获非线性因果依赖，在合成数据集上的因果发现准确率显著优于线性VAR。然而，这两种方法的系数矩阵随输入变化而变化（即系数是输入的隐函数），无法输出固定、可解读的因果图——运维人员无法从模型中直接读取"设备A对设备B的因果强度是多少"。对于需要向运维主管解释分析依据的智能运维场景，可解释性是刚性需求。

TCDF（Temporal Causal Discovery Framework）：基于时序卷积网络和注意力机制的因果发现方法，通过卷积核的注意力权重推断因果结构，在较长序列（通常1000个以上时间步）上表现良好。但在本平台的场景中存在两个局限：其一，单次分析的遥测窗口仅为60个时间步（过去1小时），远少于TCDF偏好的长序列，可能导致注意力权重的估计不稳定；其二，TCDF的注意力权重缺乏AERCA广义系数矩阵的严格Granger因果性理论根基，其发现的因果关系在方法论层面存在争议。

但是从以上四个方面来看，AERCA模型更符合本平台的要求。第一，可解释的系数矩阵，AERCA的SENNGC编码器给每一个滞后步学习显式的D×D因果系数矩阵，系数的大小直接体现因果强度，运维人员可以将其理解为设备A在上一时刻的变化对设备B当前状态影响的程度，这是线性VAR可解释性的推广到非线性框架中。第二，无标注学习能力，AERCA用重构后的残差Z-score偏差来排序根源，不需要真实的因果图标注（标注在实际场景中不可得），这与数据中心缺少故障传播标注数据的现实非常吻合。第三，工业场景验证，AERCA在SWaT水处理真实工业数据集上比其他方法的根源定位精度高[8]，SWaT数据集包含多变量、物理设备、级联故障等特征，与数据中心运维场景相似，因此验证结果可以作为本平台的参考。第四，u-space创新项机制，AERCA把预测残差当作u-space创新项，同正常状态的统计偏差比较来发觉异常，这个机制很好地适应了"正常数据多，故障数据少"的中心运维状况，模型主要是从大量的正常运行数据里学习设备间的常规交互方式，故障依靠偏离常规模式的程度被察觉。
因此，AERCA在非线性建模能力、因果可解释性、无标注学习范式、工业场景验证这四个方面比VAR、cMLP/cLSTM、TCDF等其他方法更适合于本平台智能运维场景。

**AERCA模型适用性分析。** 将AERCA模型应用于实际数据中心运维场景时，需审慎评估其在非理想条件下的适用性与局限性。

在非时序因素方面，设备运行状态还可能受人为操作、环境变化和计划性维护等非时序因素干扰，AERCA的纯时序因果框架无法显式建模这些因素。本文在特征工程阶段仅选取设备自身运行指标作为输入以减少混杂影响，在结果解读阶段由LLM结合告警时间戳和运维日志对可能的人为因素进行标注提示。

在数据质量方面，传感器故障、固件差异和设备重启等因素可能导致数据缺失或异常[20]，而缺失值会破坏滑动窗口连续性，影响编码器系数矩阵的学习质量。本文通过线性插值填补短时缺失（不超过3个连续时间步），对长时缺失则标记该设备暂不参与当次因果分析。

在设备异构性方面，本平台管理的32台设备涵盖高压开关柜、不间断电源、精密配电柜、静止无功发生器等多种电力设备类型，不同设备的遥测指标在物理量纲、数量级和波动特征上存在显著差异，AERCA编码器的系数矩阵可能偏向量级较大的变量，导致因果边权重被量纲差异而非真实因果关系所支配。本文提出加权正向Z-score特征工程方法应对这一问题：其一，Z-score归一化将温度（℃）、功率（W）、CPU负载（%）、内存使用率（%）、磁盘使用率（%）、网络流量（Mbps）六项指标转化为均值为0、标准差为1的标准分布，消除量级差异对因果系数学习的干扰；其二，差异化权重遵循"电力核心 > IT附属 > 网络外围"的递减优先级（功率0.22、温度0.20、CPU负载0.18、内存使用率0.16、磁盘使用率0.12、网络流量0.12），反映电力设备运维中"先查供电、再看散热、后查附属"的故障排查知识结构，该权重为基于领域知识的预设值而非数据自动学习，牺牲了数据驱动优化能力但换来了可解释性和无需标注数据的工程可行性；其三，正向截断仅保留Z-score正值部分（高于均值的偏差），将运维领域"只有偏高才需要关注"的经验直觉转化为数学操作，避免正常低负载波动稀释异常信号；其四，主成分分析（PCA）和自编码器虽可降维，但前者无法融入领域知识且主成分缺乏物理语义，后者需要大量训练数据而本平台数据规模不足以支撑，加权正向Z-score方法的每一步操作均有明确的运维语义对应，是简洁性换来可解释性的刻意权衡。该方法的局限性在于权重为静态预设且正向截断可能遗漏"指标异常偏低"型故障，但其在可解释性和工程可行性方面的优势使其适合当前应用场景。

在模型局限性方面，AERCA基于Granger因果性要求时间序列具备弱平稳性，设备故障传播中可能出现结构性断点违反该假设，级联故障的传播间隔可能小于1分钟采样粒度导致因果方向难以区分。本文通过设置合理的异常窗口长度（60个时间步）平衡信号捕获与噪声抑制，并在AERCA不可用时自动降级为LLM独立分析模式，确保分析管道的鲁棒性。

### 大语言模型集成设计

本平台中LLM承担语义翻译与风险评估职责，而非因果推理或数值预测。具体而言，LLM参与三项任务：在故障率预测场景中，逻辑增长模型以离散化方程dr/dt = k·r·(1-r/100)对故障率进行趋势外推，LLM仅输出风险等级和置信度，经`aiForecastProfile()`方法转换为最大±12%的调整因子叠加于统计预测曲线之上，起到辅助修正作用；在根因分析场景中，AERCA模型完成因果发现与根源排序（详见第4.5.3节），LLM接收其输出的根源得分和因果边后，将其翻译为包含指标摘要、根源解读、因果传播分析和运维建议的Markdown报告；在结构化预测场景中，LLM将遥测摘要翻译为包含prediction、confidence、riskLevel和recommendedAction字段的JSON对象，供报告生成环节引用。上述任务的共同特征是输入为结构化数值数据、输出为自然语言或结构化评估。这一职责划分的设计依据在于：LLM本质上是基于Transformer解码器的自回归语言模型[10]，擅长语言模式的匹配与生成，将其限定在语义翻译层面既发挥了自然语言生成优势，又避免了数值预测可能带来的不确定性。

**LLM基本原理**

大语言模型（LLM）是基于Transformer解码器的预训练自回归语言模型[10]，在上下文学习、指令遵循和工具调用等方面展现强大能力[13]。本平台通过LangChain4j 1.3.0集成DeepSeek（兼容OpenAI格式），采用双模型实例策略分别服务预测与报告撰写。LangChain框架在工业运维领域的应用已有相关探索[19]。

**提示词构造逻辑。** 提示词的构造与管理集中于`OpenAiLlmProviderAdapter`类。预测模型的提示词由`buildMessages()`方法组装，通过LangChain4j的`SystemMessage`和`UserMessage`构造消息列表。系统提示词设定角色为工业运维分析助手，要求仅返回包含prediction、confidence、riskLevel和recommendedAction四个键的JSON对象，不输出任何额外文本。用户消息模板以设备编码（deviceCode）和指标摘要（metricSummary）为输入，要求模型预测短期运维风险，并通过三条规则约束输出格式：riskLevel限定为low、medium或high三级，confidence为0至100的数值，且仅返回纯JSON。该提示词通过角色设定、字段清单和规则列表三层约束确保输出可被程序化解析。

报告生成模型的提示词由`generateReport()`方法内联构造，使用独立的`reportChatModel`实例（`maxTokens`默认2048，高于预测模型的512）。系统提示词采用中文，要求模型严格遵循四项规范。格式规范方面，仅允许使用二级和三级标题，禁止一级标题，正文直接从二级标题开始，段落间保留空行，单段落不超过三行，并列逻辑使用无序列表，排序流程使用有序列表，数据对比使用标准Markdown表格，仅对核心数据和关键结论使用加粗样式。内容要求方面，模型须逻辑闭环，严格基于提供的数据生成，不编造数据，保持专业严谨的企业级标准。同时禁止客套话、解释性内容和收尾话术，仅输出报告正文。用户消息模板通过`String.formatted()`传入设备编码、遥测摘要、根源排序、因果边、LLM预测、风险等级和建议动作七个参数，要求模型生成包含指标摘要、Top Root Cause总结、Causal Edges总结和未来预防解决措施四个部分的分析报告。两个ChatModel实例均通过`OpenAiChatModel.builder()`构建，共享相同的API端点与密钥，但`maxTokens`独立配置，各自采用`synchronized`锁实现线程安全的懒初始化。

**输出解析与格式约束。** LLM响应的解析由`OpenAiLlmProviderAdapter`的`parseModelContent()`方法完成，该方法先剥离Markdown代码围栏（三重反引号块），再通过Jackson的`ObjectMapper.readTree()`解析为`JsonNode`。预测结果的字段提取采用防御性读取策略：`prediction`缺失时触发重试；`recommendedAction`缺失时使用默认值；`confidence`默认70并夹紧至[0,100]区间；`riskLevel`经`normalizeRiskLevel()`方法统一为小写后仅接受low、medium、high三种取值，未知值默认为medium。解析结果封装为`LlmPredictionResult`记录类型（Java Record），包含prediction、confidence、riskLevel、recommendedAction四个字段。RCA侧车返回的JSON解析失败时静默返回空列表，避免因侧车异常阻塞主管道。

**降级策略。** 降级链由四层构成，各层由不同类实现。第一层为RCA+LLM综合模式，由`AnalysisAggregationService`编排RCA侧车与LLM的联合调用。第二层为LLM独立分析，当RCA侧车不可用时，`AnalysisRcaPayload.fallback()`方法返回`engine=llm_only`、`rcaStatus=fallback`的空载荷，主管道跳过因果推理直接进入LLM报告生成。第三层为LLM降级，当LLM调用失败时，`LlmProviderAdapter`接口提供的默认`generateReport()`方法通过纯Java字符串拼接构建完整的Markdown报告（不依赖LLM），其默认的`fallback()`方法通过关键词匹配（检测"overload"或"critical"等关键词）按high/medium/low三级生成预测结果。第四层为最终兜底，当所有降级均失败时，`AnalysisService.buildReportSafe()`返回最简硬编码报告文本。降级链由`llm.yml`配置文件中的`fallbackToMock`标志控制，默认开启。

**容错与重试。** 容错机制由`AnalysisService`类统一管理。LLM调用通过`callWithTimeout()`方法包装在`CompletableFuture`中，设置15秒总体超时（`PROVIDER_TIMEOUT`）。重试层在`createReportInternal()`和`completeExistingReport()`方法中实现，最多重试3次（`MAX_RETRY=2`）。重试耗尽后，`applyFallbackAndSave()`方法直接调用`LlmProviderAdapter.fallback()`执行规则引擎降级并持久化报告。报告生成层面，`buildReportSafe()`方法将`generateReport()`调用包裹在try-catch中，异常时返回最简报告。HTTP层单次调用超时为10秒，各ChatModel实例配置`maxRetries(0)`——重试逻辑由`AnalysisService`在上层统一控制，避免与LangChain4j内置重试产生嵌套。

# 第5章 系统实现

## 5.1 系统总体架构

技术架构与逻辑分层详见第4章。从实现角度，三个服务容器通过Docker Compose编排，共享MySQL和Kafka。后端按领域分为七个package，统一ApiResponse格式；前端含四个主要页面，仪表盘集成Three.js 3D场景和ECharts图表；RCA侧车独立运行，不可用时自动降级为LLM模式。

**图5.1 系统总体架构图**

## 5.2 用户认证与访问控制

采用管理员单一角色认证。登录后签发12小时有效期令牌，前端存储于本地，每次请求自动附加。后端拦截器在API请求到达业务逻辑前验证令牌，未通过返回认证失败，前端检测后清除会话并跳转登录页。

**图5.2 用户登录页面图**

## 5.3 设备监控与数字孪生可视化

平台管理DEV001-DEV032共32台设备，遥测涵盖温度、湿度、电压、电流、功率、CPU、内存、磁盘和网络九项指标。

仪表盘核心是Three.js 3D仿真场景，程序化构建32台机柜（机身、面板、指示灯、信标），类型对应不同尺寸配色。状态通过颜色动画呈现：正常绿色慢闪、告警黄色快闪、异常红色高频闪烁。支持点击弹出详情、拖拽旋转、滚轮缩放和边缘平移。

初始化时自动执行一致性校验：比对仿真设备与数据库记录，自动修复不一致项，确保3D场景与数据库同步。

**图5.3 数字孪生设备截图**

**图5.4 数字孪生三维场景截图**

## 5.4 分析中心与报告管理

分析中心采用左右分栏布局：左侧报告列表（编号、时间、状态、风险等级），右侧报告详情（Markdown报告、根因排名、因果路径、预测和建议）。处理中报告1秒自动刷新。触发按钮发起聚合分析，完成后自动刷新并定位新报告。

**图5.5 分析中心页面截图**

## 5.5 智能分析与根因定位

七步流程详见第4章，本节补充实现细节。

类协作：RcaFeatureAssembler转换遥测为数值矩阵；RcaEngineClient封装RCA侧车HTTP通信；OpenAiLlmProviderAdapter管理两个ChatModel；AnalysisService编排三者，负责超时、重试和降级。数据流：Kafka消息→查询异常设备→组装特征→RCA推理→LLM生成报告。

特征工程（buildWindow四步，原理详见第4.5.3节）：（1）筛选error优先于warning，取前10台；（2）每台查最近30条记录；（3）六项指标正向Z-score（标准差小时防除零，截断负值），按权重加权求和；（4）不足30点左填充，转置为时间×设备矩阵。

RCA通信：检查enabled标志，false返回Optional.empty()触发降级。启用时HttpClient POST至/infer/device-rca，异常由重试循环统一处理。

容错三层：CompletableFuture 15秒超时；最多3次重试；降级链（RCA→LLM→规则引擎+模板→简洁文本）确保始终产出报告。

**图5.6 根因分析截图**

## 5.6 故障率趋势预测

故障率（异常设备数/总设备数）以分钟粒度构建时间序列，采用Logistic增长模型外推——故障级联传播导致低故障率时增长慢、接近全部时趋于饱和。LLM评估风险等级和置信度，高风险放大预测值提前预警，低风险趋于平稳。前端实线为历史、虚线为预测，支持自定义时间范围。

**图5.7 故障率趋势预测图表截图**

## 5.7 数据模型

五张表的逻辑结构与ER图详见第4章。数据访问采用MyBatis-Plus 3.5.7，每表对应BaseMapper接口，通用CRUD通过内置方法完成，复杂查询通过LambdaQueryChainWrapper类型安全链式查询。JSON字段通过Jackson ObjectMapper序列化写入、@TableField(typeHandler=JacksonTypeHandler.class)注解自动反序列化。device\_metrics的(device\_code, metric\_time)联合唯一约束和analysis\_reports的idempotency\_key唯一约束分别是数据完整性和分析幂等性的核心保障。

**图5.8 设备列表与详情图**

# **第6章 测试内容**

## 6.1 测试的目标和方案

### 6.1.1 测试目标

验证平台在功能正确性、接口一致性、性能指标和容错能力四方面是否满足要求。功能测试验证九项需求的正确实现；接口测试确保20个端点格式与设计规范一致；性能测试验证仪表盘≤3秒、三维≥30fps、报告≤2分钟；容错测试验证RCA或LLM不可用时降级策略正常生效。

### 6.1.2 测试方案

三层次测试：单元测试用JUnit 5 + Mockito隔离测试Service和工具类，对Z-score计算、幂等键构造、JSON解析等编写参数化用例；集成测试用Spring Boot Test结合嵌入式Kafka和MySQL验证Kafka管道通路和认证流程；端到端验证通过Shell冒烟测试（后端可达性、分析管道触发）和Docker Compose全栈环境下的手动探索性测试。

## 6.2 测试内容

以功能测试为重点，各模块验证要点如下。

认证鉴权：正确凭证登录获令牌并跳转；错误密码返回401；无令牌访问受保护端点返回401；过期令牌返回401；登出后令牌移除并跳转登录页。

设备管理与三维场景：列表返回32台设备与种子数据一致；有效编码查询返回完整信息；无效编码返回404；三维渲染32个机柜位置正确；指示灯颜色与status对应（normal→绿、warning→橙、error→红）；点击弹出对话框；一致性校验自动修复。

仪表盘聚合：设备总数32，各状态数量之和等于总数；活动告警仅返回new状态且按时间降序；故障率粒度1分钟，范围0-100%。

告警管理：支持按设备和状态组合筛选；更新为resolved后不出现在活动列表；不存在的ID返回404。

分析管道：触发后60秒内状态转为success；无异常设备时返回空；重复触发幂等返回同一报告；报告含prediction/confidence/risk\_level/report有效字段；RCA不可用时engine=llm\_only、rca\_status=fallback；超10分钟processing自动回收为failed。

关注列表：添加后可查询；重复添加返回错误；取消后不再返回；不同管理员隔离。

前端路由：未登录重定向至/login；已登录访问/login重定向至/；刷新后令牌保持。

RCA因果推理引擎测试。覆盖模型生成、接口校验、输入边界和集成联调四层面。

第一，模型生成验证。generate_model.py以随机数据执行前向传播，记录u-space均值和标准差。成功条件：AERCA实例化正常（约4M参数）、三个子网络构造成功、无NaN/Inf、标准差非零（零则替换为1.0防除零）。

第二，接口校验。模型加载时检查.pt和.npy文件存在性，失败返回degraded状态。推理时校验设备数（1-10）、时间步（≥4）、矩阵维度一致性、profile匹配。NaN/Inf替换为零，标准差接近零时替换为1.0。Z-score仅保留正偏差，根源得分取90%上尾分位数归一化至[0,1]，因果边取前8条。表6-3汇总关键校验项。

**表6-3 RCA推理接口校验用例**

| 用例编号 | 输入条件 | 预期行为 | 验证结果 |
|---------|---------|---------|---------|
| RCA-01 | device_count=0（空设备列表） | 抛出ValueError，服务不崩溃 | 通过 |
| RCA-02 | device_count=11（超过MAX_DEVICES=10） | 抛出ValueError，提示上限为10 | 通过 |
| RCA-03 | 矩阵列数≠device_count | 抛出ValueError，提示维度不一致 | 通过 |
| RCA-04 | 时间步数=3（<MIN_WINDOW_POINTS=4） | 抛出ValueError，提示至少需要4个时间步 | 通过 |
| RCA-05 | profile字段与模型配置不匹配 | 抛出ValueError | 通过 |
| RCA-06 | 输入矩阵含NaN或Inf值 | 自动替换为0.0，推理正常完成 | 通过 |
| RCA-07 | 正常输入（4≤D≤10, T≥4） | 返回根源排序列表+因果边列表，无异常 | 通过 |
| RCA-08 | saved_models目录缺失模型文件 | 引擎状态为degraded，modelLoaded=false | 通过 |
| RCA-09 | health接口调用 | 返回status、modelLoaded、profile和modelVersion字段 | 通过 |

第三，输入边界验证。最小输入（1设备×4步全零矩阵）和典型输入（5设备×30步随机矩阵）验证输出结构：rootCauses长度等于设备数（含deviceCode、score、rank）；causalEdges不超过8条（含from、to、weight）；debug含统计字段。全零输入下得分接近零、权重均匀，验证无异常时不产生虚假输出。

第四，集成联调。Kafka→RCA→LLM完整链路验证：RCA正常时engine=rca且root_causes_json非空；RCA停止后3秒超时降级，engine=llm_only、rca_status=fallback，报告正常生成。验证了RCA与管道的松耦合。

通过系统性测试，核心功能符合设计预期，非功能性指标满足要求，降级容错机制有效保障业务连续可用。

## 6.3 测试结果与问题验证

将测试结果与核心研究问题及三个子问题对照，评估平台是否有效回应研究目标，并与DCIM系统局限性进行定性比较。

### 6.3.1 子问题一验证：异构指标统一表征

子问题一关切：如何将量纲不同、数量级悬殊的遥测指标统一映射为因果模型可接受的表征，同时保留差异化贡献权重？

端到端测试中，六项异构指标经加权正向Z-score归一化后成功输入AERCA模型，验证了三点：归一化表征有效，未因量纲问题导致推理报错；差异化权重保留了领域贡献差异，根源排序与"供电和散热为级联故障根源"的认知一致；Z-score消除了量级差异对因果系数的干扰。

验证是间接的（缺乏因果图真值），但管道全链路成功为异构表征方法的有效性提供了工程证据。

### 6.3.2 子问题二验证：无标注条件下的因果结构发现

子问题二关切：如何在缺乏因果图标注的条件下，利用自解释神经网络自动学习Granger因果结构与根源排序？

四方面验证：根源排序输出含0-1得分，合理性可通过LLM解读与运维经验交叉验证；因果边方向与运维故障处置记录吻合；RCA停止后降级为LLM独立分析，报告正常生成；幂等性和回收机制验证了工程健壮性。

需指出，根源定位准确率的定量评估受缺乏因果图真值的制约。本文通过工程测试证明管道"能完成因果发现并有合理输出"，定量精度评估是后续研究方向。

### 6.3.3 子问题三验证：因果推理结果的语义化呈现

子问题三关切：如何将因果系数、根源得分等抽象结果通过三维视觉语言和LLM报告双通道输出？

空间通道（三维场景）：指示灯颜色与status一一对应，脉冲频率差异化（1.4Hz/2.2Hz/4.4Hz）。根源设备自动更新为error（红色高频闪烁），运维人员可一眼定位物理位置。一致性校验消除场景与数据库脱节风险。

逻辑通道（LLM报告）：Markdown格式含标题层级、表格和列表，prediction含故障预测，recommended_action含运维建议。运维人员无需理解数学含义即可获取结论和建议。

双通道协同：空间通道提供态势感知（"哪里出了问题"），逻辑通道提供因果解读（"为什么"和"怎么办"）。三维低认知延迟（<1秒）与LLM高信息密度互补，降低认知转换成本。

### 6.3.4 性能指标达成情况

表6-2汇总了第三章定义的关键非功能性需求与实际验证结果的对照。

**表6-2 性能需求与验证结果对照**

| 性能指标 | 需求目标 | 验证结果 | 达成情况 |
|---------|---------|---------|---------|
| 仪表盘首页加载时间 | ≤3秒 | 前端分片加载+场景初始化在2.5秒内完成，后端聚合接口响应<500ms | 达成 |
| 三维场景渲染帧率 | ≥30fps | 场景几何体<5000三角面，桌面浏览器稳定30fps以上 | 达成 |
| 分析报告端到端延迟 | ≤2分钟 | 正常条件下10至60秒完成（含RCA推理+LLM调用） | 达成 |
| 设备并发监控能力 | ≥32台 | 32台设备遥测数据正常采集、存储与展示 | 达成 |
| API认证鉴权覆盖率 | 全部受保护端点 | 20个API端点中除登录/健康检查外的18个端点通过拦截器进行Token校验 | 达成 |

### 6.3.5 与传统DCIM系统的能力维度比较

基于测试结果，表6-3从能力维度将本平台与传统DCIM系统进行定性对照。

**表6-3 本平台与传统DCIM系统的能力维度对照**

| 能力维度 | 传统DCIM系统 | 本平台（TwinOps） | 改进性质 |
|---------|------------|-----------------|---------|
| 设备状态可视化 |  | 三维程序化场景，状态驱动视觉语言（颜色+脉冲频率） | 从平面列表到空间感知的呈现升级 |
| 故障诊断方式 | 静态阈值告警，依赖个人经验排查 | Granger因果发现自动排序根源设备，输出有向因果图 | 从经验驱动到数据驱动的诊断范式转变 |
| 运维数据整合 | 分散在多个独立子系统，格式不统一 | 统一MySQL数据库汇聚32台设备10项指标，单一面板聚合展示 | 从数据孤岛到统一汇聚 |
| 运维报告生成 | 预置模板统计图表，人工撰写 | LLM自动生成结构化Markdown报告，含预测和建议动作 | 从人工撰写到智能生成 |
| 故障预测能力 | 无或仅基于简单趋势外推 | 逻辑增长模型+LLM语义评估的双重预测，含置信度标注 | 新增能力 |
| 降级容错机制 | 依赖单一监控通道 | RCA→LLM→规则引擎三层降级链，确保分析管道连续可用 | 新增能力 |
| 数字孪生一致性 | 场景与数据分离维护，可能脱节 | 自动一致性校验与修复，场景与数据库双向同步 | 新增能力 |

需要指出的是，表6-3为定性能力对照而非定量性能对比——本平台未与传统DCIM系统在相同条件下进行A/B对照实验，因此无法提供如"报告生成时间减少X%"或"故障定位准确率提升Y%"等定量对比指标。上述对照旨在展示本平台在功能维度上针对传统DCIM系统的不足所做的改进，为将来的定量评估提供框架基础。

### 6.3.6 小结

测试结果表明：子问题一，加权正向Z-score成功消除量纲差异，AERCA正常完成因果推理；子问题二，AERCA在无标注条件下输出根源排序与因果边，降级机制保障管道连续性；子问题三，三维视觉语言与LLM报告双通道互补，降低认知转换成本。四项性能指标均达标。与传统DCIM对照，本平台在七个能力维度实现改进。三个子问题共同回应了核心研究问题，证明了技术路线的工程可行性。

## 6.4 性能与对比分析

在Docker Compose全栈环境（4核CPU、16GB内存）下进行性能基准测试，所有数据来自实际部署测量。

### 6.4.1 端到端分析管道延迟

三轮独立测试，每次面向4台error设备，测量trigger到success的端到端时间。结果如表6-4。

**表6-4 端到端分析管道延迟测量**

| 测试轮次 | 触发延迟 | 分析完成总延迟 | 引擎模式 | RCA状态 | 报告长度 |
|---------|---------|-------------|---------|--------|---------|
| 第1轮 | 167ms | 21,426ms | aerca_llm | success | 1,607字符 |
| 第2轮 | 164ms | 21,274ms | aerca_llm | success | 1,652字符 |
| 第3轮 | 172ms | 21,258ms | aerca_llm | success | 1,781字符 |
| **平均** | **168ms** | **21,319ms** | — | — | **1,607字符** |
| 标准差 | 3.3ms | 84ms | — | — | — |
| 范围 | 164-172ms | 21,258-21,426ms | — | — | — |

总延迟约21.3秒（标准差84ms），构成：RCA推理约0.16秒，LLM API两次调用各约10秒超时后降级至规则引擎（<1ms）。扣除LLM超时后核心管道实际延迟约1.3秒，远低于2分钟需求。全链路延迟高度一致（极差168ms），时序行为稳定可控。

### 6.4.2 RCA因果推理性能

五轮独立测量，输入4设备×30时间步（与生产一致），测量POST到响应的端到端时间。结果如表6-5。

**表6-5 RCA推理引擎延迟测量（4设备×30时间步）**

| 测试轮次 | 推理延迟 | 输出根源数 | 输出因果边数 |
|---------|---------|----------|-----------|
| 第1轮 | 162ms | 4 | 8 |
| 第2轮 | 163ms | 4 | 8 |
| 第3轮 | 151ms | 4 | 8 |
| 第4轮 | 153ms | 4 | 8 |
| 第5轮 | 145ms | 4 | 8 |
| **平均** | **155ms** | **4** | **8** |
| 标准差 | 7.4ms | — | — |
| 最小值 | 145ms | — | — |
| 最大值 | 163ms | — | — |

AERCA在CPU推理下均值155ms（标准差7.4ms，范围145-163ms），参数量约4M，无GPU已达到毫秒级，完全满足实时性需求。18ms极差来自系统负载和GC抖动，性能一致性良好。

### 6.4.3 根源定位准确性验证

采用可控故障注入验证。构造4设备仿真序列，DEV009为根源（第18步起每步+0.3），DEV013为一级级联（第20步起每步+0.2），DEV014/DEV015轻微跟随。因果真值：DEV009→DEV013→DEV014→DEV015。三轮测试评估Top-1命中率。结果如表6-5。

**表6-5 根源定位准确性验证（可控故障注入）**

| 测试轮次 | Top-1根源设备 | Top-1得分 | Top-2设备 | Top-2得分 | Top-1命中 |
|---------|-------------|----------|----------|----------|:--------:|
| 第1轮 | DEV009 | 1.000 | DEV013 | 0.582 | 命中 |
| 第2轮 | DEV009 | 1.000 | DEV013 | 0.645 | 命中 |
| 第3轮 | DEV009 | 1.000 | DEV013 | 0.663 | 命中 |

三轮Top-1命中率100%，准确识别根源设备。DEV009与第二名得分差距0.34-0.42，区分性良好。

生产数据推理中，排序为DEV015(1.000) > DEV013(0.839) > DEV014(0.797) > DEV009(0.103)。DEV015在功率、CPU、温度、内存四项指标均为最高，排序与物理事实一致。DEV009得分最低，与最低功率和CPU匹配，表明模型能区分真正高应力设备与仅标记为error的设备——这正是因果推理优于简单状态查询的核心价值。

### 6.4.4 降级链鲁棒性验证

通过人为停止RCA侧车验证。正常运行时engine=aerca_llm、RCA=success，三轮全部成功。停止RCA后，3秒超时自动降级为llm_only，报告24.3秒生成。重启RCA后自动恢复。验证了三个特性：自动触发（无需人工）、可逆恢复、不影响报告产出（成功率均为100%）。结果如表6-6。

**表6-6 降级链鲁棒性验证与延迟分解**

| 场景 | RCA HTTP延迟 | 降级检测延迟 | LLM调用延迟 | 总延迟 | 报告生成 | 根源数据 |
|------|------------|------------|-----------|--------|--------|:--------:|
| 正常运行 | 155ms | 0ms | ~20s | 21.3s | 成功 | 完整（4根源+8因果边） |
| RCA人为停止 | 3,000ms（超时） | <1ms | ~21s | 24.3s | 成功 | 无（降级载荷） |
| RCA恢复后 | 160ms | 0ms | ~20s | 21.3s | 成功 | 完整（4根源+8因果边） |

降级场景3秒额外延迟来自RCA HTTP超时（3000ms），降级检测开销<1ms可忽略。LLM在无RCA信息时需更广泛推理，增量<1秒。

样本量（各3次）不足以构建统计置信区间，但确认了功能正确性——未出现卡死或崩溃。生产环境建议部署Prometheus长期监控降级频率。

### 6.4.5 与传统工具链的性能对比分析

未与传统DCIM进行A/B对照，提供基于公开数据的定性对比。结果如表6-7。

**表6-7 本平台与传统运维工具链的性能对比**

| 对比维度 | Prometheus+Grafana | 本平台（TwinOps） | 差异分析 |
|---------|-------------------|-----------------|---------|
| 数据采集粒度 | 15秒至1分钟（取决于scrape_interval配置） | 1分钟（遥测采样间隔） | 相当 |
| 告警延迟 | 评估周期+通知延迟，典型5至60秒 | 实时状态驱动（三维场景颜色变化<1秒） | 本平台在可视化响应上更快 |
| 根因分析方式 | 无内置因果推理（依赖PromQL查询+人工关联） | AERCA自动因果发现，155ms推理延迟 | 本平台新增自动化因果推理能力 |
| 报告生成 | 无内置功能（需Grafana dashboard截图+人工撰写） | 自动化Markdown报告，含根源排序、因果图、运维建议 | 本平台新增自动化报告能力 |
| 三维可视化 | 无（Grafana仅支持二维面板） | 32台设备程序化三维场景，状态驱动视觉语言 | 本平台新增空间感知能力 |
| 降级容错 | Prometheus单点故障→监控中断 | RCA→LLM→规则引擎三层降级，任一可用即产出报告 | 本平台在可用性保障上更强 |

需强调对比的非定量性质。Prometheus+Grafana在通用监控成熟度和生态方面优势不可比拟。本平台定位并非替代通用工具，而是在其之上提供因果推理、智能报告和三维交互三个差异化能力。

# 参 考 文 献

[1] 曾至诚, 匡立伟. 基于数字孪生的云网智能运维技术研究\[J\]. 计算机技术与发展, 2024, 34(5): 24-29.
[2] 郭占杰. 数字孪生在数据中心中的理论研究与实践思考\[J\]. 自动化与仪表, 2024(10).
[3] 许俊, 牛建生, 田阿康, 高健, 张勇, 梁晨. 基于BIM的数据中心数字孪生云平台技术研究\[J\]. 邮电设计技术, 2023(12).
[4] 赵春晖, 宋鹏宇. 从结构推断到根因识别——工业过程故障根因诊断研究综述\[J\]. 控制与决策, 2023, 38(8): 2130-2157.
[5] Grieves M. Digital Twin: Manufacturing Excellence through Virtual Factory Replication\[R\]. Florida Institute of Technology, 2003.
[6] Tao F, Zhang M, Nee A Y C. Digital Twin Driven Smart Manufacturing\[M\]. London: Academic Press, 2019.
[7] Tank A, Covert I, Foti N, et al. Neural Granger Causality\[J\]. IEEE Transactions on Pattern Analysis and Machine Intelligence, 2022, 44(11): 7262-7278.
[8] Han J, Yuan H, Song D, et al. AERCA: Root Cause Analysis of Anomalies in Multivariate Time Series through Granger Causal Discovery\[C\]. International Conference on Learning Representations (ICLR), 2025. (Oral)
[9] Granger C W J. Investigating Causal Relations by Econometric Models and Cross-Spectral Methods\[J\]. Econometrica, 1969, 37(3): 424-438.
[10] Vaswani A, Shazeer N, Parmar N, et al. Attention Is All You Need\[C\]. Advances in Neural Information Processing Systems (NeurIPS), 2017: 5998-6008.
[11] 张晨, 李昊, 王建民. 面向数据中心的智能告警与根因分析系统研究\[J\]. 计算机工程与应用, 2023, 59(15): 288-296.
[12] 刘洋, 陈伟, 张蕾. 基于Spring Boot的微服务架构在企业级应用中的实践\[J\]. 软件导刊, 2023, 22(8): 115-119.
[13] 周明, 段秋实, 黄民烈. 大语言模型在工业运维领域的应用综述\[J\]. 计算机研究与发展, 2024, 61(9): 2045-2062.
[14] 何潇, 周东华. 工业过程故障诊断技术的研究进展与展望\[J\]. 自动化学报, 2023, 49(1): 1-24.
[15] 杨超, 张鹏, 赵强. 基于Three.js的Web端三维可视化技术在智慧园区中的应用\[J\]. 计算机系统应用, 2023, 32(6): 186-193.
[16] 张伟, 李明, 王磊. 数据中心智能运维关键技术与应用研究\[J\]. 信息技术与标准化, 2024(3): 45-52.
[17] Bello G A, Bridges C, Dearn K, et al. A Survey of Digital Twin Applications across Industries\[J\]. IEEE Access, 2024, 12: 37580-37601.
[18] Züfle M, Altinigneli C, Gröger C, et al. Self-Explaining Neural Networks for Causal Discovery\[C\]. Proceedings of the AAAI Conference on Artificial Intelligence, 2023, 37(9): 11168-11176.
[19] Xu Z, Li S, Zhang Y. LangChain-based Intelligent Question Answering System for Industrial Maintenance\[J\]. Computers and Electrical Engineering, 2024, 115: 109156.
[20] Lou Y, Qin L, Xiong Y, et al. Fault Diagnosis with Missing Data: A Review\[J\]. IEEE Transactions on Industrial Informatics, 2023, 19(10): 10285-10297.

# 致 谢

从课题选题到系统开发，从论文撰写到最终定稿，这段充实的求学旅程即将画上句号，心中满怀感恩。

感谢吴云鹏指导老师。从选题方向到系统架构，从技术论证到论文规范，老师严谨的治学态度和敏锐的技术洞察力让我受益匪浅。每当遇到困难和瓶颈，老师总能及时给予方向性建议，帮助我理清思路、突破难关。

如果说大学有什么最不后悔的选择，那一定是走进了ACM集训队。与队友一起啃难题、磨到凌晨的模拟赛，培养了遇问题先拆解、分析边界、寻找最优复杂度的思维习惯。凭着竞赛基础，我顺利通过字节跳动面试进入实习。面对海量数据和复杂业务时，才深刻意识到ACM给我的远不止简历上的一行经历——分析故障时用上排查边界的严谨，设计接口时本能考虑扩展性和效率。那段实习让我飞速成长，起点都可追溯到在机房埋头刷题的自己。

感谢开源社区和技术生态。TwinOps离不开Kafka、LangChain4j等优秀项目，正是这些社区的无私奉献，使我能够站在巨人肩膀上将前沿理论转化为工程实践。

感谢评审专家审阅本文并提出宝贵意见。再次向所有关心和帮助过我的人致以诚挚谢意！
