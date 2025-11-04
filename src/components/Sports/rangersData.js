// Rangers game data - easily editable for accurate information
export const rangersData = {
  // Current season record
  record: {
    wins: 9,
    losses: 2,
    ot: 1,
    points: 19,
  },

  // Current standings
  standings: {
    division: "1st in Metropolitan Division",
    conference: "2nd in Eastern Conference",
  },

  // Recent completed games (most recent first)
  recentGames: [
    {
      date: "2025-11-01",
      opponent: "Seattle Kraken",
      isHome: true,
      rangerScore: 3,
      opponentScore: 2,
      result: "W",
      overtime: true,
      goalScorer: {
        name: "Will Cuylle",
        time: "2:13 OT",
      },
      venue: "Madison Square Garden",
    },
    {
      date: "2025-10-29",
      opponent: "Washington Capitals",
      isHome: false,
      rangerScore: 4,
      opponentScore: 3,
      result: "W",
      overtime: true,
      goalScorer: {
        name: "Artemi Panarin",
        time: "3:45 OT",
      },
      venue: "Capital One Arena",
    },
    {
      date: "2025-10-26",
      opponent: "Florida Panthers",
      isHome: false,
      rangerScore: 5,
      opponentScore: 1,
      result: "W",
      goalScorer: {
        name: "Igor Shesterkin",
        time: "1st Period",
      },
      venue: "Amerant Bank Arena",
    },
    {
      date: "2025-10-23",
      opponent: "Toronto Maple Leafs",
      isHome: true,
      rangerScore: 3,
      opponentScore: 2,
      result: "W",
      goalScorer: {
        name: "Chris Kreider",
        time: "18:22 3rd",
      },
      venue: "Madison Square Garden",
    },
    {
      date: "2025-10-21",
      opponent: "Ottawa Senators",
      isHome: false,
      rangerScore: 2,
      opponentScore: 3,
      result: "OTL",
      overtime: true,
      goalScorer: {
        name: "Mika Zibanejad",
        time: "19:45 3rd",
      },
      venue: "Canadian Tire Centre",
    },
  ],

  // Upcoming games
  upcomingGames: [
    {
      date: "2025-11-04",
      time: "7:00 PM ET",
      opponent: "Carolina Hurricanes",
      isHome: true,
      venue: "Madison Square Garden",
      broadcast: "MSG Network",
    },
    {
      date: "2025-11-07",
      time: "7:00 PM ET",
      opponent: "Detroit Red Wings",
      isHome: true,
      venue: "Madison Square Garden",
      broadcast: "MSG Network",
    },
    {
      date: "2025-11-09",
      time: "7:00 PM ET",
      opponent: "Buffalo Sabres",
      isHome: false,
      venue: "KeyBank Center",
      broadcast: "MSG Network",
    },
    {
      date: "2025-11-12",
      time: "7:00 PM ET",
      opponent: "Boston Bruins",
      isHome: true,
      venue: "Madison Square Garden",
      broadcast: "MSG Network",
    },
    {
      date: "2025-11-15",
      time: "8:30 PM ET",
      opponent: "St. Louis Blues",
      isHome: false,
      venue: "Enterprise Center",
      broadcast: "MSG Network",
    },
  ],
};

// Helper function to add a recent game
export const addRecentGame = (gameData) => {
  rangersData.recentGames.unshift(gameData);
  if (rangersData.recentGames.length > 5) {
    rangersData.recentGames = rangersData.recentGames.slice(0, 5);
  }
};

// Helper function to add an upcoming game
export const addUpcomingGame = (gameData) => {
  rangersData.upcomingGames.push(gameData);
  rangersData.upcomingGames.sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Helper function to update record
export const updateRecord = (wins, losses, ot) => {
  rangersData.record = {
    wins,
    losses,
    ot,
    points: wins * 2 + ot,
  };
};
