from urllib.parse import unquote
from plugins import scb
import json

def process():

    msgs = json.loads(unquote(input()))
    scb.doPrint({'messages': msgs})

    for msg in msgs:
        if(msg['scope'].lower() == 'global'):
            scb.goScope('global')
            scb.sendMessage(msg['message'], faster=True)
        elif(msg['scope'].lower() == 'local'):
            scb.goScope('local')
            scb.sendMessage(msg['message'], faster=True)
        else:
            scb.doPrint({
                'error': True,
                'errorMessage': 'Invalid message scope'
            })
