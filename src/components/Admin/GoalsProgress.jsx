import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { db } from "../../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "./GoalsProgress.css";

const GOALS_CONFIG = [
  {
    id: "weight",
    name: "Lose weight / get in shape",
    type: "weight", // special input for weight
    target: "Reach 185 lbs (from 220)",
    startValue: 220,
    targetValue: 185,
    unit: "lbs",
    description: "Track weight loss progress",
  },
  {
    id: "quit-weed",
    name: "Quit weed",
    type: "days", // count days sober
    target: "365 days sober",
    targetValue: 365,
    unit: "days",
    description: "Days without smoking",
  },
  {
    id: "promotion",
    name: "Get a promotion",
    type: "checkbox", // binary goal
    target: "Achieve promotion",
    description: "Binary: Yes or No",
  },
  {
    id: "launch-app",
    name: "Launch an app or a game",
    type: "milestones", // track milestones
    target: "Launch and publish",
    milestones: ["Concept", "Prototype", "Development", "Testing", "Launch"],
    description: "Progress through development phases",
  },
  {
    id: "youtube",
    name: "Grow YouTube channel",
    type: "count", // count subscribers
    target: "1,000 subscribers",
    targetValue: 1000,
    unit: "subscribers",
    description: "Current subscriber count",
  },
  {
    id: "writing",
    name: "Write a new short story / get published",
    type: "milestones",
    target: "Get story published",
    milestones: ["Outline", "First Draft", "Revision", "Submit", "Accepted"],
    description: "Writing and publication progress",
  },
  {
    id: "baby",
    name: "Have a baby",
    type: "checkbox",
    target: "Welcome a baby",
    description: "Binary: Yes or No",
  },
  {
    id: "debt",
    name: "Pay off debt / grow investments",
    type: "currency", // track dollar amounts
    target: "$0 debt / $50k invested",
    targetValue: 50000,
    unit: "$",
    description: "Investment value or debt remaining",
  },
  {
    id: "books",
    name: "Read more books",
    type: "count",
    target: "24 books (2 per month)",
    targetValue: 24,
    unit: "books",
    description: "Books completed",
  },
  {
    id: "movies",
    name: "Watch more movies / shows",
    type: "count",
    target: "50 movies/shows",
    targetValue: 50,
    unit: "watched",
    description: "Movies and shows completed",
  },
  {
    id: "art",
    name: "Make more art / miniatures / music",
    type: "count",
    target: "12 projects (1 per month)",
    targetValue: 12,
    unit: "projects",
    description: "Completed creative projects",
  },
  {
    id: "travel",
    name: "Travel more / go on dates etc.",
    type: "count",
    target: "12 dates/trips",
    targetValue: 12,
    unit: "events",
    description: "Dates or trips completed",
  },
  {
    id: "sports",
    name: "Fishing / Golf / Biking / Hockey",
    type: "count",
    target: "24 outings (2 per month)",
    targetValue: 24,
    unit: "outings",
    description: "Sports activities completed",
  },
  {
    id: "website",
    name: "Build out personal site",
    type: "milestones",
    target: "Complete site features",
    milestones: ["Blog", "Portfolio", "Projects", "Analytics", "Polish"],
    description: "Website feature completion",
  },
  {
    id: "games",
    name: "Play more meaningful games",
    type: "count",
    target: "12 games completed",
    targetValue: 12,
    unit: "games",
    description: "Meaningful games completed",
  },
  {
    id: "declutter",
    name: "Declutter the house / garage etc.",
    type: "percentage", // traditional percentage slider
    target: "100% organized",
    targetValue: 100,
    description: "Overall organization progress",
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
      if (username === "antoin") {
        setUserGoalsConfig(FRIEND_GOALS_CONFIG);
      } else {
        setUserGoalsConfig(GOALS_CONFIG);
      }
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
      case "streak":
        const value = data.current || 0;
        return Math.min((value / goal.targetValue) * 100, 100);

      case "weekly-tracker":
        const weeks = data.weeks || [];
        const completedWeeks = weeks.filter((w) => w.completed).length;
        return Math.min((completedWeeks / goal.weeksToTrack) * 100, 100);

      case "percentage":
      default:
        return data.current || 0;
    }
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

        {/* Goals List */}
        <div className="goals-list">
          {userGoalsConfig.map((goal, index) => {
            const percentage = calculatePercentage(goal);

            return (
              <div key={goal.id} className="goal-item">
                {/* Goal Header */}
                <div className="goal-header">
                  <div className="goal-title-section">
                    <h3>{goal.name}</h3>
                    <p className="goal-target">{goal.target}</p>
                  </div>
                  <span className="goal-percentage">
                    {Math.round(percentage)}%
                  </span>
                </div>

                {/* Goal Input (varies by type) */}
                {renderGoalInput(goal)}

                {/* Progress Bar */}
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${percentage}%` }}
                  >
                    {percentage > 5 && (
                      <span className="progress-text">
                        {Math.round(percentage)}%
                      </span>
                    )}
                  </div>
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
