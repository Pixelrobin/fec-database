// Misc typscript globals

// Workaround for requirejs conflict with node's require() syntax
// Use to require node modules. Sadly, that means typescript typings won'be supported.
declare function nodeRequire( packageName: string ): void;

// Workaround for different module methods from node and webix jet
// ipcRenderer is explosed to the window in index.html
// It's the only module that renderer will need
//declare const ipcRenderer: Electron.IpcRenderer;