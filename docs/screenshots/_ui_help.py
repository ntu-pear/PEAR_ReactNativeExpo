"""Dump UI nodes or tap by text/id."""
import re
import subprocess
import sys

ADB = r"C:\Users\User\AppData\Local\Android\Sdk\platform-tools\adb.exe"
SERIAL = "emulator-5554"
XML = r"C:\Users\User\AppData\Local\Temp\pear_now.xml"


def adb(*args):
    return subprocess.check_output([ADB, "-s", SERIAL, *args], stderr=subprocess.STDOUT)


def dump():
    adb("shell", "uiautomator", "dump", "/sdcard/ui.xml")
    adb("pull", "/sdcard/ui.xml", XML)
    with open(XML, encoding="utf-8", errors="ignore") as f:
        return f.read()


def nodes(xml):
    out = []
    for node in re.findall(r"<node [^>]*>", xml):
        def g(attr):
            m = re.search(attr + r'="([^"]*)"', node)
            return m.group(1) if m else ""
        b = re.search(r'bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"', node)
        if not b:
            continue
        x1, y1, x2, y2 = map(int, b.groups())
        out.append({
            "text": g("text"),
            "desc": g("content-desc"),
            "id": g("resource-id").split("/")[-1],
            "clickable": 'clickable="true"' in node,
            "cx": (x1 + x2) // 2,
            "cy": (y1 + y2) // 2,
            "bounds": (x1, y1, x2, y2),
        })
    return out


def print_nodes(xml):
    for n in nodes(xml):
        label = (n["text"] or n["desc"] or "").encode("ascii", "replace").decode("ascii")
        if not label and not (n["id"] and n["clickable"]):
            continue
        flag = " TAP" if n["clickable"] else ""
        print(f"{label!r:42} {n['id']:28} [{n['bounds'][0]},{n['bounds'][1]}][{n['bounds'][2]},{n['bounds'][3]}]{flag}")


def tap(x, y):
    adb("shell", "input", "tap", str(x), str(y))


def tap_match(pred, xml=None):
    xml = xml or dump()
    for n in nodes(xml):
        if pred(n):
            tap(n["cx"], n["cy"])
            msg = (n["text"] or n["desc"] or n["id"]).encode("ascii", "replace").decode("ascii")
            print(f"TAP {msg} @ {n['cx']},{n['cy']}")
            return True
    print("MISS")
    return False


def screenshot(path):
    adb("shell", "screencap", "-p", "/sdcard/pear_now.png")
    adb("pull", "/sdcard/pear_now.png", path)
    print("SHOT", path)


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "dump"
    xml = dump()
    if cmd == "dump":
        print_nodes(xml)
    elif cmd == "tap-text":
        needle = sys.argv[2]
        ok = tap_match(lambda n: needle.lower() in (n["text"] + n["desc"]).lower(), xml)
        sys.exit(0 if ok else 1)
    elif cmd == "tap-id":
        needle = sys.argv[2]
        ok = tap_match(lambda n: n["id"] == needle, xml)
        sys.exit(0 if ok else 1)
    elif cmd == "shot":
        screenshot(sys.argv[2])
    else:
        print("unknown", cmd)
        sys.exit(1)
