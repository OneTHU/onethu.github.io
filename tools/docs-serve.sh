#!/usr/bin/env bash
# 本地预览文档站：同步主仓文档 → docs-src/，再起 mkdocs serve。
#
#   bash tools/docs-serve.sh                 # 主仓默认取 ~/…/thuapp/OneTHU
#   ONETHU_REPO=/path/to/OneTHU bash tools/docs-serve.sh
#   PORT=8123 bash tools/docs-serve.sh
#
# 构建环境（venv）默认建在仓库之外：本仓库位于 exFAT 卷时 venv 无法创建符号链接。
set -euo pipefail

HERE=$(cd "$(dirname "$0")/.." && pwd)
MAIN_REPO=${ONETHU_REPO:-"$HERE/../OneTHU"}
VENV=${DOCS_VENV:-"$HOME/Library/Caches/onethu/docs-venv"}
PORT=${PORT:-8000}

if [ ! -d "$MAIN_REPO/docs" ]; then
  echo "× 找不到主仓文档目录：$MAIN_REPO/docs"
  echo "  用 ONETHU_REPO=/path/to/OneTHU 指定主仓路径。"
  exit 2
fi

if [ ! -x "$VENV/bin/mkdocs" ]; then
  echo "· 创建文档站构建环境：$VENV"
  mkdir -p "$(dirname "$VENV")"
  if command -v uv >/dev/null 2>&1; then
    uv venv --python 3.13 "$VENV"
    uv pip install --python "$VENV/bin/python" -r "$HERE/requirements-docs.txt"
  else
    python3 -m venv "$VENV"
    "$VENV/bin/pip" install -q -r "$HERE/requirements-docs.txt"
  fi
fi

python3 "$HERE/tools/sync-docs.py" "$MAIN_REPO/docs"

echo "· 预览地址 http://127.0.0.1:$PORT/docs/  （官网根目录页面不在本次预览内）"
exec "$VENV/bin/mkdocs" serve --config-file "$HERE/mkdocs.yml" --dev-addr "127.0.0.1:$PORT"
