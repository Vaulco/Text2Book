#!/usr/bin/env python3
"""
clipboard_to_game.py - Watches the clipboard and auto-pastes new content into Minecraft,
then clicks a specific coordinate and returns the mouse to its original position.

Requirements:
    pip install pyautogui pygetwindow pyperclip
"""

import sys
import time

try:
    import pyperclip
except ImportError:
    print("Missing dependency. Install with:  pip install pyperclip")
    sys.exit(1)

try:
    import pyautogui
except ImportError:
    print("Missing dependency. Install with:  pip install pyautogui")
    sys.exit(1)

try:
    import pygetwindow as gw
    HAS_GETWINDOW = True
except ImportError:
    HAS_GETWINDOW = False
    print("Note: pygetwindow not found — install with: pip install pygetwindow")
    print("      Ctrl+V will be sent to whatever window is currently focused.\n")


MINECRAFT_KEYWORDS = ["minecraft", "lwjgl"]
POLL_INTERVAL = 0.3  # seconds between clipboard checks
CLICK_X = 1504
CLICK_Y = 379


def find_window(keywords: list) -> object:
    if not HAS_GETWINDOW:
        return None
    for win in gw.getAllWindows():
        if any(kw in win.title.lower() for kw in keywords):
            return win
    return None


def focus_and_paste(win):
    if win:
        try:
            win.activate()
            time.sleep(0.2)
        except Exception as e:
            print(f"  Warning: could not focus window ({e})")
    pyautogui.hotkey('ctrl', 'v')


def click_and_restore(x: int, y: int, delay: float):
    """Save mouse position, click target, then move mouse back."""
    orig_x, orig_y = pyautogui.position()
    time.sleep(delay)
    pyautogui.click(x, y)
    print(f"  → Clicked ({x}, {y})")
    time.sleep(0.1)
    pyautogui.moveTo(orig_x, orig_y)
    print(f"  → Mouse restored to ({orig_x}, {orig_y})")


def list_windows():
    if not HAS_GETWINDOW:
        print("pygetwindow not installed.")
        return
    print("\nOpen windows:")
    for win in gw.getAllWindows():
        if win.title.strip():
            print(f"  {win.title}")
    print()


def main():
    import argparse
    parser = argparse.ArgumentParser(
        description="Watch clipboard and auto-paste new content into Minecraft, then click a coordinate."
    )
    parser.add_argument("--minecraft", type=str, default=None,
                        help="Partial Minecraft window title (default: auto-detect)")
    parser.add_argument("--delay", type=float, default=0.2,
                        help="Seconds to wait after focusing before pasting (default: 0.2)")
    parser.add_argument("--click-x", type=int, default=CLICK_X,
                        help=f"X coordinate to click after pasting (default: {CLICK_X})")
    parser.add_argument("--click-y", type=int, default=CLICK_Y,
                        help=f"Y coordinate to click after pasting (default: {CLICK_Y})")
    parser.add_argument("--list-windows", action="store_true",
                        help="Print all open window titles and exit")
    args = parser.parse_args()

    if args.list_windows:
        list_windows()
        sys.exit(0)

    pyautogui.FAILSAFE = True

    mc_keywords = [args.minecraft.lower()] if args.minecraft else MINECRAFT_KEYWORDS

    print("=" * 50)
    print("  Clipboard → Minecraft Auto-Paster")
    print("=" * 50)

    mc_win = find_window(mc_keywords)
    print(f"  Minecraft: {'\"' + mc_win.title + '\"' if mc_win else 'NOT FOUND (will retry on each change)'}")
    print(f"  Click target: ({args.click_x}, {args.click_y})")
    print()
    print("Watching clipboard for changes...")
    print("Tip: run with --list-windows to see all window titles.")
    print("Press Ctrl+C to quit.\n")

    try:
        last = pyperclip.paste()
    except Exception:
        last = ""

    count = 0
    while True:
        try:
            time.sleep(POLL_INTERVAL)

            try:
                current = pyperclip.paste()
            except Exception:
                continue

            if current == last:
                continue

            last = current
            count += 1
            preview = current[:60].replace('\n', '↵')
            if len(current) > 60:
                preview += "…"
            print(f"[#{count}] Clipboard changed: \"{preview}\"")

            mc_win = find_window(mc_keywords)
            if not mc_win:
                print("  Minecraft window not found — skipping.")
                continue

            # Paste into Minecraft
            focus_and_paste(mc_win)
            print(f"  → Pasted into \"{mc_win.title}\"")

            # Click the target coordinate then restore mouse
            click_and_restore(args.click_x, args.click_y, args.delay)

        except KeyboardInterrupt:
            print("\nStopped.")
            sys.exit(0)


if __name__ == "__main__":
    main()