
import React, { useMemo, useState, useEffect } from 'react';
import './FindTalent.css';
import { useJobs } from '../JobContext';
import { ProfileCard } from './ProfileCard';
import { useNavigate } from 'react-router-dom';


export const FindTalent = () => {

  // 🔥 ADD HERE (top of file)

  const normalizeValue = (value) => {
    if (!value || typeof value !== "string") return null;

    let cleaned = value.trim().toLowerCase();
    cleaned = cleaned.replace(/\s+/g, " ");
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

    return cleaned;
  };

  const isValidValue = (value) => {
    if (!value) return false;

    const cleaned = value.trim();

    if (cleaned.length < 2) return false;

    if (!/^[a-zA-Z\s]+$/.test(cleaned)) return false;

    if (/^(.)\1+$/.test(cleaned)) return false;

    return true;
  };

  // Get data from JobContext
  const { Alluser } = useJobs();
  const navigate = useNavigate();

  // States for Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedEdu, setSelectedEdu] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [maxExp, setMaxExp] = useState(10);

  // States for "View More" toggles
  const [showAllLangs, setShowAllLangs] = useState(false);
  const [showAllEdu, setShowAllEdu] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);



  // ✅ Filter out employers from Alluser
  const jobseekersOnly = useMemo(() => {
    if (!Alluser || Alluser.length === 0) return [];

    // Filter based on user_type
    return Alluser.filter(user => {
      // Check user_type in different possible locations
      const userType = user.user?.user_type ||
        user.user_type ||
        user.role ||
        user.profile?.user_type;

      // Keep only jobseekers (exclude employers)
      return userType !== 'employer';
    });
  }, [Alluser]);

  // Debug: Log filtered data
  useEffect(() => {
    console.log("Original Alluser count:", Alluser?.length);
    console.log("Jobseekers only count:", jobseekersOnly?.length);

    if (jobseekersOnly && jobseekersOnly.length > 0) {
      console.log("First jobseeker:", jobseekersOnly[0]);
    }
  }, [Alluser, jobseekersOnly]);


  // Debug: Log Alluser data structure
  useEffect(() => {
    if (Alluser && Alluser.length > 0) {
      console.log("FindTalent - Alluser data:", Alluser);
      console.log("Sample user structure:", Alluser[0]);
      console.log("Sample user profile:", Alluser[0].profile);
      console.log("Sample user languages:", Alluser[0].profile?.languages);
      console.log("Sample user educations:", Alluser[0].profile?.educations);
      console.log("Sample user skills:", Alluser[0].profile?.skills);
    }
  }, [Alluser]);


  // ✅ Add authentication check
  useEffect(() => {
    const userType = localStorage.getItem('user_type');
    if (userType !== 'employer') {
      // Redirect jobseekers away from this page
      navigate('/Job-portal/jobseeker/');
    }
  }, [navigate]);

  // --- Dynamic Data Extraction based on backend structure ---
  const filterOptions = useMemo(() => {
    const languages = new Map();
    const education = new Map();
    const skills = new Map();

    if (!Alluser || Alluser.length === 0) {
      return { languages: [], education: [], skills: [] };
    }

    const processArray = (arr, key, map) => {
      if (!Array.isArray(arr)) return;

      arr.forEach(item => {
        const raw = item[key];
        if (!raw) return;

        const normalized = normalizeValue(raw);

        if (isValidValue(normalized)) {
          map.set(normalized.toLowerCase(), normalized);
        }
      });
    };

    Alluser.forEach(user => {
      processArray(user.profile?.languages, "name", languages);
      processArray(user.profile?.educations, "degree", education);
      processArray(user.profile?.skills, "name", skills);

      // fallback
      processArray(user.languages, "name", languages);
      processArray(user.educations, "degree", education);
      processArray(user.skills, "name", skills);
    });

    return {
      languages: Array.from(languages.values()).sort(),
      education: Array.from(education.values()).sort(),
      skills: Array.from(skills.values()).sort(),
    };
  }, [Alluser]);

  // Handle filter changes
  const handleFilterChange = (value, state, setState) => {
    setState(
      state.includes(value)
        ? state.filter(i => i !== value)
        : [...state, value]
    );
  };

  // Filter talent based on all criteria
  const filteredTalent = useMemo(() => {
    if (!Alluser || Alluser.length === 0) return [];

    return Alluser.filter((user) => {
      // Extract skills names from profile first
      const userSkills = user.profile?.skills?.map(s => s.name) ||
        user.skills?.map(s => s.name) || [];

      // Extract language names from profile first
      const userLanguages = user.profile?.languages?.map(l => l.name) ||
        user.languages?.map(l => l.name) || [];

      // Extract education degrees from profile first
      const userEducation = user.profile?.educations?.map(e => e.degree) ||
        user.educations?.map(e => e.degree) || [];

      // Search term matching
      const searchLower = searchTerm.toLowerCase().trim();
      let matchesSearch = true;

      if (searchLower) {
        const searchableText = [
          user.full_name || '',
          user.current_job_title || user.profile?.current_job_title || '',
          user.current_company || user.profile?.current_company || '',
          ...userSkills,
          ...userEducation
        ].join(' ').toLowerCase();

        matchesSearch = searchableText.includes(searchLower);
      }

      // Language matching
      const normalizeArray = (arr) =>
        arr.map(item => normalizeValue(item));

      const matchesLanguage =
        selectedLanguages.length === 0 ||
        normalizeArray(userLanguages).some(lang =>
          selectedLanguages.map(normalizeValue).includes(lang)
        );

      // Education matching
      const matchesEducation =
        selectedEdu.length === 0 ||
        normalizeArray(userEducation).some(edu =>
          selectedEdu.map(normalizeValue).includes(edu)
        );

      // Skills matching
      const matchesSkills =
        selectedSkills.length === 0 ||
        selectedSkills.every(skill =>
          normalizeArray(userSkills).includes(normalizeValue(skill))
        );

      // Experience calculation
      let expNumber = 0;
      if (user.total_experience_years !== undefined) {
        expNumber = parseFloat(user.total_experience_years) || 0;
      } else if (user.profile?.total_experience_years) {
        expNumber = parseFloat(user.profile.total_experience_years) || 0;
      }

      const matchesExperience = expNumber <= maxExp;

      return matchesSearch && matchesLanguage && matchesEducation && matchesSkills && matchesExperience;
    });
  }, [searchTerm, selectedLanguages, selectedEdu, selectedSkills, maxExp, Alluser]);

  // Helper to get visible items for "View More"
  const getVisibleItems = (items, showAll) => {
    if (!items || items.length === 0) return [];
    return showAll ? items : items.slice(0, 5);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedLanguages([]);
    setSelectedEdu([]);
    setSelectedSkills([]);
    setMaxExp(10);
    setSearchTerm('');
    setShowAllLangs(false);
    setShowAllEdu(false);
    setShowAllSkills(false);
  };

  return (
    <div className="talent-page-container">
      {/* Search Section */}
      <section className="FindTalent-search-section">
        <div className="FindTalent-search-wrapper">
          <input
            type="text"
            placeholder="Search by Skills, Education, or Job Title"
            className="FindTalent-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="FindTalent-search-button">Search</button>
        </div>
        <h1 style={{ marginTop: "40px" }} className="FindTalent-results-title">
          Jobseekers based on your search ({filteredTalent.length})
        </h1>
      </section>

      <div className="FindTalent-layout-body">
        {/* Filters Sidebar */}
        <div className="FindTalent-filters-sidebar">
          <div className="FindTalent-filter-top">
            <span className="FindTalent-filter-label">Apply filters</span>
            <span className="FindTalent-clear-btn" onClick={clearFilters}>
              Clear all
            </span>
          </div>

          {/* Languages Filter */}
          {filterOptions.languages.length > 0 && (
            <div className="FindTalent-filter-category">
              <h3>Languages</h3>
              {getVisibleItems(filterOptions.languages, showAllLangs).map(lang => (
                <div key={lang} className="FindTalent-checkbox-item">
                  <input
                    type="checkbox"
                    id={`lang-${lang}`}
                    checked={selectedLanguages.includes(lang)}
                    onChange={() => handleFilterChange(lang, selectedLanguages, setSelectedLanguages)}
                  />
                  <label htmlFor={`lang-${lang}`}>{lang}</label>
                </div>
              ))}
              {filterOptions.languages.length > 5 && (
                <span className="FindTalent-view-more-link" onClick={() => setShowAllLangs(!showAllLangs)}>
                  {showAllLangs ? "View Less" : `View More (${filterOptions.languages.length - 5}+)`}
                </span>
              )}
            </div>
          )}

          {/* Experience Filter */}
          <div className="FindTalent-filter-category">
            <h3>Experience (Max: {maxExp} years)</h3>
            <input
              type="range"
              min="0"
              max="20"
              value={maxExp}
              onChange={(e) => setMaxExp(parseInt(e.target.value))}
              className="FindTalent-exp-slider"
            />
            <div className="FindTalent-range-values">
              <span>0 yrs</span>
              <span>{maxExp} yrs</span>
            </div>
          </div>

          {/* Education Filter */}
          {filterOptions.education.length > 0 && (
            <div className="FindTalent-filter-category">
              <h3>Education</h3>
              {getVisibleItems(filterOptions.education, showAllEdu).map(edu => (
                <div key={edu} className="FindTalent-checkbox-item">
                  <input
                    type="checkbox"
                    id={`edu-${edu}`}
                    checked={selectedEdu.includes(edu)}
                    onChange={() => handleFilterChange(edu, selectedEdu, setSelectedEdu)}
                  />
                  <label htmlFor={`edu-${edu}`}>{edu}</label>
                </div>
              ))}
              {filterOptions.education.length > 5 && (
                <span className="FindTalent-view-more-link" onClick={() => setShowAllEdu(!showAllEdu)}>
                  {showAllEdu ? "View Less" : `View More (${filterOptions.education.length - 5}+)`}
                </span>
              )}
            </div>
          )}

          {/* Skills Filter */}
          {filterOptions.skills.length > 0 && (
            <div className="FindTalent-filter-category">
              <h3>Skills</h3>
              {getVisibleItems(filterOptions.skills, showAllSkills).map(skill => (
                <div key={skill} className="FindTalent-checkbox-item">
                  <input
                    type="checkbox"
                    id={`skill-${skill}`}
                    checked={selectedSkills.includes(skill)}
                    onChange={() => handleFilterChange(skill, selectedSkills, setSelectedSkills)}
                  />
                  <label htmlFor={`skill-${skill}`}>{skill}</label>
                </div>
              ))}
              {filterOptions.skills.length > 5 && (
                <span className="FindTalent-view-more-link" onClick={() => setShowAllSkills(!showAllSkills)}>
                  {showAllSkills ? "View Less" : `View More (${filterOptions.skills.length - 5}+)`}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Talent List */}
        <div className="FindTalent-talent-list">
          {filteredTalent.length > 0 ? (
            filteredTalent.map((user, index) => (
              <ProfileCard
                key={user.id || index}
                user={user}
                showActions={true}
              />
            ))
          ) : (
            <div className="FindTalent-no-results">
              <h3>No job seekers found</h3>
              <p>Try adjusting your filters or search term</p>
              <button className="FindTalent-clear-filters-btn" onClick={clearFilters}>
                Clear all filters
              </button>
            </div>
          )}

          {filteredTalent.length > 0 && filteredTalent.length >= 10 && (
            <button className="FindTalent-load-more-btn">Load More</button>
          )}
        </div>
      </div>
    </div>
  );
};