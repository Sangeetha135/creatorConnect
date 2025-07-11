import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
} from "@mui/material";
import {
  verifyEmail,
  resendVerificationCode,
} from "../features/auth/authSlice";

const VerifyEmail = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isResending, setIsResending] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useSelector((state) => state.auth);

  React.useEffect(() => {
    const emailFromState = location.state?.email;
    const emailFromParams = new URLSearchParams(location.search).get("email");
    setEmail(emailFromState || emailFromParams || "");
  }, [location]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!verificationCode) {
      setError("Please enter the verification code");
      return;
    }

    try {
      const result = await dispatch(
        verifyEmail({ email, code: verificationCode })
      ).unwrap();
      setMessage("Email verified successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setError(error.message || "Verification failed. Please try again.");
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError("Email is required to resend verification code");
      return;
    }

    setIsResending(true);
    setError("");
    setMessage("");

    try {
      await dispatch(resendVerificationCode({ email })).unwrap();
      setMessage("Verification code has been resent to your email");
    } catch (error) {
      setError(error.message || "Failed to resend verification code");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Verify Your Email
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 3 }}>
          Please enter the verification code sent to {email}
        </Typography>
        <Box component="form" onSubmit={handleVerify}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Verification Code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            error={!!error}
            helperText={error}
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
            disabled={isResending}
            sx={{ mb: 2 }}
          >
            {isResending ? "Resending..." : "Resend Verification Code"}
          </Button>
          {message && (
            <Typography color="primary" align="center">
              {message}
            </Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default VerifyEmail;
