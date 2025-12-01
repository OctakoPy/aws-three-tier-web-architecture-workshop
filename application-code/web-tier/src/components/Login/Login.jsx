import React, { Component } from 'react';
import './Login.css';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            isRegister: false,
            message: ""
        };
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleRegister = this.handleRegister.bind(this);
        this.toggleMode = this.toggleMode.bind(this);
    }

    handleInputChange(e) {
        this.setState({ [e.target.name]: e.target.value, message: "" });
    }

    toggleMode() {
        this.setState({ 
            isRegister: !this.state.isRegister, 
            message: "",
            username: "",
            password: ""
        });
    }

    handleLogin() {
        const { username, password } = this.state;
        
        if (!username || !password) {
            this.setState({ message: "Please enter username and password" });
            return;
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        };

        fetch('/api/login', requestOptions)
            .then(response => response.json())
            .then(data => {
                if (data.user) {
                    this.props.onLogin(data.user);
                } else {
                    this.setState({ message: data.message || "Login failed" });
                }
            })
            .catch(err => {
                this.setState({ message: "Error connecting to server" });
            });
    }

    handleRegister() {
        const { username, password } = this.state;
        
        if (!username || !password) {
            this.setState({ message: "Please enter username and password" });
            return;
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        };

        fetch('/api/register', requestOptions)
            .then(response => response.json())
            .then(data => {
                if (data.userId) {
                    this.setState({ 
                        message: "Account created! Please login.", 
                        isRegister: false,
                        username: "",
                        password: ""
                    });
                } else {
                    this.setState({ message: data.message || "Registration failed" });
                }
            })
            .catch(err => {
                this.setState({ message: "Error connecting to server" });
            });
    }

    render() {
        const { isRegister, username, password, message } = this.state;

        return (
            <div className="login-container">
                <div className="login-box">
                    <h1>{isRegister ? "Create Account" : "Login"}</h1>
                    
                    <div className="form-group">
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={username}
                            onChange={this.handleInputChange}
                            className="form-input"
                        />
                    </div>
                    
                    <div className="form-group">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={password}
                            onChange={this.handleInputChange}
                            className="form-input"
                        />
                    </div>

                    {message && <div className="message">{message}</div>}

                    <button 
                        onClick={isRegister ? this.handleRegister : this.handleLogin}
                        className="btn-primary"
                    >
                        {isRegister ? "Register" : "Login"}
                    </button>

                    <div className="toggle-link">
                        {isRegister ? "Already have an account? " : "Don't have an account? "}
                        <span onClick={this.toggleMode} className="link">
                            {isRegister ? "Login" : "Register"}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}

export default Login;
