import ctypes
import ctypes.wintypes
from ctypes.wintypes import HWND, RECT, DWORD
from ctypes import *


def get(hwnd):
    try:
        f = ctypes.windll.dwmapi.DwmGetWindowAttribute
    except WindowsError:
        f = None
    if f:
        rect = ctypes.wintypes.RECT()
        DWMWA_EXTENDED_FRAME_BOUNDS = 9
        f(ctypes.wintypes.HWND(hwnd),
          ctypes.wintypes.DWORD(DWMWA_EXTENDED_FRAME_BOUNDS),
          ctypes.byref(rect),
          ctypes.sizeof(rect)
          )
        x = rect.left
        y = rect.top
        w = rect.right - x
        h = rect.bottom - y
        return {
            'x': x,
            'y': y,
            'w': w,
            'h': h
        }
