// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom"; 
// import UserIcon from "../assets/Employer/User.png";
// import { useJobs } from "../JobContext";
// import "./ViewApplicants.css";

// export const ViewApplicants = ({ job }) => {
//   const { Alluser, updateApplicantStatus, addChatToSidebar } = useJobs();
//   const [viewMode, setViewMode] = useState("list");
//   const [selectedUser, setSelectedUser] = useState(null);
//   const navigate = useNavigate();

//   const statusOptions = [
//     "Application Submitted",
//     "Resume Screening",
//     "Recruiter Review",
//     "Shortlisted",
//     "Interview Called",
//     "Rejected"
//   ];

//   const applicantsForThisJob = Alluser.filter(user => 
//     user.appliedJobs?.some(aj => aj.id === job?.id)
//   );


//   const calculateJobStats = () => {
//     const getCount = (statusName) => {
//       return applicantsForThisJob.filter(user => {
//         const jobInfo = user.appliedJobs.find(aj => aj.id === job?.id);
//         return jobInfo?.status === statusName;
//       }).length;
//     };

//     return {
//       total: applicantsForThisJob.length,
//       shortlisted: getCount("Shortlisted"),
//       rejected: getCount("Rejected")
//     };
//   };

//   const stats = calculateJobStats();

//   const handleStatusChange = (userId, newStatus) => {
//     updateApplicantStatus(userId, job?.id, newStatus);
//     if (selectedUser) {
//       setSelectedUser(prev => ({ ...prev, status: newStatus }));
//     }
//   };

//   const handleMessageUser = (userId) => {
//     addChatToSidebar(userId); 
//     navigate(`/Job-portal/employer-chat/${userId}`); 
//   };

//   const handleViewDetails = (user) => {
//     const jobSpecificInfo = user.appliedJobs?.find(aj => aj.id === job?.id);
//     setSelectedUser({ 
//       ...user, 
//       status: jobSpecificInfo?.status || "Application Submitted" 
//     });
//     setViewMode("detail");
//   };

//   const handleBack = () => {
//     setViewMode("list");
//     setSelectedUser(null);
//   };

//   const getStatusClass = (status) => {
//     const s = status?.toLowerCase() || 'pending';
//     if (s === 'application submitted') return 'status-submitted';
//     if (s === 'resume screening') return 'status-screening';
//     if (s === 'recruiter review') return 'status-review';
//     if (s === 'shortlisted') return 'status-shortlisted';
//     if (s === 'interview called') return 'status-interview';
//     if (s === 'rejected') return 'status-rejected';
//     return 'status-pending';
//   };

//   // --- TABLE VIEW ---
//   if (viewMode === "list") {
//     return (
//       <div className="view-applicants-page">
//         <div className="main-card">
//           <div className="header-section">
//             <div className="title-group">
//               <h2>Applicants for {job?.jobTitle}</h2>
//               <p className="subtitle">{stats.total} Total Jobseekers applied</p>
//             </div>
//             {/* Optional: Add status badges here if needed */}
//           </div>

//           <table className="applicants-table">
//             <thead>
//               <tr>
//                 <th>Candidate</th>
//                 <th>Experience</th>
//                 <th>Status for this Job</th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {applicantsForThisJob.length > 0 ? (
//                 applicantsForThisJob.map((user) => {
//                   const currentJobStatus = user.appliedJobs?.find(aj => aj.id === job?.id)?.status;
//                   return (
//                     <tr key={user.id}>
//                       <td className="candidate-cell">
//                         <img src={UserIcon} alt="avatar" className="table-avatar" />
//                         <div className="name-stack">
//                           <span className="name">{user.profile?.fullName || "N/A"}</span>
//                           <span className="designation">{user.currentDetails?.jobTitle}</span>
//                         </div>
//                       </td>
//                       <td>{user.currentDetails?.experience}</td>
//                       <td>
//                         <span className={`status-pill ${getStatusClass(currentJobStatus)}`}>
//                           {currentJobStatus || "Application Submitted"}
//                         </span>
//                       </td>
//                       <td>
//                         <button className="view-link-btn" onClick={() => handleViewDetails(user)}>
//                           View Application
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })
//               ) : (
//                 <tr>
//                   <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
//                     No one has applied for this job yet.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     );
//   }

//   // --- DETAIL VIEW ---
//   return (
//     <div className="view-applicants-page detail-view">
//       <div className="detail-container">
//         <div className="detail-header">
//           <button className="back-btn" onClick={handleBack}> Back to Application</button>

//           <div className="header-actions">
//             <div className="status-selector-container">
//               <span>Update Stage: </span>
//               <select 
//                 className="status-dropdown-box"
//                 value={selectedUser.status}
//                 onChange={(e) => handleStatusChange(selectedUser.id, e.target.value)}
//               >
//                 {statusOptions.map((option, index) => (
//                   <option key={index} value={option}>{option}</option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>

