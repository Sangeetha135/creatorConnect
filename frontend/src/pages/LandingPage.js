import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  useTheme,
  keyframes,
  Paper,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CampaignIcon from "@mui/icons-material/Campaign";
import PeopleIcon from "@mui/icons-material/People";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import SecurityIcon from "@mui/icons-material/Security";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BarChartIcon from "@mui/icons-material/BarChart";
import DevicesIcon from "@mui/icons-material/Devices";
import GroupsIcon from "@mui/icons-material/Groups";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

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
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const shine = keyframes`
  0% {
    background-position: -100px;
  }
  40%, 100% {
    background-position: 300px;
  }
`;

const FeatureCard = ({ icon, title, description, index }) => {
  const theme = useTheme();
  return (
    <Card
      sx={{
        height: "100%",
        transition: "all 0.3s ease-in-out",
        animation: `${fadeIn} 0.5s ease-out ${index * 0.1}s both`,
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.light}15 100%)`,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.05)",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: theme.shadows[10],
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.light}25 100%)`,
          borderColor: theme.palette.primary.light,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 2,
            animation: `${float} 3s ease-in-out infinite`,
            bgcolor: `${theme.palette.primary.main}15`,
            width: 64,
            height: 64,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="h6"
          component="h3"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 700,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

const TestimonialCard = ({ name, role, company, image, quote, index }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        animation: `${fadeIn} 0.5s ease-out ${index * 0.15}s both`,
        "&:hover": {
          boxShadow: theme.shadows[6],
          transform: "translateY(-3px)",
          transition: "all 0.3s ease",
        },
      }}
    >
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          mb: 3,
          fontStyle: "italic",
          position: "relative",
          "&:before": {
            content: '"""',
            fontSize: "4rem",
            color: "rgba(25, 118, 210, 0.1)",
            position: "absolute",
            top: "-2rem",
            left: "-1rem",
            fontFamily: "serif",
          },
        }}
      >
        {quote}
      </Typography>
      <Box sx={{ mt: "auto", display: "flex", alignItems: "center" }}>
        <Avatar
          src={image}
          alt={name}
          sx={{
            width: 48,
            height: 48,
            border: "2px solid",
            borderColor: theme.palette.primary.main,
          }}
        />
        <Box sx={{ ml: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {role}, {company}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

const StatsCard = ({ value, label, icon, index }) => {
  const theme = useTheme();
  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 3,
        textAlign: "center",
        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        overflow: "hidden",
        position: "relative",
        animation: `${fadeIn} 0.5s ease-out ${index * 0.15}s both`,
        "&:after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)",
          animation: `${shine} 3s infinite linear`,
        },
        "&:hover": {
          transform: "translateY(-5px)",
          transition: "transform 0.3s ease",
        },
      }}
    >
      <Box
        sx={{
          bgcolor: `${theme.palette.primary.main}10`,
          width: 60,
          height: 60,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 2,
          color: theme.palette.primary.main,
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="h3"
        fontWeight="bold"
        gutterBottom
        sx={{
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        {value}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {label}
      </Typography>
    </Card>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const features = [
    {
      icon: (
        <CampaignIcon
          sx={{ fontSize: 32, color: theme.palette.primary.main }}
        />
      ),
      title: "Campaign Management",
      description:
        "Create and manage influencer marketing campaigns with ease. Track performance and engagement in real-time.",
    },
    {
      icon: (
        <PeopleIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
      ),
      title: "Influencer Discovery",
      description:
        "Find the perfect influencers for your brand. Filter by niche, audience size, and engagement rates.",
    },
    {
      icon: (
        <AnalyticsIcon
          sx={{ fontSize: 32, color: theme.palette.primary.main }}
        />
      ),
      title: "Analytics Dashboard",
      description:
        "Comprehensive analytics and reporting tools to measure campaign success and ROI.",
    },
    {
      icon: (
        <SecurityIcon
          sx={{ fontSize: 32, color: theme.palette.primary.main }}
        />
      ),
      title: "Secure Platform",
      description:
        "Enterprise-grade security to protect your data and ensure safe transactions between brands and influencers.",
    },
    {
      icon: (
        <MonetizationOnIcon
          sx={{ fontSize: 32, color: theme.palette.primary.main }}
        />
      ),
      title: "Payment Integration",
      description:
        "Seamless payment processing for campaign payments and influencer earnings.",
    },
    {
      icon: (
        <VerifiedUserIcon
          sx={{ fontSize: 32, color: theme.palette.primary.main }}
        />
      ),
      title: "Verified Profiles",
      description:
        "Authenticated influencer profiles with verified metrics and audience demographics.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Director",
      company: "StyleCo",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      quote:
        "This platform has completely transformed how we run influencer campaigns. We've seen a 40% increase in engagement and a significant boost in sales conversion.",
    },
    {
      name: "David Chen",
      role: "Content Creator",
      company: "Travel Vibes",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      quote:
        "As an influencer, I love how easy it is to find relevant brand opportunities and manage my campaign deadlines. The analytics help me understand my performance better.",
    },
    {
      name: "Emily Rodriguez",
      role: "Social Media Manager",
      company: "Fusion Tech",
      image: "https://randomuser.me/api/portraits/women/65.jpg",
      quote:
        "The ROI tracking and campaign management tools have made my job so much easier. We can now run multiple campaigns simultaneously without any hassle.",
    },
  ];

  const stats = [
    {
      value: "5K+",
      label: "Brand Partners",
      icon: <GroupsIcon sx={{ fontSize: 24 }} />,
    },
    {
      value: "20K+",
      label: "Influencers",
      icon: <EmojiEventsIcon sx={{ fontSize: 24 }} />,
    },
    {
      value: "500M+",
      label: "Audience Reach",
      icon: <BarChartIcon sx={{ fontSize: 24 }} />,
    },
    {
      value: "10K+",
      label: "Campaigns Completed",
      icon: <CampaignIcon sx={{ fontSize: 24 }} />,
    },
  ];

  const platformBenefits = [
    "Direct connection between brands and influencers",
    "Transparent metrics and performance tracking",
    "Advanced audience demographics and insights",
    "Automated campaign management tools",
    "Secure payment processing system",
    "Real-time analytics and reporting dashboard",
  ];

  return (
    <Box sx={{ overflow: "hidden" }}>
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: "white",
          py: { xs: 8, md: 12 },
          mb: 8,
          position: "relative",
          overflow: "hidden",
          clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)",
            animation: `${pulse} 4s ease-in-out infinite`,
          },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  animation: `${fadeIn} 0.5s ease-out`,
                  textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
                  fontWeight: 800,
                  fontSize: { xs: "2.5rem", md: "3.5rem" },
                }}
              >
                Connect Brands with Influencers
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  animation: `${fadeIn} 0.5s ease-out 0.2s both`,
                  opacity: 0.9,
                  maxWidth: "90%",
                }}
              >
                The ultimate platform for influencer marketing success. Launch,
                manage, and scale your campaigns efficiently.
              </Typography>
              <Box
                sx={{
                  animation: `${fadeIn} 0.5s ease-out 0.4s both`,
                  display: "flex",
                  gap: 2,
                  flexWrap: { xs: "wrap", sm: "nowrap" },
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate("/register")}
                  sx={{
                    py: 1.5,
                    px: 3,
                    borderRadius: 3,
                    fontSize: "1rem",
                    fontWeight: 600,
                    boxShadow: "0 4px 14px 0 rgba(0,0,0,0.25)",
                    background: theme.palette.background.paper,
                    color: theme.palette.primary.main,
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
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
                    py: 1.5,
                    px: 3,
                    borderRadius: 3,
                    fontSize: "1rem",
                    borderColor: "white",
                    color: "white",
                    "&:hover": {
                      borderColor: "white",
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  Login
                </Button>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mt: 4,
                  animation: `${fadeIn} 0.5s ease-out 0.6s both`,
                }}
              >
                <Box sx={{ display: "flex" }}>
                  {[1, 2, 3].map((i) => (
                    <Avatar
                      key={i}
                      src={`https://randomuser.me/api/portraits/${
                        i % 2 ? "women" : "men"
                      }/${i + 20}.jpg`}
                      sx={{
                        width: 36,
                        height: 36,
                        border: "2px solid white",
                        ml: i === 1 ? 0 : -1,
                      }}
                    />
                  ))}
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Join 25,000+ brands and creators
                </Typography>
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              sx={{ display: { xs: "none", md: "block" } }}
            >
              <Box
                sx={{
                  position: "relative",
                  animation: `${float} 5s ease-in-out infinite`,
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1000"
                  alt="Influencer Marketing Dashboard"
                  style={{
                    width: "100%",
                    maxWidth: 550,
                    borderRadius: 12,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: -30,
                    right: -20,
                    background: "white",
                    borderRadius: 2,
                    p: 2,
                    boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                    animation: `${float} 4s ease-in-out 1s infinite`,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, color: "text.primary" }}
                  >
                    Campaign Results
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: 1,
                    }}
                  >
                    <BarChartIcon color="primary" />
                    <Typography
                      variant="body2"
                      color="primary"
                      fontWeight="bold"
                    >
                      +43% Engagement
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mb: 10 }}>
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <StatsCard {...stat} index={index} />
            </Grid>
          ))}
        </Grid>
      </Container>

      <Container maxWidth="lg" sx={{ mb: 12 }}>
        <Box sx={{ mb: 6, textAlign: "center" }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Powerful Platform Features
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto" }}
          >
            Everything you need to run successful influencer marketing campaigns
          </Typography>
        </Box>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <FeatureCard {...feature} index={index} />
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box
        sx={{
          bgcolor: theme.palette.grey[50],
          py: 10,
          mb: 12,
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "100%",
            background: `linear-gradient(90deg, ${theme.palette.primary.main}05 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ mb: 6, textAlign: "center" }}>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
              }}
            >
              How It Works
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: "auto" }}
            >
              Our platform simplifies the influencer marketing process for both
              brands and creators
            </Typography>
          </Box>

          <Grid container spacing={5} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h4"
                component="h3"
                gutterBottom
                sx={{ fontWeight: 600, color: theme.palette.primary.main }}
              >
                For Brands
              </Typography>
              <List>
                {[
                  "Create detailed campaign briefs",
                  "Browse and filter influencers based on audience demographics",
                  "Send campaign invitations to selected influencers",
                  "Review and approve submitted content",
                  "Track campaign performance with detailed analytics",
                ].map((item, index) => (
                  <ListItem key={index} sx={{ py: 1.5 }}>
                    <ListItemIcon
                      sx={{ color: theme.palette.primary.main, minWidth: 36 }}
                    >
                      <CheckCircleIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={item}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                ))}
              </List>
              <Button
                variant="contained"
                color="primary"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate("/register/brand")}
                sx={{ mt: 2, borderRadius: 2 }}
              >
                Register as Brand
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography
                variant="h4"
                component="h3"
                gutterBottom
                sx={{ fontWeight: 600, color: theme.palette.secondary.main }}
              >
                For Influencers
              </Typography>
              <List>
                {[
                  "Create a comprehensive profile showcasing your engagement rates",
                  "Connect your social media accounts for verified metrics",
                  "Browse campaign opportunities matching your audience",
                  "Submit content for review and approval",
                  "Track earnings and campaign performance",
                ].map((item, index) => (
                  <ListItem key={index} sx={{ py: 1.5 }}>
                    <ListItemIcon
                      sx={{ color: theme.palette.secondary.main, minWidth: 36 }}
                    >
                      <CheckCircleIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={item}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                ))}
              </List>
              <Button
                variant="contained"
                color="secondary"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate("/register/influencer")}
                sx={{ mt: 2, borderRadius: 2 }}
              >
                Register as Influencer
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mb: 12 }}>
        <Box sx={{ mb: 6, textAlign: "center" }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
            }}
          ></Typography>
        </Box>
      </Container>

      <Box
        sx={{
          bgcolor: theme.palette.primary.main,
          color: "white",
          py: 10,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
          },
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 700,
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              Ready to Transform Your Influencer Marketing?
            </Typography>
            <Typography
              variant="h6"
              sx={{ mb: 4, opacity: 0.9, maxWidth: 700, mx: "auto" }}
            >
              Join thousands of brands and influencers who are already
              experiencing the power of our platform.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/register")}
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: 3,
                fontSize: "1.1rem",
                fontWeight: 600,
                boxShadow: "0 4px 14px 0 rgba(0,0,0,0.25)",
                background: theme.palette.background.paper,
                color: theme.palette.primary.main,
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
                },
              }}
            >
              Get Started Now
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: theme.palette.grey[900], color: "white", py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                Influencer Platform
              </Typography>
              <Typography
                variant="body2"
                sx={{ maxWidth: 300, opacity: 0.7, mb: 2 }}
              >
                The all-in-one platform connecting brands with influencers for
                powerful marketing campaigns.
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <IconButton size="small" sx={{ color: "white" }}>
                  <YouTubeIcon />
                </IconButton>
                <IconButton size="small" sx={{ color: "white" }}>
                  <InstagramIcon />
                </IconButton>
                <IconButton size="small" sx={{ color: "white" }}>
                  <LinkedInIcon />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                Quick Links
              </Typography>
              <List dense disablePadding>
                {[
                  "Home",
                  "About Us",
                  "Features",
                  "Pricing",
                  "Blog",
                  "Contact",
                ].map((item, index) => (
                  <ListItem key={index} disablePadding sx={{ pb: 0.5 }}>
                    <Typography
                      variant="body2"
                      sx={{ opacity: 0.7, "&:hover": { opacity: 1 } }}
                    >
                      {item}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                Contact Us
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Email: info@influencerplatform.com
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7, mb: 2 }}>
                Phone: +1 (555) 123-4567
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.5 }}>
                © 2023 Influencer Platform. All rights reserved.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
