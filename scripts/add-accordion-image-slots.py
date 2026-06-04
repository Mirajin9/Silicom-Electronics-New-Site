# Adds a 16:9 image-slot inside every Application accordion body (top of
# .category-body-inner) on both components.html and instruments.html.
# The hint label uses the application's category-title text for fast lookup.
import re, pathlib

PAGES = {
    "components.html": "components",
    "instruments.html": "instruments",
}

# Match an Application accordion card and inject the slot after the opening
# <div class="category-body-inner"> tag.
# Only target cards with id="app-*" (Applications). Skip categories/brands.
PATTERN = re.compile(
    r'(<article class="category-card glass reveal" id="app-[^"]+">'
    r'[\s\S]*?<div class="category-title">([^<]+)</div>'
    r'[\s\S]*?<div class="category-body"><div class="category-body-inner">)',
    re.MULTILINE,
)

counter = {"n": 0}
def insert_factory(scope):
    def insert(m):
        head = m.group(1)
        title = re.sub(r"&amp;", "&", m.group(2)).strip()
        hint  = f"{scope}: {title} — example board / setup photo"
        if 'class="image-slot"' in head.split('<div class="category-body"><div class="category-body-inner">')[1]:
            return head
        slot = (
            '\n          <div class="image-slot" data-ratio="16-9" '
            f'data-hint="{hint}" style="margin-bottom:14px"></div>'
        )
        counter["n"] += 1
        return head + slot
    return insert

for filename, scope in PAGES.items():
    p = pathlib.Path(filename)
    src = p.read_text(encoding="utf-8")
    counter["n"] = 0
    new = PATTERN.sub(insert_factory(scope), src)
    p.write_text(new, encoding="utf-8")
    print(f"{filename}: inserted {counter['n']} image-slots")
