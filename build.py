#!/usr/bin/env python3
"""Сборка игры: склеивает файлы из src/ (порядок в src/manifest.txt) в один index.html.

Запуск:  python3 build.py           — собрать index.html
         python3 build.py --check   — проверить, что index.html совпадает со сборкой
"""
import sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / 'src'
OUT = ROOT / 'index.html'


def build() -> str:
    parts = [l.strip() for l in (SRC / 'manifest.txt').read_text(encoding='utf-8').splitlines()]
    parts = [p for p in parts if p and not p.startswith('#')]
    return ''.join((SRC / p).read_text(encoding='utf-8') for p in parts)


if __name__ == '__main__':
    html = build()
    if '--check' in sys.argv:
        same = OUT.exists() and OUT.read_text(encoding='utf-8') == html
        print('index.html актуален' if same else 'index.html устарел: запустите python3 build.py')
        sys.exit(0 if same else 1)
    OUT.write_text(html, encoding='utf-8')
    print(f'Собрано: {OUT.name}, {len(html.encode("utf-8")) // 1024} КБ')
