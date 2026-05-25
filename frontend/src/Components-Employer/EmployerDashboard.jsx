import React, { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './EmployerDashboard.css'
import DashboardIC from '../assets/Employer/DashboardIC.png'
import PostJobs from '../assets/Employer/PostJob.png'
import Mypost from '../assets/Employer/JOBPOST.png'
import Analytics from '../assets/Employer/AnalyticsInA.png'
import Billing from '../assets/Employer/Billing.png'
import Logout from '../assets/Employer/Elogout.png'
import Profile from '../assets/Employer/Esettings.png'
import { EHeader } from './EHeader'
import { Footer } from '../Components-LandingPage/Footer'
import Shortlist from '../assets/Employer/EShortlist.png'
import InterviewS from '../assets/Employer/EinterviewS.png'
import ActiveJobs from '../assets/Employer/EActiveJobs.png'
import TotalAPP from '../assets/Employer/ETotalAPP.png'
import Close from '../assets/Employer/Close.png'
import ClockImage from '../assets/Employer/ClockImage.gif'
import jobpost from '../assets/Employer/JOBPOST.png'
import { PostedJobs } from './PostedJobs'
import { ViewApplicants } from './ViewApplicants'
import { useJobs } from '../JobContext'
import { FindTalent } from './FindTalent'
import { PostJobForm } from './PostJobForm'
import Dashboard from '../assets/Employer/Dashboard_Inactive.png'
import PostJobsAct from '../assets/Employer/JonPost_Active.png'
import MypostAct from '../assets/Employer/MyJobPost_Active.png'
import LogoutAct from '../assets/Employer/LogOut.png'
import BillingAct from '../assets/Employer/Billing_Alt.png'
import AnalyticsAct from '../assets/Employer/Analytics_Active.png'
import ProfileAct from '../assets/Employer/Eprofile.png'
import Findtalent from '../assets/Employer/FindTalent.png'
import FindTalentAct from '../assets/Employer/FindTalent_Active.png'
import { AboutYourCompany } from './AboutYourCompany'
import place from '../assets/opportunity_location.png'
import { LogoutModal } from '../Components-Jobseeker/LogoutModal'
import { AnalyticsPage } from './AnalyticsPage'
import api from "../api/axios";

export const EmployerDashboard = () => {
    const { currentEmployer, getJobStats } = useJobs();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [applications, setApplications] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [verificationStatus, setVerificationStatus] = useState(null);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const navigate = useNavigate();

    const PostedJob = currentEmployer?.jobPosted || [];

    // ✅ Fetch verification status when dashboard loads
    useEffect(() => {
        const fetchVerificationStatus = async () => {
            try {
                const response = await api.get('/employer/onboarding-status/');
                console.log("Dashboard - Verification status:", response.data);
                if (response.data.verification_status) {
                    setVerificationStatus(response.data.verification_status);
                }
            } catch (error) {
                console.error("Error fetching verification status:", error);
            } finally {
                setCheckingStatus(false);
            }
        };
        
        fetchVerificationStatus();
    }, []);

    // Fetch applications for accurate stats
    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await api.get('jobs/applications/');
                console.log("Dashboard - Applications fetched:", response.data);
                setApplications(response.data || []);
            } catch (error) {
                console.error("Error fetching applications:", error);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchApplications();
    }, []);

    // Calculate stats directly from applications data
    const jobStats = useMemo(() => {
        if (!PostedJob.length || !applications.length) {
            return { totalApps: 0, totalShortlisted: 0, totalInterview: 0 };
        }

        const employerJobIds = PostedJob.map(job => String(job.id));

        // Filter applications for employer's jobs
        const employerApplications = applications.filter(app =>
            employerJobIds.includes(String(app.job?.id))
        );

        const totalApps = employerApplications.length;
        const totalShortlisted = employerApplications.filter(app =>
            app.status?.toLowerCase() === 'shortlisted'
        ).length;
        const totalInterview = employerApplications.filter(app =>
            app.status?.toLowerCase() === 'interview_called'
        ).length;

        console.log("Dashboard Stats:", { totalApps, totalShortlisted, totalInterview });

        return { totalApps, totalShortlisted, totalInterview };
    }, [applications, PostedJob]);

    // Get stats for each job
    const getJobApplicationStats = (jobId) => {
        if (!applications.length) {
            return { total: 0, new: 0, screening: 0, interview: 0, rejected: 0 };
        }

        const jobApplications = applications.filter(app =>
            String(app.job?.id) === String(jobId)
        );

        return {
            total: jobApplications.length,
            new: jobApplications.filter(app => app.status?.toLowerCase() === 'applied').length,
            screening: jobApplications.filter(app =>
                app.status?.toLowerCase() === 'shortlisted' ||
                app.status?.toLowerCase() === 'resume_screening'
            ).length,
            interview: jobApplications.filter(app => app.status?.toLowerCase() === 'interview_called').length,
            rejected: jobApplications.filter(app => app.status?.toLowerCase() === 'rejected').length
        };
    };

    const activeJobsCount = PostedJob.length;

    const [activeMenu, setActiveMenu] = useState(null);
    const initialLetter = currentEmployer?.hrName?.charAt(0).toUpperCase() || "U";

    const handleLogoutConfirm = async () => {
        setShowLogoutModal(false);

        try {
            const refresh = localStorage.getItem("refresh");

            if (refresh) {
                await api.post("logout/", { refresh });
            }
        } catch (err) {
            console.error("Logout failed:", err);
        } finally {

            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            localStorage.removeItem("userRole");
            localStorage.removeItem("user_id");
            localStorage.removeItem("user_type");
            localStorage.removeItem("profile_id");

            navigate('/');
        }
    };

    const [activetab, setActiveTab] = useState('Dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);

    const toggleMenu = (id) => {
        setActiveMenu(activeMenu === id ? null : id);
    };

    const location = useLocation();
    const fromVerify = location.state?.fromVerify || false;
    const [isVerifying, setIsVerifying] = useState(fromVerify);

    useEffect(() => {
        if (fromVerify) {
            const timer = setTimeout(() => {
                setIsVerifying(false);
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [fromVerify]);

    const ToggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    const handleViewApplicants = (job) => {
        setSelectedJob(job);
        setActiveTab('ViewApplicants');
    };

    // ✅ Get verification display message and style
    const getVerificationDisplay = () => {
        if (verificationStatus === 'pending') {
            return {
                message: 'Your company verification is pending admin approval. You will be able to post jobs once approved.',
                icon: '⏳',
                bgColor: '#fff3cd',
                borderColor: '#ffc107',
                textColor: '#856404'
            };
        } else if (verificationStatus === 'rejected') {
            return {
                message: 'Your company verification was rejected. Please resubmit your verification documents.',
                icon: '❌',
                bgColor: '#f8d7da',
                borderColor: '#dc3545',
                textColor: '#721c24'
            };
        } else if (verificationStatus === 'approved') {
            return {
                message: 'Your company has been verified! You can now post jobs.',
                icon: '✅',
                bgColor: '#d4edda',
                borderColor: '#28a745',
                textColor: '#155724'
            };
        }
        return null;
    };

    const verificationDisplay = getVerificationDisplay();

    // Show loading while checking status
    if (checkingStatus) {
        return (
            <>
                <EHeader />
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '80vh',
                    flexDirection: 'column'
                }}>
                    <div className="onboarding-loader"></div>
                    <p style={{ marginTop: '20px', color: '#666' }}>Loading your profile...</p>
                    <style>{`
                        .onboarding-loader {
                            width: 50px;
                            height: 50px;
                            border: 5px solid #f3f3f3;
                            border-top: 5px solid #1e88e5;
                            border-radius: 50%;
                            animation: spin 1s linear infinite;
                        }
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <EHeader />
            <div className='container1'>
                {isSidebarOpen ? (
                    <div className='EAside'>
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", textAlign: "center", alignItems: "center", marginTop: "35px", marginBottom: "35px" }}>
                                <h3 style={{ color: "snow", margin: "25px", fontWeight: "900" }}>{currentEmployer?.hrName || "User"}</h3>
                                <img src={Close} width={10} style={{ backgroundColor: "white", padding: '5px', margin: "25px", borderRadius: "30px" }} onClick={() => ToggleSidebar()} />
                            </div>
                            <h3 className='Aside-Title'>Overview</h3>
                            <div className='ENavbar'>
                                <div onClick={() => !isVerifying && setActiveTab('Dashboard')} className={activetab === 'Dashboard' ? "Active" : 'Navbox'} >
                                    {activetab === 'Dashboard' ? <img src={DashboardIC} height={15} width={15} alt="Dashboard" /> : <img src={Dashboard} height={20} width={20} alt="Dashboard" />}
                                    <div className='Enav-item'>Dashboard</div>
                                </div>
                                <div
                                    onClick={() => !isVerifying && (
                                        setActiveTab('Post a Job')
                                    )}
                                    className={activetab === 'Post a Job' ? "Active" : 'Navbox'}
                                >
                                    {activetab === 'Post a Job' ? <img src={PostJobsAct} height={25} width={25} alt="Post a Job" /> : <img src={PostJobs} height={20} width={20} alt="Post a Job" />}
                                    <div className='Enav-item'>Post a Job</div>
                                </div>

                                <div onClick={() => !isVerifying && setActiveTab('My job post')} className={activetab === 'My job post' ? "Active" : 'Navbox'} >
                                    {activetab === 'My job post' ? <img src={MypostAct} height={35} width={20} alt="My Job Post" /> : <img src={Mypost} height={15} width={20} alt="My Job Post" />}
                                    <div className='Enav-item'>My Job Post</div>
                                </div>
                                <div onClick={() => !isVerifying && setActiveTab('Find a Talent')} className={activetab === 'Find a Talent' ? "Active" : 'Navbox'} >
                                    {activetab === 'Find a Talent' ? <img src={FindTalentAct} height={20} width={20} alt="My Job Post" /> : <img src={Findtalent} height={20} width={20} alt="My Job Post" />}
                                    <div className='Enav-item'>Find a Talent</div>
                                </div>
                                <div onClick={() => !isVerifying && setActiveTab('Analytics')} className={activetab === 'Analytics' ? "Active" : 'Navbox'} >
                                    {activetab === 'Analytics' ? <img src={AnalyticsAct} height={20} width={20} alt="Analytics" /> : <img src={Analytics} height={20} width={20} alt="Analytics" />}
                                    <div className='Enav-item'>Analytics</div>
                                </div>
                                <div onClick={() => !isVerifying && setActiveTab('Billing')} className={activetab === 'Billing' ? "Active" : 'Navbox'} >
                                    {activetab === 'Billing' ? <img src={BillingAct} height={15} width={15} alt="Billing" /> : <img src={Billing} height={18} width={20} alt="Billing" />}
                                    <div className='Enav-item'>Billing</div>
                                </div>
                            </div>
                            <h3 className='Aside-Title'>Settings</h3>
                            <div className='ENavbar'>
                                <div onClick={() => !isVerifying && setActiveTab('My Profile')} className={activetab === 'My Profile' ? "Active" : 'Navbox'} >
                                    {activetab === 'My Profile' ? <img src={ProfileAct} height={15} width={15} alt="My Profile" /> : <img src={Profile} height={15} width={15} alt="My Profile" />}
                                    <div className='Enav-item'>My Profile</div>
                                </div>
                                <div onClick={() => !isVerifying && setShowLogoutModal(true)} className={activetab === 'Logout' ? "Active" : 'Navbox'}>
                                    {activetab === 'Logout' ? <img src={LogoutAct} height={15} width={15} alt="Logout" /> : <img src={Logout} height={15} width={15} alt="Logout" />}
                                    <div className='Enav-item'>Logout</div>
                                </div>
                            </div>
                        </div>
                    </div>)
                    : (
                        <div className='EAside2'>
                            <div>
                                <div style={{ display: "flex", flexDirection: "column-reverse", justifyContent: "space-between", alignItems: "center", textAlign: "center", marginTop: "15px", padding: "5px" }}>
                                    <div className='EE-Name'><h3 style={{ margin: "15px", fontSize: "22px" }}>{initialLetter}</h3></div>
                                    <img src={jobpost} width={30} style={{ padding: '5px' }} onClick={() => ToggleSidebar()} />
                                </div>

                                <div className='ENavbar1' style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <div onClick={() => !isVerifying && setActiveTab('Dashboard')} className={activetab === 'Dashboard' ? "Active1" : 'Navbox1'} >
                                        {activetab === 'Dashboard' ? <img src={DashboardIC} height={20} width={20} alt="Dashboard" /> : <img src={Dashboard} height={18} width={18} alt="Dashboard" />}
                                    </div>
                                    <div onClick={() => !isVerifying && (
                                        setActiveTab('Post a Job')
                                    )} className={activetab === 'Post a Job' ? "Active1" : 'Navbox1'} >
                                        {activetab === 'Post a Job' ? <img src={PostJobsAct} height={20} width={20} alt="Post a Job" /> : <img src={PostJobs} height={15} width={15} alt="Post a Job" />}
                                    </div>
                                    <div onClick={() => !isVerifying && setActiveTab('My job post')} className={activetab === 'My job post' ? "Active1" : 'Navbox1'} >
                                        {activetab === 'My job post' ? <img src={MypostAct} height={20} width={20} alt="My Job Post" /> : <img src={Mypost} height={15} width={15} alt="My Job Post" />}
                                    </div>
                                    <div onClick={() => !isVerifying && setActiveTab('Find a Talent')} className={activetab === 'Find a Talent' ? "Active1" : 'Navbox1'} >
                                        {activetab === 'Find a Talent' ? <img src={FindTalentAct} height={15} width={15} alt="My Job Post" /> : <img src={Findtalent} height={15} width={15} alt="My Job Post" />}
                                    </div>
                                    <div onClick={() => !isVerifying && setActiveTab('Analytics')} className={activetab === 'Analytics' ? "Active1" : 'Navbox1'} >
                                        {activetab === 'Analytics' ? <img src={AnalyticsAct} height={15} width={15} alt="Analytics" /> : <img src={Analytics} height={15} width={15} alt="Analytics" />}
                                    </div>
                                    <div onClick={() => !isVerifying && setActiveTab('Billing')} className={activetab === 'Billing' ? "Active1" : 'Navbox1'} >
                                        {activetab === 'Billing' ? <img src={BillingAct} height={15} width={15} alt="Billing" /> : <img src={Billing} height={15} width={15} alt="Billing" />}
                                    </div>
                                    <div onClick={() => !isVerifying && setActiveTab('My Profile')} className={activetab === 'My Profile' ? "Active1" : 'Navbox1'} >
                                        {activetab === 'My Profile' ? <img src={ProfileAct} height={15} width={15} alt="My Profile" /> : <img src={Profile} height={15} width={15} alt="My Profile" />}
                                    </div>
                                    <div onClick={() => !isVerifying && setShowLogoutModal(true)} className={activetab === 'Logout' ? "Active1" : 'Navbox1'} style={{ cursor: 'pointer' }}>
                                        {activetab === 'Logout' ? <img src={LogoutAct} height={15} width={15} alt="Logout" /> : <img src={Logout} height={15} width={15} alt="Logout" />}
                                    </div>
                                </div>
                                <div className='ENavbar'>
                                </div>
                            </div>
                        </div>
                    )}

                <div className={isSidebarOpen ? 'Emainsec' : 'Emainsec2'}>
                    {activetab === 'Dashboard' && (
                        <>
                            {isVerifying ? (
                                <div className="pending-main-section">
                                    <div className='Welcome-Note'>
                                        <div>
                                            <h2>Hi {currentEmployer?.hrName || "User"},</h2>
                                            <p style={{ fontWeight: "600" }}>Here's, What's Going on... </p>
                                        </div>
                                    </div>
                                    <div className="pending-section">
                                        <img src={ClockImage} alt="pending" className="pending-icon" />
                                        <h2>Verification Submitted!</h2>
                                        <p>Your company verification is pending admin approval.</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className='Welcome-Note'>
                                        <div>
                                            <h2>Hi {currentEmployer?.hrName || "User"},</h2>
                                            <p style={{ fontWeight: "600" }}>Here's, What's Going on... </p>
                                        </div>
                                        <button
                                            className='post-job-btn'
                                            onClick={() => {
                                                !isVerifying && setActiveTab('Post a Job');
                                                window.scrollTo(0, 0);
                                            }}
                                            disabled={verificationStatus !== 'approved'}
                                            style={{
                                                opacity: verificationStatus !== 'approved' ? 0.6 : 1,
                                                cursor: verificationStatus !== 'approved' ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            + Post a Job
                                        </button>
                                    </div>

                                    {/* ✅ Verification Status Banner */}
                                    {verificationDisplay && (
                                        <div style={{
                                            margin: '20px 40px',
                                            padding: '15px 20px',
                                            backgroundColor: verificationDisplay.bgColor,
                                            borderLeft: `4px solid ${verificationDisplay.borderColor}`,
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}>
                                            <span style={{ fontSize: '24px' }}>{verificationDisplay.icon}</span>
                                            <div>
                                                <p style={{ margin: 0, color: verificationDisplay.textColor, fontWeight: '500' }}>
                                                    {verificationDisplay.message}
                                                </p>
                                                {verificationStatus === 'rejected' && (
                                                    <button
                                                        onClick={() => setActiveTab('My Profile')}
                                                        style={{
                                                            marginTop: '8px',
                                                            background: 'none',
                                                            border: 'none',
                                                            color: '#dc3545',
                                                            cursor: 'pointer',
                                                            fontSize: '14px',
                                                            textDecoration: 'underline'
                                                        }}
                                                    >
                                                        Click here to resubmit verification
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className='E-DashB-Over-View'>
                                        <h2 style={{ marginLeft: "40px" }}>Overview</h2>
                                        <div className='EDashB-Application-Counts'>
                                            <div className='E-DashB-No-Counts'>
                                                <div><img src={ActiveJobs} width={40} alt="" /></div>
                                                <div><p>{activeJobsCount}</p><p className='E-job-status'>Active Jobs</p></div>
                                            </div>
                                            <div className='E-DashB-No-Counts'>
                                                <div><img src={TotalAPP} width={40} alt="" /></div>
                                                <div><p>{jobStats.totalApps}</p><p className='E-job-status'>Total Applicants</p></div>
                                            </div>
                                            <div className='E-DashB-No-Counts'>
                                                <div><img src={Shortlist} width={40} alt="" /></div>
                                                <div><p>{jobStats.totalShortlisted}</p><p className='E-job-status'>ShortListed</p></div>
                                            </div>
                                            <div className='E-DashB-No-Counts'>
                                                <div><img src={InterviewS} width={40} alt="" /></div>
                                                <div><p>{jobStats.totalInterview}</p><p className='E-job-status'>Interview Schedules</p></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recently posted jobs */}
                                    <div>
                                        <div className='ERecent-Post-Cont'>
                                            <h3 style={{ marginleft: "40px" }}>Recently Posted Jobs</h3>
                                            <div className='ERecent-Post-Table-Container'>
                                                {PostedJob.length > 0 ? <>
                                                    <div className="postedjobs-grid-layout postedjobs-table-header">
                                                        <div />
                                                        <span className="postedjobs-label">Applicants</span>
                                                        <span className="postedjobs-label">New</span>
                                                        <span className="postedjobs-label">Shortlisted</span>
                                                        <span className="postedjobs-label">Interview</span>
                                                        <span className="postedjobs-label">Rejected</span>
                                                        <div />
                                                    </div>

                                                    <div className="postedjobs-list">
                                                        {PostedJob.slice(0, 5).map((job) => {
                                                            const stats = getJobApplicationStats(job.id);
                                                            return (
                                                                <div key={job.id} className="postedjobs-grid-layout postedjobs-card">
                                                                    <div className="postedjobs-info">
                                                                        <h3>{job.job_title || job.title}</h3>
                                                                        <p className="postedjobs-loc flex items-center gap-2">
                                                                            <img src={place} alt="location" className="post-job-locationicon" />
                                                                            {Array.isArray(job.location)
                                                                                ? job.location.join(", ")
                                                                                : job.location || "N/A"}
                                                                        </p>
                                                                        <small>Created on: {new Date(job.created_at || job.posted_date).toLocaleDateString()}</small>
                                                                    </div>
                                                                    <span className="postedjobs-badge">{stats.total}</span>
                                                                    <span className="postedjobs-badge">{stats.new}</span>
                                                                    <span className="postedjobs-badge">{stats.screening}</span>
                                                                    <span className="postedjobs-badge">{stats.interview}</span>
                                                                    <span className="postedjobs-badge">{stats.rejected}</span>

                                                                    <div className="postedjobs-actions">
                                                                        <button className="postedjobs-view-btn" onClick={() => handleViewApplicants(job)}>
                                                                            View applicants
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </>
                                                    :
                                                    <>
                                                        <h2 style={{ display: "flex", justifyContent: "center", alignItems: "center", height: '50vh' }}>No Jobs posted by you</h2>
                                                    </>
                                                }
                                                {PostedJob.length > 0 && (
                                                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                                        <button className="view-more-link" onClick={() => setActiveTab('My job post')}>
                                                            View more...
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {activetab === 'Post a Job' && (
                        <PostJobForm onCancel={() => setActiveTab('Dashboard')} />
                    )}

                    {activetab === 'My job post' && (<PostedJobs onViewApplicants={(job) => { setSelectedJob(job); setActiveTab('ViewApplicants'); }} />)}

                    {activetab === 'ViewApplicants' && (<ViewApplicants job={selectedJob} onBack={() => setActiveTab('My job post')} />)}

                    {activetab === 'Find a Talent' && (<FindTalent />)}

                    {activetab === 'Analytics' && (<AnalyticsPage />)}

                    {activetab === 'Billing' && (<h1>Billing Section</h1>)}

                    {activetab === 'My Profile' && (<AboutYourCompany hideNavigation={true} setActiveTab={setActiveTab} />)}

                </div>

            </div>
            <LogoutModal show={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={handleLogoutConfirm} />
            <Footer />
        </>
    );
};