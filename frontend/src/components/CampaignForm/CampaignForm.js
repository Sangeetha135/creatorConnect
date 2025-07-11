import React, { useState } from "react";
import "./CampaignForm.css";

const campaignTypes = [
  "Sponsored Post",
  "Brand Ambassador",
  "Product Review",
  "Content Creation",
  "Affiliate Marketing",
];

const creatorCategories = [
  "Lifestyle",
  "Fashion",
  "Beauty",
  "Tech",
  "Gaming",
  "Food",
  "Travel",
  "Fitness",
  "Entertainment",
];

const CampaignForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    campaignType: "",
    numberOfDeliverables: "1",
    startDate: "",
    endDate: "",
    contentSubmissionDeadline: "",
    kpis: "",
    locationTargeting: "",
    preferredCreatorCategory: "",
    hashtagsMentions: "",
    dosAndDonts: "",
    referenceLinks: "",
    minSubscribers: "0",
    minViews: "0",
  });

  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [selectedDeliverables, setSelectedDeliverables] = useState([]);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePlatformChange = (platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleDeliverablesChange = (deliverable) => {
    setSelectedDeliverables((prev) =>
      prev.includes(deliverable)
        ? prev.filter((d) => d !== deliverable)
        : [...prev, deliverable]
    );
  };

  const handleGoalsChange = (goal) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title?.trim()) {
      newErrors.title = "Campaign title is required";
    }

    if (!formData.description?.trim()) {
      newErrors.description = "Campaign description is required";
    }

    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      newErrors.budget = "Valid budget amount is required";
    }

    if (!formData.campaignType) {
      newErrors.campaignType = "Campaign type is required";
    }

    if (!selectedPlatforms || selectedPlatforms.length === 0) {
      newErrors.platforms = "At least one platform must be selected";
    }

    if (!selectedDeliverables || selectedDeliverables.length === 0) {
      newErrors.deliverables = "At least one deliverable must be selected";
    }

    if (
      !formData.numberOfDeliverables ||
      parseInt(formData.numberOfDeliverables) < 1
    ) {
      newErrors.numberOfDeliverables =
        "Number of deliverables must be at least 1";
    }

    if (!selectedGoals || selectedGoals.length === 0) {
      newErrors.goals = "At least one campaign goal must be selected";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    if (!formData.contentSubmissionDeadline) {
      newErrors.contentSubmissionDeadline =
        "Content submission deadline is required";
    }

    if (
      formData.startDate &&
      formData.endDate &&
      formData.contentSubmissionDeadline
    ) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const submission = new Date(formData.contentSubmissionDeadline);

      if (end <= start) {
        newErrors.endDate = "End date must be after start date";
      }

      if (submission >= end) {
        newErrors.contentSubmissionDeadline =
          "Submission deadline must be before end date";
      }

      if (submission <= start) {
        newErrors.contentSubmissionDeadline =
          "Submission deadline must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const campaignData = new FormData();

    campaignData.append("title", formData.title.trim());
    campaignData.append("description", formData.description.trim());
    campaignData.append("budget", formData.budget);
    campaignData.append("campaignType", formData.campaignType);
    campaignData.append("platforms", JSON.stringify(selectedPlatforms));
    campaignData.append("deliverables", JSON.stringify(selectedDeliverables));
    campaignData.append("numberOfDeliverables", formData.numberOfDeliverables);
    campaignData.append("campaignGoals", JSON.stringify(selectedGoals));
    campaignData.append("startDate", formData.startDate);
    campaignData.append("endDate", formData.endDate);
    campaignData.append(
      "contentSubmissionDeadline",
      formData.contentSubmissionDeadline
    );
    campaignData.append("kpis", formData.kpis);

    const requirements = {
      minSubscribers: parseInt(formData.minSubscribers) || 0,
      minViews: parseInt(formData.minViews) || 0,
      preferredCreatorCategory: formData.preferredCreatorCategory,
      locationTargeting: formData.locationTargeting,
    };
    campaignData.append("requirements", JSON.stringify(requirements));

    const contentGuidelines = {
      hashtagsMentions: formData.hashtagsMentions,
      dosAndDonts: formData.dosAndDonts,
      referenceLinks: formData.referenceLinks,
    };
    campaignData.append("contentGuidelines", JSON.stringify(contentGuidelines));

    onSubmit(campaignData);
  };

  return (
    <div className="campaign-form-container">
      <h2>Create Campaign</h2>
      {Object.keys(errors).length > 0 && (
        <div className="validation-errors-summary">
          <h3>Please fix the following errors:</h3>
          <ul>
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-group">
            <label htmlFor="title">Campaign Title</label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
            {errors.title && <div className="error">{errors.title}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Campaign Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows="3"
            />
            {errors.description && (
              <div className="error">{errors.description}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="budget">Campaign Budget</label>
            <input
              id="budget"
              name="budget"
              type="number"
              min="0"
              step="0.01"
              value={formData.budget}
              onChange={handleInputChange}
              required
            />
            {errors.budget && <div className="error">{errors.budget}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="campaignType">Campaign Type</label>
            <select
              id="campaignType"
              name="campaignType"
              value={formData.campaignType}
              onChange={handleInputChange}
              required
            >
              <option value="">- Select -</option>
              {campaignTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.campaignType && (
              <div className="error">{errors.campaignType}</div>
            )}
          </div>
        </div>

        <div className="form-section">
          <h3>Campaign Timeline</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
              {errors.startDate && (
                <div className="error">{errors.startDate}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
                required
              />
              {errors.endDate && <div className="error">{errors.endDate}</div>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="contentSubmissionDeadline">
              Content Submission Deadline
            </label>
            <input
              id="contentSubmissionDeadline"
              name="contentSubmissionDeadline"
              type="date"
              value={formData.contentSubmissionDeadline}
              onChange={handleInputChange}
              required
            />
            {errors.contentSubmissionDeadline && (
              <div className="error">{errors.contentSubmissionDeadline}</div>
            )}
          </div>
        </div>

        <div className="form-section">
          <h3>Platforms and Deliverables</h3>
          <div className="form-group">
            <label>Platforms</label>
            <div className="checkbox-group">
              {["YouTube", "Instagram", "TikTok"].map((platform) => (
                <label key={platform}>
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(platform)}
                    onChange={() => handlePlatformChange(platform)}
                  />
                  {platform}
                </label>
              ))}
            </div>
            {errors.platforms && (
              <div className="error">{errors.platforms}</div>
            )}
          </div>

          <div className="form-group">
            <label>Deliverables</label>
            <div className="checkbox-group">
              {[
                { id: "video", label: "Video" },
                { id: "reelShort", label: "Reel/Short" },
                { id: "storyPost", label: "Story/Post" },
                { id: "blog", label: "Blog" },
              ].map((deliverable) => (
                <label key={deliverable.id}>
                  <input
                    type="checkbox"
                    checked={selectedDeliverables.includes(deliverable.id)}
                    onChange={() => handleDeliverablesChange(deliverable.id)}
                  />
                  {deliverable.label}
                </label>
              ))}
            </div>
            {errors.deliverables && (
              <div className="error">{errors.deliverables}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="numberOfDeliverables">Number of Deliverables</label>
            <input
              id="numberOfDeliverables"
              name="numberOfDeliverables"
              type="number"
              min="1"
              value={formData.numberOfDeliverables}
              onChange={handleInputChange}
              required
            />
            {errors.numberOfDeliverables && (
              <div className="error">{errors.numberOfDeliverables}</div>
            )}
          </div>
        </div>

        <div className="form-section">
          <h3>Campaign Goals and KPIs</h3>
          <div className="form-group">
            <label>Campaign Goals</label>
            <div className="checkbox-group">
              {[
                { id: "increaseReach", label: "Increase Reach" },
                { id: "driveWebsiteTraffic", label: "Drive Website Traffic" },
                { id: "appDownloads", label: "App Downloads" },
                { id: "salesConversions", label: "Sales/Conversions" },
              ].map((goal) => (
                <label key={goal.id}>
                  <input
                    type="checkbox"
                    checked={selectedGoals.includes(goal.id)}
                    onChange={() => handleGoalsChange(goal.id)}
                  />
                  {goal.label}
                </label>
              ))}
            </div>
            {errors.goals && <div className="error">{errors.goals}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="kpis">Key Performance Indicators (KPIs)</label>
            <textarea
              id="kpis"
              name="kpis"
              value={formData.kpis}
              onChange={handleInputChange}
              placeholder="Describe your expected KPIs"
              rows="3"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Creator Requirements</h3>
          <div className="form-group">
            <label htmlFor="minSubscribers">
              Minimum Subscribers/Followers
            </label>
            <input
              id="minSubscribers"
              name="minSubscribers"
              type="number"
              min="0"
              value={formData.minSubscribers}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="minViews">Minimum Average Views</label>
            <input
              id="minViews"
              name="minViews"
              type="number"
              min="0"
              value={formData.minViews}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="preferredCreatorCategory">
              Preferred Creator Category
            </label>
            <select
              id="preferredCreatorCategory"
              name="preferredCreatorCategory"
              value={formData.preferredCreatorCategory}
              onChange={handleInputChange}
            >
              <option value="">- Select -</option>
              {creatorCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="locationTargeting">Location Targeting</label>
            <input
              id="locationTargeting"
              name="locationTargeting"
              type="text"
              value={formData.locationTargeting}
              onChange={handleInputChange}
              placeholder="e.g., United States, Europe, Global"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Content Guidelines</h3>
          <div className="form-group">
            <label htmlFor="dosAndDonts">Do's and Don'ts</label>
            <textarea
              id="dosAndDonts"
              name="dosAndDonts"
              value={formData.dosAndDonts}
              onChange={handleInputChange}
              placeholder="List what creators should and shouldn't do"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="hashtagsMentions">
              Required Hashtags and Mentions
            </label>
            <textarea
              id="hashtagsMentions"
              name="hashtagsMentions"
              value={formData.hashtagsMentions}
              onChange={handleInputChange}
              placeholder="List required hashtags and account mentions"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="referenceLinks">Reference Links</label>
            <textarea
              id="referenceLinks"
              name="referenceLinks"
              value={formData.referenceLinks}
              onChange={handleInputChange}
              placeholder="Add links to example content or references"
              rows="3"
            />
          </div>
        </div>

        <button type="submit" className="submit-button">
          Create Campaign
        </button>
      </form>
    </div>
  );
};

export default CampaignForm;
