from urllib.parse import unquote
from plugins import control
from plugins import scb
import pyautogui
import json


def startup():
    scb.sendMessage('#SetFakeName ・ :[FiBo]')
    scb.goScope('global')
    scb.sendMessage('I\'m getting prepared...')
    scb.sendMessage('#ListZombies')
    scb.sendMessage('#ShowOtherPlayerInfo true')
    repair([
        '#Teleport -117564.797 -67794.680 36809.430',
        '#Teleport -107551.336 -67783.750 36857.059'
    ])
    scb.sendMessage('#Teleport -117331 -66059 37065')
    control.takeA('shit')
    control.takeA('shit')
    control.takeA('piss')
    scb.sendMessage('#Teleport -116369 -65906 37144')
    control.sitDown()
    scb.goScope('global')
    scb.sendMessage('I\'m ready!')
    eat()


def process():

    actions = json.loads(unquote(input()))
    scb.doPrint({'actions': actions})

    for action in actions:
        actType = action['type'].lower()
        if(actType == 'repair'):
            repair(action['properties'])
        elif(actType == 'light'):
            light(action['properties'])
        elif(actType == 'shit'):
            control.takeA('shit')
        elif(actType == 'piss'):
            control.takeA('piss')
        elif(actType == 'eat'):
            eat()
        elif(actType == 'idle'):
            control.sitDown()
        elif(actType == 'dress'):
            dress()
        elif(actType == 'mapshot'):
            control.mapshot()
        elif(actType == 'restart'):
            scb.restart()
        elif(actType == 'travel'):
            travel(action['properties'])
        elif(actType == 'awake'):
            botstate = scb.goReadyState()
            scb.doPrint({
                'data': botstate
            })
            if (not botstate['chat'] or not botstate['inventory']):
                scb.doPrint({'error': True})
                raise Exception('Game not ready')
                
        else:
            scb.doPrint({
                'error': True,
                'errorMessage': 'Unknown action'
            })




def travel(props):
    scb.sendMessage('#ListPlayers')
    listPlayers = scb.readMessage().split('\r\n')
    listPlayers.remove(listPlayers[0])

    playerList = []
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
            elif(len(el) > 1):
                i = i + 1
                if(i == 1):
                    player['steamName'] = el.strip()
                elif(i == 2):
                    player['charName'] = el.strip()
                elif(i == 3):
                    player['fame'] = el.strip()
        playerList.append(player)

    user = False
    for u in playerList:
        if(u['steamID'] == props['steamID']):
            if(not isinstance(u['fame'], int)):
                u['fame'] = int(u['fame'])
            user = u
            break

    scb.doPrint({'userInfo': user})

    if(not user):
        scb.sendMessage(props['message']['smthWrong'])
        return False

    if(user['fame'] < props['costs']):
        scb.sendMessage(props['message']['notEnough'])
        return False

    scb.sendMessage('#Location '+user['steamID'])
    p = scb.readMessage()
    playerLoc = (p[(p.find(':')+1):]).strip().split()

    nearStation = False
    for station in props['stations']:
        if(float(playerLoc[0][2:]) > (station[0] - station[2]) and float(playerLoc[0][2:]) < (station[0] + station[2])):
            if(float(playerLoc[1][2:]) > (station[1] - station[3]) and float(playerLoc[1][2:]) < (station[1] + station[3])):
                nearStation = True
    
    if(nearStation):
        scb.goScope('global')
        scb.sendMessage(props['message']['good'])
        scb.sendMessage('#SetFamePoints ' + str(user['fame'] - props['costs']) + ' ' + user['steamID'])
        scb.sendMessage(props['target'] + ' ' + user['steamID'])
    else:
        scb.sendMessage(props['message']['noStation'])
        return False

    return True
    




def repair(teleports):
    currentPosition = scb.getPosition()

    for teleport in teleports:
        scb.sendMessage(teleport)
        scb.sendMessage('#SpawnItem Tool_Box 3')
        for x in range(3):
            control.actF('img/act/repair.png', duration=4)

    scb.sendMessage(
        '#Teleport '+currentPosition['x']+' '+currentPosition['y']+' '+currentPosition['z'])


def light(teleports):
    currentPosition = scb.getPosition()

    scb.sendMessage('#SpawnItem Lighter 2')
    control.act([
        ('img/light/lighter.png', 'img/light/aufnehmen.png', 0.03), 
        ('img/light/lighter.png', 'img/light/aufnehmen.png', 0.03)
    ])

    for teleport in teleports:
        scb.sendMessage(teleport)
        scb.sendMessage('#SpawnItem Wooden_Plank 1')
        control.act([
            ('img/light/fackel.png', 'img/light/schueren.png', 1.9),
            ('img/light/fackel.png', 'img/light/anzuenden.png', 1.5),
            ('img/light/fackel.png', 'img/light/instand.png', 0.01)
        ])

    scb.sendMessage(
        '#Teleport '+currentPosition['x']+' '+currentPosition['y']+' '+currentPosition['z'])


def dress():

    items = [
        'Tights_01_02',
        'Tactical_Gloves_03',
        'Sneakers_02_04',
        'Halloween_Mask_Plague',
        'Ghillie_Suit_Jacket_Winter',
        'Beenie_3_hole_06',
        'Bulletproof_Vest_04'
    ]

    posi = scb.getPosition()
    scb.sendMessage('#Teleport '+posi['x']+' '+posi['y']+' 110000')
    pyautogui.press('esc')
    for x in range(12):
        scb.safeClick(scb.getPoint(435, 110), double=True)
    pyautogui.press('t')
    scb.sendMessage('#Teleport '+posi['x']+' '+posi['y']+' '+posi['z'])

    itemsList = []
    for item in items:
        scb.sendMessage('#SpawnItem ' + item)
        itemsList.append(('img/dress/'+item+'.png', 'img/dress/ausruesten.png', 0.6))

    control.act(itemsList)


def eat():
    scb.sendMessage('#SpawnItem Ganoderma_Lucidum')
    scb.sleep(0.05)
    control.act([
        ('img/act/mushroom.png', 'img/act/eatAll.png', 0.005)
    ])
