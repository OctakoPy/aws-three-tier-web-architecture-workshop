
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
                    color: '#00ff41',
                    textShadow: '0 0 3px #00ff41',
                    fontFamily: 'Arial, sans-serif',
                    letterSpacing: '2px',
                    animation: 'glow 2s ease-in-out infinite alternate'
                }}>
                    Welcome to your file sharing system!
                </h1>
                <style jsx>{`
                    @keyframes glow {
                        from {
                            text-shadow: 0 0 3px #00ff41;
                        }
                        to {
                            text-shadow: 0 0 6px #00ff41;
                        }
                    }
                `}</style>
            </div>
        );
      }
    }

    export default Home;