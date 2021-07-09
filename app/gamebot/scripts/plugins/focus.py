from ctypes.wintypes import HWND, RECT, DWORD
from pywinauto import Application
from plugins import scb
from ctypes import *
import ctypes.wintypes
import win32gui
import psutil
import ctypes



def regForegroundWindow():
    scb.reg(windowPosition=getWreckt(win32gui.GetForegroundWindow()))


def foregroundWindow():
    try:
        name = win32gui.GetWindowText(win32gui.GetForegroundWindow())
        name = name.strip().lower()
        return(name)
    except:
        pass


def get():
    if(foregroundWindow() == 'scum'):
        regForegroundWindow()
        return True
    for proc in psutil.process_iter():
        if 'SCUM.exe' in proc.name():
            app = Application().connect(process=proc.pid)
            app.top_window().set_focus()
            scb.sleep(0.5)
            regForegroundWindow()
            return True
    return False
            

def check(processName):
    try:
        for proc in psutil.process_iter():
            if (processName in proc.name().lower()):
                return True
        return False
    except:
        return False


def getWreckt(hwnd):
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
