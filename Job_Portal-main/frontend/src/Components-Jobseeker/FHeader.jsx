import React from 'react'
import { useNavigate } from 'react-router-dom'
import './FHeader.css'
import backicon from "../assets/curved-go-back.png";

export function FHeader() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };
  return (
    <div className="header">
      <div className="logo">Job portal</div>

      <div className="Fheader-back-btn" onClick={handleBack} title="Go Back">
        <img src={backicon} alt="back" />
      </div>
    </div>
  )
}