//         <div className="detail-layout">
//           <div className="detail-left">
//             <div className="profile-main-card">
//               <img src={UserIcon} alt="Profile" className="detail-avatar" />
//               <h3>{selectedUser.profile?.fullName}</h3>
//               <p className="role-tag">{selectedUser.currentDetails?.jobTitle}</p>

//               <div className="quick-info-list">
//                 <p><strong>Experience:</strong> {selectedUser.currentDetails?.experience}</p>
//                 <p><strong>Education:</strong> {selectedUser.education?.highestQual}</p>
//                 <p><strong>Current Loc:</strong> {selectedUser.currentDetails?.currentLocation}</p>
//               </div>

//               <div className="status-badge-container">
//                  <p className="status-label">Application Stage:</p>
//                  <span className={`status-pill large ${getStatusClass(selectedUser.status)}`}>
//                     {selectedUser.status}
//                  </span>
//               </div>
//             </div>
//           </div>

//           <div className="detail-right">
//   <div className="tabs-bar">
//     <span className="tab active">Profile Overview</span>
//   </div>

//   <div className="tab-pane">
//     {/* Skills Section */}
//     <div className="info-section">
//       <h4>Skills</h4>
//       <div className="skill-pills">
//         {selectedUser.skills?.map((skill, i) => (
//           <span key={i} className="skill-tag">{skill}</span>
//         ))}
//       </div>
//     </div>

//     {/* Resume & Documents Section */}
//     <div className="info-section document-section">
//       <h4>Resume & Documents</h4>
//       <div className="resume-card">
//         <div className="resume-info">
//           <div className="file-details">
//             <p className="file-name">{selectedUser.profile?.fullName}_Resume.pdf</p>
//             <p className="file-size">{selectedUser.resume?.size || "1.2 MB"}</p>
//           </div>
//         </div>
//         <button className="download-btn" onClick={() => alert("Downloading Resume...")}>
//           Download Resume
//         </button>
//       </div>
//     </div>

//     {/* Cover Letter Section */}
//     <div className="info-section">
//       <h4>Cover Letter / Experience Summary</h4>
//       <div className="cover-letter-box">
//         <p>
//           {selectedUser.experience?.entries?.[0]?.responsibilities || 
//            "Dear Hiring Manager, I am highly interested in this position and believe my skills align with your requirements. I have a strong foundation in the required technologies and I am eager to contribute to your team."}
//         </p>
//       </div>
//     </div>

//     {/* Education Summary */}
//     <div className="info-section">
//       <h4>Education</h4>
//       <div className="edu-item">
//         <p><strong>{selectedUser.education?.highestQual}</strong></p>
//         <p className="sub-text">{selectedUser.education?.graduations?.[0]?.college} | {selectedUser.education?.graduations?.[0]?.endYear}</p>
//       </div>
//     </div>
//   </div>
// </div>
//         </div>

//         <div className="message-action-footer">
//             <button className="btn-message-center" onClick={() => handleMessageUser(selectedUser.id)}>
//                 Send Message to {selectedUser.profile?.fullName.split(' ')[0]}
//             </button>
//         </div>
//       </div>
//     </div>
//   );
// };   



// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom"; 
// import UserIcon from "../assets/Employer/User.png";
// import { useJobs } from "../JobContext";
// import api from "../api/axios";
// import "./ViewApplicants.css";

// export const ViewApplicants = ({ job, onBack }) => {
//   const { updateApplicantStatus, addChatToSidebar } = useJobs();
//   const [viewMode, setViewMode] = useState("list");
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [applications, setApplications] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   // ✅ USE URL 1: Fetch applications for this job
//   useEffect(() => {
//     const fetchApplications = async () => {
//       try {
//         console.log("Fetching applications for job:", job?.id);

//         // Get all applications for employer
//         const response = await api.get('jobs/applications/');
//         console.log("All applications:", response.data);

//         // Filter applications for current job
//         const jobApplications = response.data.filter(
//           app => app.job.id === job?.id
//         );

//         console.log("Filtered applications for this job:", jobApplications);
//         setApplications(jobApplications);
//       } catch (error) {
//         console.error("Error fetching applications:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (job?.id) {
//       fetchApplications();
//     }
//   }, [job]);

//   const statusOptions = [
//     "applied",
//     "resume_screening",
//     "recruiter_review",
//     "shortlisted",
//     "interview_called",
//     "offered",
//     "rejected",
//     "hired"
//   ];

//   const statusLabels = {
//     "applied": "Application Submitted",
//     "resume_screening": "Resume Screening",
//     "recruiter_review": "Recruiter Review",
//     "shortlisted": "Shortlisted",
//     "interview_called": "Interview Called",
//     "offered": "Offered",
//     "rejected": "Rejected",
//     "hired": "Hired"
//   };

//   const calculateJobStats = () => {
//     const getCount = (statusName) => {
//       return applications.filter(app => app.status === statusName).length;
//     };

