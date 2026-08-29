import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'  

const Footer = () => {
  return (
    <div className='footer' id='footer'>
      <div className="footer-content">
        <div className="footer-content-left">
            <img src={assets.logo} alt="" />
            <p> We've got you covered. Browse top-rated restaurants, track your order in real time, and enjoy fresh food delivered straight to your doorstep.</p>
            <div className="footer-social-icons"> 
              <img src={assets.facebook_icon} alt= "FB icon" />
              <img src= {assets.twitter_icon} alt=" X icon" />
              <img src= {assets.linkedin_icon} alt="Linkedin icon" />
            </div>
        </div>
        
        <div className="footer-content-center">
          <h2>COMPANY</h2>
          <ul>
            <li>Home</li>
            <li>About us</li>
            <li>Delivery</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
        <div className="footer-content-right">
          <h2>GET IN TOUCH</h2>
          <ul>
            <li>+250-788-987-687</li>
            <li>contact@chakuladel.com</li>
          </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright"> Copyright 2026 © ChakulDel.com - All Right Reserved</p>
    </div>
  )
}

export default Footer
