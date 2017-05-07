import { ipcMain } from 'electron'
import sqlite3 = require( "sqlite3" );

let db: sqlite3.Database;

export function init( database: sqlite3.Database ) {
    db = database;

    db.exec(
        `CREATE TABLE IF NOT EXISTS attendance (
            id     INTEGER PRIMARY KEY,
            date   TEXT,
            hour   NUMBER UNIQUE,
            visits NUMBER
        );`
    )

    ipcMain.on( "get-attendance-data", ( event, arg ) => {
        let result = {
            weekrows: null,
            dayrows: null
        }

        // Did someone say callback hell?
        db.serialize( () => {
            db.all( `SELECT * FROM attendance WHERE date BETWEEN ? AND ?;`,
                [ arg.start, arg.end ],
                ( err, rows ) => {
                    if ( err ) console.log( err );
                    else {
                        result.weekrows = rows;
                        db.all( `SELECT * FROM attendance WHERE date = ?`,
                            arg.day,
                            ( err, rows ) => {
                                if ( err ) console.log( err );
                                else {
                                    result.dayrows = rows;
                                    event.sender.send( "get-attendance-data-reply", result );
                                }
                            }
                        )
                    }
                }
            );
        });
    });

    ipcMain.on( "update-attendance-data", ( event, arg ) => {
        db.serialize( () => {
            for ( let d of arg.data ) {
                if ( d.visits > 0 ) {
                    db.run( `INSERT OR REPLACE INTO attendance(
                                date,
                                hour,
                                visits
                            ) VALUES (
                                ?, ?, ?
                            );
                        `, [ arg.date, d.id, d.visits ], ( err ) => {
                            if ( err ) console.log( err );
                        }
                    )
                }
            }
        })
    })

}