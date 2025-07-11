import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Grid,
  useTheme,
  Card,
  CardContent,
  CardActionArea,
  Divider,
  keyframes,
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const RegisterChoice = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const options = [
    {
      title: "Brand",
      icon: (
        <BusinessIcon
          sx={{ fontSize: 48, color: theme.palette.primary.main }}
        />
      ),
      description:
        "Collaborate with influencers to promote your products and services",
      benefits: [
        "Create and manage marketing campaigns",
        "Find relevant influencers for your niche",
        "Track campaign analytics and ROI",
        "Access detailed audience demographics",
      ],
      color: theme.palette.primary.main,
      path: "/register/brand",
    },
    {
      title: "Influencer",
      icon: (
        <PersonIcon
          sx={{ fontSize: 48, color: theme.palette.secondary.main }}
        />
      ),
      description: "Connect with brands and monetize your audience",
      benefits: [
        "Discover brand partnership opportunities",
        "Showcase your audience metrics",
        "Track your campaign performance",
        "Manage payments and collaborations",
      ],
      color: theme.palette.secondary.main,
      path: "/register/influencer",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[100]} 100%)`,
        py: 8,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
            overflow: "hidden",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "6px",
              background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            },
          }}
        >
          <Box
            sx={{
              textAlign: "center",
              mb: 4,
              animation: `${fadeIn} 0.6s ease-out`,
            }}
          >
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Join our Influencer Platform
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Select your account type to get started
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {options.map((option, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    transition: "all 0.3s ease",
                    animation: `${fadeIn} 0.6s ease-out ${index * 0.2}s`,
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
                      "& .MuiSvgIcon-root": {
                        animation: `${float} 2s ease-in-out infinite`,
                      },
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => handleNavigation(option.path)}
                    sx={{
                      height: "100%",
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <CardContent sx={{ width: "100%" }}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 80,
                            height: 80,
                            borderRadius: "50%",
                            backgroundColor: `${option.color}15`,
                            mb: 2,
                          }}
                        >
                          {option.icon}
                        </Box>
                        <Typography
                          variant="h5"
                          component="h2"
                          gutterBottom
                          fontWeight={600}
                          color={option.color}
                        >
                          {option.title}
                        </Typography>
                      </Box>

                      <Typography
                        variant="body1"
                        gutterBottom
                        align="center"
                        sx={{ mb: 2 }}
                      >
                        {option.description}
                      </Typography>

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ pl: 1 }}>
                        {option.benefits.map((benefit, i) => (
                          <Box
                            key={i}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                bgcolor: option.color,
                                mr: 1.5,
                              }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {benefit}
                            </Typography>
                          </Box>
                        ))}
                      </Box>

                      <Box
                        sx={{
                          mt: 3,
                          textAlign: "center",
                        }}
                      >
                        <Button
                          variant="contained"
                          endIcon={<ArrowForwardIcon />}
                          onClick={() => handleNavigation(option.path)}
                          sx={{
                            backgroundColor: option.color,
                            borderRadius: 2,
                            px: 3,
                            "&:hover": {
                              backgroundColor: option.color,
                              opacity: 0.9,
                            },
                          }}
                        >
                          Register as {option.title}
                        </Button>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Typography
                component="span"
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  cursor: "pointer",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
                onClick={() => navigate("/login")}
              >
                Log in
              </Typography>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterChoice;
