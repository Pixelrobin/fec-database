import { ipcMain } from 'electron'
import sqlite3 = require( "sqlite3" );

let db: sqlite3.Database;

export function init( database: sqlite3.Database ) {
    db = database;

    db.exec(`
        CREATE TABLE IF NOT EXISTS schedules (
            name TEXT,
            id INTEGER PRIMARY KEY
        );
        
        CREATE TABLE IF NOT EXISTS scheduleData (
            eventId TEXT UNIQUE NOT NULL,
            scheduleId TEXT NOT NULL,
            title TEXT,
            startTime TEXT,
            endTime TEXT,
            day INTEGER,
            FOREIGN KEY( scheduleId ) REFERENCES schedules( id )
        );
    `
    )

    ipcMain.on( "get-schedule-names", ( event, arg ) => {
        returnScheduleNames( event );
    });

    ipcMain.on( "get-schedule-events", ( event, arg ) => {
        db.serialize( () => {
            db.all( `SELECT * FROM scheduleData WHERE scheduleId = ?`, arg, ( err, rows ) => {
                if ( !err ) event.sender.send( "get-schedule-events-reply", rows );
            })
        })
    });

    ipcMain.on( "add-schedule", ( event, arg ) => {
        db.serialize( () => {
            db.run(
                "INSERT INTO schedules( name ) VALUES( ? );",
                [ arg ], ( err ) => {
                    if ( !err ) returnScheduleNames( event );
                    else console.log( err );
                }
            );
        });
    });

    ipcMain.on( "set-schedule-name", ( event, arg ) => {
        db.serialize( () => {
            db.run(
                `UPDATE schedules SET
                    name = ?
                WHERE id = ?`, [
                    arg.name, arg.id
                ], ( err ) => {
                    if ( !err ) returnScheduleNames( event );
                    else console.log( err )
                }
            )
        } );
    } );

    ipcMain.on( "delete-schedule", ( event, arg ) => {
        db.serialize( () => {
            db.run( `DELETE FROM scheduleData WHERE scheduleId = ?`, arg );
            db.run( `DELETE FROM schedules WHERE id = ?`, arg, ( err ) => {
                returnScheduleNames( event );
            });
        })
    })

    /*ipcMain.on( "create-event", ( event, arg ) => {
        db.serialize( () => {
            db.run( `INSERT INTO scheduleData( scheduleId ) VALUES( ? )`, arg.scheduleId );

        })
    })

    ipcMain.on( "submit-event", ( event, arg ) => {
        db.serialize( () => {
            db.run( `
                UPDATE scheduleData SET
                    name = $name,
                    startTime = $startTime,
                    endTime = $endTime,
                    day = $day
                WHERE id = $id
            `, arg)
        })
    });*/

    ipcMain.on( "submit-event", ( event, args ) => {
        console.log( "submitting event ", args.$eventId );
        db.serialize( () => {
            db.run( `
                INSERT OR REPLACE INTO scheduleData(
                    eventId, scheduleId, title, startTime, endTime, day
                ) VALUES (
                    $eventId, $scheduleId, $title, $startTime, $endTime, $day
                );
            `, args, ( err ) => { if ( err ) console.log( err ) } )
        })
    });

    ipcMain.on( "delete-event", ( event, args ) => {
        db.serialize( () => {
            db.run( `
                DELETE FROM scheduleData WHERE eventId = ?
            `, args, ( err ) => { if ( err ) console.log( err ) } )
        })
    })

}

function returnScheduleNames( event: Electron.IpcMainEvent ) {
    db.serialize( () => {
        db.all( "SELECT * FROM schedules;", ( err, rows ) => {
            event.sender.send( "get-schedule-names-reply", rows )
        });
    })
}