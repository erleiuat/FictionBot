import win32clipboard
import subprocess
import pyautogui
import keyboard
import time
import json
import sys
import os


fullBatPath = os.path.dirname(os.path.realpath(__file__))
path = './app/gamebot/scripts/'
currentScope = ''
props = {
    'resolution': None,
    'regions': None,
    'windowPosition': None,
    'failSafe': 0
}
printCache = {
    'error': False
}


def doPrint(text):
    global printCache
    printCache.update(text)


def flushPrint():
    global printCache
    print(json.dumps(printCache))
    sys.stdout.flush()
    printCache = {
        'error': False
    }


def reg(resolution=False, regions=False, windowPosition=False, failSafe=False):
    global props
    if(failSafe):
        props['failSafe'] = failSafe
        pyautogui.PAUSE = failSafe
    if(resolution):
        props['resolution'] = resolution
    if(regions):
        props['regions'] = regions
    if(windowPosition):
        offset_y = windowPosition['h'] - props['resolution']['y']
        props['windowPosition'] = {
            'x': windowPosition['x'],
            'y': windowPosition['y'] + offset_y
        }


def getPoint(*coords):
    winPos = props['windowPosition']
    posX = coords[0]+winPos['x'] - 2
    posY = coords[1]+winPos['y'] - 2
    if(posX < 0):
        posX = 0
    if(posY < 0):
        posY = 0
    return (
        posX,
        posY
    )


def getRegion(name):
    reg = props['regions'][name]
    winPos = props['windowPosition']
    posX = reg[0]+winPos['x'] - 2
    posY = reg[1]+winPos['y'] - 2
    w = reg[2] + 4
    h = reg[3] + 4
    if(posX < 0):
        posX = 0
        w = reg[2]
    if(posY < 0):
        posY = 0
        h = reg[3]

    return (
        posX,
        posY,
        w,
        h
    )


def restartPC():
    #subprocess.call('shutdown /r /t 2')
    raise Exception('I WOULD RESTART NOW')


def sleep(duration=0.4):
    time.sleep(duration + props['failSafe'])


def safeMouse():
    pyautogui.moveTo(props['windowPosition']['x'] + 1650,
                     props['windowPosition']['y'] + 640)


def safeMoveTo(coords, duration=0.001):
    pyautogui.moveTo(coords, duration=duration)
    pyautogui.move(-5, -2, duration=0.0005)
    pyautogui.move(10, 0, duration=0.0005)
    pyautogui.move(0, 4, duration=0.0005)
    pyautogui.move(-10, 0, duration=0.0005)
    pyautogui.move(0, -4, duration=0.0005)
    pyautogui.move(5, 2, duration=0.0005)


def safeClick(coords, double=False, button='left'):
    safeMoveTo(coords)
    pyautogui.click(button=button)
    if(double):
        pyautogui.click(button=button)


def goScope(scopeName):
    global currentScope
    if(currentScope == scopeName):
        return True
    isThere = onScreen(
        'img/chat/'+scopeName+'.png',
        region=getRegion('scope')
    )
    i = 0
    while(not isThere):
        i = i + 1
        pyautogui.press('tab')
        sleep(0.1)
        isThere = onScreen(
            'img/chat/'+scopeName+'.png',
            region=getRegion('scope')
        )
        if(i>10):
            raise Exception('Could not change scope')
    currentScope = scopeName


def loading():
    sleep(1)
    while(onScreen('img/scb/laden.png', region=getRegion('loading'))):
        sleep(0.01)


def getPosition():
    sendMessage('#Location')
    location = readMessage()
    p = (location[(location.find(':')+1):]).strip().split()
    return {
        'x': p[0][2:],
        'y': p[1][2:],
        'z': p[2][2:]
    }


def openTab():
    i = 0
    while(not onScreen('img/scb/inventar.png', bw=True, region=getRegion('inventory'))):
        sleep(0.04)
        pyautogui.keyDown('tab')
        sleep(0.01)
        pyautogui.keyUp('tab')
        pyautogui.keyUp('tab')
        pyautogui.keyUp('tab')
        pyautogui.keyUp('tab')
        pyautogui.keyUp('tab')
        sleep(0.05)
        pyautogui.press('1')
        sleep(0.1)
        i = i + 1
        if(i > 5):
            return False
    return True


def isTeleport():
    loading()
    if(not openTab()):
        raise Exception('Unable to open tab')
    pyautogui.press('t')

def sendMessage(msg, read=False):
    pyautogui.hotkey('ctrl','a')
    pyautogui.press('backspace')
    sleep(0.5 - (props['failSafe']*4))
    keyboard.write(msg.encode('utf-8').decode('utf-8'))
    pyautogui.press('enter')
    if(msg.lower().startswith('#teleport')):
        isTeleport()
    if(read):
        return readMessage()
        

def readMessage():
    safeClick(getPoint(85, 470))
    pyautogui.hotkey('ctrl','a')
    pyautogui.hotkey('ctrl', 'c')
    safeClick(getPoint(140, 500))
    win32clipboard.OpenClipboard()
    data = win32clipboard.GetClipboardData()
    win32clipboard.CloseClipboard()
    return data


def onScreen(img, bw=False, sure=0.96, region=False):
    global path
    if(not region):
        region = (props['windowPosition']['x'], props['windowPosition']['y'], 1440, 900)
    isThere = pyautogui.locateCenterOnScreen(
        path + img,
        grayscale=bw,
        confidence=sure,
        region=region
    )
    if(isThere):
        return isThere
    else:
        return False


def isReady():
    parts = {
        'chat': False,
        'inventory': False
    }
    if(onScreen('img/scb/inventar.png', region=getRegion('inventory'))):
        parts['inventory'] = True
    if(onScreen('img/chat/stumm.png', region=getRegion('chat'))):
        parts['chat'] = True
    return parts


def goReadyState(repeat=0):
    safeMouse()
    parts = isReady()
    if (parts['chat'] and parts['inventory']):
        sendMessage('#SetFakeName ・ :[FiBo]')
        sendMessage('#ListZombies')
        sendMessage('#SetHairLength 0')
        sendMessage('#SetFacialHairLength 0')
        sendMessage('#ShowOtherPlayerInfo true')
        return parts
    else:
        pyautogui.press('esc')
        openTab()
        pyautogui.press('t')
        if(repeat < 2):
            return goReadyState(repeat+1)
        else:
            return parts


def regWindowPos(pos):
    return True


