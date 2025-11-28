const fileService = require('./TransactionService');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const os = require('os');

const app = express();
const port = 4000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '50mb'})); // Increased limit for file uploads
app.use(cors());

// ROUTES FOR OUR API
// =======================================================

//Health Checking
app.get('/health',(req,res)=>{
    res.json("This is the health check");
});

// USER AUTHENTICATION
app.post('/register', (req,res)=>{
    try{
        const {username, password} = req.body;
        if (!username || !password) {
            return res.status(400).json({message: 'Username and password required'});
        }
        
        fileService.createUser(username, password, function(result) {
            if (result.error) {
                if (result.error.includes('Duplicate')) {
                    return res.status(409).json({message: 'Username already exists'});
                }
                return res.status(500).json({message: 'Registration failed', error: result.error});
            }
            res.status(200).json({message: 'User created successfully', userId: result.userId});
        });
    }catch (err){
        res.status(500).json({message: 'Registration error', error: err.message});
    }
});

app.post('/login', (req,res)=>{
    try{
        const {username, password} = req.body;
        if (!username || !password) {
            return res.status(400).json({message: 'Username and password required'});
        }
        
        fileService.loginUser(username, password, function(result) {
            if (result.error) {
                return res.status(401).json({message: 'Invalid credentials'});
            }
            res.status(200).json({message: 'Login successful', user: result.user});
        });
    }catch (err){
        res.status(500).json({message: 'Login error', error: err.message});
    }
});

// FILE OPERATIONS
app.post('/file/upload', (req,res)=>{
    try{
        const {userId, filename, fileData} = req.body;
        if (!userId || !filename || !fileData) {
            return res.status(400).json({message: 'userId, filename, and fileData required'});
        }
        
        fileService.uploadFile(userId, filename, fileData, function(result) {
            if (result.error) {
                return res.status(500).json({message: 'Upload failed', error: result.error});
            }
            res.status(200).json({message: 'File uploaded successfully', fileId: result.fileId});
        });
    }catch (err){
        res.status(500).json({message: 'Upload error', error: err.message});
    }
});

app.get('/file/list/:userId', (req,res)=>{
    try{
        const userId = req.params.userId;
        
        fileService.getUserFiles(userId, function(result) {
            if (result.error) {
                return res.status(500).json({message: 'Failed to get files', error: result.error});
            }
            res.status(200).json({files: result.files});
        });
    }catch (err){
        res.status(500).json({message: 'Error retrieving files', error: err.message});
    }
});

app.get('/file/shared/:userId', (req,res)=>{
    try{
        const userId = req.params.userId;
        
        fileService.getSharedFiles(userId, function(result) {
            if (result.error) {
                return res.status(500).json({message: 'Failed to get shared files', error: result.error});
            }
            res.status(200).json({files: result.files});
        });
    }catch (err){
        res.status(500).json({message: 'Error retrieving shared files', error: err.message});
    }
});

app.get('/file/download/:fileId', (req,res)=>{
    try{
        const fileId = req.params.fileId;
        
        fileService.getFile(fileId, function(result) {
            if (result.error) {
                return res.status(404).json({message: 'File not found', error: result.error});
            }
            res.status(200).json({file: result.file});
        });
    }catch (err){
        res.status(500).json({message: 'Error downloading file', error: err.message});
    }
});

app.post('/file/share', (req,res)=>{
    try{
        const {fileId, ownerId, shareWithUsername} = req.body;
        if (!fileId || !ownerId || !shareWithUsername) {
            return res.status(400).json({message: 'fileId, ownerId, and shareWithUsername required'});
        }
        
        // First check if the user exists
        fileService.checkUserExists(shareWithUsername, function(checkResult) {
            if (checkResult.error) {
                return res.status(500).json({message: 'Error checking user', error: checkResult.error});
            }
            if (!checkResult.exists) {
                return res.status(404).json({message: 'User not found'});
            }
            
            // Share the file
            fileService.shareFile(fileId, ownerId, checkResult.userId, function(result) {
                if (result.error) {
                    return res.status(500).json({message: 'Share failed', error: result.error});
                }
                res.status(200).json({message: 'File shared successfully'});
            });
        });
    }catch (err){
        res.status(500).json({message: 'Share error', error: err.message});
    }
});

app.delete('/file/:fileId/:userId', (req,res)=>{
    try{
        const {fileId, userId} = req.params;
        
        fileService.deleteFile(fileId, userId, function(result) {
            if (result.error) {
                return res.status(500).json({message: 'Delete failed', error: result.error});
            }
            res.status(200).json({message: 'File deleted successfully'});
        });
    }catch (err){
        res.status(500).json({message: 'Delete error', error: err.message});
    }
});

app.listen(port, () => {
    console.log(`File sharing backend app listening at http://localhost:${port}`)
});
