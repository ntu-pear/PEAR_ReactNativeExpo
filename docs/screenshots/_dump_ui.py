"""Print clickable nodes from a uiautomator dump."""
import re
import sys

path = sys.argv[1] if len(sys.argv) > 1 else r"%TEMP%\pear_now.xml"
with open(path, encoding="utf-8", errors="ignore") as f:
    xml = f.read()

nodes = re.findall(r"<node [^>]*>", xml)
for node in nodes:
    text = re.search(r'text="([^"]*)"', node)
    desc = re.search(r'content-desc="([^"]*)"', node)
    rid = re.search(r'resource-id="([^"]*)"', node)
    bounds = re.search(r'bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"', node)
    clickable = 'clickable="true"' in node
    label = (text.group(1) if text else "") or (desc.group(1) if desc else "")
    if not label and not (rid and clickable):
        continue
    extra = rid.group(1).split("/")[-1] if rid else ""
    b = bounds.groups() if bounds else ("?", "?", "?", "?")
    flag = " TAP" if clickable else ""
    print(f"{label!r:40} {extra:28} [{b[0]},{b[1]}][{b[2]},{b[3]}]{flag}")
