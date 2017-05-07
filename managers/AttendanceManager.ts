import { ipcMain } from 'electron'
import sqlite3 = require( "sqlite3" );

let db: sqlite3.Database;

export function init( database: sqlite3.Database ) {
    db = database;

    db.exec(
        `CREATE TABLE IF NOT EXISTS attendance (
            id     INTEGER PRIMARY KEY,
            date   TEXT,
            hour   NUMBER,
            visits NUMBER
        );`
    )

    ipcMain.on( "get-attendance-data", ( event, arg ) => {
        db.all( `SELECT * FROM attendance WHERE date BETWEEN $start AND $end;`, arg, ( err, rows ) => {
            event.sender.send( "get-attendance-data-reply", rows )
        });
    });

}