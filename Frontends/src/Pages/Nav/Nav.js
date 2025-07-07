//File Path >> frontend>src>Components>Nav>Nav.js

import React from 'react';
import './Nav.css';
import{Link} from "react-router-dom";

function Nav() {
  return (
    <div>
      <ul className="home-ul">
        <li className= "home-li">
                <Link to="/mainhome" className="active home-a">
            <h1>Home</h1>
                </Link>
        </li>
        <li className= "home-li">
                <Link to="/gallery" className="active home-a">
            <h1>Booking</h1>
                </Link>
        </li>
        <li className= "home-li">
                <Link to="/register" className="active home-a">
            <h1>Register</h1>
                </Link>
        </li>
        <li className= "home-li">
                <Link to="/signin" className="active home-a">
            <h1>Sign in</h1>
                </Link>
        </li>
        <li className= "home-li">
                <Link to="/userprofile" className="active home-a">
            <h1>User Profile</h1>
                </Link>
        </li>
        <li className= "home-li">
                <Link to="/admindashboard" className="active home-a">
            <h1>Admin Dashboard</h1>
                </Link>
        </li>
      </ul>
    </div>
  )
}

export default Nav