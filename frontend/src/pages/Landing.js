import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
  Paper,
  keyframes,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Campaign as CampaignIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
} from "@mui/icons-material";

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
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const Landing = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const features = [
    {
      icon: <CampaignIcon sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Campaign Management",
      description:
        "Create and manage influencer campaigns with ease. Track progress and engagement in real-time.",
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Influencer Network",
      description:
        "Connect with a diverse network of influencers. Find the perfect match for your brand.",
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Performance Analytics",
      description:
        "Get detailed insights into campaign performance. Make data-driven decisions.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Director, TechCorp",
      avatar: "/avatars/sarah.jpg",
      content:
        "This platform has transformed how we approach influencer marketing. The analytics and campaign management tools are exceptional.",
    },
    {
      name: "Michael Chen",
      role: "Content Creator",
      avatar: "/avatars/michael.jpg",
      content:
        "As an influencer, I've found amazing brand partnerships through this platform. The process is seamless and professional.",
    },
    {
      name: "Emily Rodriguez",
      role: "Brand Manager, FashionHouse",
      avatar: "/avatars/emily.jpg",
      content:
        "The ROI tracking and influencer matching features have helped us achieve our marketing goals more effectively than ever.",
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box
        sx={{
          py: 10,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ animation: `${fadeIn} 0.8s ease-out` }}>
                <Typography
                  variant="h2"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    color: "primary.main",
                    animation: `${float} 3s ease-in-out infinite`,
                  }}
                >
                  Connect Brands with Influencers
                </Typography>
                <Typography
                  variant="h5"
                  color="text.secondary"
                  paragraph
                  sx={{ mb: 4 }}
                >
                  The all-in-one platform for influencer marketing. Create
                  campaigns, connect with influencers, and track performance in
                  one place.
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate("/register")}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: "none",
                      fontSize: "1.1rem",
                      transition: "all 0.3s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                      },
                    }}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate("/login")}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: "none",
                      fontSize: "1.1rem",
                      transition: "all 0.3s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                      },
                    }}
                  >
                    Sign In
                  </Button>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  animation: `${fadeIn} 0.8s ease-out 0.2s backwards`,
                }}
              >
                <Paper
                  elevation={24}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    maxWidth: 500,
                    width: "100%",
                    background: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(10px)",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-5px)",
                    },
                  }}
                >
                  <Typography variant="h6" gutterBottom color="primary.main">
                    Platform Statistics
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Typography
                        variant="h3"
                        color="primary.main"
                        gutterBottom
                      >
                        1000+
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Influencers
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        variant="h3"
                        color="primary.main"
                        gutterBottom
                      >
                        500+
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Successful Campaigns
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        variant="h3"
                        color="primary.main"
                        gutterBottom
                      >
                        50M+
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Reach
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        variant="h3"
                        color="primary.main"
                        gutterBottom
                      >
                        95%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Client Satisfaction
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: 10, bgcolor: "background.default" }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{
              mb: 6,
              fontWeight: 700,
              color: "primary.main",
            }}
          >
            Why Choose Our Platform
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    transition: "all 0.3s ease-in-out",
                    animation: `${fadeIn} 0.5s ease-out ${
                      index * 0.1
                    }s backwards`,
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: "center" }}>
                    <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                    <Typography
                      variant="h5"
                      component="h3"
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{
              mb: 6,
              fontWeight: 700,
              color: "primary.main",
            }}
          >
            How It Works
          </Typography>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ animation: `${fadeIn} 0.8s ease-out` }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", mb: 4 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "bold",
                      mr: 2,
                    }}
                  >
                    1
                  </Box>
                  <Box>
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      Create Your Profile
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Sign up as a brand or influencer and complete your profile
                      with relevant information.
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "flex-start", mb: 4 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "bold",
                      mr: 2,
                    }}
                  >
                    2
                  </Box>
                  <Box>
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      Connect with Partners
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Browse and connect with potential partners based on your
                      criteria and preferences.
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "bold",
                      mr: 2,
                    }}
                  >
                    3
                  </Box>
                  <Box>
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      Launch Campaigns
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Create and manage campaigns, track performance, and
                      achieve your marketing goals.
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  animation: `${fadeIn} 0.8s ease-out 0.2s backwards`,
                }}
              >
                <Paper
                  elevation={24}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    maxWidth: 500,
                    width: "100%",
                    background: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(10px)",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-5px)",
                    },
                  }}
                >
                  <Typography variant="h6" gutterBottom color="primary.main">
                    Platform Benefits
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <CheckCircleIcon sx={{ color: "success.main", mr: 1 }} />
                    <Typography variant="body1">
                      Easy campaign creation and management
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <CheckCircleIcon sx={{ color: "success.main", mr: 1 }} />
                    <Typography variant="body1">
                      Advanced analytics and reporting
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <CheckCircleIcon sx={{ color: "success.main", mr: 1 }} />
                    <Typography variant="body1">
                      Secure payment processing
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <CheckCircleIcon sx={{ color: "success.main", mr: 1 }} />
                    <Typography variant="body1">
                      Dedicated support team
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CheckCircleIcon sx={{ color: "success.main", mr: 1 }} />
                    <Typography variant="body1">
                      Regular platform updates and improvements
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: 10, bgcolor: "background.default" }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{
              mb: 6,
              fontWeight: 700,
              color: "primary.main",
            }}
          >
            What Our Users Say
          </Typography>
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    transition: "all 0.3s ease-in-out",
                    animation: `${fadeIn} 0.5s ease-out ${
                      index * 0.1
                    }s backwards`,
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar
                        src={testimonial.avatar}
                        sx={{ width: 60, height: 60, mr: 2 }}
                      />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body1" sx={{ fontStyle: "italic" }}>
                      "{testimonial.content}"
                    </Typography>
                    <Box sx={{ display: "flex", mt: 2 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon key={star} sx={{ color: "warning.main" }} />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: 10 }}>
        <Container maxWidth="md">
          <Paper
            elevation={24}
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: 4,
              animation: `${fadeIn} 0.8s ease-out`,
            }}
          >
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: "primary.main",
                mb: 2,
              }}
            >
              Ready to Transform Your Influencer Marketing?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Join thousands of brands and influencers who have already
              discovered the power of our platform.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/register")}
              endIcon={<ArrowForwardIcon />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontSize: "1.1rem",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                },
              }}
            >
              Get Started Now
            </Button>
          </Paper>
        </Container>
      </Box>

      <Box
        sx={{
          py: 4,
          bgcolor: "background.paper",
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom color="primary.main">
                About Us
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We connect brands with influencers to create impactful marketing
                campaigns. Our platform makes it easy to manage, track, and
                optimize your influencer marketing efforts.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom color="primary.main">
                Quick Links
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Button
                  variant="text"
                  color="inherit"
                  onClick={() => navigate("/about")}
                  sx={{ justifyContent: "flex-start", textTransform: "none" }}
                >
                  About Us
                </Button>
                <Button
                  variant="text"
                  color="inherit"
                  onClick={() => navigate("/contact")}
                  sx={{ justifyContent: "flex-start", textTransform: "none" }}
                >
                  Contact Us
                </Button>
                <Button
                  variant="text"
                  color="inherit"
                  onClick={() => navigate("/privacy")}
                  sx={{ justifyContent: "flex-start", textTransform: "none" }}
                >
                  Privacy Policy
                </Button>
                <Button
                  variant="text"
                  color="inherit"
                  onClick={() => navigate("/terms")}
                  sx={{ justifyContent: "flex-start", textTransform: "none" }}
                >
                  Terms of Service
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom color="primary.main">
                Contact Us
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Email: info@influencerplatform.com
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Phone: +1 (555) 123-4567
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Address: 123 Marketing Ave, Suite 100, New York, NY 10001
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4 }} />
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Influencer Platform. All rights
            reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;
