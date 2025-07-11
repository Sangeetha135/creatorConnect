const API_URL = "http://localhost:5000/api/invitations";

export const sendInvitation = async (
  campaignId,
  creatorId,
  message,
  compensation
) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    if (!campaignId || !creatorId || !message || !compensation) {
      throw new Error("Missing required fields");
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        campaignId,
        influencerId: creatorId,
        message,
        compensation,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to send invitation");
    }

    return data;
  } catch (error) {
    console.error("Error sending invitation:", error);
    throw error;
  }
};

export const getInvitations = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch invitations");
    }

    return data;
  } catch (error) {
    console.error("Error fetching invitations:", error);
    throw error;
  }
};

export const respondToInvitation = async (
  invitationId,
  status,
  responseMessage = ""
) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_URL}/${invitationId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
        responseMessage,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to respond to invitation");
    }

    return data;
  } catch (error) {
    console.error("Error responding to invitation:", error);
    throw error;
  }
};
