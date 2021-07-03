from plugins import control
from plugins import scb
import pyautogui
import json


def startup():
    scb.sendMessage('#SetFakeName [SF-BOT]')
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

    actions = json.loads(input())
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
            ('img/light/fackel.png', 'img/light/schueren.png', 2),
            ('img/light/fackel.png', 'img/light/anzuenden.png', 1.6),
            ('img/light/fackel.png', 'img/light/instand.png', 0.1)
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
    control.act([
        ('img/act/mushroom.png', 'img/act/eatAll.png', 0.005)
    ])
