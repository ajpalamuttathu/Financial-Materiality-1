
export const suggestRiskNarrative = async (
  topicName: string,
  industryName: string,
  context: string = "financial materiality"
): Promise<string> => {
  try {
    // We call our own local Netlify function instead of the Google API
    const response = await fetch("/.netlify/functions/suggest-narrative", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicName, industryName, context }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Server error");
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Frontend Service Error:", error);
    return "The AI service is currently unavailable or the API key is not configured in Netlify.";
  }
};
