from plugins import procControl
from plugins import scb
import pyautogui
import _message
import _action
import sys


scb.reg(
    failSafe = 0.04,
    resolution={
        'x': 1920,
        'y': 1080
    },
    regions={
        'scope': (515, 490, 60, 20),
        'loading': (1640, 960, 125, 45),
        'inventory': (480, 0, 955, 850),
        'chat': (30, 145, 550, 375),
        'invDrag': (935, 0, 45, 950),
        'map': (420, 0, 1080, 1080)
    }
)

startup = False
if (not procControl.focus()):
    startup = True

procControl.solveProblems()

try:
    if (not procControl.focus()):
        scb.doPrint({'error': True})
        raise Exception('Window not found')
    botstate = scb.goReadyState()
    scb.doPrint({
        'data': botstate
    })
    if (not botstate['chat'] or not botstate['inventory']):
        scb.doPrint({'error': True})
        raise Exception('Game not ready')
        
except Exception as e:
    scb.doPrint({
        'error': True,
        'errorMessage': str(e),
        'restart': True
    })
    scb.flushPrint()
    scb.restartPC()

scb.flushPrint()


if(startup):
    _action.startup()


while (True):
    try:
        cmd = input()
        scb.doPrint({'command': cmd})

        procControl.focus()
        pyautogui.click(scb.getPoint(160, 500))
        scb.safeMouse()

        if(cmd == 'MESSAGES'):
            _message.process()
        elif(cmd == 'ACTION'):
            _action.process()
        else:
            scb.doPrint({'Error': 'Command not recognized'})
    except Exception as e:
        scb.doPrint({
            'error': True,
            'errorMessage': str(e)
        })
        if (not procControl.focus()):
            procControl.solveProblems()
            scb.doPrint({'error': True})
            if (not procControl.focus()):
                scb.restartPC()
                raise Exception('Window not found')
        botstate = scb.goReadyState()
        scb.doPrint({
            'data': botstate
        })
        if (not botstate['chat'] or not botstate['inventory']):
            scb.doPrint({'error': True})
            scb.restartPC()
            raise Exception('Game not ready')

    scb.flushPrint()
    scb.safeMouse()
