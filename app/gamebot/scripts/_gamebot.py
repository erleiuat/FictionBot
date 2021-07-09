from urllib.parse import unquote
from plugins import procControl
from threading import Thread
from plugins import focus
from plugins import scb
import pyautogui
import _message
import _action
import sys

busyWork = True
busyCheck = False

class check(Thread):
    def __init__(self):
        Thread.__init__(self)
        self.daemon = True
        self.start()
    def run(self):
        global busyWork
        global busyCheck
        while True:
            busyCheck = False
            scb.sleep(10)
            if(busyWork):
                scb.sleep(1)
                continue
            else:
                busyCheck = True
                if(not focus.get()):
                    procControl.solveProblems()
                pyautogui.click(scb.getPoint(160, 500))
                scb.safeMouse()
                if(busyWork):
                    continue
                procControl.solveProblems()
                



class ready(Thread):
    def __init__(self):
        Thread.__init__(self)
        self.daemon = True
        self.start()
    def run(self):
        global busyWork
        global busyCheck
        while (True):
            try:
                busyWork = False
                cmd = unquote(input())
                busyWork = True
                while (busyCheck):
                    scb.sleep(0.0001)
                scb.doPrint({'command': cmd})
                if(cmd == 'MESSAGES'):
                    _message.process()
                elif(cmd == 'ACTION'):
                    _action.process()
                else:
                    scb.doPrint({'Error': 'Command not recognized'})

            except Exception as e:
                exception_type, exception_object, exception_traceback = sys.exc_info()
                scb.doPrint({
                    'error': True,
                    'errorMessage': str(e),
                    'errorType': str(exception_type)
                })
                if (not focus.get()):
                    procControl.solveProblems()
                    scb.doPrint({'error': True})
                    if (not focus.get()):
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
