#!/usr/bin/env python3
"""把主仓 docs/ 同步成本站 mkdocs 的文档源目录 docs-src/。

用法：
    python3 tools/sync-docs.py <主仓 docs 目录> [回退 docs 目录 ...]
    # 例：python3 tools/sync-docs.py ../OneTHU/docs

规则：
  · 逐目录复制，后续目录只补前面缺失的文件（用于仅存在于 demo 分支的文档），互不覆盖；
  · 跳过 macOS / exFAT 副产物（`._*`、`.DS_Store`），否则会被视为文档页；
  · 主仓 `docs/README.md` 在站内改名为 `overview.md`：站内首页由本站自有的 `index.md` 提供；
  · 指向仓库内其他文件（`../LICENSE` 等）的相对链接改写为主仓 GitHub 地址，避免站内 404；
  · 最后叠加本站自有页面 `docs-site/`（可覆盖以上任意文件）。

文档正文的权威位置始终是主仓；本脚本只做单向复制，不修改主仓文件。
"""
import os
import re
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DEST = os.path.join(ROOT, 'docs-src')
SITE_PAGES = os.path.join(ROOT, 'docs-site')

REPO_URL = os.environ.get('ONETHU_REPO_URL', 'https://github.com/smartThise/OneTHU')
REF = os.environ.get('ONETHU_REF', 'dev3')

SKIP_NAMES = {'.DS_Store', '.git', '.github'}
# 指向 docs/ 之外（仓库其他文件）的相对链接：]( ../LICENSES/THIRD-PARTY.md )
OUTSIDE_LINK = re.compile(r'\]\(\.\./([^)\s]+)\)')


def skipped(name):
    return name in SKIP_NAMES or name.startswith('._')


def copy_tree(src, dst, only_missing=False):
    """复制目录树；only_missing=True 时只补目标里缺的文件。返回 (新增, 跳过) 列表。"""
    added, skipped_existing = [], []
    for base, dirs, files in os.walk(src):
        dirs[:] = [d for d in dirs if not skipped(d)]
        rel = os.path.relpath(base, src)
        target_dir = dst if rel == '.' else os.path.join(dst, rel)
        os.makedirs(target_dir, exist_ok=True)
        for name in files:
            if skipped(name):
                continue
            rel_path = name if rel == '.' else os.path.join(rel, name)
            target = os.path.join(target_dir, name)
            if only_missing and os.path.exists(target):
                skipped_existing.append(rel_path)
                continue
            # 使用 copyfile 而非 copy2：exFAT 上复制元数据会生成 `._*` 旁文件，
            # 该文件会被 mkdocs 视为文档页并混入构建产物
            shutil.copyfile(os.path.join(base, name), target)
            added.append(rel_path)
    return added, skipped_existing


def main(argv):
    sources = [os.path.abspath(p) for p in argv]
    if not sources:
        print(__doc__)
        return 2
    for src in sources:
        if not os.path.isdir(src):
            print('× 目录不存在：%s' % src, file=sys.stderr)
            return 2

    if os.path.isdir(DEST):
        shutil.rmtree(DEST)
    os.makedirs(DEST)

    for index, src in enumerate(sources):
        added, existing = copy_tree(src, DEST, only_missing=index > 0)
        tag = '主来源' if index == 0 else '回退补入'
        print('· %s %s：复制 %d 个文件%s'
              % (tag, src, len(added), '（跳过已存在 %d 个）' % len(existing) if existing else ''))

    # 主仓 docs/README.md → overview.md
    readme = os.path.join(DEST, 'README.md')
    if os.path.exists(readme):
        os.replace(readme, os.path.join(DEST, 'overview.md'))
        print('· 主仓 README.md → overview.md（站内首页由 docs-site/index.md 提供）')

    # 指向仓库其他文件的相对链接 → 主仓 GitHub 地址
    rewritten = 0
    for base, dirs, files in os.walk(DEST):
        dirs[:] = [d for d in dirs if not skipped(d)]
        for name in files:
            if skipped(name) or not name.endswith('.md'):
                continue
            path = os.path.join(base, name)
            with open(path, encoding='utf-8') as handle:
                text = handle.read()
            new = OUTSIDE_LINK.sub(lambda m: '](%s/blob/%s/%s)' % (REPO_URL, REF, m.group(1)), text)
            if new != text:
                with open(path, 'w', encoding='utf-8') as handle:
                    handle.write(new)
                rewritten += 1
    if rewritten:
        print('· 仓库内其他文件链接改为 GitHub 地址：%d 个文件（%s@%s）' % (rewritten, REPO_URL, REF))

    # 本站自有页面叠加在最后
    if os.path.isdir(SITE_PAGES):
        added, _ = copy_tree(SITE_PAGES, DEST)
        print('· 叠加本站自有页面 docs-site/：%d 个文件' % len(added))

    # 兜底：清理任何来源留下的 AppleDouble 旁文件
    removed = 0
    for base, dirs, files in os.walk(DEST):
        for name in files:
            if name.startswith('._'):
                os.remove(os.path.join(base, name))
                removed += 1
    if removed:
        print('· 清理 `._*` 旁文件 %d 个' % removed)

    pages = sum(len([f for f in files if f.endswith('.md') and not skipped(f)])
                for _, _, files in os.walk(DEST))
    print('√ 文档源就绪：%s（%d 个 Markdown 页面）' % (os.path.relpath(DEST, ROOT), pages))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
