from urllib.parse import unquote
import json

class Process:

    PRC_ACTION = None
    PRC_CHAT = None
    test = None
    RES = None
    CON = None
    PAG = None

    def __init__(self, respond, control, PRC_CHAT, PRC_ACTION, pyautogui, test = False):
        self.PRC_ACTION = PRC_ACTION
        self.PRC_CHAT = PRC_CHAT
        self.PAG = pyautogui
        self.RES = respond
        self.CON = control
        self.test = test


    def message(self):
        if(not self.test):
            messages = json.loads(unquote(input()).strip())
        else:
            messages = []
            for x in range(10):
                messages.append({"scope":"global","message":str(x)})
            messages.append({"scope":"local","message":"ö"})
            messages.append({"scope":"global","message":"ä"})
            messages.append({"scope":"local","message":"ü"})
        self.RES.addInput({'input': messages})
        self.PRC_CHAT.sendMulti(messages)


    def action(self):
        if(not self.test):
            actions = json.loads(unquote(input()).strip())
        else:
            actions = []
            actions.append({"type":"mapshot","properties":"#Teleport -118302 -67347 38549"})
        self.RES.addInput({'input': actions})

        for action in actions:
            if(action['type'] == 'mapshot'):
                self.PRC_ACTION.mapshot()