//     return {
//       total: applications.length,
//       shortlisted: getCount("shortlisted"),
//       rejected: getCount("rejected"),
//       interview: getCount("interview_called"),
//       screening: getCount("resume_screening")
//     };
//   };

//   const stats = calculateJobStats();

//   //  USE URL 2: Update application status
//   const handleStatusChange = async (applicationId, newStatus) => {
//     try {
//       console.log("Updating status for application:", applicationId, "to:", newStatus);

//       const response = await api.patch(`jobs/applications/${applicationId}/status/`, {
//         status: newStatus
//       });

//       console.log("Status updated:", response.data);

//       // Update local state
//       setApplications(prev => prev.map(app => 
//         app.id === applicationId ? { ...app, status: newStatus } : app
//       ));

//       if (selectedUser) {
//         setSelectedUser(prev => ({ ...prev, status: newStatus }));
//       }

//     } catch (error) {
//       console.error("Error updating status:", error);
//       alert("Failed to update status");
//     }
//   };

//   const handleMessageUser = (userId) => {
//     addChatToSidebar(userId); 
//     navigate(`/Job-portal/employer-chat/${userId}`); 
//   };

//   const handleViewDetails = (application) => {
//     setSelectedUser(application);
//     setViewMode("detail");
//   };

//   const handleBack = () => {
//     setViewMode("list");
//     setSelectedUser(null);
//     if (onBack) onBack();
//   };

//   const getStatusClass = (status) => {
//     const s = status?.toLowerCase() || 'pending';
//     if (s === 'applied') return 'status-submitted';
//     if (s === 'resume_screening') return 'status-screening';
//     if (s === 'recruiter_review') return 'status-review';
//     if (s === 'shortlisted') return 'status-shortlisted';
//     if (s === 'interview_called') return 'status-interview';
//     if (s === 'offered') return 'status-offered';
//     if (s === 'rejected') return 'status-rejected';
//     if (s === 'hired') return 'status-hired';
//     return 'status-pending';
//   };

//   if (loading) {
//     return (
//       <div className="view-applicants-page">
//         <div className="main-card">
//           <div style={{ textAlign: "center", padding: "40px" }}>
//             Loading applicants...
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // --- TABLE VIEW ---
//   if (viewMode === "list") {
//     return (
//       <div className="view-applicants-page">
//         <div className="main-card">
//           <div className="header-section">
//             <div className="title-group">
//               <button className="back-btn" onClick={handleBack}>← Back</button>
//               <h2>Applicants for {job?.jobTitle || job?.title}</h2>
//               <p className="subtitle">{stats.total} Total Applicants | 
//                 Shortlisted: {stats.shortlisted} | 
//                 Interview: {stats.interview} | 
//                 Rejected: {stats.rejected}
//               </p>
//             </div>
//           </div>

//           <table className="applicants-table">
//             <thead>
//               <tr>
//                 <th>Candidate</th>
//                 <th>Applied Date</th>
//                 <th>Status</th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {applications.length > 0 ? (
//                 applications.map((app) => (
//                   <tr key={app.id}>
//                     <td className="candidate-cell">
//                       <img src={UserIcon} alt="avatar" className="table-avatar" />
//                       <div className="name-stack">
//                         <span className="name">{app.user?.username || "N/A"}</span>
//                         <span className="designation">{app.user?.email}</span>
//                       </div>
//                     </td>
//                     <td>{new Date(app.applied_date).toLocaleDateString()}</td>
//                     <td>
//                       <span className={`status-pill ${getStatusClass(app.status)}`}>
//                         {statusLabels[app.status] || app.status}
//                       </span>
//                     </td>
//                     <td>
//                       <button className="view-link-btn" onClick={() => handleViewDetails(app)}>
//                         View Application
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
//                     No one has applied for this job yet.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     );
//   }

//   // --- DETAIL VIEW ---
//   return (
//     <div className="view-applicants-page detail-view">
//       <div className="detail-container">
//         <div className="detail-header">
//           <button className="back-btn" onClick={handleBack}>← Back to Applications</button>

//           <div className="header-actions">
//             <div className="status-selector-container">
//               <span>Update Stage: </span>
//               <select 
//                 className="status-dropdown-box"
//                 value={selectedUser?.status || "applied"}
//                 onChange={(e) => handleStatusChange(selectedUser.id, e.target.value)}
//               >
//                 {statusOptions.map((option) => (
//                   <option key={option} value={option}>
//                     {statusLabels[option]}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>

//         <div className="detail-layout">
//           <div className="detail-left">
//             <div className="profile-main-card">
//               <img src={UserIcon} alt="Profile" className="detail-avatar" />
//               <h3>{selectedUser?.user?.username}</h3>
//               <p className="role-tag">{selectedUser?.user?.email}</p>

