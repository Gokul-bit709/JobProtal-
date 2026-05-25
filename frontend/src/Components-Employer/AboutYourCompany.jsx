import React, { useState, useEffect } from "react";
import { Footer } from "../Components-LandingPage/Footer";
import { EHeader } from "./EHeader";
import "./AboutYourCompany.css";
import fileIcon from "../assets/Employer/fileIcon.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useJobs } from "../JobContext";
import api from "../api/axios";

export const AboutYourCompany = ({ hideNavigation = false, setActiveTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCompanyProfile } = useJobs();
  const [isLoading, setIsLoading] = useState(false);
  const [backendError, setBackendError] = useState("");
  const [existingLogo, setExistingLogo] = useState(null);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  
  // State for popup modal
  const [showPopup, setShowPopup] = useState(false);
  const [pendingCompanyName, setPendingCompanyName] = useState("");

  // Check if coming from signup
  const fromSignup = location.state?.fromSignup || false;

  const [formData, setFormData] = useState({
    fullName: "",
    employerId: "",
    companyName: "",
    companyMoto: "",
    contactPerson: "",
    contactNumber: "",
    companyMail: "",
    website: "",
    companySize: "",
    address1: "",
    address2: "",
    about: "",
    companyLogo: null,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!fromSignup) {
      fetchExistingProfile();
    } else {
      console.log("Coming from signup, skipping profile fetch");
      setIsLoading(false);
    }
  }, [fromSignup]);

  const fetchExistingProfile = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching existing company profile for dashboard...");

      const response = await api.get("/company/profile/");
      console.log("✅ Existing profile found:", response.data);

      const profile = response.data;
      setFormData({
        fullName: profile.full_name|| "",
        employerId: profile.employee_id || "",
        companyName: profile.company_name || "",
        companyMoto: profile.company_moto || "",
        contactPerson: profile.contact_person || "",
        contactNumber: profile.contact_number || "",
        companyMail: profile.company_email || "",
        website: profile.website || "",
        companySize: profile.company_size || "",
        address1: profile.address1 || "",
        address2: profile.address2 || "",
        about: profile.about || "",
        companyLogo: null,
      });

      setExistingLogo(profile.company_logo);
      setHasExistingProfile(true);

    } catch (err) {
      if (err.response?.status === 404) {
        console.log("No existing profile found");
        setHasExistingProfile(false);
        setExistingLogo(null);
        if (!hideNavigation) {
          setBackendError("No company profile found. Please create one.");
        }
      } else if (err.response?.status === 401) {
        console.log("Unauthorized - redirecting to login");
        if (!hideNavigation) {
          navigate("/Job-portal/employer/login");
        } else {
          setBackendError("Session expired. Please login again.");
        }
      } else {
        console.error("Error fetching profile:", err);
        setBackendError("Failed to load company profile");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const companyNameRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s&.,-]{3,100}$/;
    const motoRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s.,!'-]{5,150}$/;
    const personRegex = /^[a-zA-Z\s]{3,50}$/;
    const mobileRegex = /^[6-9]\d{9}$/;
    const emailRegex = /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const urlRegex = /^(https?:\/\/)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}(\/[a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=%-]*)?$/;
    const fullNameRegex = /^[A-Za-z]+( [A-Za-z]+)+$/;
    const employerIdRegex = /^(?=.*[A-Za-z])[A-Za-z0-9](?:[A-Za-z0-9_-]{0,18}[A-Za-z0-9])?$/;

    // Fullname
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Please enter your full name";
    } else if (formData.fullName.length < 3) {
      newErrors.fullName = "Full name must be at least 3 characters";
    } else if (!fullNameRegex.test(formData.fullName)) {
      newErrors.fullName = "Enter valid full name (First & Last name, only letters)";
    }

    // Employee Id
    if (!formData.employerId.trim()) {
      newErrors.employerId = "Employer ID is required";
    } else if (formData.employerId.length > 20) {
      newErrors.employerId = "Maximum 20 characters allowed";
    } else if (!/^[A-Za-z0-9_-]+$/.test(formData.employerId)) {
      newErrors.employerId = "Only letters, numbers, '-' and '_' are allowed";
    } else if (!/^[A-Za-z0-9]/.test(formData.employerId)) {
      newErrors.employerId = "Must start with a letter or number";
    } else if (!/[A-Za-z0-9]$/.test(formData.employerId)) {
      newErrors.employerId = "Must end with a letter or number";
    } else if (!employerIdRegex.test(formData.employerId)) {
      newErrors.employerId = "Invalid Employer ID format";
    }

    // Company Name
    if (!formData.companyName?.trim()) {
      newErrors.companyName = "Company Name is required";
    } else if (!companyNameRegex.test(formData.companyName)) {
      newErrors.companyName = "Invalid Name (must contain letters, no special symbols)";
    }

    // Company Moto
    if (!formData.companyMoto?.trim()) {
      newErrors.companyMoto = "Company Moto is required";
    } else if (!motoRegex.test(formData.companyMoto)) {
      newErrors.companyMoto = "Moto must contain letters (min 5 characters)";
    }

    // Contact Person
    if (!formData.contactPerson?.trim()) {
      newErrors.contactPerson = "Contact person name is required";
    } else if (!personRegex.test(formData.contactPerson)) {
      newErrors.contactPerson = "Name must contain only letters";
    }

    // Contact Number
    if (!formData.contactNumber?.trim()) {
      newErrors.contactNumber = "Mobile number is required";
    } else if (!mobileRegex.test(formData.contactNumber)) {
      newErrors.contactNumber = "Enter valid 10-digit mobile (starts with 6-9)";
    }

    // Company Mail
    if (!formData.companyMail?.trim()) {
      newErrors.companyMail = "Company email is required";
    } else if (!emailRegex.test(formData.companyMail)) {
      newErrors.companyMail = "Email must start with a letter and be valid";
    }

    // Website URL
    if (!formData.website?.trim()) {
      newErrors.website = "Company website is required";
    } else if (!urlRegex.test(formData.website)) {
      newErrors.website = "Include https:// (e.g., https://www.company.com)";
    }

    // Static Selections / Textareas
    if (!formData.companySize?.trim()) newErrors.companySize = "Please select company size";
    if (!formData.address1?.trim() || formData.address1.length < 10) {
      newErrors.address1 = "Enter a complete address (min 10 chars)";
    }
    if (!formData.about?.trim() || formData.about.length < 50) {
      newErrors.about = "About description must be at least 50 characters";
    }

    // Logo validation
    if (!formData.companyLogo && !existingLogo) {
      newErrors.companyLogo = "Please upload a company logo";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const target = e?.target;
    if (!target) return;

    const { name, value, files } = target;

    setErrors((prev) => ({ ...prev, [name]: "" }));
    setBackendError("");

    if (files) {
      const file = files[0];
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
      const maxSize = 5 * 1024 * 1024;

      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, companyLogo: "Only image files are allowed!" }));
        return;
      }

      if (file.size > maxSize) {
        setErrors((prev) => ({ ...prev, companyLogo: "File size should be less than 5MB" }));
        return;
      }

      setFormData({ ...formData, [name]: file });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // ✅ Link to existing company (for multi-employer support)
  const linkToExistingCompany = async (companyName) => {
    setIsLoading(true);
    setBackendError("");
    
    try {
      const response = await api.post("/company/link-to-existing/", {
        company_name: companyName
      });
      
      console.log("✅ Linked to existing company:", response.data);
      
      setCompanyProfile({
        ...formData,
        id: response.data.company_id,
        companyName: response.data.company_name,
        isExisting: true
      });
      
      return {
        success: true,
        data: {
          ...response.data,
          id: response.data.company_id,
          is_existing: true
        }
      };
    } catch (err) {
      console.error("Link to company error:", err);
      
      if (err.response?.status === 404) {
        setBackendError("Company not found. Please create a new company.");
      } else if (err.response?.status === 400) {
        setBackendError(err.response?.data?.error || "Cannot link to this company");
      } else {
        setBackendError("Failed to link to company. Please try again.");
      }
      
      return { success: false, error: "Link failed" };
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Create new company profile with popup handling
  const createCompanyProfile = async (data) => {
    setIsLoading(true);
    setBackendError("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("company_name", data.companyName);
      formDataToSend.append("company_moto", data.companyMoto);
      formDataToSend.append("contact_person", data.contactPerson);
      formDataToSend.append("contact_number", data.contactNumber);
      formDataToSend.append("company_email", data.companyMail);
      formDataToSend.append("website", data.website);
      formDataToSend.append("company_size", data.companySize);
      formDataToSend.append("address1", data.address1);
      if (data.address2) formDataToSend.append("address2", data.address2);
      formDataToSend.append("about", data.about);
      if (data.companyLogo) formDataToSend.append("company_logo", data.companyLogo);

      const response = await api.post("/company/profile/create/", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Company profile created:", response.data);
      return { success: true, data: { ...response.data, is_existing: false } };
    } catch (err) {
      console.error("Create profile error:", err);
      
      if (err.response?.status === 400) {
        const errorMsg = err.response?.data?.error || "";
        
        // ✅ Check if error is about duplicate company
        if (errorMsg.includes("already exists")) {
          // Show popup instead of window.confirm
          setPendingCompanyName(data.companyName);
          setShowPopup(true);
          setIsLoading(false);
          return { success: false, error: "duplicate_company", pending: true };
        }
        
        // Handle other validation errors
        const backendErrors = err.response.data;
        const newErrors = {};
        const fieldMapping = {
          company_name: "companyName", company_moto: "companyMoto",
          contact_person: "contactPerson", contact_number: "contactNumber",
          company_email: "companyMail", website: "website",
          company_size: "companySize", address1: "address1",
          about: "about", company_logo: "companyLogo",
        };

        Object.keys(backendErrors).forEach((key) => {
          const frontendKey = fieldMapping[key];
          if (frontendKey) {
            newErrors[frontendKey] = Array.isArray(backendErrors[key])
              ? backendErrors[key][0] : backendErrors[key];
          }
        });
        setErrors(newErrors);
        return { success: false, error: "Validation failed" };
      }
      
      return { success: false, error: err.response?.data?.error || "Network error" };
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Update existing company profile
  const updateCompanyProfile = async (data) => {
    setIsLoading(true);
    setBackendError("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("company_name", data.companyName);
      formDataToSend.append("company_moto", data.companyMoto);
      formDataToSend.append("contact_person", data.contactPerson);
      formDataToSend.append("contact_number", data.contactNumber);
      formDataToSend.append("company_email", data.companyMail);
      formDataToSend.append("website", data.website);
      formDataToSend.append("company_size", data.companySize);
      formDataToSend.append("address1", data.address1);
      if (data.address2) formDataToSend.append("address2", data.address2);
      formDataToSend.append("about", data.about);
      if (data.companyLogo) formDataToSend.append("company_logo", data.companyLogo);

      const response = await api.patch("/company/profile/update/", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Company profile updated:", response.data);
      return { success: true, data: response.data };
    } catch (err) {
      console.error("Update profile error:", err);

      if (err.response?.status === 400) {
        const backendErrors = err.response.data;
        const newErrors = {};
        const fieldMapping = {
          company_name: "companyName", company_moto: "companyMoto",
          contact_person: "contactPerson", contact_number: "contactNumber",
          company_email: "companyMail", website: "website",
          company_size: "companySize", address1: "address1",
          about: "about", company_logo: "companyLogo",
        };

        Object.keys(backendErrors).forEach((key) => {
          const frontendKey = fieldMapping[key];
          if (frontendKey) {
            newErrors[frontendKey] = Array.isArray(backendErrors[key])
              ? backendErrors[key][0] : backendErrors[key];
          }
        });
        setErrors(newErrors);
        return { success: false, error: "Validation failed" };
      }

      return { success: false, error: err.response?.data?.error || "Network error" };
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Handle popup confirm (Join existing company)
  const handleJoinExistingCompany = async () => {
    setShowPopup(false);
    const result = await linkToExistingCompany(pendingCompanyName);
    
    if (result.success) {
      setCompanyProfile({
        ...formData,
        id: result.data.company_id,
        companyLogo: result.data.company_logo
      });

      // Navigate to verification page
      navigate("/Job-portal/Employer/about-your-company/company-verification", {
        state: {
          fromSignup: fromSignup,
          profileId: result.data.company_id,
          isExistingCompany: true,
          companyName: pendingCompanyName
        }
      });
    } else if (result.error !== "Validation failed") {
      setBackendError(result.error || "Failed to link to company");
    }
  };

  // ✅ Handle popup cancel
  const handleCancelJoin = () => {
    setShowPopup(false);
    setPendingCompanyName("");
    setErrors({ companyName: "Please use a different company name" });
  };

  // ✅ Next button - ALWAYS go to verification page
  const handleNext = async (e) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) {
      console.log("Form has errors");
      return;
    }

    console.log("Saving company profile...");

    let result;
    if (fromSignup || !hasExistingProfile) {
      result = await createCompanyProfile(formData);
      // If duplicate company detected and popup is shown, stop here
      if (result.pending) return;
    } else {
      result = await updateCompanyProfile(formData);
    }

    if (result.success) {
      setCompanyProfile({
        ...formData,
        id: result.data.id || result.data.company_id,
        companyLogo: result.data.company_logo
      });

      navigate("/Job-portal/Employer/about-your-company/company-verification", {
        state: {
          fromSignup: fromSignup,
          profileId: result.data.id || result.data.company_id,
          isExistingCompany: result.data.is_existing || false,
          companyName: formData.companyName
        }
      });
    } else if (result.error !== "Validation failed" && result.error !== "duplicate_company") {
      setBackendError(result.error || "Failed to save company profile");
    }
  };

  // Save button (from Dashboard My Profile)
  const handleSave = async (e) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) return;

    console.log("Saving Company Profile from Dashboard:", formData);

    let result;
    if (hasExistingProfile) {
      result = await updateCompanyProfile(formData);
    } else {
      result = await createCompanyProfile(formData);
    }

    if (result.success) {
      setCompanyProfile({
        ...formData,
        id: result.data.id,
        companyLogo: result.data.company_logo
      });

      setExistingLogo(result.data.company_logo);
      setHasExistingProfile(true);

      alert("Company profile saved successfully!");
    } else if (result.error !== "Validation failed" && result.error !== "duplicate_company") {
      setBackendError(result.error || "Failed to save");
    }
  };

  // Popup Modal Component
  const PopupModal = () => {
    return (
      <div className="popup-modal-overlay">
        <div className="popup-modal-content">
          <div className="popup-modal-header">
            <h3>Company Already Exists</h3>
          </div>
          <div className="popup-modal-body">
            <p>
              A company with the name <strong>"{pendingCompanyName}"</strong> already exists in our system.
            </p>
            <p>Do you want to join this existing company instead of creating a new one?</p>
          </div>
          <div className="popup-modal-footer">
            <button 
              className="popup-btn-cancel" 
              onClick={handleCancelJoin}
            >
              No, Use Different Name
            </button>
            <button 
              className="popup-btn-confirm" 
              onClick={handleJoinExistingCompany}
            >
              Yes, Join Existing Company
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (isLoading && !fromSignup) {
    return (
      <>
        {!hideNavigation && <EHeader />}
        <div className="aboutcompany-container">
          <h2 className="aboutcompany-title">About Your Company</h2>
          <div style={{ textAlign: "center", padding: "50px" }}>Loading...</div>
        </div>
        {!hideNavigation && <Footer />}
      </>
    );
  }

  return (
    <>
      {!hideNavigation && <EHeader />}

      {/* Popup Modal */}
      {showPopup && <PopupModal />}

      <div className="aboutcompany-container">
        <h2 className="aboutcompany-title">
          About Your Company
          {fromSignup && <span style={{ fontSize: "14px", color: "#666", marginLeft: "10px" }}>(Step 1 of 2)</span>}
        </h2>

        {backendError && (
          <div className="backend-error-message" style={{
            backgroundColor: "#ffebee", color: "#d32f2f",
            padding: "10px", borderRadius: "5px", marginBottom: "20px", textAlign: "center"
          }}>
            {backendError}
          </div>
        )}

        <form className="aboutcompany-form">
          {/* Full Name */}
          <div className="aboutcompany-form-group">
            <label>Full Name *</label>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <input
                className={errors.fullName ? "input-error" : ""}
                type="text"
                name="fullName"
                placeholder="e.g., John Doe"
                value={formData.fullName}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.fullName && <span className="error-msg">{errors.fullName}</span>}
            </div>
          </div>

          {/* Employee Id */}
          <div className="aboutcompany-form-group">
            <label>Employee ID *</label>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <input
                className={errors.employerId ? "input-error" : ""}
                type="text"
                name="employerId"
                placeholder="e.g., EMP001"
                value={formData.employerId}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.employerId && <span className="error-msg">{errors.employerId}</span>}
            </div>
          </div>

          {/* Company Name */}
          <div className="aboutcompany-form-group">
            <label>Company Name *</label>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <input
                className={errors.companyName ? "input-error" : ""}
                type="text"
                name="companyName"
                placeholder="e.g., Tech Solutions Pvt Ltd"
                value={formData.companyName}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.companyName && <span className="error-msg">{errors.companyName}</span>}
            </div>
          </div>

          {/* Company Moto */}
          <div className="aboutcompany-form-group">
            <label>Company Moto *</label>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <input
                className={errors.companyMoto ? "input-error" : ""}
                type="text"
                name="companyMoto"
                placeholder="e.g., Innovating for a better tomorrow"
                value={formData.companyMoto}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.companyMoto && <span className="error-msg">{errors.companyMoto}</span>}
            </div>
          </div>

          {/* Contact Person */}
          <div className="aboutcompany-form-group">
            <label>Contact Person *</label>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <input
                className={errors.contactPerson ? "input-error" : ""}
                type="text"
                name="contactPerson"
                placeholder="e.g., John Doe"
                value={formData.contactPerson}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.contactPerson && <span className="error-msg">{errors.contactPerson}</span>}
            </div>
          </div>

          {/* Contact Number */}
          <div className="aboutcompany-form-group">
            <label>Contact Number *</label>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <input
                className={errors.contactNumber ? "input-error" : ""}
                type="tel"
                name="contactNumber"
                placeholder="e.g., 9876543210"
                value={formData.contactNumber}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.contactNumber && <span className="error-msg">{errors.contactNumber}</span>}
            </div>
          </div>

          {/* Company Email */}
          <div className="aboutcompany-form-group">
            <label>Company Mail Id *</label>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <input
                className={errors.companyMail ? "input-error" : ""}
                type="email"
                name="companyMail"
                placeholder="e.g., hr@company.com"
                value={formData.companyMail}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.companyMail && <span className="error-msg">{errors.companyMail}</span>}
            </div>
          </div>

          {/* Website */}
          <div className="aboutcompany-form-group">
            <label>Company Website *</label>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <input
                className={errors.website ? "input-error" : ""}
                type="text"
                name="website"
                placeholder="e.g., https://www.company.com"
                value={formData.website}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.website && <span className="error-msg">{errors.website}</span>}
            </div>
          </div>

          {/* Company Logo */}
          <div className="aboutcompany-form-group">
            <label>Company Logo *</label>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div className={`aboutcompany-file-upload-box ${errors.companyLogo ? "input-error" : ""}`}>
                <input
                  type="file"
                  name="companyLogo"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  id="logoUpload"
                  onChange={handleChange}
                  hidden
                  disabled={isLoading}
                />

                {!formData.companyLogo && !existingLogo && (
                  <label htmlFor="logoUpload" className="aboutcompany-upload-placeholder">
                    Click to Upload Logo
                  </label>
                )}

                {existingLogo && !formData.companyLogo && (
                  <div style={{ padding: "15px", textAlign: "center" }}>
                    <img src={existingLogo} alt="Current Logo" style={{ maxWidth: "100px", maxHeight: "100px" }} />
                    <label htmlFor="logoUpload" style={{ cursor: "pointer", color: "#007bff", display: "block" }}>
                      Click to change
                    </label>
                  </div>
                )}

                {formData.companyLogo && (
                  <div className="aboutcompany-file-preview">
                    <label htmlFor="logoUpload" className="aboutcompany-file-left clickable-area">
                      <img src={fileIcon} alt="file" />
                      <div>
                        <p>{formData.companyLogo.name}</p>
                        <span>{(formData.companyLogo.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    </label>
                  </div>
                )}
              </div>
              {errors.companyLogo && <span className="error-msg">{errors.companyLogo}</span>}
            </div>
          </div>

          {/* Company Size */}
          <div className="aboutcompany-form-group">
            <label>Company Size *</label>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <select
                className={errors.companySize ? "input-error" : ""}
                name="companySize"
                value={formData.companySize}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="">Select company size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
              {errors.companySize && <span className="error-msg">{errors.companySize}</span>}
            </div>
          </div>

          {/* Address 1 */}
          <div className="aboutcompany-form-group">
            <label>Company Address *</label>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <input
                className={errors.address1 ? "input-error" : ""}
                type="text"
                name="address1"
                placeholder="e.g., Hyderabad, India"
                value={formData.address1}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.address1 && <span className="error-msg">{errors.address1}</span>}
            </div>
          </div>

          {/* Address 2 (Optional) */}
          <div className="aboutcompany-form-group">
            <label>Company Address 2 (Optional)</label>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <input
                type="text"
                name="address2"
                placeholder="e.g., Floor 3, Building A"
                value={formData.address2}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* About Company */}
          <div className="aboutcompany-form-group">
            <label>About Company *</label>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <textarea
                className={errors.about ? "input-error" : ""}
                rows="5"
                name="about"
                placeholder="Tell us about your company, mission, values, and what makes you unique..."
                value={formData.about}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.about && <span className="error-msg">{errors.about}</span>}
            </div>
          </div>

          {!hideNavigation && (
            <div className="aboutcompany-form-buttons">
              <button type="button" className="aboutcompany-back-btn" onClick={() => navigate(-1)} disabled={isLoading}>
                Back
              </button>
              <button type="button" className="aboutcompany-next-btn" onClick={handleNext} disabled={isLoading}>
                {isLoading ? "Saving..." : "Next"}
              </button>
            </div>
          )}

          {hideNavigation && (
            <div>
              <button type="button" className="aboutcompany-save-btn" onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </form>
      </div>

      {!hideNavigation && <Footer />}
      
      {/* Popup Modal CSS */}
      <style>{`
        .popup-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }
        
        .popup-modal-content {
          background: white;
          border-radius: 12px;
          width: 450px;
          max-width: 90%;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          animation: modalFadeIn 0.3s ease;
        }
        
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .popup-modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .popup-modal-header h3 {
          margin: 0;
          color: #d32f2f;
          font-size: 20px;
        }
        
        .popup-modal-body {
          padding: 24px;
        }
        
        .popup-modal-body p {
          margin: 10px 0;
          color: #333;
          line-height: 1.5;
        }
        
        .popup-modal-body strong {
          color: #1e88e5;
        }
        
        .popup-modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #e0e0e0;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        
        .popup-btn-cancel {
          padding: 10px 20px;
          background: white;
          border: 1px solid #ccc;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          color: #666;
          transition: all 0.2s;
        }
        
        .popup-btn-cancel:hover {
          background: #f5f5f5;
        }
        
        .popup-btn-confirm {
          padding: 10px 20px;
          background: #1e88e5;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          color: white;
          transition: all 0.2s;
        }
        
        .popup-btn-confirm:hover {
          background: #1565c0;
        }
      `}</style>
    </>
  );
};