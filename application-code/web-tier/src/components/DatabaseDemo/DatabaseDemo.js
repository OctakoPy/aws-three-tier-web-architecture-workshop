import React, { Component } from 'react';
import './DatabaseDemo.css';

class Dashboard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            myFiles: [],
            sharedFiles: [],
            shareFileId: null,
            shareUsername: "",
            message: ""
        };
        this.handleFileUpload = this.handleFileUpload.bind(this);
        this.handleFileDownload = this.handleFileDownload.bind(this);
        this.handleFileDelete = this.handleFileDelete.bind(this);
        this.handleShareClick = this.handleShareClick.bind(this);
        this.handleShareSubmit = this.handleShareSubmit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    componentDidMount() {
        this.loadFiles();
    }

    loadFiles() {
        const userId = this.props.user.id;

        // Load user's files
        fetch(`/api/file/list/${userId}`)
            .then(res => res.json())
            .then(data => {
                this.setState({ myFiles: data.files || [] });
            })
            .catch(console.log);

        // Load shared files
        fetch(`/api/file/shared/${userId}`)
            .then(res => res.json())
            .then(data => {
                this.setState({ sharedFiles: data.files || [] });
            })
            .catch(console.log);
    }

    handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const fileData = event.target.result;

            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.props.user.id,
                    filename: file.name,
                    fileData: fileData
                })
            };

            fetch('/api/file/upload', requestOptions)
                .then(response => response.json())
                .then(data => {
                    if (data.fileId) {
                        this.setState({ message: "File uploaded successfully!" });
                        this.loadFiles();
                    } else {
                        this.setState({ message: "Upload failed: " + data.message });
                    }
                    setTimeout(() => this.setState({ message: "" }), 3000);
                })
                .catch(err => {
                    this.setState({ message: "Error uploading file" });
                });
        };
        reader.readAsDataURL(file);
        e.target.value = null; // Reset input
    }

    handleFileDownload(fileId, filename) {
        fetch(`/api/file/download/${fileId}`)
            .then(res => res.json())
            .then(data => {
                if (data.file) {
                    // Create download link
                    const link = document.createElement('a');
                    link.href = data.file.file_data;
                    link.download = data.file.filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    this.setState({ message: "Download failed" });
                }
            })
            .catch(err => {
                this.setState({ message: "Error downloading file" });
            });
    }

    handleFileDelete(fileId) {
        if (!window.confirm("Are you sure you want to delete this file?")) return;

        fetch(`/api/file/${fileId}/${this.props.user.id}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(data => {
                this.setState({ message: "File deleted" });
                this.loadFiles();
                setTimeout(() => this.setState({ message: "" }), 3000);
            })
            .catch(err => {
                this.setState({ message: "Error deleting file" });
            });
    }

    handleShareClick(fileId) {
        this.setState({ shareFileId: fileId, shareUsername: "" });
    }

    handleShareSubmit() {
        const { shareFileId, shareUsername } = this.state;

        if (!shareUsername) {
            this.setState({ message: "Please enter a username" });
            return;
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fileId: shareFileId,
                ownerId: this.props.user.id,
                shareWithUsername: shareUsername
            })
        };

        fetch('/api/file/share', requestOptions)
            .then(res => res.json())
            .then(data => {
                if (data.message.includes('successfully')) {
                    this.setState({ 
                        message: "File shared successfully!",
                        shareFileId: null,
                        shareUsername: ""
                    });
                } else {
                    this.setState({ message: data.message });
                }
                setTimeout(() => this.setState({ message: "" }), 3000);
            })
            .catch(err => {
                this.setState({ message: "Error sharing file" });
            });
    }

    handleInputChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    renderMyFiles() {
        return this.state.myFiles.map((file) => {
            const { id, filename, upload_date } = file;
            return (
                <tr key={id}>
                    <td>{filename}</td>
                    <td>{new Date(upload_date).toLocaleDateString()}</td>
                    <td>
                        <button onClick={() => this.handleFileDownload(id, filename)} className="btn-small">
                            Download
                        </button>
                        <button onClick={() => this.handleShareClick(id)} className="btn-small">
                            Share
                        </button>
                        <button onClick={() => this.handleFileDelete(id)} className="btn-small btn-danger">
                            Delete
                        </button>
                    </td>
                </tr>
            );
        });
    }

    renderSharedFiles() {
        return this.state.sharedFiles.map((file) => {
            const { id, filename, upload_date, owner } = file;
            return (
                <tr key={id}>
                    <td>{filename}</td>
                    <td>{owner}</td>
                    <td>{new Date(upload_date).toLocaleDateString()}</td>
                    <td>
                        <button onClick={() => this.handleFileDownload(id, filename)} className="btn-small">
                            Download
                        </button>
                    </td>
                </tr>
            );
        });
    }

    render() {
        const { user, onLogout } = this.props;
        const { shareFileId, shareUsername, message } = this.state;

        return (
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h1>Welcome, {user.username}!</h1>
                    <button onClick={onLogout} className="btn-logout">Logout</button>
                </div>

                {message && <div className="message-banner">{message}</div>}

                <div className="upload-section">
                    <label className="upload-label">
                        <input 
                            type="file" 
                            onChange={this.handleFileUpload} 
                            style={{ display: 'none' }}
                        />
                        <span className="upload-btn">+ Upload File</span>
                    </label>
                </div>

                <div className="files-section">
                    <h2>My Files</h2>
                    <table className="files-table">
                        <thead>
                            <tr>
                                <th>Filename</th>
                                <th>Upload Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.myFiles.length > 0 ? this.renderMyFiles() : (
                                <tr><td colSpan="3" style={{ textAlign: 'center' }}>No files yet</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="files-section">
                    <h2>Files Shared With Me</h2>
                    <table className="files-table">
                        <thead>
                            <tr>
                                <th>Filename</th>
                                <th>Owner</th>
                                <th>Upload Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.sharedFiles.length > 0 ? this.renderSharedFiles() : (
                                <tr><td colSpan="4" style={{ textAlign: 'center' }}>No shared files</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {shareFileId && (
                    <div className="modal-overlay" onClick={() => this.setState({ shareFileId: null })}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h3>Share File</h3>
                            <input
                                type="text"
                                name="shareUsername"
                                placeholder="Enter username"
                                value={shareUsername}
                                onChange={this.handleInputChange}
                                className="share-input"
                            />
                            <div className="modal-buttons">
                                <button onClick={this.handleShareSubmit} className="btn-primary">
                                    Share
                                </button>
                                <button onClick={() => this.setState({ shareFileId: null })} className="btn-secondary">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default Dashboard;
