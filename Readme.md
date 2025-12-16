# 🚀 Emran Ali — Dynamic Personal Portfolio Ecosystem

**Live Site:** [emran.humachlab.com](https://emran.humachlab.com)

Welcome to the source code for **Emran Ali's Personal Portfolio Website**. Originally based on the [iPortfolio](https://bootstrapmade.com/iportfolio-bootstrap-portfolio-websites-template/) Bootstrap theme, this project has been re-architected into a fully dynamic, data-driven platform. It serves as a centralized digital identity for a PhD researcher in AI and Health Informatics, showcasing academic background, research activities, and professional experiences.

---

## 📖 Part 1: General Overview
### (For Visitors, Recruiters, and General Readers)

This platform is designed as a **"Living Document."** Unlike traditional portfolios where updating a job title requires editing HTML code, this site pulls all its content from external data files. This ensures that the CV, website, and portfolio remain perfectly consistent at all times.

### 👨‍💼 About the Author
**Emran Ali** is a researcher, educator, and developer with expertise in:
* Artificial Intelligence and Machine Learning
* Biomedical Signal Processing
* Software Development
* Research Project Leadership

### 🎨 Key Features
* **Responsive Design:** Optimized layout for desktop, tablet, and mobile viewing.
* **Dark/Futuristic Theme:** Powered by Bootstrap 5.3.3 for a modern, professional aesthetic.
* **Dynamic Sections:** Powered by AOS (Animate On Scroll) for engaging entrance animations.
* **Interactive Icons:** Includes custom SVG icons for academic platforms (Google Scholar, ORCID, ResearchGate).
* **Smart Contact:** The "Location" link is hard-wired to an embedded Google Map; clicking it updates the map view instantly without reloading the page.
* **Sidebar Navigation:** Features smooth scrolling and section-based highlighting.

### 🗂️ Site Navigation & Pages

#### 1. **Main Interactive Hub (`index.html`)**
The main homepage of the portfolio site.
* **Hero Section:** Features a dynamic background and an animated typing effect cycling through professional personas.
* **About & Metrics:** A biographical overview paired with animated statistics (PureCounter.js).
* **Timeline:** A chronological, auto-sorted display of Professional Experience and Education history.

#### 2. **Reflective Diary (`diary.html`)**
A dedicated space for philosophical and spiritual writing.
* **Smart Sidebar:** The page automatically scans all entries to generate a "Filter Sidebar," allowing readers to filter content by tags like "Life" or "Philosophy."

#### 3. **Visual Gallery (`gallery.html`)**
A high-performance photography portfolio.
* **Tag-Based Filtering:** Users can filter the gallery using dynamic tags (e.g., "Nature," "City").
* **Lightbox Integration:** Clicking any image opens a full-screen, swipeable preview mode.

#### 4. **Printable CV (`printable_cv.html`)**
A print-optimized CV layout retaining all profile details.
* **Data Synchronization:** Pulls from the *exact same JSON files* as the main site, ensuring the PDF CV is never out of sync with the live website.

#### 5. **Personal Branding (`ea-logo.html`)**
A specialized gallery showcasing personal branding assets and logo evolution.

### 🛡️ License & Credits
* **Theme Origin:** The website theme was originally developed by [BootstrapMade](https://bootstrapmade.com/iportfolio-bootstrap-portfolio-websites-template/) and is used under a personal-use license.
* **Copyright:** All custom content, research data, and modifications are copyrighted © Emran Ali.
* **Permissions:** No portion of this website may be reused or redistributed without **explicit permission**.

---

## ⚙️ Part 2: Technical Architecture
### (For Software Engineers & Developers)

This section details the custom-built **"Data-Injection Architecture."** The application follows the **Separation of Concerns (SoC)** principle, decoupling the Data Layer (JSON) from the Presentation Layer (HTML).

### 📂 Project Directory Structure

```text
/ (Root Directory)
│
├── index.html                # Main Interactive Hub
├── diary.html                # Dynamic Blog Page
├── gallery.html              # Filterable Portfolio
├── ea-logo.html              # Branding Showcase
├── printable_cv.html         # Syncs with live data for PDF generation
├── copyright.html            # Version Control History
│
└── assets/
    ├── css/
    │   ├── main.css          # Core Styling
    │   └── additional.css    # Custom Overrides
    │
    ├── js/
    │   ├── site-loader.js    # ⚙️ CORE ENGINE (Fetch, Cache, & Render)
    │   └── main.js           # UI Interactions (Mobile Nav, Preloader)
    │
    ├── data/                 # 📄 THE DATABASE (JSON Files)
    │   ├── site.json         # Global Config & Cache Settings
    │   ├── personal_info.json
    │   ├── education.json
    │   ├── professional_experience.json
    │   ├── diary.json
    │   └── ... (20+ Total Data Files)
    │
    ├── img/                  # Static Assets (Profile, Gallery, Logos)
    └── vendor/               # Dependencies (Bootstrap, AOS, GLightbox)
```

### 🏗️ System Architecture

The backbone of the application is the **Site Loader Engine** (`assets/js/site-loader.js`), which orchestrates data fetching, local caching, and DOM manipulation.



#### 1. Data Layer (JSON)
Content is distributed across specialized JSON files in `assets/data/`.
* **Identity & Meta:** `site.json` (Caching rules), `personal_info.json`.
* **Timeline Data:** `education.json`, `professional_experience.json`.
* **Content Arrays:** `gallery.json` (Items + Tags), `diary.json` (Categories + Entries).

#### 2. The Loading Engine & Caching Strategy
To ensure the site loads instantly, the system implements a **LocalStorage Cache**.
1.  **Check Cache:** On page load, the script queries `localStorage` for `site_data_cache`.
2.  **Verify Timestamp:** It retrieves the `expiration_seconds` key from `site.json` to determine validity.
3.  **Decision Tree:**
    * *Valid:* Data is parsed directly from memory, resulting in 0ms network latency.
    * *Expired:* The script executes concurrent `fetch()` requests for all JSON files defined in the `JSON_FILES` array.

#### 3. Dynamic Rendering Algorithms
* **Tag-Based Filtering:** The `renderGallery` and `renderDiary` functions iterate through the dataset, extracting unique tags into a `Set` to generate sidebar filters dynamically.
* **Client-Side Routing:** The loader acts as a router, detecting `window.location.pathname` to execute only the necessary rendering functions for the active view.
* **GLightbox Re-initialization:** Since content is injected dynamically, the script re-triggers the GLightbox library to ensure image zoom features work on new elements.

### 🛠️ Technologies Used
* **Frontend:** HTML5, CSS3, JavaScript (ES6+).
* **Framework:** Bootstrap 5.3.3.
* **Data Transport:** Fetch API, Async/Await, JSON.
* **Storage:** LocalStorage API.
* **Libraries:**
    * **AOS:** Animate On Scroll Library for entry effects.
    * **Boxicons / Bootstrap Icons:** Comprehensive iconography.
    * **Typed.js:** Dynamic typewriter effects in the Hero section.
    * **PureCounter:** Statistical animations for key metrics.
    * **GLightbox:** Responsive image modal popups.

### 👨‍💻 Developer Maintenance Guide
1.  **Updating Content:** Edit the relevant `.json` file in `assets/data/`.
2.  **Forcing Updates (Dev Mode):** Set `"expiration_seconds": 0` in `site.json` or run `localStorage.clear()` in the browser console.
3.  **Adding New Sections:** Add the new filename to the `JSON_FILES` array in `site-loader.js` and implement a corresponding render function.

---
*Copyright © 2025 Emran Ali. All Rights Reserved.*