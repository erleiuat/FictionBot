from plugins import focus
from plugins import scb
import webbrowser
import pyautogui


def getState():
    parts = {
        'gameRunning': False,
        'steamRunning': False,
        'onServer': False
    }

    if(focus.check('steam')):
        parts['steamRunning'] = True
    if(focus.check('scum')):
        parts['gameRunning'] = True
    else:
        return parts

    parts['onServer'] = True
    if(scb.onScreen('img/scb/inventar.png', region=scb.getRegion('inventory'))):
        if(scb.onScreen('img/chat/stumm.png', region=scb.getRegion('chat'))):
            return parts
    i = 0
    while(not scb.onScreen('img/scb/fortsetzen.png', bw=True, sure=0.8, region=scb.getRegion('inventory'))):
        pyautogui.press('esc')
        scb.sleep(0.5)
        i = i + 1
        if(i > 10):
            parts['onServer'] = False
            break

    if(parts['onServer']):
        pyautogui.press('esc')
        scb.openTab()
        pyautogui.press('t')

    return parts


def startGame():
    webbrowser.open('steam://rungameid/513710')
    scb.sleep(30)

    i = 0
    while(not focus.get()):
        scb.sleep(5)
        i = i + 1
        if(i >= 25):
            scb.restartPC()

    i = 0
    while(not scb.onScreen('img/scb/mehrspieler.png', bw=True, sure=0.8)):
        scb.sleep(5)
        i = i + 1
        if(i >= 25):
            scb.restartPC()

    scb.sleep(1)
    joinServer()


def joinServer():
    scb.sleep()
    scb.safeMouse()
    goFortsetzen()

    i = 0
    while(not scb.onScreen('img/scb/fortsetzen.png', bw=True, sure=0.8, region=scb.getRegion('inventory'))):
        scb.sleep(0.1)
        pyautogui.press('esc')
        scb.sleep(1)
        if(scb.onScreen('img/scb/mehrspieler.png', bw=True, sure=0.8)):
            goFortsetzen()
        i = i + 1
        if(i > 90):
            scb.restartPC()
            raise Exception('Unable to join')
    pyautogui.press('esc')
    scb.sleep(20)

    i = 0
    while(not scb.openTab()):
        scb.sleep(0.2)
        pyautogui.press('esc')
        scb.sleep(0.8)
        i = i + 1
        if(i > 60):
            scb.restartPC()
            raise Exception('Unable to open tab')

    getReady()
    scb.sleep()
    pyautogui.press('t')


def getReady():
    scb.sleep(1)
    ist = scb.onScreen('img/scb/invDrag.png', region=scb.getRegion('invDrag'))
    soll = scb.getPoint(955, 855)
    scb.sleep(1)
    while(ist.y < (soll[1] - 50) or ist.y > (soll[1] + 50)):
        scb.safeMoveTo(ist)
        scb.sleep(0.5)
        pyautogui.mouseDown()
        scb.sleep(0.5)
        scb.safeMoveTo(soll, duration=0.5)
        scb.sleep(0.5)
        pyautogui.mouseUp()
        pyautogui.mouseUp()
        pyautogui.mouseUp()
        scb.sleep(0.5)
        pyautogui.mouseUp()
        ist = scb.onScreen('img/scb/invDrag.png', region=scb.getRegion('invDrag'))
    scb.safeMouse()
    return True


def goFortsetzen():
    needOK = scb.onScreen('img/scb/ok.png', bw=True)
    if(needOK):
        scb.safeClick(needOK)
        scb.sleep(1)

    scb.sleep(3)
    if(scb.onScreen('img/scb/mehrspieler.png', bw=True, sure=0.8)):
        scb.safeClick(scb.getPoint(230, 645))
        scb.sleep(0.05)
        scb.safeMouse()
        scb.sleep(1)


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
        
    scb.goScope('local')
    scb.goScope('global')
    return focus.get()
