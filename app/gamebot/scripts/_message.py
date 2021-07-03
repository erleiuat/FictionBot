from plugins import scb
import json

def process():

    msgs = json.loads(input())
    scb.doPrint({'messages': msgs})

    for msg in msgs:
        if(msg['scope'].lower() == 'global'):
            #scb.goScope('local')
            scb.goScope('global')
            scb.sendMessage(msg['message'])
        elif(msg['scope'].lower() == 'local'):
            scb.goScope('local')
            scb.sendMessage(msg['message'])
        else:
            scb.doPrint({
                'error': True,
                'errorMessage': 'Invalid message scope'
            })
