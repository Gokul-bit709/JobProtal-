import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PostAJob from '../assets/Employer/PostAJob.png';
import time from '../assets/opportunity_time.png';
import experience from '../assets/opportunity_bag.png';
import place from '../assets/opportunity_location.png';
import twitterIcon from '../assets/socials-x.png';
import linkedinIcon from '../assets/socials-linkedin.png';
import facebookIcon from '../assets/socials-facebook.png';
import starIcon from '../assets/Star_icon.png';
import './PostJobPreview.css';
import { EHeader } from './EHeader';
import { Footer } from '../Components-LandingPage/Footer';
import { useJobs } from '../JobContext';
 
export const PostJobPreview = () => {
  const { state } = useLocation();
  const { postJob, editJob, currentEmployer , companyProfile} = useJobs();
  const navigate = useNavigate();
  const { id } = useParams();
  const [step, setStep] = useState('preview');
 
  const getSelectedLabels = (val) => {
    if (!val) return [];
    if (typeof val === 'object' && !Array.isArray(val)) {
      return Object.keys(val)
        .filter(key => val[key])
        .map(key => key.charAt(0).toUpperCase() + key.slice(1));
    }
    if (Array.isArray(val)) return val;
    return [val];
  };
 
  const formatDisplay = (val) => {
    const labels = getSelectedLabels(val);
    return labels.length > 0 ? labels.join(', ') : 'Not specified';
  };
 
  const job = state ? {
    job_title: state.job_title,
    company: currentEmployer?.company || "Company",
    companyId: currentEmployer?.companyId,
    ratings: 4.2,
    reviewNo: 100,
    // logo: "",
    logo:currentEmployer?.logo,
    work_duration: state.work_duration,
    salary: state.salary,
    experience: state.experience,
    location: state.location,
    shift: formatDisplay(state.shift),
    work_type: state.work_type,
    job_category: state.job_category,
    posted: new Date().toISOString(),
    openings: state.openings,
    applicants: 0,
    job_highlights: state.job_highlights,
    responsibilities: state.responsibilities,
    key_skills: state.key_skills,
    industry_type: state.industry_type,
    department: state.department,
    education: state.education,
    job_description: state.job_description,
    companyOverview:currentEmployer.companyOverview,
  } : null;
 
  console.log('Job preview data:', job);
 
  // const handleFinalPost = () => {
  //   setStep('loading');
 
  //   setTimeout(() => {
  //     try {
  //       if (state.id) {
  //         editJob(state.id, state);
  //       } else {
  //         postJob(state);
  //       }
 
  //       setStep('success');
  //       setTimeout(() => {
  //         navigate('/Job-portal/Employer/Dashboard');
  //       }, 2000);
 
  //     } catch (error) {
  //       console.error("Failed to post job:", error);
  //       setStep('preview');
  //       alert("Something went wrong while posting the job. Please try again.");
  //     }
  //   }, 1000);
  // };
 
const handleFinalPost = () => {
  setStep('loading');

  setTimeout(() => {
    try {

      const formattedData = {
        ...state,

        // ✅ ARRAY FIELDS
        industry_type: Array.isArray(state.industry_type)
          ? state.industry_type
          : state.industry_type ? [state.industry_type] : [],

        department: Array.isArray(state.department)
          ? state.department
          : state.department ? [state.department] : [],

        education: Array.isArray(state.education)
          ? state.education
          : state.education ? [state.education] : [],

        key_skills: Array.isArray(state.key_skills)
          ? state.key_skills
          : state.key_skills?.split(',').map(s => s.trim()),

        job_highlights: Array.isArray(state.job_highlights)
          ? state.job_highlights
          : state.job_highlights?.split(',').map(h => h.trim()),

        responsibilities: Array.isArray(state.responsibilities)
          ? state.responsibilities
          : state.responsibilities?.split(',').map(r => r.trim()),

        //  STRING FIELD (IMPORTANT FIX)
        shift: Array.isArray(state.shift)
          ? state.shift[0]   //  ONLY FIRST VALUE
          : state.shift
      };

      console.log("🚀 FINAL DATA:", formattedData);

      if (state.id) {
        editJob(state.id, formattedData);
      } else {
        postJob(formattedData);
      }

      setStep('success');
      setTimeout(() => {
        navigate('/Job-portal/Employer/Dashboard');
      }, 2000);

    } catch (error) {
      console.error("Failed to post job:", error);
      setStep('preview');
    }
  }, 1000);
};

  if (!state || !job) {
    return (
      <>
        <EHeader />
        <div className="jobpost-previous-error-screen" style={{ padding: "50px", textAlign: "center" }}>
          <h2>No job data found</h2>
          <button className="jobpost-previous-btn-cancel" onClick={() => navigate(-1)}>Go Back</button>
        </div>
        <Footer />
      </>
    );
  }
 
  if (step === 'loading' || step === 'success') {
    return (
      <>
        <EHeader />
        <div className="jobpost-previous-status-container">
          {step === 'loading' ? (
            <div className="jobpost-previous-success-msg">
              <div className="jobpost-previous-loader"></div>
              <p className="jobpost-previous-success-title">Posting your job...</p>
            </div>
          ) : (
            <div className="jobpost-previous-success-msg">
              <img src={PostAJob} alt="Post Success" className="jobpost-previous-success-hero-img" />
              <h2 className="jobpost-previous-success-title">Job Posted Successfully for the position</h2>
              <p className="jobpost-previous-success-subtitle">{state.job_title}</p>
            </div>
          )}
        </div>
        <Footer />
      </>
    );
  }
 
  return (
    <>
      <EHeader />
      <div className='jobpost-overview-content'>
        <div className='search-backbtn-container'>
          <button className="back-btn" onClick={() => navigate(-1)}>Back</button>
          <header className="jobpost-previous-preview-header">
            <h1>Preview Job</h1>
          </header>
        </div>
 
        <main className="jobpost-overview-main">
          <div className="jobpost-job-main">
            <div className="opp-job-main">
              <div className="opp-overview-job-card">
                <div className="Opportunities-job-header">
                  <div>
                    <h2 className="opp-topcard-job-title">{job.job_title}</h2>
                    <h5 className="Opportunities-job-company">
                      {job.company} <span className="Opportunities-divider">|</span>
                      <span className="star"><img src={starIcon} alt="star" /></span> {job.ratings}
                      <span className="Opportunities-divider">|</span>
                      <span className="opp-reviews"> {job.reviewNo} Reviews</span>
                    </h5>
                  </div>
                  {job.logo ? (<img src={job.logo} alt={job.company} className="Opportunities-job-logo" />) : (<div className="Opportunities-job-logo-placeholder">{job.company?.charAt(0).toUpperCase()}</div>)}
                </div>
 
                <div className="Opportunities-job-details">
                  <p className='Opportunities-detail-line'><img src={time} className='card-icons' alt="time" />{job.work_duration}<span className="Opportunities-divider">|</span>₹ {job.salary} Lpa</p>
                  <p className='Opportunities-detail-line'><img src={experience} className='card-icons' alt="exp" />{job.experience} years of experience</p>
                  <p className='Opportunities-detail-line'><img src={place} className='card-icons' alt="loc" />{Array.isArray(job.location) ? job.location.join(", ") : job.location}</p>
                </div>
 
                <div className='Opportunities-details-bottom'>
                  <div className="Opportunities-job-tags">
                    {getSelectedLabels(state.job_category).map((tag, index) => (
                      <span key={index} className={`Opportunities-job-tag ${tag.toLowerCase()}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="Opportunities-job-type">
                    {getSelectedLabels(state.work_type).join(', ') || 'Not specified'}
                  </div>
                </div>
 
                <hr className="Opportunities-separator" />
 
                <div className="Opportunities-job-footer">
                  <div className="Opportunities-job-meta1">
                    <p>Just Now <span className="Opportunities-divider">|</span> Openings: {job.openings} <span className="Opportunities-divider">|</span> Applicants: {job.applicants}</p>
                  </div>
                </div>
              </div>
            </div>
 
            <div className="opp-job-details-card">
              <div className="opp-job-highlights">
                <h4>Job highlights</h4>
                <ul>
                  {job.job_highlights?.filter(h => h && h.trim() !== "").map((highlight, i) => (
                    <li key={i}>{highlight}</li>
                  ))}
                  {(!job.job_highlights || job.job_highlights.length === 0 || job.job_highlights[0] === "") && <li>No specific highlights added.</li>}
                </ul>
              </div>
 
              <div className="jobpost-previous-section-block">
                <h4>Company Overview {job.company}</h4>
                <p className="jobpost-previous-description-text">
                  {job.companyOverview || "No company overview available."}
                </p>
              </div>
 
              <div className="jobpost-previous-section-block">
                <h4>Job description</h4>
                <p className="jobpost-previous-description-text">{state.job_description || "No description provided."}</p>
              </div>
 
              <div className="jobpost-previous-section-block">
                <h4>Responsibilities</h4>
                <ul className="jobpost-previous-description-list">
                  {job.responsibilities?.filter(r => r && r.trim() !== "").map((res, i) => (
                    <li key={i}>{res}</li>
                  ))}
                  {(!job.responsibilities || job.responsibilities.length === 0 || job.responsibilities[0] === "") && <li>Refer to job description.</li>}
                </ul>
              </div>
 
              <h4>Key Details:</h4>
 
              <div className="jobpost-previous-meta-info-grid">
                <p><strong>Role:</strong> {formatDisplay(job.job_title)}</p>
                <p><strong>Industry Type:</strong> {formatDisplay(state.industry_type)}</p>
                <p><strong>Department:</strong> {formatDisplay(state.department)}</p>
                <p><strong>Job Type:</strong> {formatDisplay(job.work_type)}</p>
                <p><strong>Experience level:</strong> {job.experience} years</p>
                <p><strong>Location:</strong> {Array.isArray(job.location) ? job.location.join(", ") : job.location}</p>
                <p><strong>Shift:</strong> {job.shift}</p>
                <p><strong>Education:</strong> {formatDisplay(state.education)}</p>
              </div>
 
              <div className="jobpost-previous-skills-section">
                <h4>Key Skills</h4>
                <div className="jobpost-previous-skills-container">
                  {job.key_skills?.length > 0 ? (
                    job.key_skills.map((skill, i) => (
                      <span key={i} className="jobpost-previous-skill-pill">{skill}</span>
                    ))
                  ) : (
                    <span className="jobpost-previous-skill-pill">Not specified</span>
                  )}
                </div>
              </div>
 
              <div className="jobpost-previous-footer-actions">
                <div className="jobpost-previous-social-sharing">
                  <span>Share this job:</span>
                  <div className="jobpost-previous-social-icons" style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                    <img src={linkedinIcon} alt="linkedin" className="jobpost-previous-icon-in" />
                    <img src={facebookIcon} alt="facebook" className="jobpost-previous-icon-fb" />
                    <img src={twitterIcon} alt="twitter" className="jobpost-previous-icon-x" />
                  </div>
                </div>
                <div className="jobpost-previous-btn-group">
                  <button className="jobpost-previous-btn-cancel" onClick={() => navigate(-1)}>Cancel</button>
                  <button className="jobpost-previous-btn-post" onClick={handleFinalPost}>Post</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};