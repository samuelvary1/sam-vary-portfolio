import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Rangers.css";

const Rangers = () => {
  const [schedule, setSchedule] = useState({
    recentGames: [],
    upcomingGames: [],
    record: { wins: 0, losses: 0, ot: 0 },
    loading: true,
    error: null,
  });

  useEffect(() => {
    fetchRangersSchedule();
  }, []);

  const fetchRangersSchedule = async () => {
    try {
      setSchedule((prev) => ({ ...prev, loading: true }));

      // Real Rangers data from NHL API
      const response = await fetch(
        "https://api-web.nhle.com/v1/club-schedule-season/NYR/20242025",
      );
      const data = await response.json();

      if (data && data.games) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Recent completed games
        const recentGames = data.games
          .filter((game) => {
            const gameDate = new Date(game.gameDate);
            return gameDate < today && game.gameState === "OFF";
          })
          .slice(-5)
          .reverse();

        // Upcoming games
        const upcomingGames = data.games
          .filter((game) => {
            const gameDate = new Date(game.gameDate);
            return gameDate >= today && game.gameState !== "OFF";
          })
          .slice(0, 5);

        // Calculate record from completed games
        let wins = 0,
          losses = 0,
          ot = 0;
        data.games.forEach((game) => {
          if (game.gameState === "OFF") {
            const isRangersHome = game.homeTeam.abbrev === "NYR";
            const rangersScore = isRangersHome
              ? game.homeTeam.score
              : game.awayTeam.score;
            const opponentScore = isRangersHome
              ? game.awayTeam.score
              : game.homeTeam.score;

            if (rangersScore > opponentScore) {
              wins++;
            } else if (
              game.periodDescriptor.number > 3 ||
              game.gameOutcome?.lastPeriodType
            ) {
              ot++;
            } else {
              losses++;
            }
          }
        });

        setSchedule({
          recentGames,
          upcomingGames,
          record: { wins, losses, ot },
          loading: false,
          error: null,
        });
      } else {
        throw new Error("No schedule data available");
      }
    } catch (error) {
      console.error("Error fetching Rangers schedule:", error);
      // Fallback to simple current data
      setSchedule({
        recentGames: [
          {
            gameDate: "2024-11-01",
            homeTeam: { abbrev: "NYR", score: 3 },
            awayTeam: { abbrev: "SEA", score: 2 },
            gameState: "OFF",
            venue: { default: "Madison Square Garden" },
          },
        ],
        upcomingGames: [
          {
            gameDate: "2024-11-04",
            startTimeUTC: "2024-11-04T23:00:00Z",
            homeTeam: { abbrev: "NYR" },
            awayTeam: { abbrev: "CAR" },
            venue: { default: "Madison Square Garden" },
          },
        ],
        record: { wins: 9, losses: 2, ot: 1 },
        loading: false,
        error: "Using sample data - API unavailable",
      });
    }
  };

  const formatGameDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatGameTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
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
            <h2>2024-25 Season Schedule ⚡</h2>

            {schedule.error && (
              <div className="error-message">⚠️ {schedule.error}</div>
            )}

            <div className="record-display">
              {schedule.loading ? (
                <div className="current-record">Loading...</div>
              ) : (
                <div className="current-record">
                  {schedule.record.wins}W - {schedule.record.losses}L -{" "}
                  {schedule.record.ot}OT
                </div>
              )}
            </div>

            <div className="schedule-container">
              {/* Recent Games */}
              <div className="games-section">
                <h3>Recent Games</h3>
                {schedule.loading ? (
                  <div className="loading">Loading games...</div>
                ) : (
                  schedule.recentGames.map((game, index) => {
                    const isRangersHome = game.homeTeam.abbrev === "NYR";
                    const rangersScore = isRangersHome
                      ? game.homeTeam.score
                      : game.awayTeam.score;
                    const opponentScore = isRangersHome
                      ? game.awayTeam.score
                      : game.homeTeam.score;
                    const opponent = isRangersHome
                      ? game.awayTeam.abbrev
                      : game.homeTeam.abbrev;
                    const won = rangersScore > opponentScore;

                    return (
                      <div
                        key={index}
                        className={`simple-game-card ${won ? "win" : "loss"}`}
                      >
                        <div className="game-date">
                          {formatGameDate(game.gameDate)}
                        </div>
                        <div className="game-matchup">
                          <span className="team">NYR</span>
                          <span className="vs">
                            {isRangersHome ? "vs" : "@"}
                          </span>
                          <span className="team">{opponent}</span>
                        </div>
                        <div className="game-score">
                          {rangersScore} - {opponentScore}
                        </div>
                        <div className="result">{won ? "W" : "L"}</div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Upcoming Games */}
              <div className="games-section">
                <h3>Upcoming Games</h3>
                {schedule.loading ? (
                  <div className="loading">Loading games...</div>
                ) : (
                  schedule.upcomingGames.map((game, index) => {
                    const isRangersHome = game.homeTeam.abbrev === "NYR";
                    const opponent = isRangersHome
                      ? game.awayTeam.abbrev
                      : game.homeTeam.abbrev;

                    return (
                      <div key={index} className="simple-game-card upcoming">
                        <div className="game-date">
                          {formatGameDate(game.gameDate)}
                        </div>
                        <div className="game-time">
                          {game.startTimeUTC
                            ? formatGameTime(game.startTimeUTC)
                            : "7:00 PM"}
                        </div>
                        <div className="game-matchup">
                          <span className="team">NYR</span>
                          <span className="vs">
                            {isRangersHome ? "vs" : "@"}
                          </span>
                          <span className="team">{opponent}</span>
                        </div>
                        <div className="venue">
                          {game.venue?.default || "TBD"}
                        </div>
                      </div>
                    );
                  })
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
