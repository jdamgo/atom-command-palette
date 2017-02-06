/** @babel */

import child_process from 'child_process'
import {CompositeDisposable} from 'atom'
import CommandPaletteView from './command-palette-view'

class CommandPalettePackage {
  execApmCommand(command) {
    // TODO CURR
    console.log(command) // DEBUG console.log
    child_process.exec('pwd', {
      timeout: 300,
      killSignal: 'SIGTERM'
    }, (error, stdout, stderr) => {
      if (error) {
        throw error
      }
      console.debug('stdout >>>${stdout}<<<')
      console.debug('stderr >>>${stderr}<<<')
    })
  }

  activate () {
    this.commandPaletteView = new CommandPaletteView()
    this.disposables = new CompositeDisposable()
    this.disposables.add(atom.commands.add('atom-workspace', 'command-palette:toggle', () => {
      this.commandPaletteView.toggle()
    }))
    this.disposables.add(atom.commands.add('atom-workspace', 'command-palette:apm', (event) => {
      if (event.detail)
        this.execApmCommand(event.detail)
      else
        throw new Error() // TODO error? notification? TBD!!!
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

const package = new CommandPalettePackage()
export default package