//               <div className="quick-info-list">
//                 <p><strong>Applied Date:</strong> {new Date(selectedUser?.applied_date).toLocaleDateString()}</p>
//                 <p><strong>Status:</strong> {statusLabels[selectedUser?.status]}</p>
//               </div>

//               <div className="status-badge-container">
//                 <span className={`status-pill large ${getStatusClass(selectedUser?.status)}`}>
//                   {statusLabels[selectedUser?.status]}
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className="detail-right">
//             <div className="tabs-bar">
//               <span className="tab active">Application Details</span>
//             </div>

//             <div className="tab-pane">
//               {/* Cover Letter Section */}
//               <div className="info-section">
//                 <h4>Cover Letter</h4>
//                 <div className="cover-letter-box">
//                   <p>{selectedUser?.cover_letter || "No cover letter provided."}</p>
//                 </div>
//               </div>

//               {/* Resume Section */}
//               <div className="info-section document-section">
//                 <h4>Resume</h4>
//                 <div className="resume-card">
//                   <div className="resume-info">
//                     <div className="file-details">
//                       <p className="file-name">Resume_{selectedUser?.user?.username}.pdf</p>
//                     </div>
//                   </div>
//                   {selectedUser?.resume_version && (
//                     <a 
//                       href={selectedUser.resume_version} 
//                       target="_blank" 
//                       rel="noopener noreferrer"
//                       className="download-btn"
//                     >
//                       Download Resume
//                     </a>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="message-action-footer">
//           <button className="btn-message-center" onClick={() => handleMessageUser(selectedUser?.user?.id)}>
//             Send Message to Candidate
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };   


// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import UserIcon from "../assets/Employer/User.png";
// import { useJobs } from "../JobContext";
// import api from "../api/axios";
// import "./ViewApplicants.css";

// export const ViewApplicants = ({ job, onBack }) => {
//   const {
//     updateApplicantStatus,
//     addChatToSidebar,
//     Alluser
//   } = useJobs();

//   const [viewMode, setViewMode] = useState("list");
//   const [selectedApplication, setSelectedApplication] = useState(null);
//   const [applications, setApplications] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [jobseekerProfile, setJobseekerProfile] = useState(null);
//   const navigate = useNavigate();

//   // Fetch applications for this job
//   useEffect(() => {
//     const fetchApplications = async () => {
//       try {
//         console.log("Fetching applications for job:", job?.id);

//         const response = await api.get('jobs/applications/');
//         console.log("All applications:", response.data);

//         const jobApplications = response.data.filter(
//           app => app.job.id === job?.id
//         );

//         console.log("Filtered applications for this job:", jobApplications);
//         setApplications(jobApplications);
//       } catch (error) {
//         console.error("Error fetching applications:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (job?.id) {
//       fetchApplications();
//     }
//   }, [job]);

//   // Fetch full application details (includes resume_version)
//   const fetchFullApplicationDetails = async (applicationId) => {
//     try {
//       console.log("Fetching full application details for ID:", applicationId);
//       const response = await api.get(`jobs/applications/${applicationId}/`);
//       console.log("Full application details:", response.data);
//       console.log("Resume version URL:", response.data.resume_version);
//       return response.data;
//     } catch (error) {
//       console.error("Error fetching full application details:", error);
//       return null;
//     }
//   };

//   const statusOptions = [
//     "applied",
//     "resume_screening",
//     "recruiter_review",
//     "shortlisted",
//     "interview_called",
//     "offered",
//     "rejected",
//     "hired"
//   ];

//   const statusLabels = {
//     "applied": "Application Submitted",
//     "resume_screening": "Resume Screening",
//     "recruiter_review": "Recruiter Review",
//     "shortlisted": "Shortlisted",
//     "interview_called": "Interview Called",
//     "offered": "Offered",
//     "rejected": "Rejected",
//     "hired": "Hired"
//   };

//   const calculateJobStats = () => {
//     const getCount = (statusName) => {
//       return applications.filter(app => app.status === statusName).length;
//     };

//     return {
//       total: applications.length,
//       shortlisted: getCount("shortlisted"),
//       rejected: getCount("rejected"),
//       interview: getCount("interview_called"),
//       screening: getCount("resume_screening")
//     };
//   };

//   const stats = calculateJobStats();

//   const handleStatusChange = async (applicationId, newStatus) => {
//     try {
//       console.log("Updating status for application:", applicationId, "to:", newStatus);

//       const response = await api.patch(`jobs/applications/${applicationId}/status/`, {
//         status: newStatus
//       });

//       console.log("Status updated:", response.data);

//       setApplications(prev => prev.map(app =>
//         app.id === applicationId ? { ...app, status: newStatus } : app
//       ));

//       if (selectedApplication) {
//         setSelectedApplication(prev => ({ ...prev, status: newStatus }));
//       }

//     } catch (error) {
//       console.error("Error updating status:", error);
//       alert("Failed to update status");
//     }
//   };

//   const handleMessageUser = (userId) => {
//     addChatToSidebar(userId);
//     navigate(`/Job-portal/employer-chat/${userId}`);
//   };

