const cmdBuilder = require('./cmdbuilder')


exports.doAct = async function doAct(action, force = false) {
    cmdBuilder.begin()
    let tmpCmd = cmdBuilder.getTmpCmd()

    if (!force && cmdBuilder.tooEarly(action, 15)) return cmdBuilder.fullCommand(tmpCmd)

    switch (action) {

        case 'startup':
            cmdBuilder.addMessage('global', 'I will be unavailable for a minute.')
            cmdBuilder.addAction('repair', [
                '#Teleport -117564.797 -67782.828 36810.059',
                '#Teleport -107551.336 -67798.992 36856.250'
            ])
            cmdBuilder.addMessage('global', '#Teleport -117331 -66059 37065')
            cmdBuilder.addAction('shit')
            cmdBuilder.addAction('shit')
            cmdBuilder.addAction('piss')
            cmdBuilder.addMessage('global', '#Teleport -116369 -65906 37144')
            cmdBuilder.addMessage('global', 'I\'m available again.')
            cmdBuilder.addAction('idle')
            break

        case 'business':
            cmdBuilder.addMessage('global', 'I will be unavailable for a minute.')
            cmdBuilder.addMessage('global', '#Teleport -117331 -66059 37065')
            cmdBuilder.addAction('piss')
            cmdBuilder.addAction('shit')
            cmdBuilder.addMessage('global', '#Teleport -116369 -65906 37144')
            cmdBuilder.addMessage('global', 'I\'m available again.')
            cmdBuilder.addAction('idle')
            break

        case 'shit':
            cmdBuilder.addMessage('global', 'I will be unavailable for a minute.')
            cmdBuilder.addMessage('global', '#Teleport -117331 -66059 37065')
            cmdBuilder.addAction('shit')
            cmdBuilder.addMessage('global', '#Teleport -116369 -65906 37144')
            cmdBuilder.addMessage('global', 'I\'m available again.')
            cmdBuilder.addAction('idle')
            break

        case 'piss':
            cmdBuilder.addMessage('global', 'I will be unavailable for a minute.')
            cmdBuilder.addMessage('global', '#Teleport -117331 -66059 37065')
            cmdBuilder.addAction('piss')
            cmdBuilder.addMessage('global', '#Teleport -116369 -65906 37144')
            cmdBuilder.addMessage('global', 'I\'m available again.')
            cmdBuilder.addAction('idle')
            break

        case 'dress':
            cmdBuilder.addMessage('global', 'I will be unavailable for a minute.')
            cmdBuilder.addMessage('global', '#Teleport -117331 -66059 37065')
            cmdBuilder.addAction('dress')
            cmdBuilder.addMessage('global', '#Teleport -116369 -65906 37144')
            cmdBuilder.addMessage('global', 'I\'m available again.')
            cmdBuilder.addAction('idle')
            break

        case 'repair':
            cmdBuilder.addMessage('global', 'I will be unavailable for a minute.')
            cmdBuilder.addAction('repair', [
                '#Teleport -117564.797 -67794.680 36809.430',
                '#Teleport -107551.336 -67783.750 36857.059'
            ])
            cmdBuilder.addMessage('global', '#Teleport -116369 -65906 37144')
            cmdBuilder.addMessage('global', 'I\'m available again.')
            cmdBuilder.addAction('idle')
            break

        case 'light':
            cmdBuilder.addMessage('global', 'I will be unavailable for 10 minutes.')
            cmdBuilder.addMessage('global', '#Teleport -117331 -66059 37065')
            cmdBuilder.addAction('light', [
                "#Teleport -112656 -71595 37542", //Turm 1.1        
                "#Teleport -111670 -71516 37535", //Turm 1.2        
                "#Teleport -112387 -71937 36626", //Einfahrt 1.1    
                "#Teleport -111760 -71896 36634", //Einfahrt 1.2    
                "#Teleport -112427 -71106 36729", //Einfahrt 1.3    
                "#Teleport -111833 -71113 36741", //Einfahrt 1.4
                "#Teleport -112095 -63900 38061", //Turm 2.1
                "#Teleport -111026 -64267 38056", //Turm 2.2
                "#Teleport -111708 -63749 37264", //Einfahrt 2.1
                "#Teleport -111199 -63872 37276", //Einfahrt 2.2
                "#Teleport -111898 -64515 37156", //Einfahrt 2.3
                "#Teleport -111306 -64654 37146", //Einfahrt 2.4
                "#Teleport -111795 -68849 36999", //Tanke 1
                "#Teleport -111646 -67682 36999", //Tanke 2
                "#Teleport -111520 -66718 36999", //Tanke 3
                "#Teleport -112476 -66705 36997", //Tanke 4
                "#Teleport -113510 -66588 36997", //Tanke 5
                "#Teleport -113655 -67707 36997", //Tanke 6
                "#Teleport -112593 -67862 36997", //Tanke 7
                "#Teleport -110138 -66370 37031", //Tanke 8
                "#Teleport -116818 -65894 37065", //Haus 1
                "#Teleport -117260 -66462 37065", //Haus 2
                "#Teleport -117259 -67017 37065", //Haus 3
                "#Teleport -116793 -66869 37065", //Haus 4
                "#Teleport -116077 -65691 37065", //VorHaus 1
                "#Teleport -116077 -66253 37065", //VorHaus 2
                "#Teleport -116077 -66665 37065", //VorHaus 3
                "#Teleport -116077 -67096 37065", //VorHaus 4
                "#Teleport -116658 -63151 37273", //Aussen 1
                "#Teleport -118116 -69254 36806", //Aussen 2
                "#Teleport -115002 -69334 36825", //Aussen 3
                "#Teleport -113327 -70297 36840", //Aussen 4
                "#Teleport -118151 -65352 37089", //Aussen 5
                "#Teleport -114378 -63300 37302" //Aussen 6
            ])
            cmdBuilder.addMessage('global', '#Teleport -116369 -65906 37144')
            cmdBuilder.addMessage('global', 'I\'m available again.')
            cmdBuilder.addAction('idle')
            break

        case 'idle':
            cmdBuilder.addMessage('global', '#Teleport -116369 -65906 37144')
            cmdBuilder.addAction('idle')
            break

        default:
            cmdBuilder.addAction(action)
            break

    }

    return cmdBuilder.fullCommand(tmpCmd)
}