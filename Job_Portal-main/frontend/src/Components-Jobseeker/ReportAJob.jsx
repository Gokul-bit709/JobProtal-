import React, { useEffect, useState } from 'react';
import {  useParams,useNavigate } from "react-router-dom";
import { Header } from '../Components-LandingPage/Header';
import { Footer } from '../Components-LandingPage/Footer';
import api from '../api/axios'; // base api

// Style
import './ReportAJob.css';

// Named export to match your App.jsx import
export const ReportAJob = () => {
    const navigate = useNavigate();
    const initialValues = {
        job_id: "",
        firstName: "",
        lastName: "",
        mobile: "",
        email: "",
        reason: "",
        explanation: ""
    };

    const [formValues, setFormValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const {id} = useParams();

    useEffect(() => {
    if (id) {
        setFormValues(prev => ({
            ...prev,
            job_id: id
        }));
    }
}, [id]);

    const validate = () => {
        let newErrors = {};

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formValues.email) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(formValues.email)) {
            newErrors.email = "Invalid email format";
        }

        const phoneRegex = /^[6-9]\d{9}$/;
        if (!formValues.mobile) {
            newErrors.mobile = "Phone number is required";
        } else if (!phoneRegex.test(formValues.mobile)) {
            newErrors.mobile = "Number must start with 6, 7, 8, or 9 and be 10 digits";
        }

        if (!formValues.firstName.trim()) newErrors.firstName = "First name is required";
        if (!formValues.lastName.trim()) newErrors.lastName = "Last name is required";
        if (!formValues.reason.trim()) newErrors.reason = "Reason for complaint is required";
        if (!formValues.explanation.trim()) newErrors.explanation = "Please provide an explanation";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "mobile") {
            // Only allow numbers and restrict to 10 digits
            const onlyNums = value.replace(/[^0-9]/g, "");
            if (onlyNums.length <= 10) {
                setFormValues({ ...formValues, [name]: onlyNums });
            }
        } else {
            setFormValues({ ...formValues, [name]: value });
        }

        if (errors[name]) setErrors({ ...errors, [name]: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {

            try {
                console.log(formValues)
                const responseData = await api.post('complaints/submit/',formValues) 
                console.log(responseData)
                alert("Report submitted successfully!");
                navigate("/Job-portal/jobseeker");
                setFormValues(initialValues);
            } catch (error) {
                const errData = error.response?.data;

                console.log(errData);

                // Access explanation error
                if (errData?.explanation) {
                    if(errData.explanation[0]){
                        alert(errData.explanation[0]);
                    }
                }
                if(errData?.job_id[0])
                    {
                        alert(errData.job_id[0])
                    }
                
            }
            
        }
    };

    return (
        <>
            <Header />
            <div className="report-container">
                <h2 className="report-title">“Complaint Form”</h2>
                <form className="report-card" onSubmit={handleSubmit}>
                    <div className="report-row">
                        <label>Name</label>
                        <div className="report-input-value">
                            <div className="report-input-split">
                                {/* First Name Group */}
                                <div className="report-input-group">
                                    <input
                                        type="text"
                                        name="firstName"
                                        placeholder="First name"
                                        value={formValues.firstName}
                                        onChange={handleChange}
                                        className={errors.firstName ? "error-field" : ""}
                                    />
                                    {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                                </div>

                                {/* Last Name Group */}
                                <div className="report-input-group">
                                    <input
                                        type="text"
                                        name="lastName"
                                        placeholder="Last name"
                                        value={formValues.lastName}
                                        onChange={handleChange}
                                        className={errors.lastName ? "error-field" : ""}
                                    />
                                    {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="report-row">
                        <label>Mobile number</label>
                        <div className="report-input-value">
                            <input
                                type="text" name="mobile" placeholder="9145******"
                                value={formValues.mobile} onChange={handleChange}
                                className={errors.mobile ? "error-field" : ""}
                            />
                            {errors.mobile && <span className="error-text">{errors.mobile}</span>}
                        </div>
                    </div>

                    <div className="report-row">
                        <label>Mail ID</label>
                        <div className="report-input-value">
                            <input type="email" name="email" placeholder="e.g.,name@gmail.com" value={formValues.email} onChange={handleChange} className={errors.email ? "error-field" : ""} />
                            {errors.email && <span className="error-text">{errors.email}</span>}
                        </div>
                    </div>
                    <div className="report-row">
                        <label>Reason for complaint</label>
                        <div className="report-input-value">
                            <input type="text" name="reason" placeholder="Enter a subject" value={formValues.reason} onChange={handleChange} className={errors.reason ? "error-field" : ""} />
                            {errors.reason && <span className="error-text">{errors.reason}</span>}
                        </div>
                    </div>
                    <div className="report-row align-top">
                        <label>Explain</label>
                        <div className="report-input-value">
                            <textarea name="explanation" rows="4" value={formValues.explanation} onChange={handleChange} className={errors.explanation ? "error-field" : ""} />
                            {errors.explanation && <span className="error-text">{errors.explanation}</span>}
                        </div>
                    </div>
                    <div className="report-actions">
                        <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>Cancel</button>
                        <button type="submit" className="btn-submit">Submit</button>
                    </div>
                </form>
            </div>
            <Footer />
        </>
    );
};