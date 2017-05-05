// Misc typscript globals

// Workaround for requirejs conflict with node's require() syntax
// Use to require node modules. Sadly, that means typescript typings won'be supported.
declare function nodeRequire( packageName: string ): void;

// JQuery only required for fullcalendar so don't need the entire library
declare function $( element: any ): any;