//   // Handle view details - fetches full application with resume
//   const handleViewDetails = async (application) => {
//     console.log("Viewing details for application:", application);

//     // Step 1: Fetch full application details (includes resume_version)
//     const fullApplication = await fetchFullApplicationDetails(application.id);

//     if (fullApplication) {
//       console.log("Full application loaded with resume:", fullApplication.resume_version);
//       console.log("=== RESUME DEBUG ===");
//       console.log("Full application data:", fullApplication);
//       console.log("resume_version field:", fullApplication.resume_version);
//       console.log("resume_version type:", typeof fullApplication.resume_version);
//       console.log("resume_version value:", JSON.stringify(fullApplication.resume_version));

//       setSelectedApplication(fullApplication);
//     } else {
//       setSelectedApplication(application);
//     }

//     // Step 2: Find jobseeker profile from Alluser (for skills, education, etc.)
//     const jobseeker = Alluser.find(user => user.id === application.user.id);

//     if (jobseeker) {
//       console.log("Jobseeker profile found in Alluser:", jobseeker);
//       console.log("Skills:", jobseeker.skills);
//       console.log("Education:", jobseeker.educations);
//       setJobseekerProfile(jobseeker);
//     } else {
//       // Fallback: create basic profile
//       console.log("Jobseeker not found in Alluser, using fallback");
//       setJobseekerProfile({
//         id: application.user.id,
//         full_name: application.user.username,
//         email: application.user.email,
//         current_job_title: "",
//         total_experience_years: 0,
//         current_location: "",
//         skills: [],
//         educations: [],
//         resume_file: null
//       });
//     }

//     setViewMode("detail");
//   };

//   const handleBack = () => {
//     setViewMode("list");
//     setSelectedApplication(null);
//     setJobseekerProfile(null);
//     if (onBack) onBack();
//   };

//   const getStatusClass = (status) => {
//     const s = status?.toLowerCase() || 'pending';
//     if (s === 'applied') return 'status-submitted';
//     if (s === 'resume_screening') return 'status-screening';
//     if (s === 'recruiter_review') return 'status-review';
//     if (s === 'shortlisted') return 'status-shortlisted';
//     if (s === 'interview_called') return 'status-interview';
//     if (s === 'offered') return 'status-offered';
//     if (s === 'rejected') return 'status-rejected';
//     if (s === 'hired') return 'status-hired';
//     return 'status-pending';
//   };

//   if (loading) {
//     return (
//       <div className="view-applicants-page">
//         <div className="main-card">
//           <div style={{ textAlign: "center", padding: "40px" }}>
//             Loading applicants...
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // --- TABLE VIEW ---
//   if (viewMode === "list") {
//     return (
//       <div className="view-applicants-page">
//         <div className="main-card">
//           <div className="header-section">
//             <div className="title-group">
//               <button className="back-btn" onClick={handleBack}>← Back</button>
//               <h2>Applicants for {job?.jobTitle || job?.title}</h2>
//               <p className="subtitle">
//                 {stats.total} Total Applicants |
//                 Shortlisted: {stats.shortlisted} |
//                 Interview: {stats.interview} |
//                 Rejected: {stats.rejected}
//               </p>
//             </div>
//           </div>

//           <table className="applicants-table">
//             <thead>
//               <tr>
//                 <th>Candidate</th>
//                 <th>Applied Date</th>
//                 <th>Status</th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {applications.length > 0 ? (
//                 applications.map((app) => (
//                   <tr key={app.id}>
//                     <td className="candidate-cell">
//                       <img src={UserIcon} alt="avatar" className="table-avatar" />
//                       <div className="name-stack">
//                         <span className="name">{app.user?.username || "N/A"}</span>
//                         <span className="designation">{app.user?.email}</span>
//                       </div>
//                     </td>
//                     <td>{new Date(app.applied_date).toLocaleDateString()}</td>
//                     <td>
//                       <span className={`status-pill ${getStatusClass(app.status)}`}>
//                         {statusLabels[app.status] || app.status}
//                       </span>
//                     </td>
//                     <td>
//                       <button className="view-link-btn" onClick={() => handleViewDetails(app)}>
//                         View Application
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
//                     No one has applied for this job yet.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     );
//   }

//   // --- DETAIL VIEW ---
//   return (
//     <div className="view-applicants-page detail-view">
//       <div className="detail-container">
//         <div className="detail-header">
//           <button className="back-btn" onClick={handleBack}>← Back to Applications</button>

//           <div className="header-actions">
//             <div className="status-selector-container">
//               <span>Update Stage: </span>
//               <select
//                 className="status-dropdown-box"
//                 value={selectedApplication?.status || "applied"}
//                 onChange={(e) => handleStatusChange(selectedApplication.id, e.target.value)}
//               >
//                 {statusOptions.map((option) => (
//                   <option key={option} value={option}>
//                     {statusLabels[option]}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>

