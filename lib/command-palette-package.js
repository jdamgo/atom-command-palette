/** @babel */

import child_process from 'child_process'
import {CompositeDisposable} from 'atom'
import CommandPaletteView from './command-palette-view'

class CommandPalettePackage {
  execApmCommand (command) {
    let delimIndex = command.search(/[^\w:/\\ -]/)
    console.log(`'${command[delimIndex]}'  @ delimIndex`)
    if (delimIndex === -1) {
      delimIndex = command.length
    } else {
      atom.notifications.addWarning('Atom Package Manager (apm)',
        { description: 'Command concatenation is not allowed!' })
    }
    command = command.substring(3, delimIndex)

    child_process.exec(atom.packages.getApmPath() + command, null,
      (error, stdout, stderr) => {
        if (stdout) {
          stdout = stdout.replace(/\033\[.+?m/g, '')
        } else if (stderr) {
          stderr = stderr.replace(/\033\[.+?m/g, '')
        }
        if (error) {
          atom.notifications.addError('Atom Package Manager (apm)', {
            detail: `>>> apm${command}\n${stderr}`,
            description: 'Run `apm help [<command>]` to see available commands or details about a specific command.',
            dismissable: true,
            icon: 'alert'
          })
          return
        }
        if (stdout) {
          atom.notifications.addSuccess('Atom Package Manager (apm)', {
            detail: `>>> apm${command}\n${stdout}`
          })
        } else if (stderr) {
          atom.notifications.addInfo('Atom Package Manager (apm)', {
            detail: `>>> apm${command}\n${stderr}`,
            dismissable: true
          })
        }
      })
  }

  activate () {
    this.commandPaletteView = new CommandPaletteView()
    this.disposables = new CompositeDisposable()
    this.disposables.add(atom.commands.add('atom-workspace', 'command-palette:toggle', () => {
      this.commandPaletteView.toggle()
    }))
    this.disposables.add(atom.commands.add('atom-workspace', 'command-palette:apm', (event) => {
      if (event.detail) {
        this.execApmCommand(event.detail)
      } else {
        throw new Error() // TODO error? notification? TBD!!! (could only occur on manual call from code)
      }
    }))
    this.disposables.add(atom.config.observe('command-palette.useAlternateScoring', (newValue) => {
      this.commandPaletteView.update({useAlternateScoring: newValue})
    }))
    this.disposables.add(atom.config.observe('command-palette.preserveLastSearch', (newValue) => {
      this.commandPaletteView.update({preserveLastSearch: newValue})
    }))
    return this.commandPaletteView.show()
  }

  async deactivate () {
    this.disposables.dispose()
    await this.commandPaletteView.destroy()
  }
}

// TODO revert on publish (just to get eslint/standard to work)
const _package = new CommandPalettePackage()
export default _package
