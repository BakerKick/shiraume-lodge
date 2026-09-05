# -*- coding: utf-8 -*-
"""Bundle a page of this site into one double-clickable HTML file.

    python3 tools/build-standalone.py [page.html ...]

Defaults to both pages. Stylesheets, images and scripts are inlined. The
awkward part is three.js: file:// pages cannot load ES modules at all, so
the module build is rewritten into a classic script that returns a THREE
namespace object, and the page's own module is unwrapped to match.
"""
import base64, re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent

PAGES = {
    'index.html':   'shiraume-lodge-standalone.html',
    'hikosan.html': 'hikosan-standalone.html',
}

# style.css points .hero-bg at an assets/hero.jpg that isn't in the repo; the
# markup's inline background overrides it, so this just keeps the bundle from
# carrying a reference to a file that doesn't exist.
ALIASES = {'hero.jpg': 'hero.png'}


def three_as_classic_script():
    """Rewrite vendor/three.module.min.js into a classic script."""
    src = (ROOT / 'vendor/three.module.min.js').read_text(encoding='utf-8')
    i = src.rindex('export{')
    body, exports = src[:i], src[i + len('export{'):]
    exports = exports.rstrip().rstrip(';').rstrip().rstrip('}')

    pairs = []
    for entry in exports.split(','):
        entry = entry.strip()
        if not entry:
            continue
        m = re.fullmatch(r'(\S+)\s+as\s+(\S+)', entry)
        local, name = m.groups() if m else (entry, entry)
        pairs.append((name, local))
    assert len(pairs) > 300, len(pairs)
    assert 'WebGLRenderer' in dict(pairs), 'export map looks wrong'

    return (
        '/* three.js r169 (MIT) — rewritten from an ES module to a classic\n'
        '   script so this page runs straight off the filesystem. */\n'
        'var THREE = (function () {\n"use strict";\n'
        + body
        + '\nreturn {' + ','.join('%s:%s' % (n, l) for n, l in pairs) + '};\n})();\n'
    ), len(pairs)


def build(page, out_name, three_classic):
    html = (ROOT / page).read_text(encoding='utf-8')

    # ── the page's own module ───────────────────────────────────────────
    m = re.search(r'<script type="module" src="\./([\w.-]+)"></script>', html)
    assert m, 'no module script in ' + page
    mod = (ROOT / m.group(1)).read_text(encoding='utf-8')
    mod, n = re.subn(r"^import \* as THREE from '[^']+';\n", '', mod, flags=re.M)
    assert n == 1, 'expected one three.js import in ' + m.group(1)

    html = html.replace(m.group(0),
        '<script>\n' + three_classic + '\n'
        + '(function () {\n"use strict";\n' + mod + '\n})();\n</script>')

    # ── stylesheets ─────────────────────────────────────────────────────
    for link in re.findall(r'<link rel="stylesheet" href="\./([\w.-]+\.css)" />', html):
        css = (ROOT / link).read_text(encoding='utf-8')
        html = html.replace('<link rel="stylesheet" href="./%s" />' % link,
                            '<style>\n/* %s */\n%s\n</style>' % (link, css))

    # ── images ──────────────────────────────────────────────────────────
    uris = {}
    for png in sorted((ROOT / 'assets').glob('*.png')):
        uris[png.name] = 'data:image/png;base64,' + base64.b64encode(png.read_bytes()).decode()
    for ref in sorted(set(re.findall(r'\./assets/[\w.-]+', html))):
        name = ref.rsplit('/', 1)[1]
        html = html.replace(ref, uris.get(name) or uris[ALIASES[name]])

    # A standalone file has no sibling pages to link back to.
    html = re.sub(r'<a id="back" href="\./index\.html">.*?</a>', '', html, flags=re.S)

    leftovers = re.findall(r'\./(?:assets/[\w.-]+|[\w.-]+\.(?:css|js|html))', html)
    assert not leftovers, leftovers

    out = ROOT / out_name
    out.write_text(html, encoding='utf-8')
    return out


if __name__ == '__main__':
    classic, n_exports = three_as_classic_script()
    targets = sys.argv[1:] or list(PAGES)
    for page in targets:
        out = build(page, PAGES[page], classic)
        print('%-14s → %-32s %.2f MB' % (page, out.name, out.stat().st_size / 1e6))
    print('(three.js exports remapped: %d)' % n_exports)
