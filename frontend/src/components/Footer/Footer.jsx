import React from 'react'
import './Footer.css'

const Footer = () => {
  return (
    <div className='footer' id='footer'>
      <div className="footer-content">
        <div className="footer-content-left">
            <img src={assets.logo} alt="" />
            <p> We've got you covered. Browse top-rated restaurants, track your order in real time, and enjoy fresh food delivered straight to your doorstep.</p>
        </div>
        <div className="footer-content-right"></div>
        <div className="footer-content-center"></div>
      </div>
    </div>
  )
}

export default Footer
