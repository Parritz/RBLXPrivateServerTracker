const sqlite3 = require('sqlite3');
const fs = require('fs');
const database = getDatabase();
const databaseTemplate = getDatabaseTemplate();

/**
 * Establishes the connection to the database file
 * @returns {Database}
 */
function getDatabase() {
    // If the database file doesn't exist, copy the template
    if (!fs.existsSync('database/database.db')) {
        fs.copyFileSync('database/database-template.db', 'database/database.db')
    }

    return new sqlite3.Database('database/database.db')
}

function getDatabaseTemplate() {
    return new sqlite3.Database('database/database-template.db')
}

/**
 * Get a single row from the database
 * @param query
 * @param params
 * @param db
 * @returns {Promise<unknown>}
 */
function dbGet(query, params, db = database) {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}

/**
 * Run a query on the database
 * @param {string} query
 * @param {Array} params
 * @param {sqlite3.Database} db
 * @returns {Promise<unknown>}
 */
function dbRun(query, params, db = database) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) return reject(err);
            resolve(this.lastID);
        });
    });
}

/**
 * Get all rows from the database
 * @param {string} query - The SQL query to execute
 * @param {Array} params - The parameters for the SQL query
 * @param {sqlite3.Database} [db=database] - The database instance to use
 * @returns {Promise<Array>} - A promise that resolves to an array of rows
 */
function dbGetAll(query, params, db = database) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

module.exports = {
    database,
    databaseTemplate,
    dbGet,
    dbRun,
    dbGetAll
};