import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
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
  Alert,
  Avatar,
  styled,
  Chip,
  IconButton,
  Autocomplete,
} from "@mui/material";
import { Person, YouTube, PhotoCamera, Add } from "@mui/icons-material";
import {
  registerInfluencer,
  verifyEmail,
  resendVerificationCode,
} from "../../features/auth/authSlice";
import api from "../../services/api";
import authService from "../../services/authService";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(8),
  marginBottom: theme.spacing(8),
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  backdropFilter: "blur(8px)",
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: "linear-gradient(90deg, #FF0000 0%, #FF4B4B 100%)",
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  margin: theme.spacing(1),
  backgroundColor: theme.palette.error.main,
  width: 56,
  height: 56,
}));

const steps = [
  "Basic Information",
  "Email Verification",
  "YouTube Authentication",
  "Profile Details",
];

const expertiseOptions = [
  "Lifestyle",
  "Fashion",
  "Beauty",
  "Technology",
  "Gaming",
  "Food",
  "Travel",
  "Fitness",
  "Health",
  "Education",
  "Business",
  "Entertainment",
  "Music",
  "Art",
  "Photography",
  "Sports",
  "Parenting",
  "Pets",
];

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const InfluencerRegister = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [activeStep, setActiveStep] = useState(() => {
    const savedStep = localStorage.getItem("registrationStep");
    return savedStep ? parseInt(savedStep, 10) : 0;
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    bio: "",
    expertise: [],
    socialLinks: {
      instagram: "",
      twitter: "",
      tiktok: "",
    },
    profilePictureUrl:
      "https://ui-avatars.com/api/?background=random&name=User",
  });

  const { error } = useSelector((state) => state.auth);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const youtubeData = urlParams.get("youtubeData");
      const error = urlParams.get("error");
      const isAwaitingAuth =
        localStorage.getItem("awaitingYouTubeAuth") === "true";

      if (isAwaitingAuth) {
        if (error) {
          console.error("YouTube auth error:", error);
          setFormErrors({ youtube: `YouTube authorization failed: ${error}` });
          localStorage.removeItem("awaitingYouTubeAuth");
        } else if (youtubeData) {
          try {
            const decodedData = JSON.parse(decodeURIComponent(youtubeData));
            setFormData((prev) => ({
              ...prev,
              youtube: decodedData,
            }));

            setActiveStep(3);
            localStorage.setItem("registrationStep", "3");
            localStorage.removeItem("awaitingYouTubeAuth");

            navigate("/register/influencer", {
              state: { activeStep: 3 },
            });
          } catch (error) {
            setFormErrors({ youtube: "Failed to process YouTube data" });
          }
        }
      }
    };

    checkAuthStatus();
  }, [location, navigate]);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    if (!formData.password.trim()) errors.password = "Password is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) errors.email = "Invalid email format";

    if (formData.password.length < 6)
      errors.password = "Password must be at least 6 characters";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const result = await dispatch(
        registerInfluencer({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        })
      ).unwrap();

      if (result) {
        if (result.token) {
          authService.setToken(result.token);
          authService.setUser({
            id: result.userId,
            name: result.name,
            email: result.email,
            role: result.role,
            isVerified: result.isVerified,
          });
        }
        setRegistrationSuccess(true);
        setUserId(result.userId);
        if (result.verificationCode) {
          setVerificationCode(result.verificationCode);
        }
        handleNext();
      }
    } catch (err) {
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
      const result = await dispatch(
        verifyEmail({
          email: formData.email,
          code: verificationCode,
        })
      ).unwrap();

      if (result.isVerified) {
        if (result.token) {
          authService.setToken(result.token);
          authService.setUser({
            id: result.userId,
            name: result.name,
            email: result.email,
            role: result.role,
            isVerified: true,
          });
        }
        handleNext();
      }
    } catch (err) {
      setFormErrors({
        verification: err.message || "Verification failed. Please try again.",
      });
    }
  };

  const handleResendCode = async () => {
    try {
      const result = await dispatch(
        resendVerificationCode({ email: formData.email })
      ).unwrap();
      if (result.verificationCode) {
        setVerificationCode(result.verificationCode);
      }
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

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setProfileData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setProfileData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileData((prev) => ({
        ...prev,
        profilePictureUrl: URL.createObjectURL(file),
      }));
    }
  };

  const handleExpertiseChange = (event, newValue) => {
    setProfileData((prev) => ({
      ...prev,
      expertise: newValue,
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await api.put(
        "/api/users/profile",
        {
          name: formData.name,
          bio: profileData.bio,
          categories: profileData.expertise,
          socialLinks: profileData.socialLinks,
          profilePictureUrl: profileData.profilePictureUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        const userData = authService.getUser();
        authService.setUser({
          ...userData,
          ...response.data.user,
        });
        navigate("/dashboard");
      }
    } catch (error) {
      setFormErrors({
        submit:
          error.response?.data?.message || "Failed to complete profile setup",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 3,
              }}
            >
              <StyledAvatar>
                <Person fontSize="large" />
              </StyledAvatar>
              <Typography variant="h5" component="h2">
                Personal Information
              </Typography>
            </Box>
            <StyledTextField
              required
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
            />
            <StyledTextField
              required
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
            <StyledTextField
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="error"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? "Registering..." : "Continue"}
            </Button>
          </Box>
        );
      case 1:
        return (
          <Box component="form" onSubmit={handleVerifyEmail} sx={{ mt: 4 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 3,
              }}
            >
              <StyledAvatar>
                <Person fontSize="large" />
              </StyledAvatar>
              <Typography variant="h5" component="h2">
                Email Verification
              </Typography>
            </Box>
            <Typography variant="body1" align="center" sx={{ mb: 3 }}>
              Please enter the verification code sent to {formData.email}
            </Typography>
            <StyledTextField
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
              color="error"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify Email"}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              onClick={handleResendCode}
              disabled={loading}
            >
              Resend Verification Code
            </Button>
            {formErrors.resend && (
              <Alert
                severity={
                  formErrors.resend.includes("successfully")
                    ? "success"
                    : "error"
                }
                sx={{ mt: 2 }}
              >
                {formErrors.resend}
              </Alert>
            )}
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 3,
              }}
            >
              <StyledAvatar sx={{ backgroundColor: "#FF0000" }}>
                <YouTube fontSize="large" />
              </StyledAvatar>
              <Typography variant="h5" component="h2">
                Connect YouTube Channel
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 4 }}>
              To complete your registration, please connect your YouTube
              channel. This will allow brands to view your channel statistics
              and engagement metrics.
            </Typography>
            <Button
              variant="contained"
              color="error"
              startIcon={<YouTube />}
              onClick={handleYouTubeConnect}
              disabled={loading}
              sx={{
                py: 2,
                px: 4,
                backgroundColor: "#FF0000",
                "&:hover": {
                  backgroundColor: "#D90000",
                },
              }}
            >
              Connect YouTube Channel
            </Button>
            {formErrors.youtube && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {formErrors.youtube}
              </Alert>
            )}
          </Box>
        );
      case 3:
        return renderProfileDetailsStep();
      default:
        return null;
    }
  };

  const handleYouTubeConnect = async () => {
    try {
      setLoading(true);
      setFormErrors({});

      const token = authService.getToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await api.get("/api/youtube/auth-url", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.authUrl) {
        localStorage.setItem("registrationStep", "2");
        localStorage.setItem("awaitingYouTubeAuth", "true");
        localStorage.setItem("youtubeRedirectUrl", window.location.href);

        window.location.href = response.data.authUrl;
      } else {
        throw new Error("Failed to get YouTube authorization URL");
      }
    } catch (error) {
      console.error("YouTube connection error:", error);
      setFormErrors({
        youtube:
          error.message || "Failed to connect to YouTube. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    const nextStep = activeStep + 1;
    setActiveStep(nextStep);
    localStorage.setItem("registrationStep", nextStep.toString());
  };

  const handleBack = () => {
    const prevStep = activeStep - 1;
    setActiveStep(prevStep);
    localStorage.setItem("registrationStep", prevStep.toString());
  };

  const renderProfileDetailsStep = () => {
    return (
      <Box component="form" onSubmit={handleProfileSubmit} noValidate>
        <Box
          sx={{
            mb: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar
            src={
              profileData.profilePictureUrl ||
              `https://ui-avatars.com/api/?background=random&name=${
                formData.name || "User"
              }`
            }
            sx={{ width: 100, height: 100, mb: 1 }}
            alt="Profile Picture"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?background=random&name=${
                formData.name || "User"
              }`;
            }}
          />
          <StyledTextField
            fullWidth
            label="Profile Picture URL"
            name="profilePictureUrl"
            value={profileData.profilePictureUrl}
            onChange={(e) =>
              setProfileData((prev) => ({
                ...prev,
                profilePictureUrl: e.target.value,
              }))
            }
            placeholder="Enter the URL of your profile picture"
            sx={{ mt: 2 }}
          />
        </Box>

        <StyledTextField
          fullWidth
          multiline
          rows={2}
          maxRows={3}
          label="Bio"
          name="bio"
          value={profileData.bio}
          onChange={(e) =>
            setProfileData((prev) => ({ ...prev, bio: e.target.value }))
          }
          placeholder="Tell us about yourself..."
        />

        <Autocomplete
          multiple
          options={expertiseOptions}
          value={profileData.expertise}
          onChange={handleExpertiseChange}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Areas of Expertise"
              placeholder="Select your areas of expertise"
              margin="normal"
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const tagProps = getTagProps({ index });
              const { key, ...otherProps } = tagProps;
              return (
                <Chip
                  key={key}
                  {...otherProps}
                  label={option}
                  color="primary"
                  variant="outlined"
                />
              );
            })
          }
        />

        <StyledTextField
          fullWidth
          label="Instagram Profile"
          name="instagram"
          value={profileData.socialLinks.instagram}
          onChange={(e) =>
            setProfileData((prev) => ({
              ...prev,
              socialLinks: { ...prev.socialLinks, instagram: e.target.value },
            }))
          }
          placeholder="@username"
        />

        {/* <StyledTextField
          fullWidth
          label="TikTok Profile"
          name="tiktok"
          value={profileData.socialLinks.tiktok}
          onChange={(e) => setProfileData(prev => ({
            ...prev,
            socialLinks: { ...prev.socialLinks, tiktok: e.target.value }
          }))}
          placeholder="@username"
        /> */}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ mt: 3 }}
        >
          Complete Profile
        </Button>

        {formErrors.submit && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {formErrors.submit}
          </Alert>
        )}
      </Box>
    );
  };

  useEffect(() => {
    return () => {
      if (!localStorage.getItem("awaitingYouTubeAuth")) {
        localStorage.removeItem("registrationStep");
      }
    };
  }, []);

  return (
    <Container maxWidth="sm">
      <StyledPaper>
        <Typography
          component="h1"
          variant="h4"
          align="center"
          color="error"
          gutterBottom
        >
          Join as a Creator
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          gutterBottom
        >
          Connect with brands and grow your influence
        </Typography>
        <Box sx={{ width: "100%", mt: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label} completed={index < activeStep}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        {renderStepContent(activeStep)}
        {(error || formErrors.submit) && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error || formErrors.submit}
          </Alert>
        )}
      </StyledPaper>
    </Container>
  );
};

export default InfluencerRegister;
