# File Sharing Application - AWS Three Tier Architecture

A secure, scalable file-sharing application built on AWS three-tier architecture with user authentication, file upload/download, and file sharing capabilities.

## 🎯 Features

### User Management
- **User Registration** - Simple account creation with username and password
- **User Authentication** - Secure login system
- **Session Management** - Persistent user sessions across the application

### File Operations
- **File Upload** - Upload files of various types (stored as base64)
- **File Download** - Download your uploaded files
- **File Deletion** - Remove files you no longer need
- **My Files Dashboard** - View all your uploaded files with metadata

### File Sharing
- **Share with Users** - Share files with other registered users by username
- **Shared Files View** - See all files that have been shared with you
- **Username Validation** - System validates that recipients exist before sharing
- **Access Control** - Only file owners can share or delete files

---

## 🏗️ Architecture Overview

![Architecture Diagram](https://github.com/aws-samples/aws-three-tier-web-architecture-workshop/blob/main/application-code/web-tier/src/assets/3TierArch.png)

### Three-Tier Design

**Web Tier (Frontend)**
- React.js single-page application
- Nginx web server serving static content
- Responsive UI with login, dashboard, and file management interfaces
- Public-facing Application Load Balancer distributes traffic

**Application Tier (Backend)**
- Node.js REST API server (Port 4000)
- Express.js framework for routing
- Internal-facing Load Balancer for high availability
- Business logic for authentication, file operations, and sharing

**Database Tier**
- Aurora MySQL multi-AZ database
- Three normalized tables: `users`, `files`, `file_shares`
- Automatic failover and backup capabilities

**Infrastructure**
- Auto-scaling groups at web and app tiers
- Health checks at all layers
- VPC with public and private subnets
- Security groups for network isolation

---

## 📡 API Documentation

### Base URL
All API requests are proxied through: `/api/`

### Authentication Endpoints

#### Register User
```http
POST /api/register
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "userId": 1
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing username/password
- `409` - Username already exists
- `500` - Server error

---

#### Login User
```http
POST /api/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "string"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing credentials
- `401` - Invalid credentials
- `500` - Server error

---

### File Management Endpoints

#### Upload File
```http
POST /api/file/upload
Content-Type: application/json

{
  "userId": 1,
  "filename": "document.pdf",
  "fileData": "base64_encoded_string"
}
```

**Response:**
```json
{
  "message": "File uploaded successfully",
  "fileId": 1
}
```

---

#### List User's Files
```http
GET /api/file/list/{userId}
```

**Response:**
```json
{
  "files": [
    {
      "id": 1,
      "filename": "document.pdf",
      "upload_date": "2025-11-28T10:30:00.000Z"
    }
  ]
}
```

---

#### List Shared Files
```http
GET /api/file/shared/{userId}
```

**Response:**
```json
{
  "files": [
    {
      "id": 2,
      "filename": "report.xlsx",
      "upload_date": "2025-11-28T09:15:00.000Z",
      "owner": "john_doe"
    }
  ]
}
```

---

#### Download File
```http
GET /api/file/download/{fileId}
```

**Response:**
```json
{
  "file": {
    "filename": "document.pdf",
    "file_data": "base64_encoded_string"
  }
}
```

---

#### Share File
```http
POST /api/file/share
Content-Type: application/json

{
  "fileId": 1,
  "ownerId": 1,
  "shareWithUsername": "jane_doe"
}
```

**Response:**
```json
{
  "message": "File shared successfully"
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing required fields
- `404` - User not found
- `500` - Share failed (duplicate share, unauthorized, etc.)

---

#### Delete File
```http
DELETE /api/file/{fileId}/{userId}
```

**Response:**
```json
{
  "message": "File deleted successfully"
}
```

---

### Health Check
```http
GET /api/health
```

**Response:**
```json
"This is the health check"
```

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Files Table
```sql
CREATE TABLE files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_data LONGTEXT NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### File Shares Table
```sql
CREATE TABLE file_shares (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_id INT NOT NULL,
    shared_with_user_id INT NOT NULL,
    shared_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_with_user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_share (file_id, shared_with_user_id)
);
```

**Indexes:**
- `idx_files_user_id` - Optimize user file lookups
- `idx_file_shares_file_id` - Optimize file share queries
- `idx_file_shares_shared_with` - Optimize shared files lookups

---

## 🔧 Configuration & Deployment

### Prerequisites
1. AWS account with permissions for EC2, RDS, VPC, ELB, Auto Scaling
2. Node.js 14+ and npm installed
3. Aurora MySQL database instance
4. Understanding of AWS networking (VPC, subnets, security groups)

### Configuration Files

#### 1. Database Configuration (`app-tier/DbConfig.js`)
```javascript
module.exports = Object.freeze({
    DB_HOST : 'your-rds-endpoint.amazonaws.com',
    DB_USER : 'admin',
    DB_PWD : 'your-password',
    DB_DATABASE : 'filesharing'
});
```

#### 2. NGINX Configuration (`nginx.conf`)
Update line 57 with your internal load balancer DNS:
```nginx
location /api/{
    proxy_pass http://internal-lb-123456789.us-east-1.elb.amazonaws.com:80/;
}
```

### Deployment Steps

#### 1. Database Setup
```bash
# Connect to your Aurora MySQL instance
mysql -h your-rds-endpoint.amazonaws.com -u admin -p

# Run the setup script
source DATABASE_SETUP.sql
```

#### 2. Application Tier Setup
```bash
cd application-code/app-tier

# Install dependencies
npm install

# Start the server (runs on port 4000)
node index.js
```

**Dependencies:**
- `express` - Web framework
- `mysql` - Database connector
- `body-parser` - Request parsing
- `cors` - Cross-origin resource sharing

#### 3. Web Tier Setup
```bash
cd application-code/web-tier

# Install dependencies
npm install

# Build for production
npm run build

# Copy build files to nginx directory
sudo cp -r build/* /home/ec2-user/web-tier/build/
```

#### 4. NGINX Setup
```bash
# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/nginx.conf

# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

---

## 🛠️ Technology Stack

### Frontend
- **React.js** - UI framework
- **React Router** - Client-side routing
- **Styled Components** - CSS-in-JS styling
- **React Focus Lock** - Accessibility features

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL Driver** - Database connectivity
- **Body Parser** - JSON request parsing
- **CORS** - Cross-origin handling

### Infrastructure
- **NGINX** - Reverse proxy and static file server
- **Aurora MySQL** - Relational database
- **AWS EC2** - Compute instances
- **AWS ELB** - Load balancing
- **AWS Auto Scaling** - Automatic scaling
- **AWS VPC** - Network isolation

---

## 📁 Project Structure

```
application-code/
├── app-tier/
│   ├── DbConfig.js           # Database configuration (MUST CONFIGURE)
│   ├── TransactionService.js # Database operations
│   ├── index.js              # Express server & API routes
│   └── package.json          # Node dependencies
├── web-tier/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login/        # Login & registration UI
│   │   │   ├── DatabaseDemo/ # Dashboard (renamed but kept path)
│   │   │   ├── Home/         # Landing page
│   │   │   ├── Menu/         # Navigation menu
│   │   │   └── Burger/       # Mobile menu toggle
│   │   ├── App.js            # Main app component with routing
│   │   └── global.js         # Global styles
│   └── package.json          # React dependencies
├── nginx.conf                # NGINX reverse proxy config (MUST CONFIGURE)
└── DATABASE_SETUP.sql        # Database schema script
```

---

## 🔐 Security Considerations

### Current Implementation
- Basic username/password authentication
- SQL injection vulnerable (uses string interpolation)
- Passwords stored in plain text
- No input validation
- No rate limiting
- No session tokens/JWT

### ⚠️ For Production Use, Implement:
1. **Password Hashing** - Use bcrypt or similar
2. **Prepared Statements** - Prevent SQL injection
3. **JWT Tokens** - Stateless authentication
4. **Input Validation** - Sanitize all user inputs
5. **HTTPS** - Enable SSL/TLS certificates
6. **Rate Limiting** - Prevent brute force attacks
7. **File Size Limits** - Prevent resource exhaustion
8. **File Type Validation** - Restrict allowed file types
9. **Secrets Management** - Use AWS Secrets Manager for DB credentials
10. **Security Groups** - Restrict network access appropriately

---

## 🚀 Usage Guide

### For End Users

1. **Access the Application**
   - Navigate to your public load balancer URL
   - Click "Login" in the menu

2. **Create an Account**
   - Click "Register" link
   - Enter username and password
   - Click "Register" button

3. **Upload Files**
   - After login, you'll see the Dashboard
   - Click "+ Upload File" button
   - Select file from your computer
   - File appears in "My Files" table

4. **Share Files**
   - Click "Share" button next to any file
   - Enter recipient's username
   - Click "Share" to confirm

5. **Download Files**
   - Click "Download" button next to any file
   - File downloads to your computer

6. **View Shared Files**
   - Scroll to "Files Shared With Me" section
   - Download shared files

---

## 🧪 Testing the API

### Using cURL

**Register:**
```bash
curl -X POST http://your-alb-url/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'
```

**Login:**
```bash
curl -X POST http://your-alb-url/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'
```

**Upload File:**
```bash
curl -X POST http://your-alb-url/api/file/upload \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"filename":"test.txt","fileData":"SGVsbG8gV29ybGQ="}'
```

---

## 📊 Monitoring & Logs

### Application Logs
- **App Tier:** Check Node.js console output or `/var/log/app-tier.log`
- **Web Tier:** Check NGINX logs at `/var/log/nginx/access.log` and `/var/log/nginx/error.log`

### CloudWatch Metrics
Monitor the following:
- EC2 CPU utilization
- Load balancer request counts
- Database connections
- Auto-scaling events

### Health Checks
- Web Tier: `http://your-instance/health`
- App Tier: `http://your-instance:4000/health`

---

## 🐛 Troubleshooting

### Common Issues

**"Invalid credentials" on login**
- Verify username and password are correct
- Check database connection in `DbConfig.js`

**"User not found" when sharing**
- Ensure recipient username is spelled correctly
- Verify user exists in database

**CORS errors**
- Check NGINX proxy configuration
- Verify CORS is enabled in `app-tier/index.js`

**Database connection failed**
- Check RDS security group allows connections from app tier
- Verify credentials in `DbConfig.js`
- Ensure RDS endpoint is correct

**Files not uploading**
- Check file size (may exceed body-parser limit)
- Increase limit in `index.js`: `bodyParser.json({limit: '50mb'})`

---

## 📝 License

This library is licensed under the MIT-0 License. See the LICENSE file.
