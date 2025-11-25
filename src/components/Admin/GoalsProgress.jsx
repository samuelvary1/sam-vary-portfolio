import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { db } from "../../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "./GoalsProgress.css";

const GOALS_CONFIG = [
  // Health & Wellness
  {
    id: "weight",
    name: "Lose weight / get in shape",
    type: "weight",
    target: "Reach 185 lbs (from 232)",
    startValue: 232,
    targetValue: 185,
    unit: "lbs",
    description: "Track weight loss progress",
    category: "Health & Wellness",
  },
  {
    id: "quit-vaping",
    name: "Quit Vaping",
    type: "sobriety",
    target: "Stay vape-free",
    quitDate: "2025-12-01",
    weeklyCost: 200,
    description: "Track days sober and money saved",
    category: "Health & Wellness",
  },
  {
    id: "quit-drinking",
    name: "Quit Drinking",
    type: "sobriety",
    target: "Stay alcohol-free",
    quitDate: "2025-11-25",
    weeklyCost: 50,
    description: "Track days sober and money saved",
    category: "Health & Wellness",
  },

  // Career & Projects
  {
    id: "promotion",
    name: "Get a promotion",
    type: "checkbox",
    target: "Achieve promotion",
    description: "Binary: Yes or No",
    category: "Career & Projects",
  },
  {
    id: "launch-app",
    name: "Launch an app or a game",
    type: "milestones",
    target: "Launch and publish",
    milestones: ["Concept", "Prototype", "Development", "Testing", "Launch"],
    description: "Progress through development phases",
    category: "Career & Projects",
  },
  {
    id: "youtube",
    name: "Grow YouTube channel",
    type: "count",
    target: "5,000 subscribers (Tier 1)",
    targetValue: 5000,
    unit: "subscribers",
    description: "Current subscriber count",
    category: "Career & Projects",
  },
  {
    id: "website",
    name: "Build out personal site",
    type: "milestones",
    target: "Complete site features",
    milestones: ["Blog", "Portfolio", "Projects", "Analytics", "Polish"],
    description: "Website feature completion",
    category: "Career & Projects",
  },

  // Creative & Learning
  {
    id: "writing",
    name: "Write a new short story / get published",
    type: "milestones",
    target: "Get story published",
    milestones: ["Outline", "First Draft", "Revision", "Submit", "Accepted"],
    description: "Writing and publication progress",
    category: "Creative & Learning",
  },
  {
    id: "books",
    name: "Read more books",
    type: "count",
    target: "24 books (2 per month)",
    targetValue: 24,
    unit: "books",
    description: "Books completed",
    category: "Creative & Learning",
  },
  {
    id: "movies",
    name: "Watch more movies / shows",
    type: "count",
    target: "50 movies/shows",
    targetValue: 50,
    unit: "watched",
    description: "Movies and shows completed",
    category: "Creative & Learning",
  },
  {
    id: "art",
    name: "Make more art / miniatures / music",
    type: "count",
    target: "12 projects (1 per month)",
    targetValue: 12,
    unit: "projects",
    description: "Completed creative projects",
    category: "Creative & Learning",
  },
  {
    id: "games",
    name: "Play more meaningful games",
    type: "count",
    target: "12 games completed",
    targetValue: 12,
    unit: "games",
    description: "Meaningful games completed",
    category: "Creative & Learning",
  },

  // Lifestyle & Personal
  {
    id: "baby",
    name: "Have a baby",
    type: "checkbox",
    target: "Welcome a baby",
    description: "Binary: Yes or No",
    category: "Lifestyle & Personal",
  },
  {
    id: "debt",
    name: "Pay off debt / grow investments",
    type: "currency",
    target: "$0 debt / $50k invested",
    targetValue: 50000,
    unit: "$",
    description: "Investment value or debt remaining",
    category: "Lifestyle & Personal",
  },
  {
    id: "travel",
    name: "Travel more / go on dates etc.",
    type: "count",
    target: "12 dates/trips",
    targetValue: 12,
    unit: "events",
    description: "Dates or trips completed",
    category: "Lifestyle & Personal",
  },
  {
    id: "sports",
    name: "Fishing / Golf / Biking / Hockey",
    type: "count",
    target: "24 outings (2 per month)",
    targetValue: 24,
    unit: "outings",
    description: "Sports activities completed",
    category: "Lifestyle & Personal",
  },
  {
    id: "declutter",
    name: "Declutter the house / garage etc.",
    type: "percentage",
    target: "100% organized",
    targetValue: 100,
    description: "Overall organization progress",
    category: "Lifestyle & Personal",
  },
];

