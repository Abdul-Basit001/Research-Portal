
const API_URL = "http://localhost:5000/api/opportunities";

export const createOpportunity = async (opportunity) => {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(opportunity)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to create opportunity");
    }

    return data;
};
