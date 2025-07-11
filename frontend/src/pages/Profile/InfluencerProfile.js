import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  FaYoutube,
  FaInstagram,
  FaTiktok,
  FaChartLine,
  FaStar,
  FaMapMarkerAlt,
  FaLanguage,
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import api from "../../services/api";
import "./InfluencerProfile.css";
import YouTubeAnalytics from "../../components/YouTubeAnalytics/YouTubeAnalytics";
import { Typography } from "@mui/material";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const InfluencerProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const [profileData, setProfileData] = useState(null);
  const [campaignStats, setCampaignStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeContentTab, setActiveContentTab] = useState("youtube");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const profileResponse = await api.get("/api/users/profile");
        setProfileData(profileResponse.data);

        const statsResponse = await api.get(
          `/api/users/campaign-stats/${user._id}`
        );
        setCampaignStats(statsResponse.data);

        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, [user._id]);

  const formatNumber = (num) => {
    if (num === undefined || num === null) return 0;
    const number = parseInt(num, 10);
    if (isNaN(number)) return 0;
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + "M";
    }
    if (number >= 1000) {
      return (number / 1000).toFixed(1) + "K";
    }
    return number;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getEngagementRate = (platform) => {
    const data = profileData?.socialMedia?.[platform];
    if (!data) return 0;

    let totalEngagement = 0;
    let totalFollowers = 0;

    switch (platform) {
      case "youtube":
        totalFollowers = data.subscribers || 0;
        totalEngagement =
          data.recentVideos?.reduce(
            (sum, video) => sum + (video.views || 0),
            0
          ) || 0;
        break;
      case "instagram":
        totalFollowers = data.followers || 0;
        totalEngagement =
          data.recentPosts?.reduce(
            (sum, post) => sum + (post.likes || 0) + (post.comments || 0),
            0
          ) || 0;
        break;
      case "tiktok":
        totalFollowers = data.followers || 0;
        totalEngagement =
          data.recentVideos?.reduce(
            (sum, video) =>
              sum +
              (video.likes || 0) +
              (video.comments || 0) +
              (video.shares || 0),
            0
          ) || 0;
        break;
    }

    return totalFollowers > 0
      ? ((totalEngagement / totalFollowers) * 100).toFixed(2)
      : 0;
  };

  const prepareChartData = () => {
    if (!profileData?.analytics?.monthlyStats) return null;

    const labels = profileData.analytics.monthlyStats.map((stat) =>
      new Date(stat.month).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    );

    return {
      labels,
      datasets: [
        {
          label: "Views",
          data: profileData.analytics.monthlyStats.map((stat) => stat.views),
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
        {
          label: "Engagement",
          data: profileData.analytics.monthlyStats.map(
            (stat) => stat.engagement
          ),
          borderColor: "rgb(255, 99, 132)",
          tension: 0.1,
        },
      ],
    };
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-cover"></div>
        <div className="profile-info">
          <div className="profile-avatar">
            <img
              src={
                profileData?.profilePictureUrl ||
                `https://ui-avatars.com/api/?name=${
                  profileData?.name || "User"
                }&background=random`
              }
              alt={profileData?.name}
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${
                  profileData?.name || "User"
                }&background=random`;
              }}
            />
          </div>
          <div className="profile-details">
            <div className="profile-name">
              <h1>{profileData?.name}</h1>
              {profileData?.isVerified && (
                <MdVerified
                  className="verified-icon"
                  title="Verified Influencer"
                />
              )}
            </div>
            <div className="profile-meta">
              {profileData?.location && (
                <span className="meta-item">
                  <FaMapMarkerAlt /> {profileData.location}
                </span>
              )}
              {profileData?.languages?.length > 0 && (
                <span className="meta-item">
                  <FaLanguage /> {profileData.languages.join(", ")}
                </span>
              )}
              {profileData?.rating > 0 && (
                <span className="meta-item">
                  <FaStar /> {profileData.rating.toFixed(1)} (
                  {profileData.totalReviews} reviews)
                </span>
              )}
            </div>
            <p className="profile-bio">
              {profileData?.bio || "No bio available"}
            </p>
            <div className="profile-categories">
              {profileData?.categories?.map((category, index) => (
                <span key={index} className="category-tag">
                  {category}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </button>
        <button
          className={`tab-button ${activeTab === "content" ? "active" : ""}`}
          onClick={() => setActiveTab("content")}
        >
          Content
        </button>
      </div>

      <div className="profile-content">
        {activeTab === "overview" && (
          <div className="overview-section">
            <div className="campaign-statistics">
              <h2>Campaign Statistics</h2>
              <div className="stats-cards">
                <div className="stat-card total">
                  <div className="stat-value">
                    {campaignStats?.totalCampaigns || 0}
                  </div>
                  <div className="stat-label">Total Campaigns</div>
                </div>
                <div className="stat-card completed">
                  <div className="stat-value">
                    {campaignStats?.completedCampaigns || 0}
                  </div>
                  <div className="stat-label">Completed Campaigns</div>
                </div>
                <div className="stat-card active">
                  <div className="stat-value">
                    {campaignStats?.activeCampaigns || 0}
                  </div>
                  <div className="stat-label">Active Campaigns</div>
                </div>
                <div className="stat-card pending">
                  <div className="stat-value">
                    {campaignStats?.pendingCampaigns || 0}
                  </div>
                  <div className="stat-label">Pending Campaigns</div>
                </div>
                <div className="stat-card influencers">
                  <div className="stat-value">
                    {campaignStats?.totalInfluencers || 0}
                  </div>
                  <div className="stat-label">Total Influencers</div>
                </div>
                <div className="stat-card budget">
                  <div className="stat-value">
                    ${formatNumber(campaignStats?.totalEarnings || 0)}
                  </div>
                  <div className="stat-label">Total Earnings</div>
                </div>
                <div className="stat-card success">
                  <div className="stat-value">
                    {campaignStats?.successRate || 0}%
                  </div>
                  <div className="stat-label">Success Rate</div>
                </div>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <h3>Social Media</h3>
                {profileData?.youtube && (
                  <div className="platform-stats">
                    <FaYoutube className="platform-icon youtube" />
                    <div className="platform-details">
                      <span>
                        {formatNumber(profileData.youtube.subscriberCount)}{" "}
                        subscribers
                      </span>
                      <span>
                        {formatNumber(profileData.youtube.totalViews)} total
                        views
                      </span>
                      <span>
                        {profileData.youtube.engagementRate?.toFixed(2) ||
                          "0.00"}
                        % engagement rate
                      </span>
                    </div>
                  </div>
                )}
                {profileData?.socialMedia?.instagram && (
                  <div className="platform-stats">
                    <FaInstagram className="platform-icon instagram" />
                    <div className="platform-details">
                      <span>
                        {formatNumber(
                          profileData.socialMedia.instagram.followers
                        )}{" "}
                        followers
                      </span>
                      <span>
                        {formatNumber(profileData.socialMedia.instagram.posts)}{" "}
                        posts
                      </span>
                      <span>
                        {getEngagementRate("instagram")}% engagement rate
                      </span>
                    </div>
                  </div>
                )}
                {profileData?.socialMedia?.tiktok && (
                  <div className="platform-stats">
                    <FaTiktok className="platform-icon tiktok" />
                    <div className="platform-details">
                      <span>
                        {formatNumber(profileData.socialMedia.tiktok.followers)}{" "}
                        followers
                      </span>
                      <span>
                        {formatNumber(profileData.socialMedia.tiktok.likes)}{" "}
                        likes
                      </span>
                      <span>
                        {getEngagementRate("tiktok")}% engagement rate
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="analytics-section">
            {profileData?.youtube ? (
              <YouTubeAnalytics analytics={profileData.youtube} />
            ) : (
              <div className="no-analytics">
                <Typography variant="h6" color="text.secondary" align="center">
                  No YouTube analytics available. Please connect your YouTube
                  channel to view analytics.
                </Typography>
              </div>
            )}
          </div>
        )}

        {activeTab === "content" && (
          <div className="content-section">
            <div className="recent-content">
              <h3>Recent Content</h3>
              <div className="content-tabs">
                {profileData?.youtube && (
                  <button
                    className={`content-tab ${
                      activeContentTab === "youtube" ? "active" : ""
                    }`}
                    onClick={() => setActiveContentTab("youtube")}
                  >
                    YouTube
                  </button>
                )}
                {profileData?.socialMedia?.instagram && (
                  <button
                    className={`content-tab ${
                      activeContentTab === "instagram" ? "active" : ""
                    }`}
                    onClick={() => setActiveContentTab("instagram")}
                  >
                    Instagram
                  </button>
                )}
                {profileData?.socialMedia?.tiktok && (
                  <button
                    className={`content-tab ${
                      activeContentTab === "tiktok" ? "active" : ""
                    }`}
                    onClick={() => setActiveContentTab("tiktok")}
                  >
                    TikTok
                  </button>
                )}
              </div>
              <div className="content-grid">
                {activeContentTab === "youtube" &&
                  profileData?.youtube?.analytics?.topPerformingVideos?.map(
                    (video, index) => (
                      <div key={index} className="content-card">
                        <h4>{video.title}</h4>
                        <div className="video-stats">
                          <span>{formatNumber(video.views)} views</span>
                          <span>{formatNumber(video.likes)} likes</span>
                          <span>{formatNumber(video.comments)} comments</span>
                        </div>
                        <p>{formatDate(video.publishedAt)}</p>
                      </div>
                    )
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfluencerProfile;
