import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import {
  registerBrand,
  verifyEmail,
  resendVerificationCode,
} from "../features/auth/authSlice";

const steps = ["Registration Details", "Email Verification"];

const BrandRegister = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    website: "",
    industry: "",
    description: "",
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    if (!formData.password.trim()) errors.password = "Password is required";
    if (!formData.companyName.trim())
      errors.companyName = "Company name is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) errors.email = "Invalid email format";

    if (formData.password.length < 6)
      errors.password = "Password must be at least 6 characters";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await dispatch(registerBrand(formData)).unwrap();
      if (result) {
        setRegistrationSuccess(true);
        setActiveStep(1);
      }
    } catch (err) {
      console.error("Registration error:", err);
      setFormErrors({
        submit: err.message || "Registration failed. Please try again.",
      });
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (!verificationCode) {
      setFormErrors({ verification: "Please enter the verification code" });
      return;
    }

    try {
      await dispatch(
        verifyEmail({ email: formData.email, code: verificationCode })
      ).unwrap();
      navigate("/login", {
        state: { message: "Email verified successfully! Please login." },
      });
    } catch (err) {
      setFormErrors({
        verification: err.message || "Verification failed. Please try again.",
      });
    }
  };

  const handleResendCode = async () => {
    try {
      await dispatch(
        resendVerificationCode({ email: formData.email })
      ).unwrap();
      setFormErrors({});
      setFormErrors({ resend: "Verification code sent successfully!" });
    } catch (err) {
      setFormErrors({ resend: err.message || "Failed to resend code" });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Company Name"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              error={!!formErrors.companyName}
              helperText={formErrors.companyName}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Website"
              name="website"
              value={formData.website}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Industry"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Description"
              name="description"
              multiline
              rows={2}
              maxRows={3}
              value={formData.description}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? "Registering..." : "Register as Brand"}
            </Button>
          </Box>
        );
      case 1:
        return (
          <Box component="form" onSubmit={handleVerifyEmail}>
            <Typography variant="body1" align="center" sx={{ mb: 3 }}>
              Please enter the verification code sent to {formData.email}
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              error={!!formErrors.verification}
              helperText={formErrors.verification}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify Email"}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleResendCode}
              disabled={loading}
            >
              Resend Verification Code
            </Button>
            {formErrors.resend && (
              <Typography
                color={
                  formErrors.resend.includes("successfully")
                    ? "success"
                    : "error"
                }
                align="center"
                sx={{ mt: 2 }}
              >
                {formErrors.resend}
              </Typography>
            )}
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Brand Registration
        </Typography>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {renderStepContent(activeStep)}
        {(error || formErrors.submit) && (
          <Typography
            color="error"
            align="center"
            sx={{
              mt: 2,
              p: 2,
              bgcolor: "error.light",
              borderRadius: 1,
              color: "error.contrastText",
            }}
          >
            {error || formErrors.submit}
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default BrandRegister;
