// api/nhl-proxy.js (for Vercel deployment)
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  try {
    const { team = "NYR" } = req.query;

    // Fetch from NHL API (server-side, no CORS issues)
    const scheduleResponse = await fetch(
      `https://api-web.nhle.com/v1/club-schedule/${team}/month/2025-11`,
    );
    const standingsResponse = await fetch(
      `https://api-web.nhle.com/v1/standings/now`,
    );

    if (!scheduleResponse.ok || !standingsResponse.ok) {
      throw new Error("Failed to fetch NHL data");
    }

    const scheduleData = await scheduleResponse.json();
    const standingsData = await standingsResponse.json();

    // Find Rangers in standings
    const rangersStandings = standingsData.standings.find(
      (team) => team.teamAbbrev?.default === "NYR",
    );

    // Process and return data
    const processedData = {
      record: {
        wins: rangersStandings?.wins || 0,
        losses: rangersStandings?.losses || 0,
        ot: rangersStandings?.otLosses || 0,
        points: rangersStandings?.points || 0,
      },
      standings: {
        division: `${rangersStandings?.divisionSequence || "?"} in Metropolitan Division`,
        conference: `${rangersStandings?.conferenceSequence || "?"} in Eastern Conference`,
      },
      games: scheduleData.games || [],
    };

    res.status(200).json(processedData);
  } catch (error) {
    console.error("Error fetching NHL data:", error);
    res.status(500).json({ error: "Failed to fetch NHL data" });
  }
}