// Friend's custom goals based on their image
const FRIEND_GOALS_CONFIG = [
  {
    id: "lift",
    name: "lift 3x a week",
    type: "streak",
    target: "52 weeks in a row",
    targetValue: 52,
    weeklyTarget: 3,
    unit: "weeks",
    description: "Consecutive weeks hitting 3x lifting",
  },
  {
    id: "cardio",
    name: "cardio 2x a week",
    type: "streak",
    target: "52 weeks in a row",
    targetValue: 52,
    weeklyTarget: 2,
    unit: "weeks",
    description: "Consecutive weeks hitting 2x cardio",
  },
  {
    id: "no-games",
    name: "no video games 3x a week",
    type: "streak",
    target: "52 weeks in a row",
    targetValue: 52,
    weeklyTarget: 3,
    unit: "weeks",
    description: "Consecutive weeks with 3+ no-game days",
  },
  {
    id: "books-friend",
    name: "finish 10 books before end of year (9/10)",
    type: "count",
    target: "10 books by Dec 31",
    targetValue: 10,
    startValue: 9,
    unit: "books",
    description: "Books completed (currently at 9)",
  },
];

export default function GoalsProgress() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userGoalsConfig, setUserGoalsConfig] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

  // Parse allowed users from environment variable
  const getAllowedUsers = () => {
    const usersString = process.env.REACT_APP_ALLOWED_USERS || "";
    const users = {};
    usersString.split(",").forEach((pair) => {
      const [username, password] = pair.split(":");
      if (username && password) {
        users[password.trim()] = username.trim();
      }
    });
    return users;
  };

  // Check authorization
  useEffect(() => {
    const key = searchParams.get("key");
    const allowedUsers = getAllowedUsers();

    console.log("🔑 Admin Auth Debug:");
    console.log("  URL key:", key);
    console.log("  Allowed users:", Object.keys(allowedUsers).length);

    if (key && allowedUsers[key]) {
      const username = allowedUsers[key];
      console.log("✅ Authorization successful for user:", username);
      setIsAuthorized(true);
      setCurrentUser(username);

      // Set goals config based on user
      let userConfig;
      if (username === "antoin") {
        userConfig = FRIEND_GOALS_CONFIG;
      } else {
        userConfig = GOALS_CONFIG;
      }
      setUserGoalsConfig(userConfig);

      // Set initial active category based on first category in config
      const firstCategory = userConfig.find((g) => g.category)?.category;
      setActiveCategory(firstCategory || null);
    } else {
      console.log("❌ Authorization failed - redirecting to home");
      navigate("/");
    }
  }, [searchParams, navigate]);

  // Load progress from Firestore
  useEffect(() => {
    if (!isAuthorized || !currentUser) return;

    const loadProgress = async () => {
      try {
        // Use currentUser as the document ID
        const docRef = doc(db, "goals", currentUser);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProgress(docSnap.data());
        } else {
          // Initialize with defaults
          const initialProgress = {};
          userGoalsConfig.forEach((goal) => {
            if (goal.type === "weight") {
              initialProgress[goal.id] = { current: goal.startValue };
            } else if (goal.type === "checkbox") {
              initialProgress[goal.id] = { completed: false };
            } else if (goal.type === "milestones") {
              initialProgress[goal.id] = { currentMilestone: 0 };
            } else if (goal.type === "tapering") {
              initialProgress[goal.id] = {
                currentPhase: 0,
                startDate: null,
                dailyCount: 0,
              };
            } else if (goal.type === "quit-countdown") {
              initialProgress[goal.id] = {
                completedMilestones: [],
                dailyPuffCount: 0,
              };
            } else if (goal.type === "weekly-tracker") {
              initialProgress[goal.id] = { weeks: [], currentWeekCount: 0 };
            } else if (goal.type === "streak") {
              initialProgress[goal.id] = { current: 0, weekProgress: 0 };
            } else if (goal.startValue !== undefined) {
              initialProgress[goal.id] = { current: goal.startValue };
            } else {
              initialProgress[goal.id] = { current: 0 };
            }
          });
          setProgress(initialProgress);
        }
      } catch (error) {
        console.error("Error loading progress:", error);
        setMessage("Error loading progress");
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [isAuthorized, currentUser, userGoalsConfig]);

  // Calculate percentage for a goal
  const calculatePercentage = (goal) => {
    const data = progress[goal.id] || {};

    switch (goal.type) {
      case "weight":
        const current = data.current || goal.startValue;
        const lost = goal.startValue - current;
        const target = goal.startValue - goal.targetValue;
        return Math.min(Math.max((lost / target) * 100, 0), 100);

      case "checkbox":
        return data.completed ? 100 : 0;

      case "milestones":
        const milestone = data.currentMilestone || 0;
        return (milestone / goal.milestones.length) * 100;

      case "count":
      case "days":
      case "currency":
      case "weekly-count":
        const value = data.current || 0;
        return Math.min((value / goal.targetValue) * 100, 100);

      case "streak":
        // For streak goals, show percentage based on current week progress
        const weekProgress = data.weekProgress || 0;
        const weeklyTarget = goal.weeklyTarget || 1;
        return Math.min((weekProgress / weeklyTarget) * 100, 100);

      case "tapering":
        const currentPhase = data.currentPhase || 0;
        return (currentPhase / goal.phases.length) * 100;

      case "quit-countdown":
        const completedMilestones = data.completedMilestones || [];
        return (completedMilestones.length / goal.milestones.length) * 100;

      case "sobriety":
        // Always 100% once quit date has passed
        const quitDateObj = new Date(goal.quitDate);
        const now = new Date();
        return quitDateObj <= now ? 100 : 0;

      case "weekly-tracker":
        const weeks = data.weeks || [];
        const completedWeeks = weeks.filter((w) => w.completed).length;
        return Math.min((completedWeeks / goal.weeksToTrack) * 100, 100);

      case "percentage":
      default:
        return data.current || 0;
    }
  };

  // Calculate overall streak percentage for progress bar
  const calculateStreakProgress = (goal) => {
    const data = progress[goal.id] || {};
    const currentStreak = data.current || 0;
    return Math.min((currentStreak / goal.targetValue) * 100, 100);
  };

  // Update progress
  const updateProgress = (goalId, value) => {
    setProgress((prev) => ({
      ...prev,
      [goalId]: value,
    }));
  };

  // Calculate current streak for weekly tracker
  const getCurrentStreak = (weeks) => {
    if (!weeks || weeks.length === 0) return 0;

    let streak = 0;
    for (let i = weeks.length - 1; i >= 0; i--) {
      if (weeks[i]?.completed) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  // Save to Firestore
  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      // Use currentUser as the document ID
      const docRef = doc(db, "goals", currentUser);
      await setDoc(docRef, progress);
      setMessage("✅ Progress saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error saving progress:", error);
      setMessage("❌ Error saving progress");
    } finally {
      setSaving(false);
    }
  };

  // Don't render anything if not authorized
  if (!isAuthorized) {
    return null;
  }

  if (loading) {
    return (
      <div className="goals-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Render different input types based on goal configuration
  const renderGoalInput = (goal) => {
    const data = progress[goal.id] || {};

    switch (goal.type) {
      case "checkbox":
        return (
          <div className="checkbox-input">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={data.completed || false}
                onChange={(e) =>
                  updateProgress(goal.id, { completed: e.target.checked })
                }
                className="goal-checkbox"
              />
              <span className="checkbox-text">
                {data.completed ? "✅ Completed!" : "⬜ Not yet completed"}
              </span>
            </label>
          </div>
        );

      case "weight":
        return (
          <div className="number-input">
            <label className="input-label">
              Current Weight:
              <input
                type="number"
                value={data.current || goal.startValue}
                onChange={(e) =>
                  updateProgress(goal.id, {
                    current: parseFloat(e.target.value),
                  })
                }
                className="number-field"
                step="0.5"
                min={goal.targetValue}
                max={goal.startValue}
              />
              <span className="unit">{goal.unit}</span>
            </label>
            <div className="target-info">
              Target: {goal.targetValue} {goal.unit} (
              {(goal.startValue - (data.current || goal.startValue)).toFixed(1)}{" "}
              lbs to go)
            </div>
          </div>
        );

      case "count":
      case "days":
      case "currency":
      case "weekly-count":
        const prefix = goal.type === "currency" ? "$" : "";
        const isWeekly = goal.type === "weekly-count";
        return (
          <div className="number-input">
            <label className="input-label">
              {goal.type === "days"
                ? "Days Sober"
                : goal.type === "currency"
                  ? "Amount"
                  : isWeekly
                    ? "This Week"
                    : "Count"}
              :
              <input
                type="number"
                value={data.current || 0}
                onChange={(e) =>
                  updateProgress(goal.id, { current: parseInt(e.target.value) })
                }
                className="number-field"
                min="0"
                max={goal.targetValue}
              />
              <span className="unit">
                {prefix}
                {goal.unit}
              </span>
            </label>
            <div className="target-info">
              Target: {prefix}
              {goal.targetValue.toLocaleString()} {goal.unit}
            </div>
          </div>
        );

      case "streak":
        const currentStreak = data.current || 0;
        const weekProgress = data.weekProgress || 0;
        const maxStreak = goal.targetValue;
        const weeklyTarget = goal.weeklyTarget || 0;

        return (
          <div className="streak-input">
            {/* Current Week Progress */}
            {weeklyTarget > 0 && (
              <div className="week-progress-bar">
                <div className="week-progress-header">
                  <span className="week-progress-label">This Week</span>
                  <span className="week-progress-count">
                    {weekProgress}/{weeklyTarget}
                  </span>
                </div>
                <div className="week-progress-track">
                  {Array.from({ length: weeklyTarget }).map((_, i) => (
                    <button
                      key={i}
                      className={`week-progress-dot ${i < weekProgress ? "completed" : ""}`}
                      onClick={() => {
                        const newProgress = i < weekProgress ? i : i + 1;
                        const newData = { ...data, weekProgress: newProgress };

                        // Auto-increment streak when week completes
                        if (
                          newProgress === weeklyTarget &&
                          weekProgress !== weeklyTarget
                        ) {
                          newData.current = Math.min(
                            maxStreak,
                            currentStreak + 1,
                          );
                          newData.weekProgress = 0; // Reset for next week
                        }

                        updateProgress(goal.id, newData);
                      }}
                      title={`Day ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Streak Counter */}
            <div className="streak-counter">
              <button
                className="streak-button decrement"
                onClick={() =>
                  updateProgress(goal.id, {
                    ...data,
                    current: Math.max(0, currentStreak - 1),
                  })
                }
                disabled={currentStreak === 0}
              >
                −
              </button>

              <div className="streak-display">
                <div className="streak-number">{currentStreak}</div>
                <div className="streak-label">weeks in a row</div>
              </div>

              <button
                className="streak-button increment"
                onClick={() =>
                  updateProgress(goal.id, {
                    ...data,
                    current: Math.min(maxStreak, currentStreak + 1),
                    weekProgress: 0,
                  })
                }
                disabled={currentStreak >= maxStreak}
              >
                +
              </button>
            </div>

            <div className="target-info">
              Target: {maxStreak} {goal.unit} •{" "}
              {currentStreak > 0
                ? `${currentStreak} week${currentStreak !== 1 ? "s" : ""} streak! 🔥`
                : "Start your streak!"}
            </div>
          </div>
        );

      case "milestones":
        const showResetButton =
          goal.id === "launch-app" || goal.id === "writing";

        return (
          <div className="milestones-input">
            <div className="milestones-grid">
              {goal.milestones.map((milestone, index) => (
                <button
                  key={index}
                  className={`milestone-button ${(data.currentMilestone || 0) >= index + 1 ? "completed" : ""} ${(data.currentMilestone || 0) === index ? "current" : ""}`}
                  onClick={() =>
                    updateProgress(goal.id, { currentMilestone: index + 1 })
                  }
                >
                  {(data.currentMilestone || 0) >= index + 1 ? "✓" : index + 1}.{" "}
                  {milestone}
                </button>
              ))}
            </div>
            <div className="milestone-footer">
              <div className="target-info">
                {data.currentMilestone || 0} of {goal.milestones.length}{" "}
                milestones completed
              </div>
              {showResetButton && (data.currentMilestone || 0) > 0 && (
                <button
                  className="reset-milestone-button"
                  onClick={() =>
                    updateProgress(goal.id, { currentMilestone: 0 })
                  }
                  title="Reset all milestones"
                >
                  ↺ Reset
                </button>
              )}
            </div>
          </div>
        );

      case "weekly-tracker":
        const weeks = data.weeks || [];
        const currentWeekCount = data.currentWeekCount || 0;

        // Helper to toggle week completion
        const toggleWeek = (weekIndex) => {
          const newWeeks = [...weeks];
          if (!newWeeks[weekIndex]) {
            newWeeks[weekIndex] = { completed: false, count: 0 };
          }
          newWeeks[weekIndex].completed = !newWeeks[weekIndex].completed;
          updateProgress(goal.id, { ...data, weeks: newWeeks });
        };

        // Helper to update current week count
        const updateCurrentWeek = (count) => {
          const parsedCount = parseInt(count);
          const newData = { ...data, currentWeekCount: parsedCount };

          // Auto-mark current week complete if target reached
          if (parsedCount >= goal.targetValue) {
            const currentWeekIndex = weeks.length;
            const newWeeks = [...weeks];
            if (!newWeeks[currentWeekIndex]) {
              newWeeks[currentWeekIndex] = {
                completed: true,
                count: parsedCount,
              };
            }
            newData.weeks = newWeeks;
            newData.currentWeekCount = 0; // Reset for next week
          }

          updateProgress(goal.id, newData);
        };

        // Show last 12 weeks + current
        const displayWeeks = Math.min(weeks.length + 1, 13);
        const startWeek = Math.max(0, weeks.length - 12);

        return (
          <div className="weekly-tracker-input">
            {/* Current Week Counter */}
            <div className="current-week-section">
              <label className="input-label">
                This Week's Progress:
                <input
                  type="number"
                  value={currentWeekCount}
                  onChange={(e) => updateCurrentWeek(e.target.value)}
                  className="number-field"
                  min="0"
                  max={goal.targetValue}
                />
                <span className="unit">
                  / {goal.targetValue} {goal.unit}
                </span>
              </label>
              {currentWeekCount >= goal.targetValue && (
                <span className="week-complete-badge">✅ Target reached!</span>
              )}
            </div>

            {/* Week History Grid */}
            <div className="weeks-grid">
              {Array.from({ length: displayWeeks }).map((_, i) => {
                const weekIndex = startWeek + i;
                const isCurrentWeek = weekIndex === weeks.length;
                const week = weeks[weekIndex];
                const isCompleted =
                  week?.completed ||
                  (isCurrentWeek && currentWeekCount >= goal.targetValue);

                return (
                  <button
                    key={weekIndex}
                    className={`week-checkbox ${isCompleted ? "completed" : ""} ${isCurrentWeek ? "current" : ""}`}
                    onClick={() => !isCurrentWeek && toggleWeek(weekIndex)}
                    disabled={isCurrentWeek}
                    title={`Week ${weekIndex + 1}${isCurrentWeek ? " (Current)" : ""}`}
                  >
                    {isCompleted ? "✓" : weekIndex + 1}
                  </button>
                );
              })}
            </div>

            <div className="target-info">
              {weeks.filter((w) => w.completed).length} weeks completed •
              Current streak: {getCurrentStreak(weeks)}
            </div>
          </div>
        );

      case "tapering":
        const currentPhase = data.currentPhase || 0;
        const startDate = data.startDate ? new Date(data.startDate) : null;
        const dailyCount = data.dailyCount || 0;
        const currentPhaseData = goal.phases[currentPhase];
        const isQuitWeek = currentPhaseData?.dailyLimit === 0;

        // Calculate which week we should be in based on start date
        let autoPhase = 0;
        if (startDate) {
          const weeksSinceStart = Math.floor(
            (new Date() - startDate) / (7 * 24 * 60 * 60 * 1000),
          );
          autoPhase = Math.min(weeksSinceStart, goal.phases.length - 1);
        }

        return (
          <div className="tapering-input">
            {/* Start Date Picker */}
            {!startDate && (
              <div className="date-picker-section">
                <label className="input-label">
                  Set Start Date (Week 1 begins):
                  <input
                    type="date"
                    onChange={(e) => {
                      const newStartDate = e.target.value;
                      updateProgress(goal.id, {
                        ...data,
                        startDate: newStartDate,
                        currentPhase: 0,
                      });
                    }}
                    className="date-field"
                  />
                </label>
              </div>
            )}

            {startDate && (
              <>
                {/* Current Phase Display */}
                <div className="phase-info-section">
                  <div className="phase-header">
                    <h4>{currentPhaseData?.description || "Complete!"}</h4>
                    {!isQuitWeek && (
                      <div className="daily-counter">
                        <label className="input-label">
                          Today's count:
                          <input
                            type="number"
                            value={dailyCount}
                            onChange={(e) =>
                              updateProgress(goal.id, {
                                ...data,
                                dailyCount: parseInt(e.target.value),
                              })
                            }
                            className="number-field small"
                            min="0"
                            max={currentPhaseData?.dailyLimit}
                          />
                          <span className="unit">
                            / {currentPhaseData?.dailyLimit} max
                          </span>
                        </label>
                        {dailyCount > currentPhaseData?.dailyLimit && (
                          <span className="over-limit-warning">
                            ⚠️ Over limit!
                          </span>
                        )}
                      </div>
                    )}
                    {isQuitWeek && (
                      <div className="quit-day-celebration">
                        🎯 QUIT DAY! Stay strong! 💪
                      </div>
                    )}
                  </div>
                </div>

                {/* Phase Timeline */}
                <div className="phases-timeline">
                  {goal.phases.map((phase, index) => {
                    const isCurrentPhase = index === currentPhase;
                    const isPastPhase = index < currentPhase;

                    return (
                      <button
                        key={index}
                        className={`phase-button ${
                          isPastPhase
                            ? "completed"
                            : isCurrentPhase
                              ? "current"
                              : "future"
                        }`}
                        onClick={() =>
                          updateProgress(goal.id, {
                            ...data,
                            currentPhase: index,
                            dailyCount: 0,
                          })
                        }
                      >
                        <div className="phase-number">Week {phase.week}</div>
                        <div className="phase-limit">
                          {phase.dailyLimit === 0
                            ? "QUIT"
                            : `${phase.dailyLimit}/day`}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Auto-advance suggestion */}
                {autoPhase > currentPhase && (
                  <div className="auto-advance-suggestion">
                    <p>
                      💡 Based on your start date, you should be on Week{" "}
                      {autoPhase + 1}
                    </p>
                    <button
                      className="advance-button"
                      onClick={() =>
                        updateProgress(goal.id, {
                          ...data,
                          currentPhase: autoPhase,
                          dailyCount: 0,
                        })
                      }
                    >
                      Advance to Week {autoPhase + 1}
                    </button>
                  </div>
                )}

                {/* Reset button */}
                <div className="tapering-footer">
                  <button
                    className="reset-milestone-button"
                    onClick={() =>
                      updateProgress(goal.id, {
                        currentPhase: 0,
                        startDate: null,
                        dailyCount: 0,
                      })
                    }
                  >
                    ↺ Reset Plan
                  </button>
                </div>
              </>
            )}
          </div>
        );

      case "quit-countdown":
        const completedMilestones = data.completedMilestones || [];
        const dailyPuffCount = data.dailyPuffCount || 0;
        const today = new Date();
        const quitDate = new Date(goal.quitDate);
        const daysUntilQuit = Math.ceil(
          (quitDate - today) / (24 * 60 * 60 * 1000),
        );

        // Calculate days since start
        const start = new Date(goal.startDate);
        const daysSinceStart = Math.floor(
          (today - start) / (24 * 60 * 60 * 1000),
        );

        // Find current milestone based on today's date
        const currentMilestone = goal.milestones
          .slice()
          .reverse()
          .find((m) => {
            const mDate = new Date(m.date);
            mDate.setHours(0, 0, 0, 0);
            const todayStart = new Date(today);
            todayStart.setHours(0, 0, 0, 0);
            return mDate <= todayStart;
          });

        // If no current milestone yet, use the first one
        const activeMilestone = currentMilestone || goal.milestones[0];

        // Extract daily limit from milestone description
        const getCurrentDailyLimit = () => {
          if (!activeMilestone) return 15; // default to first limit
          if (activeMilestone.date === goal.quitDate) return 0;
          const match = activeMilestone.description.match(/(\d+) puffs/);
          return match ? parseInt(match[1]) : 15;
        };

        const currentDailyLimit = getCurrentDailyLimit();

        // Toggle milestone completion
        const toggleMilestone = (milestoneDate) => {
          const newCompleted = completedMilestones.includes(milestoneDate)
            ? completedMilestones.filter((d) => d !== milestoneDate)
            : [...completedMilestones, milestoneDate];
          updateProgress(goal.id, {
            ...data,
            completedMilestones: newCompleted,
          });
        };

        return (
          <div className="quit-countdown-input">
            {/* Countdown Display */}
            <div className="countdown-display">
              <div className="countdown-number">
                {daysUntilQuit > 0 ? daysUntilQuit : 0}
              </div>
              <div className="countdown-label">
                {daysUntilQuit > 0
                  ? `day${daysUntilQuit !== 1 ? "s" : ""} until quit day`
                  : daysUntilQuit === 0
                    ? "🎯 TODAY IS QUIT DAY!"
                    : "✅ Quit day passed!"}
              </div>
            </div>

            {/* Daily Puff Counter */}
            {daysUntilQuit >= 0 && (
              <div className="daily-puff-counter">
                <div className="puff-counter-header">
                  <h4>Today's Puff Count</h4>
                  {currentDailyLimit > 0 && (
                    <span className="daily-limit-badge">
                      Limit: {currentDailyLimit} puffs
                    </span>
                  )}
                </div>
                <div className="puff-counter-controls">
                  <button
                    className="puff-button decrement"
                    onClick={() =>
                      updateProgress(goal.id, {
                        ...data,
                        dailyPuffCount: Math.max(0, dailyPuffCount - 1),
                      })
                    }
                    disabled={dailyPuffCount === 0}
                  >
                    −
                  </button>
                  <div className="puff-display">
                    <div className="puff-number">{dailyPuffCount}</div>
                    <div className="puff-label">puffs today</div>
                  </div>
                  <button
                    className="puff-button increment"
                    onClick={() =>
                      updateProgress(goal.id, {
                        ...data,
                        dailyPuffCount: dailyPuffCount + 1,
                      })
                    }
                  >
                    +
                  </button>
                </div>
                {currentDailyLimit > 0 &&
                  dailyPuffCount > currentDailyLimit && (
                    <div className="over-limit-warning">
                      ⚠️ You're over today's limit by{" "}
                      {dailyPuffCount - currentDailyLimit} puff
                      {dailyPuffCount - currentDailyLimit !== 1 ? "s" : ""}
                    </div>
                  )}
                {currentDailyLimit > 0 &&
                  dailyPuffCount <= currentDailyLimit &&
                  dailyPuffCount > 0 && (
                    <div className="within-limit-message">
                      ✓ Within limit ({currentDailyLimit - dailyPuffCount}{" "}
                      remaining)
                    </div>
                  )}
              </div>
            )}

            {/* Milestones Grid */}
            <div className="milestones-countdown-grid">
              {goal.milestones.map((milestone, index) => {
                const milestoneDate = new Date(milestone.date);
                const isCompleted = completedMilestones.includes(
                  milestone.date,
                );
                const isPast = milestoneDate < today;
                const isToday =
                  milestoneDate.toDateString() === today.toDateString();
                const isQuitDay = milestone.date === goal.quitDate;

                return (
                  <button
                    key={index}
                    className={`milestone-countdown-button ${
                      isCompleted
                        ? "completed"
                        : isToday
                          ? "current"
                          : isPast
                            ? "missed"
                            : "future"
                    } ${isQuitDay ? "quit-day" : ""}`}
                    onClick={() => toggleMilestone(milestone.date)}
                  >
                    <div className="milestone-date">
                      {new Date(milestone.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="milestone-description">
                      {isCompleted && "✓ "}
                      {milestone.description}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Progress Summary */}
            <div className="target-info">
              {completedMilestones.length} of {goal.milestones.length}{" "}
              milestones completed
              {daysSinceStart >= 0 && (
                <span> • Day {daysSinceStart + 1} of your journey</span>
              )}
            </div>
          </div>
        );

      case "sobriety":
        const quitDateSob = new Date(goal.quitDate);
        const todaySob = new Date();

        // Calculate days sober (0 if before quit date)
        const daysSober =
          quitDateSob <= todaySob
            ? Math.floor((todaySob - quitDateSob) / (24 * 60 * 60 * 1000))
            : 0;

        // Calculate money saved
        const weeklyCost = goal.weeklyCost || 0;
        const dailyCost = weeklyCost / 7;
        const moneySaved = daysSober * dailyCost;

        // Days until quit date (if not yet quit)
        const daysUntilSober =
          quitDateSob > todaySob
            ? Math.ceil((quitDateSob - todaySob) / (24 * 60 * 60 * 1000))
            : 0;

        return (
          <div className="sobriety-tracker">
            {daysUntilSober > 0 ? (
              <div className="countdown-to-quit">
                <div className="countdown-number">{daysUntilSober}</div>
                <div className="countdown-label">
                  day{daysUntilSober !== 1 ? "s" : ""} until quit day
                </div>
                <div className="quit-date-display">
                  Quit Date:{" "}
                  {quitDateSob.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
            ) : (
              <>
                {/* Days Sober Gauge */}
                <div className="sobriety-gauge">
                  <div className="gauge-header">
                    <span className="gauge-label">Days Sober</span>
                    <span className="gauge-value">{daysSober}</span>
                  </div>
                  <div className="gauge-visual">
                    <svg viewBox="0 0 200 120" className="gauge-svg">
                      {/* Background arc */}
                      <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="#e0e0e0"
                        strokeWidth="20"
                        strokeLinecap="round"
                      />
                      {/* Progress arc - fills based on milestones */}
                      <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="#4caf50"
                        strokeWidth="20"
                        strokeLinecap="round"
                        strokeDasharray={`${Math.min((daysSober / 365) * 251, 251)} 251`}
                        className="gauge-progress"
                      />
                      {/* Center text */}
                      <text
                        x="100"
                        y="90"
                        textAnchor="middle"
                        className="gauge-number"
                        fill="#333"
                        fontSize="32"
                        fontWeight="bold"
                      >
                        {daysSober}
                      </text>
                      <text
                        x="100"
                        y="110"
                        textAnchor="middle"
                        className="gauge-subtitle"
                        fill="#666"
                        fontSize="14"
                      >
                        days
                      </text>
                    </svg>
                  </div>
                  <div className="milestone-badges">
                    {daysSober >= 1 && <span className="badge">✓ 1 Day</span>}
                    {daysSober >= 7 && <span className="badge">✓ 1 Week</span>}
                    {daysSober >= 30 && (
                      <span className="badge">✓ 1 Month</span>
                    )}
                    {daysSober >= 90 && (
                      <span className="badge">✓ 3 Months</span>
                    )}
                    {daysSober >= 180 && (
                      <span className="badge">✓ 6 Months</span>
                    )}
                    {daysSober >= 365 && (
                      <span className="badge">✓ 1 Year</span>
                    )}
                  </div>
                </div>

                {/* Money Saved Gauge */}
                <div className="sobriety-gauge">
                  <div className="gauge-header">
                    <span className="gauge-label">Money Saved</span>
                    <span className="gauge-value">
                      ${moneySaved.toFixed(2)}
                    </span>
                  </div>
                  <div className="gauge-visual">
                    <svg viewBox="0 0 200 120" className="gauge-svg">
                      {/* Background arc */}
                      <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="#e0e0e0"
                        strokeWidth="20"
                        strokeLinecap="round"
                      />
                      {/* Progress arc - fills based on money milestones */}
                      <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="#2196f3"
                        strokeWidth="20"
                        strokeLinecap="round"
                        strokeDasharray={`${Math.min((moneySaved / 10000) * 251, 251)} 251`}
                        className="gauge-progress"
                      />
                      {/* Center text */}
                      <text
                        x="100"
                        y="90"
                        textAnchor="middle"
                        className="gauge-number"
                        fill="#333"
                        fontSize="28"
                        fontWeight="bold"
                      >
                        ${Math.floor(moneySaved)}
                      </text>
                      <text
                        x="100"
                        y="110"
                        textAnchor="middle"
                        className="gauge-subtitle"
                        fill="#666"
                        fontSize="14"
                      >
                        saved
                      </text>
                    </svg>
                  </div>
                  <div className="money-breakdown">
                    <div className="breakdown-item">
                      <span className="breakdown-label">
                        Daily cost avoided:
                      </span>
                      <span className="breakdown-value">
                        ${dailyCost.toFixed(2)}
                      </span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">Weekly savings:</span>
                      <span className="breakdown-value">
                        ${weeklyCost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sobriety Date */}
                <div className="sobriety-footer">
                  <p className="sobriety-date">
                    Sober since:{" "}
                    {quitDateSob.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </>
            )}
          </div>
        );

      case "percentage":
      default:
        return (
          <div className="slider-input">
            <input
              type="range"
              min="0"
              max="100"
              value={data.current || 0}
              onChange={(e) =>
                updateProgress(goal.id, { current: parseInt(e.target.value) })
              }
              className="goal-slider"
            />
          </div>
        );
    }
  };

  return (
    <div className="goals-dashboard">
      <div className="goals-container">
        {/* Header */}
        <div className="goals-header">
          <h1>🎯 2025–2026 Goals Progress</h1>
          <p className="subtitle">
            Welcome,{" "}
            {currentUser.charAt(0).toUpperCase() + currentUser.slice(1)}!
          </p>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`message-banner ${message.includes("✅") ? "success" : "error"}`}
          >
            {message}
          </div>
        )}

        {/* Category Navigation */}
        {userGoalsConfig.some((g) => g.category) && (
          <div className="category-nav">
            {[
              "Health & Wellness",
              "Career & Projects",
              "Creative & Learning",
              "Lifestyle & Personal",
            ]
              .filter((category) =>
                userGoalsConfig.some((g) => g.category === category),
              )
              .map((category) => (
                <button
                  key={category}
                  className={`category-nav-button ${activeCategory === category ? "active" : ""}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
          </div>
        )}

        {/* Goals List */}
        <div className="goals-list">
          {/* If no categories, render all goals directly */}
          {!userGoalsConfig.some((g) => g.category)
            ? userGoalsConfig.map((goal) => {
                const percentage = calculatePercentage(goal);
                const isStreakGoal = goal.type === "streak";
                const progressBarPercentage = isStreakGoal
                  ? calculateStreakProgress(goal)
                  : percentage;

                return (
                  <div key={goal.id} className="goal-item">
                    {/* Goal Header */}
                    <div className="goal-header">
                      <div className="goal-title-section">
                        <h3>{goal.name}</h3>
                        <p className="goal-target">{goal.target}</p>
                      </div>
                      <span className="goal-percentage">
                        {isStreakGoal && "Current week: "}
                        {Math.round(percentage)}%
                      </span>
                    </div>

                    {/* Goal Input (varies by type) */}
                    {renderGoalInput(goal)}

                    {/* Progress Bar */}
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${progressBarPercentage}%` }}
                      >
                        {progressBarPercentage > 5 && (
                          <span className="progress-text">
                            {Math.round(progressBarPercentage)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            : /* Group goals by category */
              [
                "Health & Wellness",
                "Career & Projects",
                "Creative & Learning",
                "Lifestyle & Personal",
              ].map((category) => {
                const categoryGoals = userGoalsConfig.filter(
                  (goal) => goal.category === category,
                );

                if (categoryGoals.length === 0 || activeCategory !== category)
                  return null;

                return (
                  <div key={category} className="goals-category">
                    <h2 className="category-title">{category}</h2>
                    <div className="category-goals">
                      {categoryGoals.map((goal) => {
                        const percentage = calculatePercentage(goal);
                        const isStreakGoal = goal.type === "streak";
                        const progressBarPercentage = isStreakGoal
                          ? calculateStreakProgress(goal)
                          : percentage;

                        return (
                          <div key={goal.id} className="goal-item">
                            {/* Goal Header */}
                            <div className="goal-header">
                              <div className="goal-title-section">
                                <h3>{goal.name}</h3>
                                <p className="goal-target">{goal.target}</p>
                              </div>
                              <span className="goal-percentage">
                                {isStreakGoal && "Current week: "}
                                {Math.round(percentage)}%
                              </span>
                            </div>

                            {/* Goal Input (varies by type) */}
                            {renderGoalInput(goal)}

                            {/* Progress Bar */}
                            <div className="progress-bar-container">
                              <div
                                className="progress-bar-fill"
                                style={{ width: `${progressBarPercentage}%` }}
                              >
                                {progressBarPercentage > 5 && (
                                  <span className="progress-text">
                                    {Math.round(progressBarPercentage)}%
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
        </div>

        {/* Save Button */}
        <div className="save-section">
          <button
            onClick={handleSave}
            disabled={saving}
            className="save-button"
          >
            {saving ? "💾 Saving..." : "💾 Save All Progress"}
          </button>
        </div>

        {/* Footer */}
        <div className="goals-footer">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