//         <div className="detail-layout">
//           {/* LEFT COLUMN - Profile Card */}
//           <div className="detail-left">
//             <div className="profile-main-card">
//               <img src={UserIcon} alt="Profile" className="detail-avatar" />
//               <h3>{jobseekerProfile?.full_name || selectedApplication?.user?.username}</h3>
//               <p className="role-tag">
//                 {jobseekerProfile?.current_job_title || "Job Seeker"}
//               </p>

//               <div className="quick-info-list">
//                 <p>
//                   <strong>Experience:</strong>{" "}
//                   {jobseekerProfile?.total_experience_years
//                     ? `${jobseekerProfile.total_experience_years} Years`
//                     : "Fresher"}
//                 </p>
//                 <p>
//                   <strong>Education:</strong>{" "}
//                   {jobseekerProfile?.educations?.[0]?.qualification_level || "Bachelor's Degree"}
//                 </p>
//                 <p>
//                   <strong>Current Loc:</strong>{" "}
//                   {jobseekerProfile?.current_location || "Not specified"}
//                 </p>
//               </div>

//               <div className="status-badge-container">
//                 <p className="status-label">Application Stage:</p>
//                 <span className={`status-pill large ${getStatusClass(selectedApplication?.status)}`}>
//                   {statusLabels[selectedApplication?.status]}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* RIGHT COLUMN - Detailed Info */}
//           <div className="detail-right">
//             <div className="tabs-bar">
//               <span className="tab active">Profile Overview</span>
//             </div>

//             <div className="tab-pane">
//               {/* Skills Section */}
//               <div className="info-section">
//                 <h4>Skills</h4>
//                 <div className="skill-pills">
//                   {jobseekerProfile?.skills?.map((skill, i) => (
//                     <span key={i} className="skill-tag">
//                       {typeof skill === 'object' ? skill.name : skill}
//                     </span>
//                   ))}
//                   {(!jobseekerProfile?.skills || jobseekerProfile.skills.length === 0) && (
//                     <span className="skill-tag">No skills listed</span>
//                   )}
//                 </div>
//               </div>

//               {/* Resume & Documents Section */}
//               <div className="info-section document-section">
//                 <h4>Resume & Documents</h4>
//                 <div className="resume-card">
//                   <div className="resume-info">
//                     <div className="file-details">
//                       <p className="file-name">
//                         {jobseekerProfile?.full_name || selectedApplication?.user?.username || "Candidate"}_Resume.pdf
//                       </p>
//                       <p className="file-size">1.1 MB</p>
//                     </div>
//                   </div>

//                   {/* ✅ Resume download from application detail */}
//                   {selectedApplication?.resume_version ? (
//                     <a
//                       href={selectedApplication.resume_version}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="download-btn"
//                       onClick={() => console.log("Downloading resume from:", selectedApplication.resume_version)}
//                     >
//                       📄 Download Resume
//                     </a>
//                   ) : (
//                     <div style={{ padding: "10px", color: "#999", textAlign: "center" }}>
//                       No resume uploaded
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Cover Letter Section */}
//               <div className="info-section">
//                 <h4>Cover Letter / Experience Summary</h4>
//                 <div className="cover-letter-box">
//                   <p>{selectedApplication?.cover_letter || "No cover letter provided."}</p>
//                 </div>
//               </div>

//               {/* Education Summary */}
//               <div className="info-section">
//                 <h4>Education</h4>
//                 {jobseekerProfile?.educations?.map((edu, i) => (
//                   <div key={i} className="edu-item">
//                     <p><strong>{edu.qualification_level || edu.degree}</strong></p>
//                     <p className="sub-text">
//                       {edu.institution} |
//                       {edu.completion_year || edu.end_year?.split('-')[0] || "2024"}
//                     </p>
//                   </div>
//                 ))}
//                 {(!jobseekerProfile?.educations || jobseekerProfile.educations.length === 0) && (
//                   <div className="edu-item">
//                     <p><strong>Bachelor's Degree</strong></p>
//                     <p className="sub-text">Not specified</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="message-action-footer">
//           <button
//             className="btn-message-center"
//             onClick={() => handleMessageUser(selectedApplication?.user?.id)}
//           >
//             Send Message to {jobseekerProfile?.full_name?.split(' ')[0] || "Candidate"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };   



import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserIcon from "../assets/Employer/User.png";
import { useJobs } from "../JobContext";
import api from "../api/axios";
import "./ViewApplicants.css";

