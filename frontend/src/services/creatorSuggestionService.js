const calculateMatchScore = (creator, requirements) => {
  let score = 0;
  let totalCriteria = 0;

  if (requirements.category) {
    totalCriteria++;
    if (
      creator.category.toLowerCase() === requirements.category.toLowerCase()
    ) {
      score += 25;
    }
  }

  if (requirements.minSubscribers) {
    totalCriteria++;
    if (creator.subscribers >= requirements.minSubscribers) {
      score += 20;
    }
  }

  if (requirements.minAverageViews) {
    totalCriteria++;
    if (creator.avgViews >= requirements.minAverageViews) {
      score += 20;
    }
  }

  if (requirements.platforms && requirements.platforms.length > 0) {
    totalCriteria++;
    const platformMatch = requirements.platforms.every((platform) =>
      creator.platforms.includes(platform)
    );
    if (platformMatch) {
      score += 20;
    }
  }

  if (requirements.location) {
    totalCriteria++;
    if (creator.location === requirements.location) {
      score += 15;
    }
  }

  return totalCriteria > 0
    ? Math.round((score / (totalCriteria * 20)) * 100)
    : 0;
};

const filterCreators = (creators, requirements) => {
  return creators.filter((creator) => {
    if (
      requirements.minSubscribers &&
      creator.subscribers < requirements.minSubscribers
    ) {
      return false;
    }
    if (
      requirements.minAverageViews &&
      creator.avgViews < requirements.minAverageViews
    ) {
      return false;
    }

    if (requirements.platforms && requirements.platforms.length > 0) {
      const hasAllPlatforms = requirements.platforms.every((platform) =>
        creator.platforms.includes(platform)
      );
      if (!hasAllPlatforms) {
        return false;
      }
    }

    return true;
  });
};

export const getCreatorSuggestions = async (campaignRequirements) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch("http://localhost:5000/api/creators", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const creators = await response.json();

    const eligibleCreators = filterCreators(creators, campaignRequirements);

    const scoredCreators = eligibleCreators.map((creator) => ({
      ...creator,
      matchScore: calculateMatchScore(creator, campaignRequirements),
    }));

    return scoredCreators.sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) {
    console.error("Error fetching creator suggestions:", error);
    throw error;
  }
};

export const getMatchScoreBreakdown = (creator, requirements) => {
  const breakdown = {
    category: {
      score: 0,
      max: 25,
      matched: false,
    },
    subscribers: {
      score: 0,
      max: 20,
      matched: false,
    },
    views: {
      score: 0,
      max: 20,
      matched: false,
    },
    platforms: {
      score: 0,
      max: 20,
      matched: false,
    },
    location: {
      score: 0,
      max: 15,
      matched: false,
    },
  };

  if (requirements.category) {
    breakdown.category.matched =
      creator.category.toLowerCase() === requirements.category.toLowerCase();
    breakdown.category.score = breakdown.category.matched ? 25 : 0;
  }

  if (requirements.minSubscribers) {
    breakdown.subscribers.matched =
      creator.subscribers >= requirements.minSubscribers;
    breakdown.subscribers.score = breakdown.subscribers.matched ? 20 : 0;
  }

  if (requirements.minAverageViews) {
    breakdown.views.matched = creator.avgViews >= requirements.minAverageViews;
    breakdown.views.score = breakdown.views.matched ? 20 : 0;
  }

  if (requirements.platforms) {
    breakdown.platforms.matched = requirements.platforms.every((p) =>
      creator.platforms.includes(p)
    );
    breakdown.platforms.score = breakdown.platforms.matched ? 20 : 0;
  }

  if (requirements.location) {
    breakdown.location.matched = creator.location === requirements.location;
    breakdown.location.score = breakdown.location.matched ? 15 : 0;
  }

  return breakdown;
};
