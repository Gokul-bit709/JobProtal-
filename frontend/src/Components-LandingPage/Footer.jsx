import React from 'react'
import "./Footer.css";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
 
export const Footer = () => {
  const navigate = useNavigate()
  
  
  const accessToken = localStorage.getItem("access");
  const userRole = localStorage.getItem("userRole");
  const isJobseeker = accessToken && userRole === "jobseeker";
  const isEmployer = accessToken && userRole === "Employer";
  const isLoggedIn = !!accessToken;
 
  // If logged in, go to path. If not, force redirect to login.
  const protectedNavigate = (path, state = {}) => {
    if (isLoggedIn) {
      navigate(path, state);
    } else {
      // Redirect to the appropriate login based on the path context
      if (path.toLowerCase().includes('Employer')) {
      navigate('/Job-portal/employer/login');
      } else {
        navigate('/Job-portal/jobseeker/login');
      }
    }
  };
 
  return (
    <footer className="footer-section">
      <div className="footer-top">
        <div className="footer-link-section">
          <h2 className="footer-logo">job portal</h2>
          <p className="tagline">Where Ambition Meets<br />Opportunity</p>
          <div>
            <i className="fab fa-linkedin-in social-icon"></i>
            <i className="fab fa-facebook-f social-icon"></i>
            <i className="fab fa-x-twitter social-icon"></i>
            <i className="fab fa-instagram social-icon"></i>
          </div>
        </div>
 
        <div className="footer-link-section">
          <h3>Quick Links</h3>
          <ul>
            <li onClick={() => navigate('/Job-portal/jobseeker/aboutus')}>About Us</li>
            <li onClick={() => navigate('/Job-portal/jobseeker/ContactUs')}>Contact Us</li>
            <li onClick={() => { navigate('/Job-portal/jobseeker/FAQ') }} >FAQs</li>
            <li onClick={() => { navigate('/Job-portal/jobseeker/Blogs') }}>Blog</li>
          </ul>
        </div>
 
 
        {(!isLoggedIn || isJobseeker) && (
          <div className="footer-link-section">
            <h3>Job Seekers</h3>
            <ul>
              <li onClick={() => protectedNavigate('/Job-portal/jobseeker/myprofile')}>Create Profile</li>
              <li onClick={() => protectedNavigate('/Job-portal/jobseeker/jobs')}>Browse Jobs</li>
              <li onClick={() => protectedNavigate('/Job-portal/jobseeker/myjobs', { state: { activeTab: 'saved' } })}>Saved Jobs</li>
              <li onClick={() => protectedNavigate('/Job-portal/jobseeker/myjobs', { state: { activeTab: 'applied' } })}> Applied Jobs </li>
            </ul>
          </div>
        )}
 
        {(!isLoggedIn || isEmployer) && (
          <div className="footer-link-section">
            <h3>Employers</h3>
            <ul>
              <li onClick={() => protectedNavigate('/Job-portal/Employer/PostJob')}>Post a Job</li>
              <li onClick={() => protectedNavigate('/Job-portal/Employer/FindTalent')}>Find Talent</li>
              <li onClick={() => protectedNavigate('/Job-portal/Employer/Dashboard')}>Employer Dashboard</li>
            </ul>
          </div>
        )}
      </div>
 
 
      <div className="footer-bottom">
        <p>&#169; 2025 JobPortal. All rights reserved.</p>
      </div>
    </footer>
  )
}
 
 