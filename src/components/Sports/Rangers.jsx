import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { rangersData } from "./rangersData";
import "./Rangers.css";

const Rangers = () => {
  const [teamData, setTeamData] = useState({
    record: { wins: 0, losses: 0, ot: 0, points: 0 },
    standings: { division: "", conference: "" },
    recentGames: [],
    upcomingGames: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    setTeamData({
      ...rangersData,
      loading: false,
      error: null,
    });
  }, []);

  const formatGameResult = (game) => {
    return {
      result: game.result,
      resultClass:
        game.result === "W"
          ? "win"
          : game.result === "OTL"
            ? "overtime-loss"
            : "loss",
      rangerScore: game.rangerScore,
      opponentScore: game.opponentScore,
      opponent: game.opponent,
      isHome: game.isHome,
      venue: game.venue,
      goalScorer: game.goalScorer,
      date: new Date(game.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };
  };

  const formatUpcomingGame = (game) => {
    return {
      opponent: game.opponent,
      isHome: game.isHome,
      venue: game.venue,
      broadcast: game.broadcast || "MSG Network",
      date: new Date(game.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: game.time,
    };
  };

  return (
    <div className="rangers-container">
      <Link to="/sports" className="rangers-back-button">
        Back to Sports
      </Link>

      <div className="rangers-content">
        <div className="rangers-team-header">
          <img
            src="/assets/rangers-logo.png"
            alt="New York Rangers"
            className="rangers-team-header-logo"
          />
          <h1 className="rangers-team-page-title">New York Rangers</h1>
        </div>{" "}
        <div className="rangers-team-info">
          <div className="rangers-section rangers-about-section">
            <h2>About the Rangers</h2>
            <p>
              The New York Rangers are a professional ice hockey team based in
              New York City, founded in 1926. As one of the "Original Six" NHL
              teams, they compete in the Metropolitan Division and call the
              iconic Madison Square Garden their home.
            </p>
            <p>
              Known as "Broadway's Team," the Rangers have a rich history
              spanning nearly a century. From legendary players like Mark
              Messier and Henrik Lundqvist to unforgettable moments like the
              1994 Stanley Cup victory that ended a 54-year drought, the Rangers
              embody the heart and soul of New York hockey.
            </p>
          </div>

          <div className="rangers-section rangers-stats-section">
            <h3>Team Statistics</h3>
            <ul className="rangers-stats-list">
              <li>
                <strong>Founded:</strong> 1926
              </li>
              <li className="stanley-cup-highlight">
                <strong>Stanley Cups:</strong> 1928, 1933, 1940, 1994
              </li>
              <li>
                <strong>Conference Championships:</strong> 11 titles
              </li>
              <li>
                <strong>Division Championships:</strong> 8 titles
              </li>
              <li>
                <strong>Home Arena:</strong> Madison Square Garden
              </li>
              <li>
                <strong>Division:</strong> Metropolitan Division
              </li>
              <li>
                <strong>Team Colors:</strong> Blue, Red, White
              </li>
              <li>
                <strong>Retired Numbers:</strong> 11 numbers retired
              </li>
              <li>
                <strong>Hall of Famers:</strong> 58 players and personnel
              </li>
              <li>
                <strong>Playoff Appearances:</strong> 64 times
              </li>
            </ul>
          </div>

          <div className="rangers-section rangers-schedule-section">
            <h2>2025-26 Season Schedule ⚡</h2>

            {teamData.error && (
              <div
                style={{
                  background: "#fff3cd",
                  border: "1px solid #ffeaa7",
                  color: "#856404",
                  padding: "1rem",
                  borderRadius: "5px",
                  marginBottom: "1rem",
                }}
              >
                {teamData.error}
              </div>
            )}

            <div className="record-display">
              {teamData.loading ? (
                <div className="current-record">Loading...</div>
              ) : (
                <>
                  <div className="current-record">
                    {teamData.record.wins}-{teamData.record.losses}-
                    {teamData.record.ot} ({teamData.record.points} PTS)
                  </div>
                  <div className="record-breakdown">
                    {teamData.standings.division} •{" "}
                    {teamData.standings.conference}
                  </div>
                </>
              )}
            </div>

            <div className="schedule-container">
              <div className="games-list">
                {/* Recent Games */}
                <h3 style={{ color: "#0038a8", marginBottom: "1rem" }}>
                  Recent Games
                </h3>

                {teamData.loading ? (
                  <div style={{ textAlign: "center", padding: "2rem" }}>
                    Loading recent games...
                  </div>
                ) : teamData.recentGames.length > 0 ? (
                  teamData.recentGames.map((game, index) => {
                    const gameInfo = formatGameResult(game);
                    return (
                      <div
                        key={index}
                        className={`game-card ${gameInfo.resultClass}`}
                      >
                        <div className="game-header">
                          <div className="game-date">{gameInfo.date}</div>
                          <div
                            className={`game-result result-${gameInfo.resultClass}`}
                          >
                            {gameInfo.result} 🏒
                          </div>
                        </div>
                        <div className="game-matchup">
                          <div className="team-info">
                            <div className="team-name">NY Rangers</div>
                            <div
                              className={
                                gameInfo.isHome
                                  ? "home-indicator"
                                  : "away-indicator"
                              }
                            >
                              {gameInfo.isHome ? "HOME" : "AWAY"}
                            </div>
                          </div>
                          <div className="vs-indicator">
                            {gameInfo.isHome ? "VS" : "@"}
                          </div>
                          <div className="team-info">
                            <div className="team-name">{gameInfo.opponent}</div>
                          </div>
                        </div>
                        <div className="game-score">
                          {gameInfo.rangerScore} - {gameInfo.opponentScore}
                        </div>
                        {gameInfo.goalScorer && gameInfo.result === "W" && (
                          <div className="goal-scorer">
                            <div className="scorer-photo-container">
                              <img
                                src="/assets/rangers-logo.png"
                                alt={gameInfo.goalScorer.name}
                                className="scorer-photo"
                                loading="lazy"
                              />
                            </div>
                            <div className="scorer-info">
                              <div className="scorer-name">
                                {gameInfo.goalScorer.name}
                              </div>
                              <div className="scorer-time">
                                GWG: {gameInfo.goalScorer.time}
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="game-details">
                          <div className="game-venue">{gameInfo.venue}</div>
                          <div className="game-broadcast">MSG Network</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "#666",
                    }}
                  >
                    No recent games available
                  </div>
                )}

                {/* Upcoming Games */}
                <h3
                  style={{
                    color: "#ce1126",
                    marginTop: "2rem",
                    marginBottom: "1rem",
                  }}
                >
                  Upcoming Games
                </h3>

                {teamData.loading ? (
                  <div style={{ textAlign: "center", padding: "2rem" }}>
                    Loading upcoming games...
                  </div>
                ) : teamData.upcomingGames.length > 0 ? (
                  teamData.upcomingGames.map((game, index) => {
                    const gameInfo = formatUpcomingGame(game);
                    return (
                      <div key={index} className="game-card upcoming">
                        <div className="game-header">
                          <div className="game-date">{gameInfo.date}</div>
                          <div className="game-time">{gameInfo.time}</div>
                        </div>
                        <div className="game-matchup">
                          <div className="team-info">
                            <div className="team-name">NY Rangers</div>
                            <div
                              className={
                                gameInfo.isHome
                                  ? "home-indicator"
                                  : "away-indicator"
                              }
                            >
                              {gameInfo.isHome ? "HOME" : "AWAY"}
                            </div>
                          </div>
                          <div className="vs-indicator">
                            {gameInfo.isHome ? "VS" : "@"}
                          </div>
                          <div className="team-info">
                            <div className="team-name">{gameInfo.opponent}</div>
                          </div>
                        </div>
                        <div className="game-details">
                          <div className="game-venue">{gameInfo.venue}</div>
                          <div className="game-broadcast">MSG Network</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "#666",
                    }}
                  >
                    No upcoming games scheduled
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rangers-section rangers-fan-section">
            <h3>Why I'm a Fan</h3>
            <p>
              Being a Rangers fan means being part of something bigger than
              hockey – it's about tradition, resilience, and the magic of
              Madison Square Garden. There's nothing quite like the atmosphere
              when 18,000 fans are on their feet, chanting "Let's Go Rangers!"
              as the team battles on Broadway's biggest stage.
            </p>
            <p>
              From watching Henrik Lundqvist make impossible saves to witnessing
              clutch playoff performances, the Rangers have provided countless
              memories of pure hockey excellence. The team's commitment to never
              giving up, combined with the electric energy of "The World's Most
              Famous Arena," creates an experience that goes far beyond the game
              itself.
            </p>
            <p>
              Whether it's a regular season matchup or a playoff thriller, every
              Rangers game carries the weight of history and the hope for future
              glory. That's what makes being part of the Blueshirts faithful so
              special.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rangers;
