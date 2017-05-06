import { ipcMain } from 'electron'
import sqlite3 = require( "sqlite3" );

let db: sqlite3.Database;

export function init( database: sqlite3.Database ) {
    db = database;

    db.serialize( () => {
        db.exec(
            `CREATE TABLE IF NOT EXISTS employees (
                id       INTEGER PRIMARY KEY,
                name     TEXT,
                category TEXT,
                email    TEXT,
                phone    TEXT,
                comments TEXT
            );`
        )
    } );
    
    ipcMain.on( "get-employee-list", ( event, arg ) => {
        returnEmployeeData( event );
    } );

    ipcMain.on( "set-employee-data", ( event, arg ) => {
        db.serialize( () => {
            db.run(
                `UPDATE employees SET
                    name = ?,
                    category = ?,
                    email = ?,
                    phone = ?,
                    comments = ?
                WHERE id = ?`, [
                    arg.name, arg.category, arg.email,
                    arg.phone, arg.comments, arg.id
                ], ( err ) => {
                    if ( !err ) returnEmployeeData( event, arg.id );
                }
            )
        } );
    } );

    ipcMain.on( "add-employee", ( event, arg ) => {
        db.serialize( () => {
            db.run(
                `INSERT INTO employees( name ) VALUES( ? );`,
                [ arg.name ]
            )

            db.get( "SELECT last_insert_rowid();", ( err, row ) => {
                if ( !err ) returnEmployeeData( event, row[ "last_insert_rowid()" ] )
            } )
        } )
    } );

    ipcMain.on( "delete-employee", ( event, arg ) => {
        db.serialize( () => {
            db.run( "DELETE FROM employees WHERE id = ?", arg, ( err ) => {
                returnEmployeeData( event );
            })
        })
    } );
}

function returnEmployeeData( event: Electron.IpcMainEvent, id?: number ) {
    let callback = ( err, rows ) => {
        if ( !err ) event.sender.send( "employee-list-reply", {
            rows: rows,
            id: id === undefined ? null : id
        } );
    }
    
    db.serialize( () => {
        if ( id === undefined ) db.all( "SELECT * FROM employees;", callback );
        else db.all( "SELECT * FROM employees WHERE id = ?;", id, callback );
    } )
}