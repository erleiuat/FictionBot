from plugins import procControl
from threading import Thread
from plugins import scb
import win32gui
import asyncio
import time
import os


state = 1

class myClassA(Thread):
    def __init__(self):
        Thread.__init__(self)
        self.daemon = True
        self.start()
    def run(self):
        while True:
            time.sleep(1)
            print(str(state))
 

class myClassB(Thread):
    def __init__(self):
        Thread.__init__(self)
        self.daemon = True
        self.start()
    def run(self):
        global state
        while True:
            time.sleep(3)
            state = state + 1

myClassA()
myClassB()
while True:
    pass