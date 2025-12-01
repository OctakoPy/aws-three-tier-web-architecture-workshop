
    import React, {Component} from 'react';

    class Home extends Component {
        render () {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '80vh',
                background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)'
            }}>
                <h1 style={{
                    fontSize: '3.5rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#00d4ff',
                    textShadow: `
                        0 0 5px #00d4ff,
                        0 0 10px #00d4ff,
                        0 0 15px #00d4ff,
                        0 0 20px #00d4ff,
                        0 0 35px #00d4ff,
                        0 0 40px #00d4ff
                    `,
                    fontFamily: 'Arial, sans-serif',
                    letterSpacing: '2px',
                    animation: 'glow 2s ease-in-out infinite alternate'
                }}>
                    Welcome to your file sharing system!
                </h1>
                <style jsx>{`
                    @keyframes glow {
                        from {
                            text-shadow: 
                                0 0 5px #00d4ff,
                                0 0 10px #00d4ff,
                                0 0 15px #00d4ff,
                                0 0 20px #00d4ff,
                                0 0 35px #00d4ff,
                                0 0 40px #00d4ff;
                        }
                        to {
                            text-shadow: 
                                0 0 2px #00d4ff,
                                0 0 8px #00d4ff,
                                0 0 12px #00d4ff,
                                0 0 16px #00d4ff,
                                0 0 25px #00d4ff,
                                0 0 30px #00d4ff;
                        }
                    }
                `}</style>
            </div>
        );
      }
    }

    export default Home;