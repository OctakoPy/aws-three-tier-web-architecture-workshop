import React from 'react';
import { bool, object, func } from 'prop-types';
import { StyledMenu } from './Menu.styled';
import {
  Link
} from "react-router-dom";


const Menu = ({ open, user, onLogout, ...props }) => {
  
  const isHidden = open ? true : false;
  const tabIndex = isHidden ? 0 : -1;

  const handleLogoutClick = () => {
    onLogout();
  };

  return (
    <StyledMenu open={open} aria-hidden={!isHidden} {...props}>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/" tabIndex = {tabIndex} style = {{outline:"none",border:"none"}}><div style={{paddingBottom : "2em", float:"left"}}><span aria-hidden="true">🏠</span> Home</div></Link>
            </li>
            {!user && (
              <li>
                <Link to="/login" tabIndex = {tabIndex} style = {{outline:"none",border:"none"}}><div style={{paddingBottom : "2em", float:"left"}}><span aria-hidden="true">🔐</span> Login</div></Link>
              </li>
            )}
            {user && (
              <li>
                <Link to="/dashboard" tabIndex = {tabIndex} style = {{outline:"none",border:"none"}}><div style={{paddingBottom : "2em", float:"left"}}><span aria-hidden="true">📁</span> Dashboard</div></Link>
              </li>
            )}
            {user && (
              <li>
                <button 
                  onClick={handleLogoutClick} 
                  tabIndex={tabIndex} 
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '2rem',
                    textTransform: 'uppercase',
                    fontWeight: 'bold',
                    letterSpacing: '0.5rem',
                    cursor: 'pointer',
                    padding: 0,
                    outline: 'none'
                  }}
                >
                  <div style={{paddingBottom : "2em", float:"left"}}><span aria-hidden="true">🚪</span> Logout</div>
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </StyledMenu>
  );
}

Menu.propTypes = {
  open: bool.isRequired,
  user: object,
  onLogout: func,
}

export default Menu;