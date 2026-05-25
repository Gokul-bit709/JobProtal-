import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from "@react-oauth/google";

import workTime from '../assets/WorkTime.png'
import Google from '../assets/icon_email_id.png'
import eye from '../assets/show_password.png'
import eyeHide from '../assets/eye-hide.png'
import emailIcon from '../assets/icon_email_otp.png'
import mobileIcon from '../assets/icon_mobile_otp.png'
import Verified from '../assets/verified-otpimage.png'

import './Jsignup.css'
import './OtpModal.css'

import api from '../api/axios'

export const Jsignup = () => {
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(false)
  const [passwordShow, setPasswordShow] = useState(true)
  const [confirmPasswordShow, setConfirmPasswordShow] = useState(true)

  const [showEmailOtp, setShowEmailOtp] = useState(false)
  const [showMobileOtp, setShowMobileOtp] = useState(false)

  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [isMobileVerified, setIsMobileVerified] = useState(false)

  const [otpValues, setOtpValues] = useState({
    emailOtp: "",
    mobileOtp: ""
  })

  const [timer, setTimer] = useState(0)

  const [emailForOtp, setEmailForOtp] = useState("")
  const [mobileForOtp, setMobileForOtp] = useState("")

  const initialValues = {
    username: "",
    email: "",
    password: "",
    confirmpassword: "",
    phone: ""
  }

  const [formValues, setFormValues] = useState(initialValues)
  const [errors, setErrors] = useState({})

  /* ---------------- TIMER ---------------- */

  useEffect(() => {
    let interval

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [timer])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60

    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`
  }

  /* ---------------- PASSWORD ---------------- */

  const togglePasswordView = () => {
    setPasswordShow(!passwordShow)
  }

  const toggleConfirmPasswordView = () => {
    setConfirmPasswordShow(!confirmPasswordShow)
  }

  /* ---------------- FORM ---------------- */

  const handleForm = (e) => {
    const { name, value } = e.target

    if (name === "phone") {
      const onlyNums = value.replace(/[^0-9]/g, "")
      if (onlyNums.length <= 10) {
        setFormValues({
          ...formValues,
          [name]: onlyNums
        })
      }
    } else {
      setFormValues({
        ...formValues,
        [name]: value
      })
    }

    setErrors({
      ...errors,
      [name]: ""
    })
  }

  /* ---------------- EMAIL OTP ---------------- */

  const sendEmailOtp = async () => {
    if (!formValues.email) {
      alert("Enter email first")
      return
    }

    try {
      setIsLoading(true)

      const response = await api.post("/send-email-otp/", {
        email: formValues.email
      })

      if (response.status === 200 || response.status === 201) {
        setEmailForOtp(formValues.email)
        setShowEmailOtp(true)
        setTimer(180)
        alert("OTP Sent Successfully")
      }

    } catch (error) {
      alert(error.response?.data?.error || "Failed to send OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const verifyEmailOtp = async () => {
    try {
      setIsLoading(true)

      const response = await api.post("/verify-email-otp/", {
        email: emailForOtp,
        otp: otpValues.emailOtp
      })

      if (response.status === 200) {
        setIsEmailVerified(true)
        setShowEmailOtp(false)
        setTimer(0)
        alert("Email Verified")
      }

    } catch (error) {
      alert(error.response?.data?.error || "Invalid OTP")
    } finally {
      setIsLoading(false)
    }
  }

  /* ---------------- MOBILE OTP ---------------- */

  const sendMobileOtp = async () => {
    if (!formValues.phone) {
      alert("Enter mobile number first")
      return
    }

    setShowMobileOtp(true)
    setTimer(180)
    alert("OTP Sent : 123456")
  }

  const verifyMobileOtp = async () => {
    if (otpValues.mobileOtp === "123456") {
      setIsMobileVerified(true)
      setShowMobileOtp(false)
      setTimer(0)
      alert("Mobile Verified")
    } else {
      alert("Invalid OTP")
    }
  }

  /* ---------------- VALIDATION ---------------- */

  const validateForm = () => {
    const newErrors = {}

    if (!formValues.username.trim()) {
      newErrors.username = "Username required"
    }

    if (!formValues.email.trim()) {
      newErrors.email = "Email required"
    }

    if (!isEmailVerified) {
      newErrors.email = "Verify email first"
    }

    if (!formValues.password.trim()) {
      newErrors.password = "Password required"
    }

    if (formValues.password.length < 8) {
      newErrors.password = "Minimum 8 characters"
    }

    if (formValues.password !== formValues.confirmpassword) {
      newErrors.confirmpassword = "Passwords do not match"
    }

    if (!isMobileVerified) {
      newErrors.phone = "Verify mobile first"
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  /* ---------------- SIGNUP ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setIsLoading(true)

      const response = await api.post("/register/jobseeker/", {
        username: formValues.username,
        email: formValues.email,
        password: formValues.password,
        password_confirm: formValues.confirmpassword,
        phone: formValues.phone
      })

      if (response.status === 200 || response.status === 201) {
        alert("Signup Successful")
        navigate("/Job-portal/jobseeker/login")
      }

    } catch (error) {
      alert(error.response?.data?.error || "Signup Failed")
    } finally {
      setIsLoading(false)
    }
  }

  /* ---------------- GOOGLE LOGIN ---------------- */

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true)

      const response = await api.post(
        "/google-login/",
        {
          token: credentialResponse.credential,
          user_type: "jobseeker"
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      )

      localStorage.setItem("access", response.data.access)
      localStorage.setItem("refresh", response.data.refresh)
      localStorage.setItem("user", JSON.stringify(response.data.user))
      localStorage.setItem("user_type", response.data.user.user_type)

      alert("Google Signup Successful")

      navigate("/Job-portal/jobseeker")

    } catch (error) {
      alert(error.response?.data?.error || "Google Login Failed")
    } finally {
      setIsLoading(false)
    }
  }

  /* ---------------- OTP MODAL ---------------- */

  const renderOtpModal = (type) => {
    const isEmail = type === "email"
    const otpKey = isEmail ? "emailOtp" : "mobileOtp"

    return (
      <div className="otp-modal-overlay">
        <div className="otp-modal-content">

          <button
            className="back-arrow"
            onClick={() =>
              isEmail
                ? setShowEmailOtp(false)
                : setShowMobileOtp(false)
            }
          >
            Back
          </button>

          <div className="otp-icon-container">
            <img
              src={isEmail ? emailIcon : mobileIcon}
              alt="otp"
              className="otp-status-icon"
            />
          </div>

          <h3>
            {isEmail ? "Email Verification" : "Mobile Verification"}
          </h3>

          <div className="otp-input-group">
            <input
              type="text"
              maxLength="6"
              value={otpValues[otpKey]}
              onChange={(e) =>
                setOtpValues({
                  ...otpValues,
                  [otpKey]: e.target.value
                })
              }
            />
          </div>

          <p>{formatTime(timer)}</p>

          <button
            type="button"
            className="verify-final-btn"
            onClick={isEmail ? verifyEmailOtp : verifyMobileOtp}
          >
            Verify
          </button>

        </div>
      </div>
    )
  }

  return (
    <>
      <div className="j-sign-up-page">

        {showEmailOtp && renderOtpModal("email")}
        {showMobileOtp && renderOtpModal("mobile")}

        <header className="j-sign-up-header">

          <Link to="/" className="logo">
            <span className="logo-text">Job portal</span>
          </Link>

          <div className="j-sign-up-header-links">

            <span className="no-account">
              Already have an account?
            </span>

            <Link
              to="/Job-portal/jobseeker/login"
              className="signup-btn"
            >
              Login
            </Link>

            <div className="separator"></div>

            <Link
              to="/Job-portal/employer/login"
              className="employer-redirect-link"
            >
              Employers Login
            </Link>

          </div>
        </header>

        <div className="j-sign-up-body">

          <div className="signup-illustration">
            <img src={workTime} alt="signup" />
          </div>

          <form onSubmit={handleSubmit} className="j-sign-up-form">

            <h2>Sign up for Jobseeker</h2>

            <label>User name</label>
            <input
              type="text"
              name="username"
              value={formValues.username}
              onChange={handleForm}
              placeholder="Create Username"
            />
            {errors.username && (
              <span className="error-msg">{errors.username}</span>
            )}

            <label>Email ID</label>

            <div className="input-container">
              <input
                type="text"
                name="email"
                value={formValues.email}
                onChange={handleForm}
                placeholder="Enter Email"
                disabled={isEmailVerified}
              />

              {!isEmailVerified && (
                <button
                  type="button"
                  className="jsignup-small-verify-btn"
                  onClick={sendEmailOtp}
                >
                  Verify
                </button>
              )}

              {isEmailVerified && (
                <span className="verified-badge">
                  Verified
                </span>
              )}
            </div>

            {errors.email && (
              <span className="error-msg">{errors.email}</span>
            )}

            <label>Password</label>

            <div className="password-wrapper">
              <input
                type={passwordShow ? "password" : "text"}
                name="password"
                value={formValues.password}
                onChange={handleForm}
                placeholder="Password"
              />

              <span
                className="eye-icon"
                onClick={togglePasswordView}
              >
                <img
                  src={passwordShow ? eyeHide : eye}
                  alt="eye"
                />
              </span>
            </div>

            {errors.password && (
              <span className="error-msg">{errors.password}</span>
            )}

            <label>Confirm Password</label>

            <div className="password-wrapper">
              <input
                type={confirmPasswordShow ? "password" : "text"}
                name="confirmpassword"
                value={formValues.confirmpassword}
                onChange={handleForm}
                placeholder="Confirm Password"
              />

              <span
                className="eye-icon"
                onClick={toggleConfirmPasswordView}
              >
                <img
                  src={confirmPasswordShow ? eyeHide : eye}
                  alt="eye"
                />
              </span>
            </div>

            {errors.confirmpassword && (
              <span className="error-msg">
                {errors.confirmpassword}
              </span>
            )}

            <label>Mobile Number</label>

            <div className="input-container">
              <input
                type="text"
                name="phone"
                value={formValues.phone}
                onChange={handleForm}
                placeholder="Enter Mobile Number"
                disabled={isMobileVerified}
              />

              {!isMobileVerified && (
                <button
                  type="button"
                  className="jsignup-small-verify-btn"
                  onClick={sendMobileOtp}
                >
                  Verify
                </button>
              )}

              {isMobileVerified && (
                <span className="verified-badge">
                  Verified
                </span>
              )}
            </div>

            {errors.phone && (
              <span className="error-msg">{errors.phone}</span>
            )}

            <button
              type="submit"
              className="j-sign-up-submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing up..." : "Signup"}
            </button>

            <div className="divider">
              Or Continue with
            </div>

            <div className="google-btn">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => alert("Google Login Failed")}
              />
            </div>

          </form>
        </div>
      </div>
    </>
  )
}