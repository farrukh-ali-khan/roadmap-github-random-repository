// API endpoints
const LANGUAGES_JSON_URL =
  "https://raw.githubusercontent.com/kamranahmedse/githunt/master/src/components/filters/language-filter/languages.json";

// DOM elements
const languageSelect = document.getElementById("languageSelect");
const messageEl = document.getElementById("message");
const repoDetailsEl = document.getElementById("repoDetails");
const repoNameEl = document.getElementById("repoName");
const repoDescriptionEl = document.getElementById("repoDescription");
const repoStarsEl = document.getElementById("repoStars");
const repoForksEl = document.getElementById("repoForks");
const repoIssuesEl = document.getElementById("repoIssues");
const refreshBtn = document.getElementById("refreshBtn");

// 1. Fetch available languages and populate dropdown
fetch(LANGUAGES_JSON_URL)
  .then((response) => response.json())
  .then((languages) => {
    // Check if the languages array is valid and non-empty
    if (!languages || !Array.isArray(languages) || languages.length === 0) {
      setErrorState("No languages found.");
      return;
    }

    // Populate dropdown using the array items (using title and value)
    languages.forEach((langObj) => {
      // Skip if the value is empty (for "All Languages" option) if desired
      // Or you can include it if you want to allow that option.
      const option = document.createElement("option");
      option.value = langObj.value; // e.g., "JavaScript"
      option.textContent = langObj.title; // e.g., "JavaScript"
      languageSelect.appendChild(option);
    });
  })
  .catch((error) => {
    console.error("Error fetching language data:", error);
    setErrorState("Error fetching language list");
  });

// 2. Add event listener to language select
languageSelect.addEventListener("change", () => {
  const selectedLang = languageSelect.value;
  if (selectedLang) {
    fetchRandomRepo(selectedLang);
  } else {
    // If user selects empty, show empty state
    setEmptyState();
  }
});

// 3. Function to fetch random repository for the selected language
function fetchRandomRepo(language) {
  // Validate language input
  if (!language || language === "undefined") {
    console.error("Invalid language provided:", language);
    setErrorState("No valid language selected");
    return;
  }

  setLoadingState();

  // We'll pick a random page between 1 and 34 (GitHub Search API allows up to 1000 results = 34 pages * 30 results)
  const randomPage = Math.floor(Math.random() * 34) + 1;

  // Build the API URL using encodeURIComponent for safety
  const url = `https://api.github.com/search/repositories?q=language:${encodeURIComponent(
    language
  )}&sort=stars&order=desc&page=${randomPage}&per_page=30`;

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (!data.items || data.items.length === 0) {
        // No repositories found for this language on this page
        setErrorState("No repositories found for this language");
        return;
      }

      // Pick a random repo from the fetched page
      const randomIndex = Math.floor(Math.random() * data.items.length);
      const repo = data.items[randomIndex];

      // Update the UI with the repository details
      showRepoDetails(repo);
    })
    .catch((error) => {
      console.error("Error fetching repositories:", error);
      setErrorState("Error fetching repositories");
    });
}

// 4. Show the repository details on the page
function showRepoDetails(repo) {
  // Hide any message and display the repository details section
  messageEl.textContent = "";
  repoDetailsEl.classList.remove("hidden");

  // Fill in the repository information
  repoNameEl.textContent = repo.name || "No Name";
  repoDescriptionEl.textContent = repo.description || "No Description";
  repoStarsEl.textContent = `★ Stars: ${repo.stargazers_count}`;
  repoForksEl.textContent = `⑂ Forks: ${repo.forks_count}`;
  repoIssuesEl.textContent = `⚠ Issues: ${repo.open_issues_count}`;

  // Display the refresh button for fetching another random repository
  refreshBtn.textContent = "Refresh";
  refreshBtn.classList.remove("hidden");
  refreshBtn.onclick = () => {
    // On refresh, fetch another random repo for the same selected language
    fetchRandomRepo(languageSelect.value);
  };
}

// 5. UI state helper functions

// Empty state: No language selected
function setEmptyState() {
  messageEl.textContent = "Please select a language";
  repoDetailsEl.classList.add("hidden");
  refreshBtn.classList.add("hidden");
}

// Loading state: Show loading message while fetching data
function setLoadingState() {
  messageEl.textContent = "Loading, please wait...";
  repoDetailsEl.classList.add("hidden");
  refreshBtn.classList.add("hidden");
}

// Error state: Show error message and allow the user to retry
function setErrorState(errorMsg) {
  messageEl.textContent = errorMsg;
  repoDetailsEl.classList.remove("hidden");

  // Allow user to retry by clicking the refresh button
  refreshBtn.textContent = "Click to retry";
  refreshBtn.classList.remove("hidden");
  refreshBtn.onclick = () => {
    const selectedLang = languageSelect.value;
    if (selectedLang) {
      fetchRandomRepo(selectedLang);
    } else {
      setEmptyState();
    }
  };
}