export const ViewApplicants = ({ job, onBack }) => {
  const {
    updateApplicantStatus,
    addChatToSidebar,
    Alluser
  } = useJobs();

  const [viewMode, setViewMode] = useState("list");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobseekerProfile, setJobseekerProfile] = useState(null);
  const navigate = useNavigate();

  // Fetch applications for this job
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        console.log("Fetching applications for job:", job?.id);

        const response = await api.get('jobs/applications/');
        console.log("All applications:", response.data);

        const jobApplications = response.data.filter(
          app => app.job.id === job?.id
        );

        console.log("Filtered applications for this job:", jobApplications);
        setApplications(jobApplications);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };

    if (job?.id) {
      fetchApplications();
    }
  }, [job]);

  // ✅ REMOVED fetchFullApplicationDetails - not needed since we have all data

  const statusOptions = [
    "applied",
    "resume_screening",
    "recruiter_review",
    "shortlisted",
    "interview_called",
    "offered",
    "rejected",
    "hired"
  ];

  const statusLabels = {
    "applied": "Application Submitted",
    "resume_screening": "Resume Screening",
    "recruiter_review": "Recruiter Review",
    "shortlisted": "Shortlisted",
    "interview_called": "Interview Called",
    "offered": "Offered",
    "rejected": "Rejected",
    "hired": "Hired"
  };

  const calculateJobStats = () => {
    const getCount = (statusName) => {
      return applications.filter(app => app.status === statusName).length;
    };

    return {
      total: applications.length,
      shortlisted: getCount("shortlisted"),
      rejected: getCount("rejected"),
      interview: getCount("interview_called"),
      screening: getCount("resume_screening")
    };
  };

  const stats = calculateJobStats();

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      console.log("Updating status for application:", applicationId, "to:", newStatus);

      const response = await api.patch(`jobs/applications/${applicationId}/status/`, {
        status: newStatus
      });

      console.log("Status updated:", response.data);

      setApplications(prev => prev.map(app =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));

      if (selectedApplication) {
        setSelectedApplication(prev => ({ ...prev, status: newStatus }));
      }

    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const handleMessageUser = (userId) => {
    addChatToSidebar(userId);
    navigate(`/Job-portal/employer-chat/${userId}`);
  };

  // ✅ FIXED handleViewDetails - no extra API call needed
  const handleViewDetails = (application) => {
    console.log("Viewing details for application:", application);

    // Set selected application directly from the data we have
    setSelectedApplication(application);

    // Find jobseeker profile from Alluser
    const jobseeker = Alluser.find(user => user.id === application.user.id);

    if (jobseeker) {
      console.log("Jobseeker profile found in Alluser:", jobseeker);
      console.log("Skills:", jobseeker.skills);
      console.log("Education:", jobseeker.educations);
      setJobseekerProfile(jobseeker);
    } else {
      // Fallback: create basic profile from application data
      console.log("Jobseeker not found in Alluser, using application data");
      setJobseekerProfile({
        id: application.user.id,
        full_name: application.user.username || application.user.full_name,
        email: application.user.email,
        current_job_title: application.user.current_job_title || "",
        total_experience_years: application.user.total_experience || 0,
        current_location: application.user.location || "",
        skills: application.user.skills || [],
        educations: application.user.educations || [],
        resume_file: application.resume_version || null
      });
    }

    setViewMode("detail");
  };

  const handleBack = () => {
    setViewMode("list");
    setSelectedApplication(null);
    setJobseekerProfile(null);
    if (onBack) onBack();
  };

  const getStatusClass = (status) => {
    const s = status?.toLowerCase() || 'pending';
    if (s === 'applied') return 'status-submitted';
    if (s === 'resume_screening') return 'status-screening';
    if (s === 'recruiter_review') return 'status-review';
    if (s === 'shortlisted') return 'status-shortlisted';
    if (s === 'interview_called') return 'status-interview';
    if (s === 'offered') return 'status-offered';
    if (s === 'rejected') return 'status-rejected';
    if (s === 'hired') return 'status-hired';
    return 'status-pending';
  };

  if (loading) {
    return (
      <div className="view-applicants-page">
        <div className="main-card">
          <div style={{ textAlign: "center", padding: "40px" }}>
            Loading applicants...
          </div>
        </div>
      </div>
    );
  }

  // --- TABLE VIEW ---
  if (viewMode === "list") {
    return (
      <div className="view-applicants-page">
        <div className="main-card">
          <div className="header-section">
            <div className="title-group">
              <button className="back-btn" onClick={handleBack}>← Back</button>
              <h2>Applicants for {job?.jobTitle || job?.title}</h2>
              <p className="subtitle">
                {stats.total} Total Applicants |
                Shortlisted: {stats.shortlisted} |
                Interview: {stats.interview} |
                Rejected: {stats.rejected}
              </p>
            </div>
          </div>

          <table className="applicants-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.length > 0 ? (
                applications.map((app) => (
                  <tr key={app.id}>
                    <td className="candidate-cell">
                      <img src={UserIcon} alt="avatar" className="table-avatar" />
                      <div className="name-stack">
                        <span className="name">{app.user?.username || "N/A"}</span>
                        <span className="designation">{app.user?.email}</span>
                      </div>
                    </td>
                    <td>{new Date(app.applied_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-pill ${getStatusClass(app.status)}`}>
                        {statusLabels[app.status] || app.status}
                      </span>
                    </td>
                    <td>
                      <button className="view-link-btn" onClick={() => handleViewDetails(app)}>
                        View Application
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                    No one has applied for this job yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- DETAIL VIEW ---
  return (
    <div className="view-applicants-page detail-view">
      <div className="detail-container">
        <div className="detail-header">
          <button className="back-btn" onClick={handleBack}>← Back to Applications</button>

          <div className="header-actions">
            <div className="status-selector-container">
              <span>Update Stage: </span>
              <select
                className="status-dropdown-box"
                value={selectedApplication?.status || "applied"}
                onChange={(e) => handleStatusChange(selectedApplication.id, e.target.value)}
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {statusLabels[option]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="detail-layout">
          {/* LEFT COLUMN - Profile Card */}
          <div className="detail-left">
            <div className="profile-main-card">
              <img src={UserIcon} alt="Profile" className="detail-avatar" />
              <h3>{jobseekerProfile?.full_name || selectedApplication?.user?.username}</h3>
              <p className="role-tag">
                {jobseekerProfile?.current_job_title || "Job Seeker"}
              </p>

              <div className="quick-info-list">
                <p>
                  <strong>Experience:</strong>{" "}
                  {jobseekerProfile?.total_experience_years
                    ? `${jobseekerProfile.total_experience_years} Years`
                    : "Fresher"}
                </p>
                <p>
                  <strong>Education:</strong>{" "}
                  {jobseekerProfile?.educations?.[0]?.qualification_level || 
                   jobseekerProfile?.educations?.[0]?.degree || 
                   "Bachelor's Degree"}
                </p>
                <p>
                  <strong>Current Loc:</strong>{" "}
                  {jobseekerProfile?.current_location || "Not specified"}
                </p>
              </div>

              <div className="status-badge-container">
                <p className="status-label">Application Stage:</p>
                <span className={`status-pill large ${getStatusClass(selectedApplication?.status)}`}>
                  {statusLabels[selectedApplication?.status]}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Detailed Info */}
          <div className="detail-right">
            <div className="tabs-bar">
              <span className="tab active">Profile Overview</span>
            </div>

            <div className="tab-pane">
              {/* Skills Section */}
              <div className="info-section">
                <h4>Skills</h4>
                <div className="skill-pills">
                  {jobseekerProfile?.skills?.map((skill, i) => (
                    <span key={i} className="skill-tag">
                      {typeof skill === 'object' ? skill.name : skill}
                    </span>
                  ))}
                  {(!jobseekerProfile?.skills || jobseekerProfile.skills.length === 0) && (
                    <span className="skill-tag">No skills listed</span>
                  )}
                </div>
              </div>

              {/* Resume & Documents Section */}
              <div className="info-section document-section">
                <h4>Resume & Documents</h4>
                <div className="resume-card">
                  <div className="resume-info">
                    <div className="file-details">
                      <p className="file-name">
                        {jobseekerProfile?.full_name || selectedApplication?.user?.username || "Candidate"}_Resume.pdf
                      </p>
                      <p className="file-size">1.1 MB</p>
                    </div>
                  </div>

                  {/* ✅ Resume download - from selectedApplication or jobseekerProfile */}
                  {(selectedApplication?.resume_version || jobseekerProfile?.resume_file) ? (
                    <a
                      href={selectedApplication?.resume_version || jobseekerProfile?.resume_file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="download-btn"
                    >
                       Download Resume
                    </a>
                  ) : (
                    <div style={{ padding: "10px", color: "#999", textAlign: "center" }}>
                      No resume uploaded
                    </div>
                  )}
                </div>
              </div>

              {/* Cover Letter Section */}
              <div className="info-section">
                <h4>Cover Letter / Experience Summary</h4>
                <div className="cover-letter-box">
                  <p>{selectedApplication?.cover_letter || "No cover letter provided."}</p>
                </div>
              </div>

              {/* Education Summary */}
              <div className="info-section">
                <h4>Education</h4>
                {jobseekerProfile?.educations?.map((edu, i) => (
                  <div key={i} className="edu-item">
                    <p><strong>{edu.qualification_level || edu.degree}</strong></p>
                    <p className="sub-text">
                      {edu.institution} |
                      {edu.completion_year || edu.end_year?.split('-')[0] || "2024"}
                    </p>
                  </div>
                ))}
                {(!jobseekerProfile?.educations || jobseekerProfile.educations.length === 0) && (
                  <div className="edu-item">
                    <p><strong>Bachelor's Degree</strong></p>
                    <p className="sub-text">Not specified</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="message-action-footer">
          <button
            className="btn-message-center"
            onClick={() => handleMessageUser(selectedApplication?.user?.id)}
          >
            Send Message to {jobseekerProfile?.full_name?.split(' ')[0] || "Candidate"}
          </button>
        </div>
      </div>
    </div>
  );
};