# Restructures .org-circle HTML in both HTML pages:
# 1. Wraps each <button class="org-node"> in <div class="org-node-orbit" style="--i:X; --n:Y">
#    - Moves --i/--n style from the button to the wrapper div
#    - The button keeps all data-* attributes and content
# 2. Inserts <div class="org-ring-track"></div><div class="org-ring-inner"></div>
#    just before <div class="org-circle-hub"> (inside .org-circle-stage)
import re, pathlib

NODE_PAT = re.compile(
    r'(<button class="org-node" type="button" )(style="--i:\d+; --n:\d+")\s+(data-app-id="[^"]*"'
    r'[^>]*>)'
    r'(\s*<span class="org-node-icon">[^<]*</span>'
    r'\s*<span class="org-node-label">[^<]*</span>'
    r'\s*</button>)',
    re.DOTALL
)

def wrap_node(m):
    before  = m.group(1)   # '<button class="org-node" type="button" '
    style   = m.group(2)   # 'style="--i:0; --n:9"'
    rest    = m.group(3)   # 'data-app-id="..." ...>'
    content = m.group(4)   # spans + </button>
    return (
        f'<div class="org-node-orbit" {style}>\n'
        f'          {before}{rest}'
        f'{content}\n'
        f'        </div>'
    )

TRACKS = (
    '<div class="org-ring-track"></div>\n'
    '        <div class="org-ring-inner"></div>\n'
    '        '
)

for filename in ['components.html', 'instruments.html']:
    p = pathlib.Path(filename)
    src = p.read_text(encoding='utf-8')

    # 1. Wrap nodes (only inside .org-circle sections)
    new = NODE_PAT.sub(wrap_node, src)

    # 2. Insert ring-track divs just before .org-circle-hub
    new = new.replace(
        '        <div class="org-circle-hub">',
        TRACKS + '<div class="org-circle-hub">',
        2  # both circles (instruments + components each have 1, but safety)
    )

    p.write_text(new, encoding='utf-8')

    # Verify
    nodes_orig = src.count('class="org-node"')
    orbits_new = new.count('class="org-node-orbit"')
    tracks_new = new.count('class="org-ring-track"')
    print(f'{filename}: {nodes_orig} nodes → {orbits_new} orbit wrappers, {tracks_new} ring tracks')
