"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const GOALS = [
  "Lose weight / get in shape",
  "Quit weed",
  "Get a promotion",
  "Launch an app or a game",
  "Grow YouTube channel",
  "Write a new short story / get published",
  "Have a baby",
  "Pay off debt / grow investments",
  "Read more books",
  "Watch more movies / shows",
  "Make more art / miniatures / music",
  "Travel more / go on dates etc.",
  "Fishing / Golf / Biking / Hockey",
  "Build out personal site",
  "Play more meaningful games",
  "Declutter the house / garage etc.",
];

export default function AdminProgressPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Check authorization
  useEffect(() => {
    const key = searchParams.get("key");
    const secretKey = process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY;

    console.log("🔑 Admin Auth Debug:");
    console.log("  URL key:", key);
    console.log("  Expected key:", secretKey);
    console.log("  Match:", key === secretKey);

    if (key === secretKey) {
      console.log("✅ Authorization successful");
      setIsAuthorized(true);
    } else {
      console.log("❌ Authorization failed - redirecting to home");
      // Redirect to home if unauthorized
      router.push("/");
    }
  }, [searchParams, router]);

  // Load progress from Firestore
  useEffect(() => {
    if (!isAuthorized) return;

    const loadProgress = async () => {
      try {
        const docRef = doc(db, "goals", "2025");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProgress(docSnap.data());
        } else {
          // Initialize with 0 for all goals if document doesn't exist
          const initialProgress = {};
          GOALS.forEach((goal) => {
            initialProgress[goal] = 0;
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
  }, [isAuthorized]);

  // Handle slider change
  const handleSliderChange = (goal, value) => {
    setProgress((prev) => ({
      ...prev,
      [goal]: parseInt(value),
    }));
  };

  // Save to Firestore
  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const docRef = doc(db, "goals", "2025");
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            🎯 2025–2026 Goals Progress
          </h1>
          <p className="text-gray-400">Secret Admin Dashboard</p>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-center font-semibold ${
              message.includes("✅")
                ? "bg-green-500/20 text-green-400 border border-green-500/50"
                : "bg-red-500/20 text-red-400 border border-red-500/50"
            }`}
          >
            {message}
          </div>
        )}

        {/* Goals List */}
        <div className="space-y-6 mb-8">
          {GOALS.map((goal, index) => {
            const value = progress[goal] || 0;

            return (
              <div
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors"
              >
                {/* Goal Name */}
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-white">{goal}</h3>
                  <span className="text-2xl font-bold text-blue-400">
                    {value}%
                  </span>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={value}
                  onChange={(e) => handleSliderChange(goal, e.target.value)}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer mb-3
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-5
                    [&::-webkit-slider-thumb]:h-5
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-blue-500
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:hover:bg-blue-400
                    [&::-webkit-slider-thumb]:transition-colors
                    [&::-moz-range-thumb]:w-5
                    [&::-moz-range-thumb]:h-5
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-blue-500
                    [&::-moz-range-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:hover:bg-blue-400
                    [&::-moz-range-thumb]:border-0
                    [&::-moz-range-thumb]:transition-colors"
                />

                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out flex items-center justify-end pr-2"
                    style={{ width: `${value}%` }}
                  >
                    {value > 0 && (
                      <span className="text-xs font-semibold text-white drop-shadow">
                        {value}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Save Button */}
        <div className="sticky bottom-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 
              disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed
              text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg hover:shadow-xl
              transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            {saving ? "💾 Saving..." : "💾 Save All Progress"}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
