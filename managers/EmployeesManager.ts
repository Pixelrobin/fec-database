// Data manager for employees

import { ipcMain } from 'electron'
import sqlite3 = require( "sqlite3" );

let db: sqlite3.Database;

export function init( database: sqlite3.Database ) {
    db = database;

    // Create table if it doesn't exist
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
    
    // Get list of employees
    ipcMain.on( "get-employee-list", ( event, arg ) => {
        returnEmployeeData( event );
    } );

    // Set the data of an employee
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
                    if ( err ) throw err;
                    else returnEmployeeData( event, arg.id );
                }
            )
        } );
    } );

    // Add a new employee
    ipcMain.on( "add-employee", ( event, arg ) => {
        db.serialize( () => {
            db.run(
                `INSERT INTO employees( name ) VALUES( ? );`,
                [ arg.name ]
            )

            db.get( "SELECT last_insert_rowid();", ( err, row ) => {
                if ( err ) throw err;
                else returnEmployeeData( event, row[ "last_insert_rowid()" ] );
            } )
        } )
    } );

    // Delete an employee
    ipcMain.on( "delete-employee", ( event, arg ) => {
        db.serialize( () => {
            db.run( "DELETE FROM employees WHERE id = ?", arg, ( err ) => {
                if ( err ) throw err;
                else returnEmployeeData( event );
            })
        })
    } );
}

// Return employee data, wither the whole thing or just for one
// Function because it is used multipl times
function returnEmployeeData( event: Electron.IpcMainEvent, id?: number ) {
    let callback = ( err, rows ) => {
        // Send the result back
        if ( err ) throw err;
        else event.sender.send( "employee-list-reply", {
            rows: rows,
            id: id === undefined ? null : id
        } );
    }
    
    db.serialize( () => {
        // If there is an id specified, get data only for that id
        if ( id === undefined ) db.all( "SELECT * FROM employees;", callback );
        else db.all( "SELECT * FROM employees WHERE id = ?;", id, callback );
    } )
}