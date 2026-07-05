import React, { useMemo, useState } from "react";

const createEmptyManualHoles = () =>
  Array.from({ length: 18 }, (_, index) => ({
    hole: index + 1,
    yardage: "",
    par: "",
    handicap: "",
  }));

function GolfCourseSelector({ setSelectedCourse, setSelectedTee }) {
  const [courseName, setCourseName] = useState("");
  const [courses, setCourses] = useState([]);
  const [searchMessage, setSearchMessage] = useState("");
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualCourse, setManualCourse] = useState({
    course_name: "",
    city: "",
    state: "",
    tee_name: "",
    total_yards: "",
    holes: createEmptyManualHoles(),
  });
  const API_KEY = "B5JFG4KI6LA3MYOKEGJM6QRHXE";

  const manualTotalYards = useMemo(
    () =>
      manualCourse.holes.reduce((sum, hole) => {
        const yardage = Number.parseInt(hole.yardage, 10);
        return sum + (Number.isNaN(yardage) ? 0 : yardage);
      }, 0),
    [manualCourse.holes]
  );

  const fetchCourses = async () => {
    const trimmedName = courseName.trim();
    if (!trimmedName) {
      setCourses([]);
      setSearchMessage("Enter a course name to search.");
      return;
    }

    const url = `https://api.golfcourseapi.com/v1/search?search_query=${encodeURIComponent(trimmedName)}`;
    try {
      setSearchMessage("");
      const response = await fetch(url, {
        headers: {
          Authorization: `Key ${API_KEY}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Search failed with status ${response.status}`);
      }
      const data = await response.json();
      const foundCourses = Array.isArray(data?.courses) ? data.courses : [];
      setCourses(foundCourses);
      setSearchMessage(foundCourses.length === 0 ? "No courses found. Try a broader search." : "");
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
      setSearchMessage("We couldn't load courses right now. Please try again.");
    }
  };

  const fetchCourseDetails = async (courseId) => {
    const url = `https://api.golfcourseapi.com/v1/courses/${courseId}`;
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Key ${API_KEY}`,
        },
      });
      const data = await response.json();
      setSelectedCourse(data.course);
      setShowManualEntry(false);
    } catch (error) {
      console.error("Error fetching course details:", error);
    }
  };

  const updateManualField = (field, value) => {
    setManualCourse((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateManualHole = (index, field, value) => {
    setManualCourse((prev) => ({
      ...prev,
      holes: prev.holes.map((hole, holeIndex) =>
        holeIndex === index ? { ...hole, [field]: value } : hole
      ),
    }));
  };

  const resetManualCourse = () => {
    setManualCourse({
      course_name: "",
      city: "",
      state: "",
      tee_name: "",
      total_yards: "",
      holes: createEmptyManualHoles(),
    });
  };

  const handleManualCourseSubmit = () => {
    if (!manualCourse.course_name.trim() || !manualCourse.tee_name.trim()) {
      alert("Please enter a course name and tee name.");
      return;
    }

    const hasMissingHoleInfo = manualCourse.holes.some(
      (hole) => hole.yardage === "" || hole.par === "" || hole.handicap === ""
    );

    if (hasMissingHoleInfo) {
      alert("Please complete yardage, par, and handicap for all 18 holes.");
      return;
    }

    const normalizedHoles = manualCourse.holes.map((hole, index) => ({
      hole: index + 1,
      yardage: Number.parseInt(hole.yardage, 10),
      par: Number.parseInt(hole.par, 10),
      handicap: Number.parseInt(hole.handicap, 10),
    }));

    const totalYards =
      manualCourse.total_yards === ""
        ? manualTotalYards
        : Number.parseInt(manualCourse.total_yards, 10);

    const tee = {
      tee_name: manualCourse.tee_name.trim(),
      total_yards: Number.isNaN(totalYards) ? manualTotalYards : totalYards,
      holes: normalizedHoles,
    };

    const formattedCourse = {
      id: `manual_${Date.now()}`,
      course_name: manualCourse.course_name.trim(),
      location: {
        city: manualCourse.city.trim(),
        state: manualCourse.state.trim(),
      },
      tees: {
        manual: [tee],
      },
      source: "manual",
    };

    setSelectedCourse(formattedCourse);
    if (typeof setSelectedTee === "function") {
      setSelectedTee(tee);
    }
    setCourses([]);
    setCourseName("");
    setSearchMessage("");
    setShowManualEntry(false);
  };

  return (
    <div>
      <input
        type="text"
        className="course-input"
        value={courseName}
        onChange={(e) => setCourseName(e.target.value)}
        placeholder="Enter course name"
      />
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0.75rem",
          marginTop: "0.75rem",
        }}
      >
        <button onClick={fetchCourses}>Search</button>
        <button
          type="button"
          onClick={() => {
            setShowManualEntry((prev) => !prev);
            setCourses([]);
            setSearchMessage("");
          }}
        >
          {showManualEntry ? "Hide Manual Entry" : "Enter Course Info"}
        </button>
      </div>
      {searchMessage && <p className="course-search-message">{searchMessage}</p>}
      {courses.length > 0 && (
        <ul>
          {courses.map((course) => (
            <li key={course.id}>
              {course.course_name} - {course.location.city}, {course.location.state}
              <button onClick={() => fetchCourseDetails(course.id)}>Select</button>
            </li>
          ))}
        </ul>
      )}
      {showManualEntry && (
        <div
          style={{
            marginTop: "1rem",
            textAlign: "left",
            border: "1px solid #d0d7de",
            borderRadius: "12px",
            padding: "1rem",
            background: "#f8fafc",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Enter Course Info</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            <label>
              Course Name
              <input
                type="text"
                value={manualCourse.course_name}
                onChange={(e) => updateManualField("course_name", e.target.value)}
                style={{ width: "100%" }}
              />
            </label>
            <label>
              Tee Name
              <input
                type="text"
                value={manualCourse.tee_name}
                onChange={(e) => updateManualField("tee_name", e.target.value)}
                style={{ width: "100%" }}
              />
            </label>
            <label>
              City
              <input
                type="text"
                value={manualCourse.city}
                onChange={(e) => updateManualField("city", e.target.value)}
                style={{ width: "100%" }}
              />
            </label>
            <label>
              State
              <input
                type="text"
                value={manualCourse.state}
                onChange={(e) => updateManualField("state", e.target.value)}
                style={{ width: "100%" }}
              />
            </label>
            <label>
              Total Yards
              <input
                type="number"
                min="1"
                value={manualCourse.total_yards}
                onChange={(e) => updateManualField("total_yards", e.target.value)}
                style={{ width: "100%" }}
              />
            </label>
            <div style={{ alignSelf: "end", paddingBottom: "0.35rem" }}>
              Auto total from holes: <strong>{manualTotalYards}</strong>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Hole</th>
                  <th style={{ textAlign: "left" }}>Yards</th>
                  <th style={{ textAlign: "left" }}>Par</th>
                  <th style={{ textAlign: "left" }}>HCP</th>
                </tr>
              </thead>
              <tbody>
                {manualCourse.holes.map((hole, index) => (
                  <tr key={hole.hole}>
                    <td>{hole.hole}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={hole.yardage}
                        onChange={(e) => updateManualHole(index, "yardage", e.target.value)}
                        style={{ width: "90px" }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        max="6"
                        value={hole.par}
                        onChange={(e) => updateManualHole(index, "par", e.target.value)}
                        style={{ width: "60px" }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        max="18"
                        value={hole.handicap}
                        onChange={(e) => updateManualHole(index, "handicap", e.target.value)}
                        style={{ width: "60px" }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              marginTop: "1rem",
            }}
          >
            <button type="button" onClick={handleManualCourseSubmit}>
              Use Manual Course
            </button>
            <button type="button" onClick={resetManualCourse}>
              Clear Form
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GolfCourseSelector;
