from plugins import procControl
from plugins import focus
from plugins import scb
import _gamebot
import _action
import sys


def startup():
    try :
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
        if (not focus.get()):
            startup = True
        procControl.solveProblems()
        botstate = scb.goReadyState()
        scb.doPrint({
            'data': botstate
        })
        if (not botstate['chat'] or not botstate['inventory']):
            scb.doPrint({'error': True})
            raise Exception('Game not ready')
        if(startup):
            _action.startup()

    except Exception as e:
        exception_type, exception_object, exception_traceback = sys.exc_info()
        scb.doPrint({
            'error': True,
            'errorMessage': str(e),
            'errorType': str(exception_type)
        })
        scb.flushPrint()
        scb.restartPC()

    scb.flushPrint()




startup()    
_gamebot.check()
_gamebot.ready()

while True:
    pass