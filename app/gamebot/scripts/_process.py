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
            messages.append({"scope":"local","message":"#listanimals"})
            messages.append({"scope":"global","message":"#Teleport -117159 -66722 37200"})
            messages.append({"scope":"local","message":"#Teleport -117159 -66722 37200"})
            messages.append({"scope":"local","message":"#Teleport -117159 -66722 100000"})
        self.RES.addInput({'input': messages})
        self.PRC_CHAT.sendMulti(messages)


    def action(self):
        if(not self.test):
            actions = json.loads(unquote(input()).strip())
        else:
            actions = []
            actions.append({
                "type":"sale",
                "properties":{
                    "userID": "76561198058320009",
                    "shop": [-117159, -66722, 2000, 2000],
                    'teleport': '#Teleport -117122 -66734 37070',
                    "item": {
                        'spawn_command': '#SpawnItem Egg',
                        "price": "1", 
                        "price_fame": "1", 
                        "location": "inside"
                    },
                    'messages': {
                        'notNearShop':':[Shop]: ・ @Test you need to be near the shop to buy things.',
                        'notEnoughMoney':':[Shop]: ・ @Test you need at least xyz Famepoints to buy this.',
                        'startSale':':[Shop]: ・ @Test your purchase of Bla for xyz Famepoints starts now.',
                        'endSale':':[Shop]: ・ @Test you successfully bought bla for xyz Famepoints!',
                        'somethingWrong': ':[Shop]: ・ Something went wrong. Please try again.'
                    }
                }
            })

        self.RES.addInput({'input': actions})

        for action in actions:
            if(action['type'] == 'mapshot'):
                self.PRC_ACTION.mapshot()
            if(action['type'] == 'sale'):
                self.PRC_ACTION.sale(action['properties'])
            if(action['type'] == 'travel'):
                self.PRC_ACTION.travel(action['properties'])