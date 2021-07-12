from datetime import datetime
from pathlib import Path
import time
import sys


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


    def getPlayerList(self):
        playerList = {}
        pList = self.PRC_CHAT.send("#ListPlayers", read=True)
        pList = pList.split('\n')
        pList.pop(0)
        for el in pList:
            elP = el.split('              ')
            uid = elP[0][3:].strip()
            playerList[uid] = {
                'userID': uid,
                'steamName': elP[1].strip(),
                'charName': elP[2].strip(),
                'fame': elP[3].strip()
            }
        return playerList


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


    def travel(self, props):
        playerList = self.getPlayerList()

        user = playerList[props['steamID']]

        self.RES.add({'userInfo': user})
        self.PRC_CHAT.goScope('local')
        
        if(not user):
            self.PRC_CHAT.send(props['messages']['smthWrong'])
            return False

        if(int(user['fame']) < int(props['costs'])):
            self.PRC_CHAT.send(props['messages']['notEnough'])
            return False

        p = self.PRC_CHAT.send('#Location '+props['steamID'], read=True)
        playerLoc = (p[(p.find(':')+1):]).strip().split()

        nearStation = False
        for station in props['stations']:
            if(float(playerLoc[0][2:]) > (station[0] - station[2]) and float(playerLoc[0][2:]) < (station[0] + station[2])):
                if(float(playerLoc[1][2:]) > (station[1] - station[3]) and float(playerLoc[1][2:]) < (station[1] + station[3])):
                    nearStation = True
        
        if(nearStation):
            self.PRC_CHAT.send(props['messages']['good'])
            self.PRC_CHAT.send('#SetFamePoints ' + str(user['fame'] - props['costs']) + ' ' + props['steamID'])
            self.PRC_CHAT.send(props['target'] + ' ' + props['steamID'])
        else:
            self.PRC_CHAT.send(props['messages']['noStation'])
            return False

        return True
        

    def sale(self, props):
        try:
            self.PRC_CHAT.goScope('local')
            self.PRC_CHAT.send(props['messages']['startSale'])
            p = self.PRC_CHAT.send('#Location '+props['userID'], read=True)
            playerLoc = (p[(p.find(':')+1):]).strip().split()
            nearShop = False
            if(float(playerLoc[0][2:]) > (props['shop'][0] - props['shop'][2]) and float(playerLoc[0][2:]) < (props['shop'][0] + props['shop'][2])):
                if(float(playerLoc[1][2:]) > (props['shop'][1] - props['shop'][3]) and float(playerLoc[1][2:]) < (props['shop'][1] + props['shop'][3])):
                    nearShop = True

            if(not nearShop):
                self.PRC_CHAT.goScope('global')
                self.PRC_CHAT.send(props['messages']['notNearShop'])
                return

            playerList = self.getPlayerList()
            player = playerList[props['userID']]
            
            if(int(player['fame']) < int(props['item']['price_fame'])):
                self.PRC_CHAT.goScope('local')
                self.PRC_CHAT.send(props['messages']['notEnoughMoney'])
                return

            famePointSetter = '#SetFamePoints '+ str(int(player['fame']) - int(props['item']['price_fame'])) + ' ' + props['userID']
            itemSpawner = props['item']['spawn_command']
            self.PRC_CHAT.goScope('local')
            self.PRC_CHAT.send(props['teleport'])
            self.PRC_CHAT.send('#TeleportToMe ' + props['userID'])
            self.PRC_CHAT.send(famePointSetter)
            self.PRC_CHAT.send(itemSpawner)
            self.PRC_CHAT.send(props['messages']['endSale'])

        except Exception as e:
            exception_type, exception_object, exception_traceback = sys.exc_info()
            self.PRC_CHAT.send(props['messages']['somethingWrong'])
            self.RES.addError(str(e), str(exception_type))
            self.RES.send()
            
        