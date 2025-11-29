const dbcreds = require('./DbConfig');
const mysql = require('mysql');

const con = mysql.createConnection({
    host: dbcreds.host,
    user: dbcreds.user,
    password: dbcreds.password,
    database: dbcreds.database
});

// USER FUNCTIONS
function createUser(username, password, callback){
    var sql = `INSERT INTO users (username, password) VALUES ('${username}','${password}')`;
    con.query(sql, function(err, result){
        if (err) return callback({error: err.message});
        console.log("User created");
        return callback({success: true, userId: result.insertId});
    }) 
}

function loginUser(username, password, callback){
    var sql = `SELECT id, username FROM users WHERE username = '${username}' AND password = '${password}'`;
    con.query(sql, function(err, result){
        if (err) return callback({error: err.message});
        if (result.length === 0) return callback({error: "Invalid credentials"});
        console.log("User logged in");
        return callback({success: true, user: result[0]});
    });
}

function checkUserExists(username, callback){
    var sql = `SELECT id FROM users WHERE username = '${username}'`;
    con.query(sql, function(err, result){
        if (err) return callback({error: err.message});
        return callback({exists: result.length > 0, userId: result[0]?.id});
    });
}

// FILE FUNCTIONS
function uploadFile(userId, filename, fileData, callback){
    var sql = `INSERT INTO files (user_id, filename, file_data, upload_date) VALUES (${userId}, '${filename}', '${fileData}', NOW())`;
    con.query(sql, function(err, result){
        if (err) return callback({error: err.message});
        console.log("File uploaded");
        return callback({success: true, fileId: result.insertId});
    }) 
}

function getUserFiles(userId, callback){
    var sql = `SELECT id, filename, upload_date FROM files WHERE user_id = ${userId} ORDER BY upload_date DESC`;
    con.query(sql, function(err, result){
        if (err) return callback({error: err.message});
        console.log("Getting user files...");
        return callback({files: result});
    });
}

function getSharedFiles(userId, callback){
    var sql = `SELECT f.id, f.filename, f.upload_date, u.username as owner 
               FROM files f 
               JOIN file_shares fs ON f.id = fs.file_id 
               JOIN users u ON f.user_id = u.id
               WHERE fs.shared_with_user_id = ${userId} 
               ORDER BY fs.shared_date DESC`;
    con.query(sql, function(err, result){
        if (err) return callback({error: err.message});
        console.log("Getting shared files...");
        return callback({files: result});
    });
}

function getFile(fileId, callback){
    var sql = `SELECT filename, file_data FROM files WHERE id = ${fileId}`;
    con.query(sql, function(err, result){
        if (err) return callback({error: err.message});
        if (result.length === 0) return callback({error: "File not found"});
        return callback({file: result[0]});
    });
}

function shareFile(fileId, ownerId, sharedWithUserId, callback){
    // First check if user owns the file
    var checkSql = `SELECT id FROM files WHERE id = ${fileId} AND user_id = ${ownerId}`;
    con.query(checkSql, function(err, result){
        if (err) return callback({error: err.message});
        if (result.length === 0) return callback({error: "File not found or unauthorized"});
        
        // Insert share
        var sql = `INSERT INTO file_shares (file_id, shared_with_user_id, shared_date) VALUES (${fileId}, ${sharedWithUserId}, NOW())`;
        con.query(sql, function(err, result){
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') return callback({error: "File already shared with this user"});
                return callback({error: err.message});
            }
            console.log("File shared");
            return callback({success: true});
        });
    });
}

function deleteFile(fileId, userId, callback){
    var sql = `DELETE FROM files WHERE id = ${fileId} AND user_id = ${userId}`;
    con.query(sql, function(err, result){
        if (err) return callback({error: err.message});
        console.log(`Deleting file with id ${fileId}`);
        return callback({success: true});
    }) 
}


module.exports = {
    createUser,
    loginUser,
    checkUserExists,
    uploadFile,
    getUserFiles,
    getSharedFiles,
    getFile,
    shareFile,
    deleteFile
};







