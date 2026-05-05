import React, { useState } from "react";

function GolfCourseSelector({ setSelectedCourse, setSelectedTee, selectedCourse }) {
  const [courseName, setCourseName] = useState("");
  const [courses, setCourses] = useState([]);
  const [searchMessage, setSearchMessage] = useState("");
  const API_KEY = "B5JFG4KI6LA3MYOKEGJM6QRHXE"; // Your secret key from StackBlitz env

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
    } catch (error) {
      console.error("Error fetching course details:", error);
    }
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
      <button onClick={fetchCourses}>Search</button>
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
      {selectedCourse && (
        <>
          <h3>{selectedCourse.course_name}</h3>
          <p>Location: {selectedCourse.location.city}, {selectedCourse.location.state}</p>
          <div className="form-row">
          <label>Select Tee Box:</label>
          <select onChange={(e) => setSelectedTee(e.target.value)}>
            <option value="">-- Choose Tee --</option>
            {Object.values(selectedCourse.tees).flat().map((tee, idx) => (
              <option key={idx} value={tee.tee_name}>
                {tee.tee_name} (Yardage: {tee.total_yards})
              </option>
            ))}
          </select>
          </div>
        </>
      )}
    </div>
  );
}

export default GolfCourseSelector;
