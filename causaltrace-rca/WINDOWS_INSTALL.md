Windows 安装说明（建议使用 Conda，避免从源编译大型科学包）

说明：在 Windows 上使用 pip 安装 numpy/scipy 等时，pip 可能尝试从源码构建并需要 Microsoft Visual C++ Build Tools，导致安装失败。推荐使用 Miniconda/Conda 来获得预编译二进制包。

示例步骤：

1. 安装 Miniconda（https://docs.conda.io/en/latest/miniconda.html）并打开新的终端。
2. 创建并激活 Python 3.11 环境：

   conda create -n causaltrace-rca python=3.11 -y
3. 安装主要依赖（从 conda-forge 获取预构建二进制包）：

   conda install -c conda-forge numpy=1.26.* scipy=1.15.* scikit-learn=1.6.* pandas=2.2.* requests tqdm numba igraph fastapi uvicorn -y
4. 安装 PyTorch：请根据你的硬件与 CUDA 版本，参考官方安装命令：
   https://pytorch.org/get-started/locally/

   例如（CPU 版本示例）：
   pip install torch --index-url https://download.pytorch.org/whl/cpu
5. 安装库中剩余的 Python 包（如果需要）：

   pip install -r requirements.txt

提示：

- 如果必须使用 pip + venv（非 conda），需要先安装 Microsoft Build Tools（Visual Studio 的 C++ 构建工具），并确保系统安装了相匹配的编译器与 Windows SDK。
- 如果遇到其他二进制包问题，优先考虑在 WSL/Ubuntu 或 Conda 环境中运行。

如需，我可以基于此准备 PR（更新 requirements.txt 并在 README 中加入此说明）。
