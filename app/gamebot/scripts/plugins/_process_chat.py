import win32clipboard
import win32con
import time


class Chat:

    RES = None
    CON = None
    SCB = None
    PAG = None

    currentScope = None
    clean = False

    def __init__(self, RES, CON, SCB, PAG):
        self.RES = RES
        self.CON = CON
        self.SCB = SCB
        self.PAG = PAG
        

    def goScope(self, scope, force = False):
        if(not force and self.currentScope == scope):
            return True
        self.PAG.doubleClick(self.CON.getPoint(140, 500))
        scopeImg = 'chat_local.png'
        if(scope == 'global'):
            scopeImg = 'chat_global.png'
        self.RES.printer(scope)
        i = 0
        while(not self.CON.onScreen('img/' + scopeImg, region='chatScope')):
            self.PAG.press('tab')
            time.sleep(0.1)
            i = i + 1
            if(i > 10):
                raise Exception('Could not change scope')
        self.currentScope = scope


    def copyToClip(self, txt):
        win32clipboard.OpenClipboard()
        win32clipboard.EmptyClipboard()
        win32clipboard.SetClipboardText(txt, win32con.CF_UNICODETEXT)
        win32clipboard.CloseClipboard()


    def readFromClip(self):
        win32clipboard.OpenClipboard()
        data = win32clipboard.GetClipboardData()
        win32clipboard.CloseClipboard()
        return data


    def doClean(self):
        self.SCB.safeClick(self.CON.getPoint(140, 500), double=True)
        self.PAG.hotkey('ctrl','a')
        self.PAG.press('backspace')
        win32clipboard.OpenClipboard()
        win32clipboard.EmptyClipboard()
        win32clipboard.CloseClipboard()
        self.clean = True


    def read(self):
        self.PAG.doubleClick(self.CON.getPoint(140, 470))
        self.PAG.hotkey('ctrl','a')
        self.PAG.hotkey('ctrl', 'c')
        self.PAG.doubleClick(self.CON.getPoint(140, 500))
        return self.readFromClip().strip()


    def teleport(self, prevL):
        while(prevL == self.roundXYZ(self.send('#Location', read = True))):
            time.sleep(0.00001)


    def roundXYZ(self, tpCom):
        nStr = ''
        parts = (tpCom.split(' ', 1)[1].replace('X=','').replace('Y=','').replace('Z=','')).split(' ')
        for x in parts:
            nStr = nStr + ' ' + str(round(float(x)))
        return nStr.strip()


    def send(self, message, read = False):
        data = True
        teleport = False
        if(message.lower().startswith('#teleport ')):
            teleport = self.roundXYZ(self.send('#Location', read = True))
            if(self.roundXYZ(message) == teleport):
                return data
        if(message.lower().startswith('#teleportto ')):
            teleport = self.roundXYZ(self.send('#Location', read = True))
        self.RES.printer('SENDING MSG -> ' + message)
        self.copyToClip(message)
        self.PAG.hotkey('ctrl','v')
        self.clean = False
        self.PAG.press('enter')
        self.clean = True
        if(read):
            data = self.read()
        elif(teleport):
            self.teleport(teleport)
        time.sleep(0.15)
        return data
        self.RES.printer('SENDING MSG DONE')


    def sendMulti(self, messages):
        self.PAG.doubleClick(self.CON.getPoint(140, 500))
        for message in messages:
            self.goScope(str(message['scope']))
            self.send(str(message['message']))
