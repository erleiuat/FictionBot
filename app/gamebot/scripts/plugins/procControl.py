from plugins import windowRect
from plugins import scb
import webbrowser
import pyautogui
import win32gui
import win32con
import psutil


def focus(window_name='scum'):
    if(window_name.lower() in win32gui.GetWindowText(win32gui.GetForegroundWindow()).lower()):
        return True

    def window_dict_handler(hwnd, top_windows):
        top_windows[hwnd] = win32gui.GetWindowText(hwnd)

    try:
        tw, expt = {}, True
        win32gui.EnumWindows(window_dict_handler, tw)
        for handle in tw:
            if (window_name.lower() in tw[handle].lower()):
                win32gui.ShowWindow(handle, win32con.SW_NORMAL)
                win32gui.BringWindowToTop(handle)
                win32gui.SetForegroundWindow(handle)
                scb.sleep(0.5)
                scb.reg(windowPosition=windowRect.get(handle))
                scb.sleep()
                return True
        return False
    except:
        return False


def processRunning(processName):
    for proc in psutil.process_iter():
        try:
            if (processName.lower() in proc.name().lower()):
                return psutil.Process(pid=proc.pid)
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass
    return False


def getState():
    parts = {
        'gameRunning': False,
        'steamRunning': False,
        'onServer': False
    }

    if(processRunning('steam')):
        parts['steamRunning'] = True

    if(processRunning('scum')):
        parts['gameRunning'] = True
    else:
        return parts

    parts['onServer'] = True

    i = 0
    while(not scb.onScreen('img/scb/fortsetzen.png', bw=True, sure=0.8, region=scb.getRegion('inventory'))):
        pyautogui.press('esc')
        scb.sleep(1)
        i = i + 1
        if(i > 10):
            parts['onServer'] = False
            break

    if(parts['onServer']):
        pyautogui.press('esc')
        scb.openTab()
        pyautogui.press('t')

    return parts


def getReady():
    ist = scb.onScreen('img/scb/invDrag.png', region=scb.getRegion('invDrag'))
    soll = scb.getPoint(955, 855)
    scb.sleep()
    while(ist.y < (soll[1] - 50) or ist.y > (soll[1] + 50)):
        pyautogui.moveTo(ist)
        scb.sleep()
        pyautogui.mouseDown()
        scb.sleep()
        pyautogui.moveTo(soll, duration=0.5)
        scb.sleep()
        pyautogui.mouseUp()
        scb.sleep()
        ist = scb.onScreen('img/scb/invDrag.png', region=scb.getRegion('invDrag'))
    scb.safeMouse()
    return True


def joinServer():
    scb.sleep()
    needOK = scb.onScreen('img/scb/ok.png', bw=True)
    if(needOK):
        scb.safeClick(needOK)
        scb.sleep(1)

    i = 0
    scb.sleep()
    while(scb.onScreen('img/scb/main_fortsetzen.png', bw=True, sure=0.8)):
        scb.safeClick(scb.getPoint(230, 645))
        scb.sleep(1)

    while(not scb.onScreen('img/scb/fortsetzen.png', bw=True, region=scb.getRegion('inventory'))):
        scb.sleep(1)
        pyautogui.press('esc')
        scb.sleep(1)
        i = i + 1
        if(i > 90):
            raise Exception('Unable to join')

    pyautogui.press('esc')
    scb.sleep(20)
    while(not scb.openTab()):
        scb.sleep(1)
        i = i + 1
        if(i > 120):
            raise Exception('Unable to open tab')

    getReady()
    scb.sleep()
    pyautogui.press('t')


def startGame():
    webbrowser.open('steam://rungameid/513710')
    scb.sleep(30)
    while(not focus('scum')):
        scb.sleep(1)
    while(not scb.onScreen('img/scb/main_fortsetzen.png', bw=True, sure=0.8)):
        scb.sleep(1)
    scb.sleep(1)
    joinServer()


def solveProblems():
    parts = getState()
    if(not parts['onServer']):
        if(not parts['gameRunning']):
            if(not parts['steamRunning']):
                startGame()
            else:
                scb.restartPC()
        else:
            joinServer()
    else:
        getReady()
        
    return focus()
