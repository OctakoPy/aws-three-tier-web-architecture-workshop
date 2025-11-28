# File Sharing Application - AWS Three Tier Architecture

A secure, scalable file-sharing application built on AWS three-tier architecture with user authentication, file upload/download, and file sharing capabilities.

## 📋 Table of Contents
- [Features](#-features)
- [Architecture Overview](#️-architecture-overview)
- [Setup Guide](#-setup-guide)
  - [Step 1: VPC Configuration](#step-1-vpc-configuration)
  - [Step 2: Subnet Creation](#step-2-subnet-creation)
  - [Step 3: Internet Gateway & Route Tables](#step-3-internet-gateway--route-tables)
  - [Step 4: Security Groups](#step-4-security-groups)
  - [Step 5: Database Setup](#step-5-database-setup)
  - [Step 6: Application Tier Deployment](#step-6-application-tier-deployment)
  - [Step 7: Web Tier Deployment](#step-7-web-tier-deployment)
  - [Step 8: Load Balancer Configuration](#step-8-load-balancer-configuration)
- [API Documentation](#-api-documentation)
- [Database Schema](#️-database-schema)
- [Technology Stack](#️-technology-stack)
- [Project Structure](#-project-structure)
- [Security Considerations](#-security-considerations)
- [Usage Guide](#-usage-guide)
- [Testing](#-testing-the-api)
- [Monitoring & Logs](#-monitoring--logs)
- [Troubleshooting](#-troubleshooting)
- [Known Issues](#️-known-issues--problems)

---

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

## 🚀 Setup Guide

This guide documents the step-by-step process of setting up the file-sharing application on AWS.

### Prerequisites
1. AWS account with permissions for EC2, RDS, VPC, ELB, Auto Scaling, S3
2. Node.js 14+ and npm installed
3. AWS Academy Lab environment or standard AWS account
4. S3 bucket named `file-sharing-bucket12` for storing application assets
5. Understanding of AWS networking (VPC, subnets, security groups)

---

### Step 1: VPC Configuration

Create a Virtual Private Cloud to isolate your application infrastructure.

**VPC Details:**
- **IPv4 CIDR Block:** `10.0.0.0/16`
- **Region:** us-east-1
- **DNS Hostnames:** Enabled
- **DNS Resolution:** Enabled

**How to Create:**
1. Navigate to VPC Dashboard in AWS Console
2. Click "Create VPC"
3. Select "VPC only"
4. Enter CIDR block: `10.0.0.0/16`
5. Click "Create VPC"

---

### Step 2: Subnet Creation

Create 6 subnets across 2 availability zones for high availability.

**Subnet Configuration:**

| Subnet Name            | Subnet ID                | CIDR          | AZ         | Tier | Type    |
| ---------------------- | ------------------------ | ------------- | ---------- | ---- | ------- |
| Public-Web-Subnet-AZ1  | subnet-08cf1139c7978f3b3 | 10.0.1.0/24   | us-east-1a | Web  | Public  |
| Private-App-Subnet-AZ1 | subnet-0818b9d3244d1e8df | 10.0.2.0/24   | us-east-1a | App  | Private |
| Private-DB-Subnet-AZ1  | subnet-0381b1f52f14b7ac7 | 10.0.3.0/24   | us-east-1a | DB   | Private |
| Public-Web-Subnet-AZ2  | subnet-03a2e3358432a268b | 10.0.101.0/24 | us-east-1b | Web  | Public  |
| Private-App-Subnet-AZ2 | subnet-02dac064e831ff206 | 10.0.102.0/24 | us-east-1b | App  | Private |
| Private-DB-Subnet-AZ2  | subnet-0e99f649f9a486b41 | 10.0.103.0/24 | us-east-1b | DB   | Private |

**How to Create:**
1. Navigate to VPC Dashboard → Subnets
2. Click "Create subnet"
3. Select your VPC
4. For each subnet:
   - Enter subnet name
   - Select availability zone
   - Enter IPv4 CIDR block
   - Click "Add new subnet" for next one
5. Click "Create subnet"

**Subnet Purpose:**
- **Public Web Subnets:** Host web tier EC2 instances with internet access
- **Private App Subnets:** Host application tier EC2 instances (no direct internet access)
- **Private DB Subnets:** Host RDS database instances (no direct internet access)

---

### Step 3: Internet Gateway & NAT Gateway Setup

Enable internet connectivity for your VPC with an Internet Gateway and provide outbound internet access for private subnets using NAT Gateways.

#### Internet Gateway

**Internet Gateway Details:**
- **Name:** ThreeTier-IGW
- **Internet Gateway ID:** igw-xxxxxxxxxxxxxxxxx
- **Attached to VPC:** vpc-0eb2f3f126ab55220

**How to Create:**
1. Navigate to VPC Dashboard → Internet Gateways
2. Click "Create internet gateway"
3. Enter name: `ThreeTier-IGW`
4. Click "Create internet gateway"
5. Select the created IGW and click "Actions" → "Attach to VPC"
6. Select your VPC (10.0.0.0/16)
7. Click "Attach internet gateway"

![Internet Gateway Setup](application-code/images-revised/internet-gateway-setup.png)

#### Elastic IPs for NAT Gateways

Allocate Elastic IPs to ensure NAT Gateways have static public IP addresses.

**Elastic IP Configuration:**

| Name        | Allocation ID        | Purpose            |
| ----------- | -------------------- | ------------------ |
| EIP-NAT-AZ1 | eipalloc-xxxxxxxxxxx | NAT Gateway for AZ1 |
| EIP-NAT-AZ2 | eipalloc-xxxxxxxxxxx | NAT Gateway for AZ2 |

**How to Create:**
1. Navigate to VPC Dashboard → Elastic IPs
2. Click "Allocate Elastic IP address"
3. Click "Allocate"
4. Select the allocated EIP and add tag: `Name` = `EIP-NAT-AZ1`
5. Repeat for second EIP with tag: `Name` = `EIP-NAT-AZ2`

![Elastic IPs](application-code/images-revised/elastic-ips.png)

#### NAT Gateways

NAT Gateways allow instances in private subnets to access the internet while remaining private.

**NAT Gateway Configuration:**

| Name       | NAT Gateway ID       | Subnet                  | Subnet ID                | Elastic IP  | AZ         |
| ---------- | -------------------- | ----------------------- | ------------------------ | ----------- | ---------- |
| NAT-GW-AZ1 | nat-xxxxxxxxxxxxxxxxx | Public-Web-Subnet-AZ1   | subnet-08cf1139c7978f3b3 | EIP-NAT-AZ1 | us-east-1a |
| NAT-GW-AZ2 | nat-xxxxxxxxxxxxxxxxx | Public-Web-Subnet-AZ2   | subnet-03a2e3358432a268b | EIP-NAT-AZ2 | us-east-1b |

**How to Create:**
1. Navigate to VPC Dashboard → NAT Gateways
2. Click "Create NAT gateway"
3. Enter name: `NAT-GW-AZ1`
4. Select subnet: `Public-Web-Subnet-AZ1`
5. Select Elastic IP: `EIP-NAT-AZ1`
6. Click "Create NAT gateway"
7. Repeat for NAT-GW-AZ2 in Public-Web-Subnet-AZ2 with EIP-NAT-AZ2

![NAT Gateways](application-code/images-revised/nat-gateways.png)

**Purpose:**
- **Internet Gateway:** Enables bidirectional internet access for public subnets
- **NAT Gateways:** Enable outbound-only internet access for private subnets
- **Elastic IPs:** Provide static public IP addresses for NAT Gateways
- **Redundancy:** One NAT Gateway per AZ for high availability

---

### Step 4: Route Tables

Configure routing to enable internet access for public subnets and controlled outbound access for private subnets through NAT Gateways.

#### Route Table Configuration

The routing setup ensures that public subnets have internet access while private subnets remain isolated, but can still access the internet via NAT Gateways. This design follows best practices for a three-tier architecture with high availability across two availability zones.

**Public Route Table**

| Property     | Value                                           |
| ------------ | ----------------------------------------------- |
| **Name**     | Public-Route-Table                              |
| **Purpose**  | Provides internet access for web layer instances |
| **Route**    | 0.0.0.0/0 → igw-0623c5e0fe612bf17               |

**Associated Subnets:**
- Public-Web-Subnet-AZ1 (subnet-08cf1139c7978f3b3, us-east-1a)
- Public-Web-Subnet-AZ2 (subnet-03a2e3358432a268b, us-east-1b)

**Justification:** A single public route table is sufficient because all public subnets can share the same route to the IGW. This keeps the network simple and avoids unnecessary duplication.

---

**Private Route Table for AZ1**

| Property     | Value                                                    |
| ------------ | -------------------------------------------------------- |
| **Name**     | Private-Route-Table-AZ1                                  |
| **Purpose**  | Routes external traffic for app layer in AZ1             |
| **Route**    | 0.0.0.0/0 → nat-0a6a2bf5e5558c66f                        |
| **NAT GW**   | Located in Public-Web-Subnet-AZ1 (subnet-08cf1139c7978f3b3) |

**Associated Subnets:**
- Private-App-Subnet-AZ1 (subnet-0818b9d3244d1e8df, us-east-1a)

**Justification:** Each AZ has its own private route table to maintain high availability. This ensures that if one NAT Gateway fails, only the private subnets in that AZ are affected, while the other AZ continues to function.

---

**Private Route Table for AZ2**

| Property     | Value                                                    |
| ------------ | -------------------------------------------------------- |
| **Name**     | Private-Route-Table-AZ2                                  |
| **Purpose**  | Routes external traffic for app layer in AZ2             |
| **Route**    | 0.0.0.0/0 → nat-0007acb82852296f9                        |
| **NAT GW**   | Located in Public-Web-Subnet-AZ2 (subnet-03a2e3358432a268b) |

**Associated Subnets:**
- Private-App-Subnet-AZ2 (subnet-02dac064e831ff206, us-east-1b)

**Justification:** Same as AZ1 — separate NAT Gateway per AZ ensures resilience and redundancy.

---

#### How to Create

**Create Public Route Table:**
1. Navigate to VPC Dashboard → Route Tables
2. Click "Create route table"
3. Enter name: `Public-Route-Table`
4. Select VPC: vpc-0eb2f3f126ab55220
5. Click "Create route table"
6. Select the route table → Routes tab → Edit routes
7. Add route: Destination `0.0.0.0/0`, Target `igw-0623c5e0fe612bf17`
8. Subnet Associations tab → Edit subnet associations
9. Select both Public-Web-Subnet-AZ1 and Public-Web-Subnet-AZ2
10. Click "Save associations"

**Create Private Route Table for AZ1:**
1. Click "Create route table"
2. Enter name: `Private-Route-Table-AZ1`
3. Select VPC: vpc-0eb2f3f126ab55220
4. Click "Create route table"
5. Routes tab → Edit routes
6. Add route: Destination `0.0.0.0/0`, Target `nat-0a6a2bf5e5558c66f`
7. Subnet Associations tab → Edit subnet associations
8. Select Private-App-Subnet-AZ1 (subnet-0818b9d3244d1e8df)
9. Click "Save associations"

**Create Private Route Table for AZ2:**
1. Click "Create route table"
2. Enter name: `Private-Route-Table-AZ2`
3. Select VPC: vpc-0eb2f3f126ab55220
4. Click "Create route table"
5. Routes tab → Edit routes
6. Add route: Destination `0.0.0.0/0`, Target `nat-0007acb82852296f9`
7. Subnet Associations tab → Edit subnet associations
8. Select Private-App-Subnet-AZ2 (subnet-02dac064e831ff206)
9. Click "Save associations"

![Route Tables Configuration](application-code/images-revised/route-tables.png)

---

#### Verification and Status

✅ **Internet Gateway:** igw-0623c5e0fe612bf17 is attached to vpc-0eb2f3f126ab55220

✅ **Public Route Table:** Default route (0.0.0.0/0) points to the IGW; associated with both public subnets

✅ **Private Route Tables:** Default routes (0.0.0.0/0) point to their respective NAT Gateways (nat-0a6a2bf5e5558c66f for AZ1, nat-0007acb82852296f9 for AZ2)

✅ **NAT Gateways:** Both are available in correct public subnets with assigned public IPs:
   - AZ1: 98.95.12.253
   - AZ2: 18.235.73.60

✅ **Subnet Associations:** Public subnets use the public route table; private app subnets use their respective private route tables

---

#### Summary / Design Justification

- **One public route table** is sufficient because all public subnets share the same route to the IGW
- **Two private route tables** provide per-AZ NAT Gateway routing, ensuring high availability and fault isolation
- This configuration allows public-facing web servers to reach the internet directly while keeping app layer subnets private, but still allowing them to access the internet for updates or external services via NAT

---

### Step 5: Security Groups

Security groups act as virtual firewalls to control inbound and outbound traffic for AWS resources. This configuration implements defense-in-depth by layering security controls across each tier while maintaining the principle of least privilege.

#### Security Group Overview

| Security Group Name       | Purpose                                    | Protected Resources        |
| ------------------------- | ------------------------------------------ | -------------------------- |
| External-LB-SG            | Public-facing load balancer                | External ALB               |
| Web-Tier-SG               | Web tier EC2 instances                     | Web tier instances         |
| Internal-LB-SG            | Internal load balancer                     | Internal ALB               |
| Private-Instance-SG       | Application tier EC2 instances             | App tier instances         |
| Private-DB-SG             | Database tier                              | Aurora MySQL cluster       |

---

#### External Load Balancer Security Group

**Name:** External-LB-SG

**Purpose:** Protects the public-facing load balancer that serves incoming traffic from the internet.

**Inbound Rules:**

| Type | Protocol | Port | Source        | Description                     |
| ---- | -------- | ---- | ------------- | ------------------------------- |
| HTTP | TCP      | 80   | Your IP/32    | Allow HTTP from your IP         |

**Justification:** Restricting access to your IP ensures only authorized testing traffic can reach the external load balancer while keeping it reachable from the internet.

---

#### Web Tier Security Group

**Name:** Web-Tier-SG

**Purpose:** Protects EC2 instances in the public web tier.

**Inbound Rules:**

| Type | Protocol | Port | Source          | Description                           |
| ---- | -------- | ---- | --------------- | ------------------------------------- |
| HTTP | TCP      | 80   | External-LB-SG  | Allow HTTP from external load balancer |
| HTTP | TCP      | 80   | Your IP/32      | Allow HTTP from your IP for testing   |

**Justification:**
- First rule allows only the external load balancer to forward traffic to web tier instances, enforcing a controlled path
- Second rule allows you to directly test the web tier without exposing it broadly

---

#### Internal Load Balancer Security Group

**Name:** Internal-LB-SG

**Purpose:** Protects the internal load balancer used to forward traffic from the web tier to the private app tier.

**Inbound Rules:**

| Type | Protocol | Port | Source       | Description                    |
| ---- | -------- | ---- | ------------ | ------------------------------ |
| HTTP | TCP      | 80   | Web-Tier-SG  | Allow HTTP from web tier       |

**Justification:** This ensures that only authorized web tier instances can reach the internal load balancer, maintaining the isolation of the app tier from the public internet.

---

#### Private Instance Security Group

**Name:** Private-Instance-SG

**Purpose:** Protects EC2 instances in the private application tier.

**Inbound Rules:**

| Type        | Protocol | Port | Source          | Description                              |
| ----------- | -------- | ---- | --------------- | ---------------------------------------- |
| Custom TCP  | TCP      | 4000 | Internal-LB-SG  | Allow app traffic from internal LB       |
| Custom TCP  | TCP      | 4000 | Your IP/32      | Allow app traffic from your IP for testing |

**Justification:**
- First rule ensures that only the internal load balancer can communicate with app instances on the application port
- Second rule allows manual testing from your IP without compromising overall security

---

#### Private Database Security Group

**Name:** Private-DB-SG

**Purpose:** Protects private database instances.

**Inbound Rules:**

| Type         | Protocol | Port | Source              | Description                        |
| ------------ | -------- | ---- | ------------------- | ---------------------------------- |
| MySQL/Aurora | TCP      | 3306 | Private-Instance-SG | Allow database access from app tier |

**Justification:** Only application tier instances are allowed to communicate with the database, enforcing strict isolation and securing sensitive data from direct public access.

---

#### How to Create Security Groups

**Create External-LB-SG:**
1. Navigate to EC2 Dashboard → Security Groups
2. Click "Create security group"
3. Name: `External-LB-SG`
4. Description: "Security group for external load balancer"
5. VPC: Select vpc-0eb2f3f126ab55220
6. Add Inbound Rule: Type `HTTP`, Source `My IP`
7. Click "Create security group"

**Create Web-Tier-SG:**
1. Click "Create security group"
2. Name: `Web-Tier-SG`
3. Description: "Security group for web tier instances"
4. VPC: Select vpc-0eb2f3f126ab55220
5. Add Inbound Rules:
   - Type `HTTP`, Source `External-LB-SG`
   - Type `HTTP`, Source `My IP`
6. Click "Create security group"

**Create Internal-LB-SG:**
1. Click "Create security group"
2. Name: `Internal-LB-SG`
3. Description: "Security group for internal load balancer"
4. VPC: Select vpc-0eb2f3f126ab55220
5. Add Inbound Rule: Type `HTTP`, Source `Web-Tier-SG`
6. Click "Create security group"

**Create Private-Instance-SG:**
1. Click "Create security group"
2. Name: `Private-Instance-SG`
3. Description: "Security group for app tier instances"
4. VPC: Select vpc-0eb2f3f126ab55220
5. Add Inbound Rules:
   - Type `Custom TCP`, Port `4000`, Source `Internal-LB-SG`
   - Type `Custom TCP`, Port `4000`, Source `My IP`
6. Click "Create security group"

**Create Private-DB-SG:**
1. Click "Create security group"
2. Name: `Private-DB-SG`
3. Description: "Security group for database tier"
4. VPC: Select vpc-0eb2f3f126ab55220
5. Add Inbound Rule: Type `MySQL/Aurora`, Source `Private-Instance-SG`
6. Click "Create security group"

![Security Groups Configuration](application-code/images-revised/security-groups.png)

---

#### Traffic Flow Summary

```
Internet → External-LB-SG (port 80) → Web-Tier-SG (port 80) → Internal-LB-SG (port 80) → Private-Instance-SG (port 4000) → Private-DB-SG (port 3306)
```

This layered approach ensures:
- **Defense in depth:** Multiple security layers protect each tier
- **Least privilege:** Each component can only communicate with its immediate neighbors
- **Isolation:** Database tier is completely isolated from public internet
- **Controlled testing:** Your IP has limited access for testing without compromising security

---

### Step 6: Database Setup

*(To be documented as you progress)*

---

### Step 5: Database Setup

*(To be documented as you progress)*

**Database Configuration:**
- Run the `DATABASE_SETUP.sql` script to create tables
- Configure `app-tier/DbConfig.js` with RDS credentials

---

### Step 6: Application Tier Deployment

*(To be documented as you progress)*

**Configuration:**
```bash
cd application-code/app-tier
npm install
node index.js
```

---

### Step 7: Web Tier Deployment

*(To be documented as you progress)*

**Configuration:**
```bash
cd application-code/web-tier
npm install
npm run build
```

---

### Step 8: Load Balancer Configuration

*(To be documented as you progress)*

Update `nginx.conf` with internal load balancer DNS

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
- **AWS S3** - Object storage (`file-sharing-bucket12`)

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

## ⚠️ Known Issues & Problems

### Lab Environment Limitations

**Problem: Cannot create IAM roles in AWS Academy Lab**
- AWS Academy lab environment restricts IAM role creation permissions

---

## 📝 License

This library is licensed under the MIT-0 License. See the LICENSE file.
