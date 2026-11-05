#!/usr/bin/env python3
"""Baut MUNSCH Flow 6 als Einzeldatei.

Übernimmt aus ../base.html unverändert:
  - Stammdaten (window.MFDATA, MF_BUILD)
  - Logo-Vektoren und den Logik-Kern (Zustand, Fächer, Milkrun, Register, Warnlage)
  - die zentrale Synchronisierung (Format bleibt identisch zur Zentrale)
und setzt sie mit der neuen Oberfläche (src/app.css, src/app.js) zusammen.

Aufruf: python3 neu/build.py  ->  neu/munsch-flow-6.html
"""
import hashlib, pathlib, re, sys

HERE = pathlib.Path(__file__).resolve().parent
SRC = HERE.parent / 'base.html'
OUT = HERE / 'munsch-flow-6.html'

base = SRC.read_text(encoding='utf-8')

def one(pattern, text, flags=re.S):
    m = re.findall(pattern, text, flags)
    assert len(m) == 1, f'{pattern[:60]!r}: {len(m)} Treffer statt 1'
    return m[0]

def between(text, start, end):
    assert text.count(start) == 1, f'Startmarke {start!r} {text.count(start)}x'
    i = text.index(start)
    j = text.index(end, i)
    return text[i:j]

# 1) Stammdaten
mfdata = one(r"<script>(window\.MF_BUILD='[^']*';window\.MFDATA=.*?)</script>", base)

# 2) Logo und Kern bis vor das alte Modal
core = between(base, '/* Original-MUNSCH-Logo als Vektor', '/* ===== Modal ===== */')
core = re.sub(r'</script>\s*<script[^>]*>', '\n', core)
assert '</script>' not in core and '<script' not in core

# 3) Synchronisierung ohne die alten Oberflächenteile
sync = between(base, '/* ===== ZENTRALE SYNCHRONISIERUNG', 'ACT.syout=function')
assert 'function syStart' in sync and 'function syPush' in sync

css = (HERE / 'src' / 'app.css').read_text(encoding='utf-8')
app = (HERE / 'src' / 'app.js').read_text(encoding='utf-8')

build = hashlib.sha1((mfdata + core + sync + css + app).encode()).hexdigest()[:12]
mfdata = re.sub(r"window\.MF_BUILD='[^']*'", f"window.MF_BUILD='6-{build}'", mfdata, count=1)

html = f'''<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>MUNSCH Flow</title>
<meta name="theme-color" content="#0A0B0D">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@500;600;700;800&family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
{css}
</style>
</head>
<body>
<div id="light" aria-hidden="true"></div><div id="vignette" aria-hidden="true"></div>
<div id="app"></div>
<script>{mfdata}</script>
<script>
{core}
</script>
<script>
{sync}
</script>
<script>
{app}
</script>
</body>
</html>
'''
OUT.write_text(html, encoding='utf-8')
print(f'{OUT.name}: {len(html)//1024} KB, Build 6-{build}')
