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
    #subprocess.call([fullBatPath + '\\restart.bat'])
    raise Exception('I WOULD RESTART NOW')


def sleep(duration=0.4):
    time.sleep(duration + props['failSafe'])


def safeMouse():
    pyautogui.moveTo(props['windowPosition']['x'] + 1650,
                     props['windowPosition']['y'] + 640)


def safeClick(coords, double=False, button='left'):
    pyautogui.moveTo(coords)
    pyautogui.move(-5, -2, duration=0.001)
    pyautogui.move(10, 0, duration=0.001)
    pyautogui.move(0, 4, duration=0.001)
    pyautogui.move(-10, 0, duration=0.001)
    pyautogui.move(0, -4, duration=0.001)
    pyautogui.move(5, 2, duration=0.001)
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
    p = readMessage()['message'].split()
    return {
        'x': p[0][2:],
        'y': p[1][2:],
        'z': p[2][2:]
    }


def openTab():
    i = 0
    while(not onScreen('img/scb/inventar.png', bw=True, region=getRegion('inventory'))):
        pyautogui.keyDown('tab')
        sleep(0.01)
        pyautogui.keyUp('tab')
        pyautogui.keyUp('tab')
        pyautogui.keyUp('tab')
        pyautogui.keyUp('tab')
        pyautogui.keyUp('tab')
        sleep(0.05)
        pyautogui.press('1')
        sleep(0.5)
        i = i + 1
        if(i > 5):
            return False
    return True


def isTeleport():
    loading()
    openTab()
    pyautogui.press('t')

def sendMessage(msg):
    pyautogui.hotkey('ctrl','a')
    pyautogui.press('backspace')
    keyboard.write(msg)
    pyautogui.press('enter')
    sleep(0.5 - (props['failSafe']*4))
    if(msg.lower().startswith('#teleport')):
        isTeleport()
        


def readMessage():
    chatPos = onScreen('img/chat/stumm.png', region=getRegion('chat'))
    safeClick((chatPos.x, (chatPos.y - 20)))
    pyautogui.hotkey('ctrl','a')
    pyautogui.hotkey('ctrl', 'c')
    safeClick(((chatPos.x + 100), chatPos.y))
    win32clipboard.OpenClipboard()
    data = win32clipboard.GetClipboardData()
    win32clipboard.CloseClipboard()
    user = (data[0:(data.find(':'))]).strip()
    message = (data[(data.find(':')+1):]).strip()
    return {
        'user': user, 
        'message': message
    }


def onScreen(img, bw=False, sure=0.98, region=False):
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


