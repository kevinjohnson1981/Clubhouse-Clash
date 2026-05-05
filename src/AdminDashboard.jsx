import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const defaultTheme = {
  backgroundColor: "#e9efe8",
  buttonColor: "#6fb72d",
  textColor: "#071f3d",
  cardColor: "#ffffff",
};

const themeOptions = {
  defaultGray: defaultTheme,
  classicBlue: {
    backgroundColor: "#dce6df",
    buttonColor: "#0a2444",
    textColor: "#071f3d",
    cardColor: "#f9fbf8",
  },
  mastersGreen: {
    backgroundColor: "#d9e6d4",
    buttonColor: "#2f7b49",
    textColor: "#0c2f22",
    cardColor: "#f7fbf5",
  },
  sunsetGold: {
    backgroundColor: "#f1ebdf",
    buttonColor: "#6fb72d",
    textColor: "#0b1f3c",
    cardColor: "#fffdf8",
  },
  midnight: {
    backgroundColor: "#0b1d38",
    buttonColor: "#79c232",
    textColor: "#f4f8f1",
    cardColor: "#132848",
  },
};

function getTournamentTheme(tournament) {
  if (tournament.theme === "custom") {
    return { ...defaultTheme, ...(tournament.customTheme || {}) };
  }

  return themeOptions[tournament.theme] || themeOptions.defaultGray;
}

function AdminDashboard({ user, onStartNewTeam, onStartNewIndividual, onSelectTournament, onDeleteTournament }) {
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    const fetchTournaments = async () => {
      if (!user) return;

      const q = query(collection(db, "tournaments"), where("adminId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const fetched = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTournaments(fetched);
    };

    fetchTournaments();
  }, [user]);

  return (
    <div className="admin-page-shell">
      <section className="admin-hero-card admin-dashboard-hero">
        <div className="admin-hero-actions admin-dashboard-actions">
          <button className="admin-primary-button" onClick={onStartNewTeam}>
            New Team Tournament
          </button>
          <button className="admin-secondary-button" onClick={onStartNewIndividual}>
            New Individual Tournament
          </button>
        </div>
      </section>

      <section className="admin-section-card">
        <div className="admin-section-header">
          <div>
            <h3>Saved Tournaments</h3>
          </div>
        </div>

        {tournaments.length > 0 ? (
          <div className="admin-dashboard-list">
            {tournaments.map((tournament) => {
              const tournamentTheme = getTournamentTheme(tournament);

              return (
                <article
                  key={tournament.id}
                  className="admin-dashboard-row"
                  style={{
                    "--tournament-row-bg": tournamentTheme.backgroundColor,
                    "--tournament-row-card": tournamentTheme.cardColor,
                    "--tournament-row-accent": tournamentTheme.buttonColor,
                    "--tournament-row-text": tournamentTheme.textColor,
                  }}
                >
                  <div className="admin-dashboard-row-main">
                    <div className="admin-dashboard-row-titleline">
                      <h4>{tournament.name || "Untitled Tournament"}</h4>
                    </div>
                    <div className="tournament-card-meta admin-dashboard-meta">
                      <span>Code: {tournament.eventCode || "Not set"}</span>
                      <span>{tournament.eventFormat === "individual" ? "Individual" : "Team"}</span>
                      {tournament.eventFormat === "individual" ? (
                        <span>{tournament.numPlayers || tournament.players?.length || 0} players</span>
                      ) : (
                        <>
                          <span>{tournament.numTeams || 0} teams</span>
                          <span>{tournament.playersPerTeam || 0} per team</span>
                        </>
                      )}
                    </div>
                  </div>

                <div className="tournament-card-actions admin-dashboard-row-actions">
                  <button onClick={() => onSelectTournament(tournament)}>
                    Edit
                  </button>
                    <button
                      className="admin-danger-button"
                      onClick={() => onDeleteTournament(tournament.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="admin-empty-state">
            <h4>No tournaments yet</h4>
            <p>Create your first event to start building teams, match days, and leaderboards.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
