from plugins import scb
from datetime import datetime
from pathlib import Path
import pyautogui


def getListPlayers():
    playerList = []
    listPlayers = scb.sendMessage('#ListPlayers', read=True).split('\r\n')
    listPlayers.remove(listPlayers[0])

    for pTmp in listPlayers:
        player = {}
        pTmp = pTmp[4:]
        player['steamID'] = pTmp[:17]
        pTmp = pTmp[17:].strip()
        pTmp = pTmp.split('    ')
        
        i = 0
        for el in pTmp:
            if(i > 2):
                continue
            elif(len(el) >= 1):
                i = i + 1
                if(i == 1):
                    player['steamName'] = el.strip()
                elif(i == 2):
                    player['charName'] = el.strip()
                elif(i == 3):
                    player['fame'] = el.strip()
                    if(not isinstance(player['fame'], int)):
                        player['fame'] = int(player['fame'])
                    break

        playerList.append(player)
        
    return playerList


def mapshot():
    pyautogui.press('esc')
    scb.sleep(0.05)
    pyautogui.press('m')
    pyautogui.keyDown('subtract')
    scb.sleep(0.1)
    pyautogui.keyUp('subtract')
    now = datetime.now()
    folderName = now.strftime('%Y_%m_%d')
    fileName = now.strftime('%Y_%m_%d.%H_%M_%S')+'.png'
    Path('./app/storage/maps/'+folderName).mkdir(parents=True, exist_ok=True)
    fullPath = './app/storage/maps/'+folderName+'/'+fileName
    pyautogui.screenshot(fullPath,region=scb.getRegion('map'))
    scb.sleep(2)
    pyautogui.keyDown('subtract')
    scb.sleep(0.1)
    pyautogui.keyUp('subtract')
    scb.sleep(0.1)
    scb.openTab()
    pyautogui.press('t')
    scb.doPrint({'data': {
        'fileName': fileName,
        'fullPath': fullPath
    }})


def takeA(action):
    pyautogui.press('esc')
    scb.sleep(0.05)
    pyautogui.press('esc')
    scb.sleep(0.4)
    pyautogui.keyDown('tab')
    scb.sleep(0.8)
    scb.safeClick(scb.getPoint(1070, 475))
    if(action == 'shit'):
        scb.safeClick(scb.getPoint(1140, 435))
        scb.sleep()
        pyautogui.keyUp('tab')
        scb.sleep(35)
    elif(action == 'piss'):
        scb.safeClick(scb.getPoint(1065, 360))
        scb.sleep()
        pyautogui.keyUp('tab')
        scb.sleep(15)
    else:
        pyautogui.keyUp('tab')
    scb.sleep(0.4)
    scb.openTab()
    pyautogui.press('t')


def sitDown():
    pyautogui.press('esc')
    scb.sleep(0.05)
    pyautogui.press('esc')
    scb.sleep(0.05)
    pyautogui.keyDown('tab')
    scb.sleep(0.8)
    scb.safeClick(scb.getPoint(850, 600))
    scb.safeClick(scb.getPoint(1065, 360))
    scb.sleep(0.05)
    pyautogui.keyUp('tab')
    scb.openTab()
    scb.sleep(0.4)
    pyautogui.press('t')


def act(acts):
    pyautogui.press('esc')
    scb.sleep(0.2)
    for act in acts:
        scb.safeMouse()
        scb.sleep(0.4)
        itemLoc = scb.onScreen(act[0], sure=0.75, bw=True, region=scb.getRegion('inventory'))
        if(itemLoc):
            scb.safeClick(itemLoc, button='right')
            scb.sleep(0.3)
            actionLoc = scb.onScreen(act[1], sure=0.75, bw=True, region=scb.getRegion('inventory'))
            if(actionLoc):
                scb.safeClick(actionLoc)
                scb.safeMouse()
                scb.sleep(act[2])
            else:
                scb.safeMouse()
                pyautogui.press('esc')
    
    scb.sleep(0.4)
    pyautogui.press('t')


def actF(action, duration=1):
    pyautogui.press('esc')
    scb.sleep(0.05)
    pyautogui.press('esc')
    scb.sleep(0.4)
    pyautogui.keyDown('f')
    scb.sleep(1)
    actionLoc = scb.onScreen(action, sure=0.8, bw=True,region=scb.getRegion('inventory'))
    if (actionLoc):
        scb.safeClick(actionLoc)
        scb.sleep()
        pyautogui.keyUp('f')
        scb.sleep(duration)
    pyautogui.keyUp('f')
    scb.sleep(0.4)
    scb.openTab()
    scb.sleep(0.05)
    pyautogui.press('t')
