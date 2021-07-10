from datetime import datetime
from pathlib import Path
import time


class Action:

    PRC_CHAT = None
    RES = None
    CON = None
    SCB = None
    PAG = None

    currentScope = None
    clean = False


    def __init__(self, RES, CON, SCB, PRC_CHAT, PAG):
        self.RES = RES
        self.CON = CON
        self.SCB = SCB
        self.PAG = PAG
        self.PRC_CHAT = PRC_CHAT


    def mapshot(self):
        self.PAG.press('esc')
        now = datetime.now()
        folderName = now.strftime('%Y_%m_%d')
        fileName = now.strftime('%Y_%m_%d.%H_%M_%S')+'.png'
        fullPath = './app/storage/maps/'+folderName+'/'+fileName
        self.PAG.screenshot(fullPath, region=self.CON.getRegion('map'))
        Path('./app/storage/maps/'+folderName).mkdir(parents=True, exist_ok=True)
        time.sleep(0.05)
        self.PAG.press('t')
        self.CON.openAll()
        self.RES.add({'fileName': fileName, 'fullPath': fullPath})
        