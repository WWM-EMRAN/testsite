// assets/js/site-loader.js

// --- 1. CONFIGURATION ---
// CORRECTED PATH: Points to the assets/data folder
const BASE_DATA_PATH = './assets/data/';

const JSON_FILES = [
    'personal_info.json',
    'site.json',
    'key_metrics.json',
    'education.json',
    'professional_experience.json',
    'expertise_achievements.json',
    'skills.json',
    'honors_awards.json',
    'courses_trainings_certificates.json',
    'projects.json',
    'memberships.json',
    'sessions_events.json',
    'languages.json',
    'portfolios.json',
    'volunteerings.json',
    'publications.json'
];

// Stores all fetched data keyed by filename (e.g., 'personal_info' : {...})
let SITE_DATA = {};


// --- 2. CORE FETCHING FUNCTION ---

/**
 * Fetches all JSON files and stores the data in the global SITE_DATA object.
 * @returns {Promise<void>} Resolves when all data is loaded.
 */
async function loadAllData() {
    console.log('Starting data loading...');
    const fetchPromises = JSON_FILES.map(fileName =>
        fetch(BASE_DATA_PATH + fileName)
            .then(response => {
                if (!response.ok) {
                    // Log the exact file that failed to load (e.g., due to 404 or bad path)
                    throw new Error(`Failed to load ${fileName}: ${response.statusText || 'Network or Path Error'}`);
                }
                return response.json();
            })
            .then(data => {
                const baseName = fileName.replace('.json', '');
                SITE_DATA[baseName] = data;
            })
    );

    try {
        await Promise.all(fetchPromises);
        console.log('All core data loaded successfully.', SITE_DATA);
    } catch (error) {
        console.error('Error during data loading:', error);
        // Fallback or error message for the user:
        document.body.innerHTML = '<h1>Error loading site data. Please check console.</h1>';
    }
}






// --- 3. RENDERING FUNCTIONS ---

// MODIFIED: assets/js/site-loader.js (renderHeader function)


/**
 * Updates the document's metadata, such as the <title> tag.
 * @param {object} siteInfo
 */
function updateDocumentMetadata(siteInfo) {
    if (!siteInfo || !siteInfo.title) return;

    // Update the HTML <title> tag
    document.title = siteInfo.title;
}



/**
 * Renders the Header (Name, Profile Image, Social Links) in the Sidebar.
 * @param {object} personalInfo
 * @param {object} siteData
 */
function renderHeader(personalInfo, siteData) {
    if (!personalInfo || !siteData) return;

    // --- 1. Update Site Name in Header ---
    const siteNameElement = document.querySelector('#header .sitename');
    if (siteNameElement) {
        // Corrected path to access the name from the root of personal_info
        siteNameElement.textContent = personalInfo.name;
    }

    // --- 2. Update Profile Images (PP and Logo) ---
    const imageAssets = siteData.assets.images;
    const iconAssets = siteData.assets.icons;

    // Profile Image (Large circular photo)
    const profileImg = document.querySelector('#header .profile-img img');
    if (profileImg) {
        profileImg.src = `assets/img/${imageAssets.profile_image_pp}`;
    }

    // Logo (Small circular photo next to site name)
    const logoImg = document.querySelector('#header .logo img');
    if (logoImg) {
        logoImg.src = `assets/img/${iconAssets.logo_png}`; // Using iconAssets for logo_png
    }

    // --- 3. Update Social Links ---
    // Using siteData.social_links as it is a master list with icons
    const socialContainer = document.querySelector('#header .social-links');
    if (socialContainer && siteData.social_links) {
        socialContainer.innerHTML = siteData.social_links
            .filter(link => link.platform !== 'google-old' && link.platform !== 'researchgate-old' && link.platform !== 'researchgate-fab') // Optional: filter out older/unused links
            .map(link => `
            <a href="${link.url}" target="_blank" class="${link.platform}">
                <i class="${link.icon_class}"></i>
            </a>
        `).join('');
    }
}



/**
 * Renders the Navigation Menu (ID: #navmenu) from site.json.
 * @param {object} navigation - Now receives a wrapper object {main_menu: array}
 */
function renderNavigation(navigation) {
    // Check if the input object exists and if the main_menu property exists
    if (!navigation || !navigation.main_menu) return;

    const navContainer = document.getElementById('navmenu');
    if (!navContainer) return;

    // Get the actual menu array
    const menuArray = navigation.main_menu;

    let navHTML = '<ul>';

    // Loop through the selected menu array (either main_menu or details_menu)
    menuArray.forEach(item => {
        // ... (rest of the logic inside the loop uses 'item' as before) ...

        // Class for the link: 'active scrollto' ONLY for #hero, 'scrollto' for all others
        // Note: For details_menu, we often want the "Back" link to be handled differently,
        // but for now, we continue the logic established for the main menu:
        const linkClass = (item.url === '#hero' || item.url === './') ? 'active scrollto' : 'scrollto';
        const finalLinkClass = linkClass;

        if (item.is_dropdown && item.submenu && item.submenu.length > 0) {
            // ... (Dropdown rendering logic as before)
            navHTML += `
                <li class="dropdown">
                    <a href="${item.url}" class="${finalLinkClass}"><i class="${item.icon_class} navicon"></i> <span>${item.label}</span> <i class="bi bi-chevron-down toggle-dropdown"></i></a>
                    <ul class=""> 
                        ${item.submenu.map(subItem => `
                            <li>
                                <a href="${subItem.url}" class="scrollto"><i class="${subItem.icon_class} navicon"></i> <span>${subItem.label}</span></a>
                            </li>
                        `).join('')}
                    </ul>
                </li>
            `;
        } else {
            // Standard Link Item
            navHTML += `
                <li><a href="${item.url}" class="${finalLinkClass}"><i class="${item.icon_class} navicon"></i> <span>${item.label}</span></a> </li>
            `;
        }
    });

    navHTML += '</ul>';
    navContainer.innerHTML = navHTML;
}



/**
 * Initializes the dropdown behavior according to the required structure:
 * <li> fixed, <a> toggles 'active' on click, <ul> toggles 'dropdown-active'.
 */
function renderNavDropdowns() {
    // Select all the dropdown parent links (the <a> element)
    const navDropdownLinks = document.querySelectorAll('#navmenu .dropdown > a');

    navDropdownLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();

            // 1. Toggle the active class on the clicked <a> tag itself.
            this.classList.toggle('active');

            // 2. Identify the submenu <ul> (which is the next sibling element)
            const submenuUl = this.nextElementSibling;

            if (submenuUl && submenuUl.tagName === 'UL') {

                // 3. Toggle the 'dropdown-active' class on the submenu <ul>.
                submenuUl.classList.toggle('dropdown-active');

            }
        });
    });
}



/**
 * Renders the main Hero Section (ID: #hero)
 * @param {object} personalInfo
 */
function renderHero(personalInfo) {
    const hero = document.getElementById('hero');
    if (!hero || !personalInfo || !personalInfo.hero) return;

    hero.querySelector('h2').textContent = personalInfo.hero.title_main;

    // Update Typed items
    const typedElement = hero.querySelector('p:nth-of-type(1) .typed');
    if (typedElement) {
        // This dynamically sets the data for Typed.js
        typedElement.setAttribute('data-typed-items', personalInfo.hero.typed_items);
    }

    // Update the researcher status and institutes
    const paragraphs = hero.querySelectorAll('p');
    if (paragraphs.length >= 2) {
        paragraphs[1].textContent = personalInfo.hero.title_researcher;
    }
    if (paragraphs.length >= 3) {
        paragraphs[2].innerHTML = `${personalInfo.hero.title_institute_primary} <br>${personalInfo.hero.title_institute_secondary} <br>${personalInfo.hero.tagline}`;
    }
}



/**
 * Renders the About section (ID: #about) and Profile Summary for the main index.html page.
 * Uses ID #research-summary-area for reliable injection.
 * @param {object} personalInfo
 */
function renderAbout(personalInfo) {
    if (!personalInfo) return;

    const aboutSection = document.getElementById('about');
    if (!aboutSection) return;

    const siteAssets = SITE_DATA.site.assets;
    const summaryData = personalInfo.profile_summary;

    // 1. Set Profile Image
    const profileImg = aboutSection.querySelector('.col-lg-4 img');
    if (profileImg && siteAssets) {
        profileImg.src = `assets/img/${siteAssets.images.profile_image_formal}`;
    }

    // --- A. Profile Summary (Top 8-column content) ---
    const summaryContainer = aboutSection.querySelector('.col-lg-8.content .section-title');

    if (summaryContainer && summaryData) {
        // Title and Printable CV link
        const titleH2 = summaryContainer.querySelector('h2');
        if (titleH2) {
            titleH2.innerHTML =
                `${summaryData.title} <a href="${summaryData.link_printable_cv}"> <i class="bx bx-printer"></i> </a>`;
        }

        // Intro paragraph
        const introParagraph = summaryContainer.querySelector('p:nth-of-type(1)');
        if (introParagraph) {
            introParagraph.innerHTML = summaryData.intro_paragraph_html;
        }

        // Key Points (Left and Right Columns)
        const leftList = summaryContainer.querySelector('.row .col-lg-6:nth-child(1) ul');
        const rightList = summaryContainer.querySelector('.row .col-lg-6:nth-child(2) ul');

        if (leftList) {
            leftList.innerHTML = summaryData.key_points_left.map(item =>
                `<li><i class="${item.icon_class}"></i> <strong>${item.strong}:</strong> <span>${item.link ? `<a target="_blank" href="${item.link}">${item.text}</a>` : item.text}</span> </li>`
            ).join('');
        }

        if (rightList) {
            rightList.innerHTML = summaryData.key_points_right.map(item =>
                `<li><i class="${item.icon_class}"></i> <strong>${item.strong}:</strong> <span>${item.link ? `<a target="_blank" href="${item.link}">${item.text}</a>` : item.text}</span> </li>`
            ).join('');
        }
    }

    // --- B. FIX: Research Area/Recent Works (Targeting the new ID) ---
    const researchAreaParagraph = document.getElementById('research-summary-area');
    if (researchAreaParagraph && summaryData) {
        // This will now replace ALL content inside the <p> with the ID.
        researchAreaParagraph.innerHTML = `
            <b>Research Area:</b> ${summaryData.research_area} <br>
            <b>Recent Works:</b> ${summaryData.recent_works}
        `;
    }

    // --- C. Full About Section (Below the summary) ---
    const fullAboutContainer = aboutSection.querySelector('.container.section-title:nth-of-type(2)');
    const fullAboutTitle = fullAboutContainer ? fullAboutContainer.querySelector('h2') : null;
    const fullAboutContent = fullAboutContainer ? fullAboutContainer.querySelector('p') : null;
    const fullAboutData = personalInfo.about_full_text;

    if (fullAboutTitle && fullAboutData) {
        fullAboutTitle.innerHTML = `<i class="bx bx-user"></i> ${fullAboutData.title}`;
    }
    if (fullAboutContent && fullAboutData) {
        fullAboutContent.innerHTML = fullAboutData.paragraph_html;
    }
}



/**
 * Renders the Profile Summary section for the printable_cv.html page.
 * Uses ID #research-summary-area for reliable injection.
 * @param {object} personalInfo
 */
function renderAboutCV(personalInfo) {
    if (!personalInfo) return;

    const cvContainer = document.getElementById('main_cv');
    if (!cvContainer) return;

    const summaryData = personalInfo.profile_summary;
    const siteAssets = SITE_DATA.site.assets;
    const resumePdfPath = siteAssets.documents.resume_pdf || '#';

    // 1. Set Profile Image
    const profileImg = cvContainer.querySelector('#about .col-lg-4 img');
    if (profileImg && siteAssets) {
        profileImg.src = `assets/img/${siteAssets.images.profile_image_formal}`;
    }

    // --- A. Top Header and Buttons ---
    const summaryHeader = cvContainer.querySelector('#about .col-lg-8.content .section-title h2');

    if (summaryHeader && summaryData) {
        // Title, Print Button, and Download Button
        summaryHeader.innerHTML = `
            Resume - ${personalInfo.name} | 
            <a href="javascript:void(0);" onclick="PrintElem('main_cv')"> <i class="bx bx-printer"></i> | </a> 
            <a href="${resumePdfPath}" target="_blank"> <i class="bx bx-download"></i> </a>
        `;
    }

    // --- B. Intro Paragraph & Key Points (Same logic as renderAbout) ---
    const introParagraph = cvContainer.querySelector('#about .col-lg-8.content .section-title p:nth-of-type(1)');
    if (introParagraph && summaryData) {
        introParagraph.innerHTML = summaryData.intro_paragraph_html;
    }

    const leftList = cvContainer.querySelector('#about .col-lg-8.content .row .col-lg-6:nth-child(1) ul');
    const rightList = cvContainer.querySelector('#about .col-lg-8.content .row .col-lg-6:nth-child(2) ul');

    if (leftList && rightList && summaryData) {
        leftList.innerHTML = summaryData.key_points_left.map(item =>
            `<li><i class="${item.icon_class}"></i> <strong>${item.strong}:</strong> <span>${item.link ? `<a target="_blank" href="${item.link}">${item.text}</a>` : item.text}</span> </li>`
        ).join('');

        rightList.innerHTML = summaryData.key_points_right.map(item =>
            `<li><i class="${item.icon_class}"></i> <strong>${item.strong}:</strong> <span>${item.link ? `<a target="_blank" href="${item.link}">${item.text}</a>` : item.text}</span> </li>`
        ).join('');
    }

    // --- C. FIX: Research Area/Recent Works (Targeting the new ID) ---
    const researchAreaParagraph = document.getElementById('research-summary-area');
    if (researchAreaParagraph && summaryData) {
        // This will now replace ALL content inside the <p> with the ID.
        researchAreaParagraph.innerHTML = `
            <b>Research Area:</b> ${summaryData.research_area} <br>
            <b>Recent Works:</b> ${summaryData.recent_works}
        `;
    } else if (researchAreaParagraph) {
        // If data is missing but the element exists, ensure it is cleared.
        researchAreaParagraph.innerHTML = '';
    }
}



/**
 * Renders the Key Metrics section (ID: #keyInfo) for the main index.html page (with PureCounter animation).
 * @param {object} keyMetricsData
 */
function renderKeyMetrics(keyMetricsData) {
    if (!keyMetricsData || !Array.isArray(keyMetricsData.metrics)) return; // Check the new structure

    const section = document.getElementById('keyInfo');
    if (!section) return;

    const sectionInfo = keyMetricsData.section_info;
    const metricsArray = keyMetricsData.metrics;

    // 1. Update Section Title and description using section_info
    const titleH2 = section.querySelector('.section-title h2');
    const descriptionH6 = section.querySelector('.section-title h6');

    if (titleH2 && sectionInfo) {
        titleH2.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title}`;
    }
    if (descriptionH6 && sectionInfo) {
        descriptionH6.textContent = sectionInfo.details;
    }

    const container = section.querySelector('.row.gy-4');
    if (!container) return;

    // Clear static HTML content
    container.innerHTML = '';

    // 2. Inject Dynamic HTML (using the metrics array)
    container.innerHTML = metricsArray.map(item => `
        <div class="col-lg-3 col-md-6">
            <div class="stats-item">
                <i class="${item.icon_class}"></i>
                <span data-purecounter-start="0" data-purecounter-end="${item.value}" data-purecounter-duration="0.75" class="purecounter"></span>
                <p><strong>${item.strong_text}</strong> ${item.description}</p>
            </div>
        </div>
    `).join('');

    // 3. Manually initialize PureCounter
    if (typeof PureCounter !== 'undefined') {
        new PureCounter();
    }
}



/**
 * Renders the Key Metrics section (ID: #keyInfo) for the printable_cv.html page (simplified table/list style).
 * @param {object} keyMetricsData
 */
function renderKeyMetricsCV(keyMetricsData) {
    if (!keyMetricsData || !Array.isArray(keyMetricsData.metrics)) return; // Check the new structure

    const section = document.getElementById('keyInfo');
    if (!section) return;

    const sectionInfo = keyMetricsData.section_info;
    const metricsArray = keyMetricsData.metrics;

    // 1. Update Section Title
    const titleH2 = section.querySelector('.section-title h2');
    const descriptionP = section.querySelector('.section-title p'); // Assuming CV might use a <p> tag for description

    if (titleH2 && sectionInfo) {
        titleH2.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title}`;
    }
    // Update the description in the CV page, which is usually a <p> tag inside the section-title
    if (descriptionP && sectionInfo) {
        descriptionP.textContent = sectionInfo.details;
    }

    // Selector: the div immediately following the section title container
    const container = section.nextElementSibling;

    if (!container || !container.classList.contains('row')) {
        console.error("KeyMetricsCV: Could not find the target container. Check HTML structure.");
        return;
    }

    // Clear static HTML content
    container.innerHTML = '';

    // 2. Inject Dynamic HTML (using the metrics array)
    container.innerHTML = metricsArray.map(item => `
        <div class="col-lg-3 col-md-6">
            <div class="stats-item">
                <p>
                    <i class="${item.icon_class}"></i> 
                    ${item.value} <strong>${item.strong_text}</strong> ${item.description}
                </p>
            </div>
        </div>
    `).join('');
}



/**
 * Renders the Education section (ID: #educations) for the main index page (two-column resume style).
 * FIX: Now correctly loads the Summary title from education.json.
 * @param {object} educationData
 */
function renderEducations(educationData) {
    if (!educationData || !Array.isArray(educationData.degrees)) return;

    const section = document.getElementById('educations');
    if (!section) return;

    const sectionInfo = educationData.section_info;
    const summaryInfo = educationData.summary;
    const columnTitles = educationData.column_titles || {};

    // 1. Render Section Title and Description
    const sectionTitleH2 = section.querySelector('.section-title h2');
    const sectionDescriptionH6 = section.querySelector('.section-title h6');

    if (sectionTitleH2 && sectionInfo) {
        sectionTitleH2.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title}`;
    }
    if (sectionDescriptionH6 && sectionInfo) {
        sectionDescriptionH6.textContent = sectionInfo.details;
    }

    // 2. Render Summary Block (Current Status)

    // 2A. CRITICAL FIX: Update the Summary Title (H3)
    const summaryTitleH3 = section.querySelector('h3.resume-title'); // Targets the first H3 in the section
    if (summaryTitleH3 && summaryInfo && summaryInfo.title) {
        summaryTitleH3.textContent = summaryInfo.title;
    }

    // 2B. Update the Summary List (UL)
    const summaryListContainer = section.querySelector('.resume-item.pb-0 ul');

    if (summaryListContainer && summaryInfo && Array.isArray(summaryInfo.status_list)) {
        summaryListContainer.innerHTML = summaryInfo.status_list.map(item =>
            `<li>${item}</li>`
        ).join('');
    }

    // 3. Setup Columns and Dynamic Headers
    const columns = section.querySelectorAll('.row > .col-lg-6');
    if (columns.length < 2) return;

    const leftColumn = columns[0];
    const rightColumn = columns[1];

    // --- Use JSON data for column headers ---
    const leftColumnTitle = columnTitles.left_column || 'Doctor of Philosophy (PhD)';
    const rightColumnMasterTitle = columnTitles.right_column_master || 'Master of Science (by Research) – MRes';
    const bachelorTitle = columnTitles.right_column_bachelor || 'Bachelor of Science (B.Sc.)';

    // Clear and start column HTML with the dynamic H3 headers
    // NOTE: This H3 is NOT the summary H3, but the first one inside the columns.
    let leftHTML = `<h3 class="resume-title">${leftColumnTitle}</h3>`;
    let rightHTML = `<h3 class="resume-title">${rightColumnMasterTitle}</h3>`;

    // Track if the Bachelor header has been injected into the right column yet
    let bachelorHeaderInjected = false;

    // Helper function to generate HTML for a single education item
    const generateItemHTML = (degree) => {
        // Thesis title display
        const thesisInfo = (degree.thesis_title && degree.thesis_length)
            ? `<strong>Thesis:</strong> ${degree.thesis_title} — length ${degree.thesis_length}.<br>`
            : '';

        // Scholarship link
        const scholarshipLinkTag = degree.scholarship_link
            ? `<a class="scrollto" href="${degree.scholarship_link}"><i class="bx bx-link"></i></a>`
            : '';

        // Specialisation
        const specialisationHTML = degree.specialisation
            ? `<strong>Specialisation:</strong> ${degree.specialisation}<br>`
            : '';

        // Scholarship/Fellowship
        const scholarshipHTML = degree.scholarship
            ? `<strong>Scholarship/Fellowship:</strong> ${degree.scholarship} ${scholarshipLinkTag}<br>`
            : '';

        // Research Topic
        const researchTopicHTML = degree.research_topic
            ? `<strong>Research Topic:</strong> ${degree.research_topic} <br>`
            : '';

        // Activities and Involvement
        const activitiesHTML = degree.activities_involvement
            ? `<strong>Activities and Involvement:</strong> ${degree.activities_involvement}<br>`
            : '';

        // Description
        const descriptionHTML = degree.description_full
            ? `<p><strong>Description:</strong> ${degree.description_full}</p>`
            : '';

        // Handle research/projects list
        const projectsList = Array.isArray(degree.research_projects) ? degree.research_projects.map(project => {
            let title = typeof project === 'string' ? project : (project.title || '');
            let link = typeof project === 'object' ? (project.link || '') : '';
            let type = typeof project === 'object' && project.type ? `<strong>${project.type}:</strong> ` : '';

            // Project link
            const linkTag = link ? `<a class="scrollto" href="${link}"><i class="bx bx-link"></i></a>` : '';

            return `<li>${type}${title} ${linkTag}</li>`;
        }).join('') : '';

        // Conditional Heading for Projects (Only show if list exists)
        const projectsHeading = projectsList
            ? `<p><strong>Research and Projects:</strong></p>`
            : '';

        // Final list block (only show <ul> if there are project items)
        const projectsBlock = projectsList ? `<ul>${projectsList}</ul>` : '';

        return `
            <div class="resume-item pb-0" data-aos="fade-up" data-aos-delay="200" id="${degree.degree_id}">
                <h4>${degree.institution_type}</h4>
                <h6>
                    <em>
                        ${degree.institution_name}, ${degree.institution_location}
                        <a target="_blank" href="${degree.link || '#'}"><i class="bx bx-link-external"></i></a>
                    </em>
                </h6>
                <h5>${degree.timeframe_details}</h5>
                <p>
                    ${specialisationHTML}
                    ${scholarshipHTML}
                    ${researchTopicHTML}
                    ${activitiesHTML}
                    ${thesisInfo}
                </p>
                ${descriptionHTML}
                ${projectsHeading} 
                ${projectsBlock}
            </div>`;
    };

    // --- 4. Sequence-Preserving Placement Logic (remains the same) ---
    educationData.degrees.forEach(degree => {
        const itemHTML = generateItemHTML(degree);

        // PHDs always go into the Left Column, preserving JSON order for that column
        if (degree.level.includes('PhD')) {
            leftHTML += itemHTML;
        }
        // Masters and Bachelors go into the Right Column, preserving JSON order for that column
        else if (degree.level.includes('Master') || degree.level.includes('Bachelor')) {

            // Inject the Bachelor header right before the first Bachelor degree item
            if (degree.level.includes('Bachelor') && !bachelorHeaderInjected) {
                rightHTML += `<h3 class="resume-title">${bachelorTitle}</h3>`;
                bachelorHeaderInjected = true;
            }
            rightHTML += itemHTML;
        }
    });

    // 5. Apply the generated HTML to the columns
    leftColumn.innerHTML = leftHTML;
    rightColumn.innerHTML = rightHTML;
}



/**
 * Renders the Education section (ID: #educations) for the printable_cv.html page (table format).
 * FIX: Removes Summary generation entirely, targeting the Tables container as the first sibling element.
 * Preserves JSON data exactly as is (no processing).
 * @param {object} educationData
 */
function renderEducationsCV(educationData) {
    if (!educationData || !Array.isArray(educationData.degrees)) return;

    const mainCvContainer = document.getElementById('main_cv');
    const sectionTitleContainer = document.getElementById('educations');

    if (!mainCvContainer || !sectionTitleContainer) return;

    const sectionInfo = educationData.section_info;
    const degrees = educationData.degrees;

    // 1. Render Section Title and Description
    const sectionTitleH2 = sectionTitleContainer.querySelector('h2');
    const sectionDescriptionP = sectionTitleContainer.querySelector('p');

    if (sectionTitleH2 && sectionInfo) {
        sectionTitleH2.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title}`;
    }

    if (sectionDescriptionP && sectionInfo && sectionInfo.details) {
        sectionDescriptionP.textContent = sectionInfo.details;
    } else if (sectionDescriptionP) {
        sectionDescriptionP.textContent = '';
    }

    // --- DOM TRAVERSAL (CRITICAL FIX: Tables Container is the first non-title sibling) ---

    // We target the Tables Container (div.row.ps-3.pe-3) as the first major sibling after #educations.
    // We use querySelector on the main container to find the first instance of this class pattern
    // that follows the #educations section title.
    const tableContainer = mainCvContainer.querySelector('#educations ~ .row.ps-3.pe-3');

    if (!tableContainer) {
        // This should only fail if the div.row.ps-3.pe-3 is missing or misnamed immediately after the title container
        console.error("EducationCV: FATAL ERROR. Could not find the Tables Container (DIV.row.ps-3.pe-3) after the #educations title.");
        return;
    }

    // 2. Render Detailed Education Items (Tables)
    tableContainer.innerHTML = ''; // Clear all static tables

    const generateTableHTML = (degree) => {
        // Helper function for conditional content, showing nothing if empty string
        const createDetailRow = (label, content, link = '', isThesis = false) => {
            if (!content) return '';

            const thesisLengthText = degree.thesis_length || '';
            const finalContent = isThesis && thesisLengthText
                ? `${content} — length ${thesisLengthText}.`
                : content;

            const linkTag = link
                ? `<a class="scrollto" href="${link}"><i class="bx bx-link"></i></a>`
                : '';

            return `<p><strong>${label}:</strong> ${finalContent} ${linkTag}</p>`;
        };

        // Project List: Simplified for CV table view
        const projectsList = Array.isArray(degree.research_projects) ? degree.research_projects.map(project => {
            let title = typeof project === 'string' ? project : (project.title || '');
            let link = typeof project === 'object' ? (project.link || '') : '';
            let type = typeof project === 'object' && project.type ? `<strong>${project.type}:</strong> ` : '';

            const linkTag = link ? `<a class="scrollto" href="${link}"><i class="bx bx-link"></i></a>` : '';

            return `<li>${type}${title} ${linkTag}</li>`;
        }).join('') : '';

        const projectsBlock = projectsList
            ? `<p><strong>Research and Projects:</strong></p><ul>${projectsList}</ul>`
            : '';

        // Institution link tag
        const institutionLinkTag = degree.link
            ? `<a target="_blank" href="${degree.link}"><i class="bx bx-link-external"></i></a>`
            : '';

        // Only include description/details block if content exists
        const descriptionHTML = degree.description_full
            ? `<p>${degree.description_full}</p>`
            : '';

        // Thesis row check: ensures the row is only built if the title exists
        const thesisRow = degree.thesis_title ? createDetailRow('Thesis', degree.thesis_title, '', true) : '';

        // Degree details
        const degreeDetailsHTML = `
            ${createDetailRow('Specialisation', degree.specialisation)}
            ${createDetailRow('Scholarship/Fellowship', degree.scholarship, degree.scholarship_link)}
            ${createDetailRow('Research Topic', degree.research_topic)}
            ${createDetailRow('Activities and Involvement', degree.activities_involvement)}
            ${thesisRow}
        `;

        return `
            <table>
                <thead>
                    <tr>
                        <td>${degree.level}</td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <h6>${degree.institution_type}</h6>
                            ${degree.institution_name}, ${degree.institution_location}
                            ${institutionLinkTag} <br>
                            <em>${degree.timeframe_details}</em>
                            
                            ${descriptionHTML}

                            ${degreeDetailsHTML}

                            ${projectsBlock}
                        </td>
                    </tr>
                </tbody>
            </table>
        `;
    };

    // Append all generated tables in JSON order
    degrees.forEach(degree => {
        tableContainer.innerHTML += generateTableHTML(degree);
    });
}



/**
 * Renders the Professional Experiences section (ID: #professionalExperiences)
 * for the main index page (two-column resume style).
 * FIX: Fully consolidated, debugged version incorporating helper functions for robust array checking
 * and verified targeting of all headers and content blocks.
 * @param {object} profExpData
 */
function renderProfessionalExperiences(profExpData) {
    // Helper functions must be defined locally for reliability
    const ArrayOfObjects = (arr) => Array.isArray(arr) && arr.every(item => typeof item === 'object' && item !== null);
    const ArrayOfStrings = (arr) => Array.isArray(arr) && arr.every(item => typeof item === 'string');

    // --- Guard Check ---
    if (!profExpData || !ArrayOfObjects(profExpData.experiences)) return;

    const section = document.getElementById('professionalExperiences');
    if (!section) return;

    // Find the section title container and the content container
    const sectionTitleContainer = section.querySelector('.container.section-title');
    const contentContainer = sectionTitleContainer ? sectionTitleContainer.nextElementSibling : null;

    if (!contentContainer) return;

    const sectionInfo = profExpData.section_info;
    const summaryInfo = profExpData.summary;
    const experiences = profExpData.experiences;

    // 1. Render Section Title and Description
    const sectionTitleH2 = sectionTitleContainer.querySelector('h2');
    const sectionDescriptionH6 = sectionTitleContainer.querySelector('h6');

    if (sectionTitleH2 && sectionInfo) {
        sectionTitleH2.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title}`;
    }
    if (sectionDescriptionH6 && sectionInfo) {
        sectionDescriptionH6.textContent = sectionInfo.details;
    }

    // --- 2. Render Summary Blocks (Areas of Expertise and Research Interests) ---

    const allH3Titles = contentContainer.querySelectorAll('h3.resume-title');
    const allResumeItems = contentContainer.querySelectorAll('div.resume-item.pb-0');

    // Target 1: The Summary (Areas of Expertise) block (Index 0)
    const expertiseTitleH3 = allH3Titles[0];
    const expertiseItem = allResumeItems[0];
    const expertiseListContainer = expertiseItem ? expertiseItem.querySelector('ul') : null;
    const expertiseH4 = expertiseItem ? expertiseItem.querySelector('h4') : null;

    if (expertiseTitleH3 && summaryInfo) {
        // H3 (Main Summary Title)
        expertiseTitleH3.textContent = summaryInfo.title;
    }

    if (expertiseListContainer && summaryInfo && ArrayOfObjects(summaryInfo.expertise_list) && summaryInfo.expertise_list.length > 0) {
        const expertiseListItem = summaryInfo.expertise_list[0];
        const expertiseData = expertiseListItem.areas_of_expertise;

        // H4 (Areas of Expertise Title)
        if (expertiseH4) {
            expertiseH4.textContent = expertiseListItem.title;
        }

        if (ArrayOfStrings(expertiseData)) {
            expertiseListContainer.innerHTML = expertiseData.map(item => `<li>${item}</li>`).join('');
        }
    }

    // Target 2: The Research Interests block (Index 1)
    const researchItem = allResumeItems[1];
    const researchTitleH4 = researchItem ? researchItem.querySelector('h4') : null;

    // We assume the H3 title for Research Interests is the element immediately preceding the research item DIV
    const researchTitleH3 = researchItem ? researchItem.previousElementSibling : null;

    if (researchItem && summaryInfo && ArrayOfObjects(summaryInfo.expertise_list) && summaryInfo.expertise_list.length > 1) {

        const researchListItem = summaryInfo.expertise_list[1];

        // H3 (Research Interests Title) - If the H3 is not commented out, load it
        if (researchTitleH3 && researchTitleH3.tagName === 'H3') {
            researchTitleH3.textContent = researchListItem.title;
        }

        // H4 (Research Description/H4) - Loads the descriptive text
        if (researchTitleH4 && summaryInfo.details_research_interests) {
            researchTitleH4.textContent = summaryInfo.details_research_interests;
        }

        // --- CRITICAL FIX: Populate the three columns (ULs) ---
        const researchColumns = researchItem ? researchItem.querySelectorAll('.col-lg-4 ul') : [];
        const columnData = researchListItem.research_interests_columns;

        if (researchColumns.length >= 3 && Array.isArray(columnData)) {
            columnData.forEach((listItems, index) => {
                if (researchColumns[index] && ArrayOfStrings(listItems)) {
                    researchColumns[index].innerHTML = listItems.map(item => `<li>${item}</li>`).join('');
                }
            });
        }
    }


    // --- 3. Setup Columns for Detailed Experiences ---
    const columns = contentContainer.querySelectorAll('.row > .col-lg-6');
    if (columns.length < 2) return;

    const leftColumn = columns[0];
    const rightColumn = columns[1];

    let leftHTML = '';
    let rightHTML = '';

    let currentInstitutionLeft = '';
    let currentInstitutionRight = '';

    // Helper function to generate HTML for a single role
    const generateRoleHTML = (role) => {

        // Helper to format lists - CONDITIONAL RENDERING
        const listToHTML = (list, prefix) => {
            if (!ArrayOfStrings(list) || list.length === 0) return '';

            const items = list.map(item => `<li>${item}</li>`).join('');
            return `<p><strong>${prefix}:</strong><ul>${items}</ul></p>`;
        };

        const courseInvolvementHTML = listToHTML(role.course_involvement, 'Course Involvement');

        const skillsHTML = role.related_skills
            ? `<p><strong>Related Skills:</strong> ${role.related_skills}</p>`
            : '';

        return `
            <div class="resume-item pb-0" data-aos="fade-up" data-aos-delay="200">
                <h4>${role.title}</h4>
                <h5>${role.timeframe_details}</h5>
                
                ${listToHTML(role.description_list, 'Description')}
                ${listToHTML(role.responsibilities_list, 'Responsibilities')}
                ${courseInvolvementHTML}
                ${skillsHTML}
            </div>`;
    };

    // --- 4. Populate Columns with Grouped Experience ---

    experiences.forEach(experience => {
        let groupContent = '';
        const category = experience.category;
        const targetColumn = (category.includes('Research') || category.includes('Training')) ? 'left' : 'right';
        let currentInstitutionTracker = targetColumn === 'left' ? currentInstitutionLeft : currentInstitutionRight;

        // 4a. Render Section Group Header
        groupContent += `<h3 class="resume-title"><i class="${experience.icon_class}"></i> ${category}</h3>`;

        // 4b. Render Roles
        experience.roles.forEach(role => {

            // Render Institution Header only if it's the first role in this institution/group
            if (experience.organization !== currentInstitutionTracker) {
                groupContent += `
                    <h3 class="resume-title" data-aos="fade-up" data-aos-delay="100">${experience.organization}</h3>
                    <h6 data-aos="fade-up" data-aos-delay="100">
                        <em>${experience.location} 
                            <a target="_blank" href="${experience.link || '#'}">
                                <i class="bx bx-link-external"></i>
                            </a> 
                        </em>
                    </h6> <br>
                `;
                // Update tracker for the current column
                if (targetColumn === 'left') {
                    currentInstitutionLeft = experience.organization;
                } else {
                    currentInstitutionRight = experience.organization;
                }
            }

            // Render the specific role item
            groupContent += generateRoleHTML(role);
        });

        // 4c. Append to the correct column
        if (targetColumn === 'left') {
            leftHTML += groupContent;
        } else {
            rightHTML += groupContent;
        }
    });

    // 5. Apply the generated HTML to the columns
    leftColumn.innerHTML = leftHTML;
    rightColumn.innerHTML = rightHTML;
}



/**
 * Renders the Professional Experiences section (ID: #professionalExperiences)
 * for the printable_cv.html page (table format).
 * FIX: Consolidates roles under the same institution and category into a single header block.
 * @param {object} profExpData
 */
function renderProfessionalExperiencesCV(profExpData) {
    if (!profExpData || !Array.isArray(profExpData.experiences)) return;

    const mainCvContainer = document.getElementById('main_cv');
    const sectionTitleContainer = document.getElementById('professionalExperiences');

    if (!mainCvContainer || !sectionTitleContainer) return;

    const sectionInfo = profExpData.section_info;
    const experiences = profExpData.experiences;

    // Helper to validate list is an array of strings
    const ArrayOfStrings = (arr) => Array.isArray(arr) && arr.every(item => typeof item === 'string');

    // 1. Render Section Title and Description
    const sectionTitleH2 = sectionTitleContainer.querySelector('h2');
    const sectionDescriptionP = sectionTitleContainer.querySelector('p');

    if (sectionTitleH2 && sectionInfo) {
        sectionTitleH2.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title}`;
    }

    if (sectionDescriptionP && sectionInfo && sectionInfo.details) {
        sectionDescriptionP.textContent = sectionInfo.details;
    } else if (sectionDescriptionP) {
        sectionDescriptionP.textContent = '';
    }

    // --- DOM TRAVERSAL (Find Tables Container) ---
    const tableContainer = mainCvContainer.querySelector('#professionalExperiences ~ .row.ps-3.pe-3');

    if (!tableContainer) {
        console.error("ProfessionalExperiencesCV: FATAL ERROR. Could not find the Tables Container (DIV.row.ps-3.pe-3) after the #professionalExperiences title.");
        return;
    }

    // 2. Clear static content
    tableContainer.innerHTML = '';

    // Tracks the last category printed to ensure the blue header prints only once per category
    let lastCategory = '';
    // Tracks the last institution printed to group roles under a single institution header
    let lastInstitution = '';

    // Helper function to format lists - with conditional rendering
    const listToHTML = (list, prefix) => {
        if (!ArrayOfStrings(list) || list.length === 0) return '';

        const items = list.map(item => `<li>${item}</li>`).join('');
        return `<p><strong>${prefix}:</strong><ul>${items}</ul></p>`;
    };

    // 3. Generate and Append Experience Tables
    experiences.forEach(experience => {
        const currentCategory = experience.category;
        const currentInstitution = experience.organization;

        let groupHTML = '';

        // A. Print Category Header (Blue H5 line) only if it changes
        if (currentCategory !== lastCategory) {
            const iconClass = experience.icon_class || 'bx bx-briefcase';
            groupHTML += `
                <h5><i class="${iconClass}"></i> ${currentCategory}<hr></h5>
            `;
            lastCategory = currentCategory;
            // Reset institution tracker when category changes, forcing the first institution header to print
            lastInstitution = '';
        }

        // B. Print Institution Header (Table Header/Thead) only if it changes from the previous one
        if (currentInstitution !== lastInstitution) {
            const institutionLinkTag = experience.link
                ? `<a target="_blank" href="${experience.link}"><i class="bx bx-link-external"></i></a>`
                : '';

            groupHTML += `
                <table>
                    <thead>
                        <tr>
                            <td>
                                ${experience.organization} <br>
                                <em>${experience.location} ${institutionLinkTag}</em>
                            </td>
                        </tr>
                    </thead>
                    <tbody>
            `;
            // Note: We leave the <tbody> open here and close it after all roles for this institution are processed.
            lastInstitution = currentInstitution;
        }

        // C. Generate Table Rows for ALL Roles under this institution
        experience.roles.forEach(role => {
            const courseInvolvementHTML = listToHTML(role.course_involvement, 'Training Course Involvement');
            const skillsHTML = role.related_skills
                ? `<p><strong>Related Skills:</strong> ${role.related_skills}</p>`
                : '';

            // Add the role content row (tr)
            groupHTML += `
                <tr>
                    <td>
                        <h6>${role.title}</h6>
                        <em>${role.timeframe_details}</em>
                        
                        ${listToHTML(role.description_list, 'Description')}
                        ${listToHTML(role.responsibilities_list, 'Responsibilities')}
                        ${courseInvolvementHTML}
                        ${skillsHTML}
                    </td>
                </tr>
            `;
        });

        // D. Close the table if the next experience is a different institution or category
        // This is complex because we are iterating through an array that groups items by category first, but then by institution.
        // The simple fix is to check the *next* item. Since we are in the middle of the loop, this is difficult.

        // Instead of complex look-ahead logic, we'll rely on the JSON order (Category > Institution)
        // and force the table closure only if the *entire* experience block is processed,
        // which means the table must be closed after all roles in the current experience block are done.

        // CRITICAL: We need to ensure the </tbody> and </table> tags are closed.
        // Since the current iteration handles one 'experience' object, and an experience object groups
        // roles under a single institution/category (per your JSON structure), we must close the table here.
        groupHTML += `
                </tbody>
            </table>
        `;

        tableContainer.innerHTML += groupHTML;
    });
}



/**
 * Renders the Expertise and Achievements header section (ID: #expertiseAndAchievements)
 * for the main index page.
 * FIX: Uses precise targeting for H2 and H6 within the single section-title container.
 * @param {object} expertiseData
 */
function renderExpertiseAndAchievements(expertiseData) {
    if (!expertiseData || !expertiseData.section_info) return;

    const section = document.getElementById('expertiseAndAchievements');
    if (!section) return;

    const sectionInfo = expertiseData.section_info;
    const sectionTitleContainer = section.querySelector('.section-title');
    if (!sectionTitleContainer) return;

    // 1. Target H2 and H6 inside the section-title container
    const sectionTitleH2 = sectionTitleContainer.querySelector('h2');
    // Index Page uses <h6> for the description in this section
    const sectionDescriptionH6 = sectionTitleContainer.querySelector('h6');

    // 2. Load data
    if (sectionTitleH2 && sectionInfo) {
        sectionTitleH2.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title}`;
    }
    if (sectionDescriptionH6 && sectionInfo) {
        sectionDescriptionH6.textContent = sectionInfo.details;
    }
}



/**
 * Renders the Expertise and Achievements header section (ID: #expertiseAndAchievements)
 * for the printable_cv.html page.
 * FIX: Targets only the first <p> child for the description and loads the dynamic data.
 * @param {object} expertiseData
 */
function renderExpertiseAndAchievementsCV(expertiseData) {
    if (!expertiseData || !expertiseData.section_info) return;

    const section = document.getElementById('expertiseAndAchievements');
    if (!section) return;

    const sectionInfo = expertiseData.section_info;

    // The entire target block IS the section element itself.

    // 1. Target H2 and the first P inside the container
    const sectionTitleH2 = section.querySelector('h2');
    // Use :first-of-type to target the description paragraph, ignoring subsequent empty P tags
    const sectionDescriptionP = section.querySelector('p:first-of-type');

    // 2. Load data
    if (sectionTitleH2 && sectionInfo) {
        sectionTitleH2.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title}`;
    }
    if (sectionDescriptionP && sectionInfo) {
        // Set the text content for the description paragraph
        sectionDescriptionP.textContent = sectionInfo.details;
    }
}



/**
 * Renders the Skills and Tools section (ID: #skillsTools) for the main index page.
 * Uses the level property to drive the progress bar animation.
 * FIX: Added logic to correctly load Section Title (h2) and Description (h6) from skillsData.section_info.
 * @param {object} skillsData
 */
function renderSkillsTools(skillsData) {
    // Helper function defined locally for reliability
    const ArrayOfObjects = (arr) => Array.isArray(arr) && arr.every(item => typeof item === 'object' && item !== null);

    if (!skillsData || !ArrayOfObjects(skillsData.skills)) return;

    const section = document.getElementById('skillsTools');
    if (!section) return;

    const sectionInfo = skillsData.section_info;
    const skills = skillsData.skills; // Use this variable for clean code
    const skillsContainer = section.querySelector('.skills-content.skills-animation');

    if (!skillsContainer) return;

    // --- 1. Render Section Title and Description ---
    const sectionTitleContainer = section.querySelector('.section-title');
    const sectionTitleH2 = sectionTitleContainer ? sectionTitleContainer.querySelector('h2') : null;
    const sectionDescriptionH6 = sectionTitleContainer ? sectionTitleContainer.querySelector('h6') : null;

    if (sectionTitleH2 && sectionInfo) {
        sectionTitleH2.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title} <a href="skillsAndTools-details.html"><i class="bx bx-link"></i></a>`;
    }
    if (sectionDescriptionH6 && sectionInfo) {
        sectionDescriptionH6.textContent = sectionInfo.details;
    }
    // ------------------------------------------------

    // 2. Clear existing static content
    skillsContainer.innerHTML = '';

    // 3. Generate HTML for two columns
    let leftColumnHTML = '<div class="col-lg-6">';
    let rightColumnHTML = '<div class="col-lg-6">';

    skills.forEach((skill, index) => {
        const skillHTML = `
            <div class="progress">
                <span class="skill">
                  ${skill.category}: ${skill.short_description} <i class="val">${skill.level}%</i>
                </span>
                <div class="progress-bar-wrap">
                    <div class="progress-bar" role="progressbar" aria-valuenow="${skill.level}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            </div>`;

        // Distribute items evenly into two columns
        if (index % 2 === 0) {
            leftColumnHTML += skillHTML;
        } else {
            rightColumnHTML += skillHTML;
        }
    });

    leftColumnHTML += '</div>';
    rightColumnHTML += '</div>';

    // 4. Append generated content to the container
    skillsContainer.innerHTML = leftColumnHTML + rightColumnHTML;

    // 5. CRITICAL FIX: Force the progress bars to show correct width
    const progressBarDivs = skillsContainer.querySelectorAll('.progress-bar');
    progressBarDivs.forEach(bar => {
        const value = bar.getAttribute('aria-valuenow');
        // Setting the style directly for immediate visual update
        bar.style.width = value + '%';
    });
}



/**
 * Renders the Skills and Tools section (ID: #skillsTools) for the printable_cv.html page.
 * FIX: Uses a direct query selector based on the unique classes of the table container
 * and ensures the section description is correctly handled.
 * @param {object} skillsData
 */
function renderSkillsToolsCV(skillsData) {
    // Helper function defined locally for reliability
    const ArrayOfObjects = (arr) => Array.isArray(arr) && arr.every(item => typeof item === 'object' && item !== null);

    if (!skillsData || !ArrayOfObjects(skillsData.skills)) return;

    const section = document.getElementById('skillsTools');
    if (!section) return;

    const sectionInfo = skillsData.section_info;
    const skills = skillsData.skills;

    // 1. Target the Section Title (h2) and Description (p)
    const sectionTitleH2 = section.querySelector('h2');

    // Targeting the Description P tag: Based on your structure, it is often the P tag
    // immediately following the entire #skillsTools DIV. We use a generic approach to find it
    // by querying the document scope from the section, assuming the structure is consistent.
    // If the P tag is OUTSIDE the section DIV, this generic search might still be the safest bet:
    const sectionDescriptionP = document.querySelector('#skillsTools + p');

    if (sectionTitleH2 && sectionInfo) {
        sectionTitleH2.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title} <a href="skillsAndTools-details.html"><i class="bx bx-link"></i></a>`;
    }

    if (sectionDescriptionP && sectionDescriptionP.tagName === 'P' && sectionInfo) {
        sectionDescriptionP.textContent = sectionInfo.details;
    }

    // 2. TARGET THE TABLE CONTAINER: Use the specific combination of classes from your HTML.
    const tableContainer = document.querySelector('#main_cv .row.skills-content.skills-animation.ps-3.pe-3');

    if (!tableContainer) {
        console.error("SkillsToolsCV: Failed to find the table content container.");
        return;
    }

    // --- 3. Dynamic Header Generation ---
    let headerHTML = '';
    // Use fallback headers if the JSON field is not present
    const headers = sectionInfo.table_headers || ["Area", "Subjects", "Expertise Level"];

    if (Array.isArray(headers) && headers.length > 0) {
        headerHTML = headers.map(header => `<td>${header}</td>`).join('');
    } else {
        headerHTML = `<td>Area</td><td>Subjects</td><td>Expertise Level</td>`;
    }

    // 4. Prepare the main table structure
    let tableHTML = `
        <table>
            <thead>
                <tr>
                    ${headerHTML}
                </tr>
            </thead>
            <tbody>
    `;

    // 5. Generate Table Body Rows
    skills.forEach(skill => {
        tableHTML += `
            <tr>
                <td>${skill.category}</td>
                <td>${skill.short_description}</td>
                <td>${skill.level}%</td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    // 6. Append generated content to the container
    // We clear the container and append the new table and an extra <p> for spacing.
    tableContainer.innerHTML = tableHTML + '<p></p>';
}



/**
 * Renders the Skills and Tools section for the skillsAndTools-details.html page.
 * FIX: Adds logic to dynamically update the document title, page title H1, and breadcrumb text.
 * Renders data using the 'details_description' field.
 * @param {object} skillsData
 */
function renderSkillsToolsDetails(skillsData) {
    // Helper function defined locally for reliability
    const ArrayOfObjects = (arr) => Array.isArray(arr) && arr.every(item => typeof item === 'object' && item !== null);

    if (!skillsData || !ArrayOfObjects(skillsData.skills)) return;

    const skills = skillsData.skills;
    const sectionInfo = skillsData.section_info;
    const container = document.getElementById('skillsToolsDetails_main');

    if (!container) return;

    // --- 1. Update Page Title, H1, and Breadcrumb ---
    if (sectionInfo) {
        // Update Document Title (<title> tag)
        document.title = `Emran Ali - ${sectionInfo.title} Details`;

        // Update H1 Page Title
        const pageTitleH1 = document.querySelector('.page-title h1');
        if (pageTitleH1) {
            pageTitleH1.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title} Details`;
        }

        // Update Breadcrumb
        const breadcrumbCurrent = document.querySelector('.breadcrumbs li.current');
        if (breadcrumbCurrent) {
            breadcrumbCurrent.textContent = `${sectionInfo.title} Details`;
        }
    }
    // ----------------------------------------------------

    // 2. Render Details Content
    const detailsContainer = container.querySelector('.row');
    if (!detailsContainer) return;

    detailsContainer.innerHTML = ''; // Clear existing static content

    skills.forEach(skill => {
        const detailsHTML = `
            <div class="general-info" data-aos="fade-up" data-aos-delay="200">
                <h3>${skill.category} </h3>
                <p class="description">
                    <strong>Short Description: </strong> ${skill.short_description} <br>
                    <strong>Description: </strong> ${skill.details_description} <br>
                    <strong>Level: </strong> ${skill.level}% <br>
                </p>
            </div> `;
        detailsContainer.innerHTML += detailsHTML;
    });
}



/**
 * Renders the Honors and Awards section (ID: #honorsAwards) for the main index page.
 * FIX: Uses a more robust selector to find the awards container within the section.
 * @param {object} honorsData
 */
function renderHonorsAwards(honorsData) {
    const ArrayOfObjects = (arr) => Array.isArray(arr) && arr.every(item => typeof item === 'object' && item !== null);

    // 1. Guard check uses the correct 'honorsawards' key
    if (!honorsData || !ArrayOfObjects(honorsData.honorsawards)) return;

    const section = document.getElementById('honorsAwards');
    if (!section) return;

    const sectionInfo = honorsData.section_info;
    const awards = honorsData.honorsawards; // Use the correct key

    // Target the section title area
    const sectionTitleContainer = section.querySelector('.section-title');

    // CRITICAL FIX: Target the awards container using the unique row classes across the entire section.
    // This bypasses potential nesting confusion with the outer .container div.
    const awardsContainer = section.querySelector('.row.gy-4');

    if (!sectionTitleContainer || !awardsContainer) return;

    // 2. Render Section Title and Description (Index page uses H6 for description)
    const sectionTitleH2 = sectionTitleContainer.querySelector('h2');
    const sectionDescriptionH6 = sectionTitleContainer.querySelector('h6');

    if (sectionTitleH2 && sectionInfo) {
        sectionTitleH2.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title} <a href="honorsAndAwards-details.html"><i class="bx bx-link"></i></a>`;
    }
    if (sectionDescriptionH6 && sectionInfo) {
        sectionDescriptionH6.textContent = sectionInfo.details;
    }

    // 3. Clear existing static content
    awardsContainer.innerHTML = '';

    // 4. Generate and Append Award Cards
    awards.forEach(award => {
        // We use the ID to link to the details page correctly
        const awardHTML = `
            <div class="col-lg-4 col-md-6 service-item d-flex" data-aos="fade-up" data-aos-delay="100">
                <div class="icon flex-shrink-0"><i class="${award.icon_class || 'bx bx-award'}"></i></div>
                <div>
                    <h4 class="title">
                        <a href="honorsAndAwards-details.html#${award.id_ref}" class="stretched-link">${award.title}</a>
                    </h4>
                    <p class="description">${award.short_description}</p>
                </div>
            </div> `;
        awardsContainer.innerHTML += awardHTML;
    });
}



/**
 * Renders the Honors and Awards section (ID: #honorsAwards) for the printable_cv.html page.
 * FIX: Reverts to a safe sibling traversal for the awards container based on the known CV layout.
 * @param {object} honorsData
 */
function renderHonorsAwardsCV(honorsData) {
    const ArrayOfObjects = (arr) => Array.isArray(arr) && arr.every(item => typeof item === 'object' && item !== null);

    if (!honorsData || !ArrayOfObjects(honorsData.honorsawards)) return;

    const section = document.getElementById('honorsAwards');
    if (!section) return;

    const sectionInfo = honorsData.section_info;
    const awards = honorsData.honorsawards;

    // 1. Render Section Title and Description (already working)
    const sectionTitleH2 = section.querySelector('h2');
    const sectionDescriptionP = section.querySelector('p');

    if (sectionTitleH2 && sectionInfo) {
        sectionTitleH2.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title} <a href="honorsAndAwards-details.html"><i class="bx bx-link"></i></a>`;
    }
    if (sectionDescriptionP && sectionInfo) {
        sectionDescriptionP.textContent = sectionInfo.details;
    }

    // 2. CRITICAL FIX: Find the awards container.
    // It should be the container immediately following the Section Title DIV.
    let awardsContainer = section.nextElementSibling;

    // Safety Check: Check siblings until we find the one with the required class,
    // handling potential empty P tags between sections.
    while (awardsContainer && !awardsContainer.classList.contains('row')) {
        awardsContainer = awardsContainer.nextElementSibling;
    }

    if (!awardsContainer) {
        console.error("HonorsAwardsCV: Failed to find the awards container via sibling traversal.");
        return;
    }

    // 3. Clear existing static content
    awardsContainer.innerHTML = '';

    // 4. Generate and Append Award Cards
    awards.forEach(award => {
        const awardHTML = `
            <div class="col-lg-4 col-md-6 service-item d-flex">
                <div class="icon flex-shrink-0"><i class="${award.icon_class || 'bx bx-award'}"></i></div>
                <div>
                    <a href="honorsAndAwards-details.html#${award.id_ref}">${award.title}</a>
                    <p class="description">${award.short_description}</p>
                </div>
            </div> `;
        awardsContainer.innerHTML += awardHTML;
    });

    // Add spacing after the last item
    awardsContainer.innerHTML += '<p></p>';
}



/**
 * Renders the Honors and Awards section for the honorsAndAwards-details.html page.
 * Renders data using the 'description_full' field and updates page headers.
 * FIX: Ensures the correct 'honorsawards' JSON key is used and content is fully replaced.
 * @param {object} honorsData
 */
function renderHonorsAwardsDetails(honorsData) {
    // Helper function defined locally for reliability
    const ArrayOfObjects = (arr) => Array.isArray(arr) && arr.every(item => typeof item === 'object' && item !== null);

    // 1. Validate data structure using the expected key 'honorsawards'
    if (!honorsData || !ArrayOfObjects(honorsData.honorsawards)) {
        console.error("HonorsAwardsDetails: Invalid or missing honorsawards data.");
        return;
    }

    const awards = honorsData.honorsawards;
    const sectionInfo = honorsData.section_info;

    // The main container for the section
    const container = document.getElementById('honorsAwardsDetails_main');
    if (!container) return;

    // The container specifically holding the list of awards (div.row)
    const detailsContainer = container.querySelector('.row');
    if (!detailsContainer) {
        console.error("HonorsAwardsDetails: Failed to find the details container (.row).");
        return;
    }

    // --- 2. Update Page Title, H1, and Breadcrumb ---
    if (sectionInfo) {
        // Update Document Title (<title> tag)
        document.title = `Emran Ali - ${sectionInfo.title} Details`;

        // Update H1 Page Title (targets .page-title h1)
        const pageTitleH1 = document.querySelector('.page-title h1');
        if (pageTitleH1) {
            pageTitleH1.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title} Details`;
        }

        // Update Breadcrumb (targets .breadcrumbs li.current)
        const breadcrumbCurrent = document.querySelector('.breadcrumbs li.current');
        if (breadcrumbCurrent) {
            breadcrumbCurrent.textContent = `${sectionInfo.title} Details`;
        }
    }

    // 3. Clear existing static content (Crucial step)
    detailsContainer.innerHTML = '';

    // 4. Render Details Content
    let allAwardsHTML = '';

    awards.forEach(award => {
        // Check for award_link to wrap the title in a link if available
        const titleHTML = award.award_link
            ? `<a target="_blank" href="${award.award_link}">${award.title}</a>`
            : award.title;

        const detailsHTML = `
            <div id="${award.id_ref}" class="general-info" data-aos="fade-up" data-aos-delay="200">
                <h3>${titleHTML} </h3>
                <p class="description">
                    <strong>Issuer Organisation: </strong> ${award.issuer_organization} <br>
                    <strong>Associated Organisation: </strong> ${award.associated_organization || 'N/A'} <br>
                    <strong>Date: </strong> ${award.date} <br>
                    <strong>Short Description: </strong> ${award.short_description} <br>
                    <strong>Description: </strong> ${award.description_full} <br>
                </p>
            </div> `;
        allAwardsHTML += detailsHTML;
    });

    // Append all generated content once
    detailsContainer.innerHTML = allAwardsHTML;
}



// /**
//  * Renders the Courses, Trainings, and Certificates section (ID: #coursesTrainingsCertificates)
//  * for the main index page, using the filterable portfolio/gallery layout.
//  * FIX: Uses the correct JSON key 'coursestrainingscertificates'.
//  * @param {object} coursesData
//  */
// function renderCoursesTrainingsCertificates(coursesData) {
//     // Helper function defined locally for reliability
//     const ArrayOfObjects = (arr) => Array.isArray(arr) && arr.every(item => typeof item === 'object' && item !== null);
//
//     // 1. Guard check uses the correct 'coursestrainingscertificates' key
//     if (!coursesData || !ArrayOfObjects(coursesData.coursestrainingscertificates)) return;
//
//     const section = document.getElementById('coursesTrainingsCertificates');
//     if (!section) return;
//
//     const sectionInfo = coursesData.section_info;
//     // Use the correct key for the main data array
//     const courses = coursesData.coursestrainingscertificates;
//
//     // Target the section title area and the items container
//     const sectionTitleContainer = section.querySelector('.section-title');
//     const itemsContainer = section.querySelector('.row.gy-4.isotope-container');
//
//     if (!sectionTitleContainer || !itemsContainer) return;
//
//     // --- 2. Render Section Title and Description ---
//     const sectionTitleH2 = sectionTitleContainer.querySelector('h2');
//     const sectionDescriptionH6 = sectionTitleContainer.querySelector('h6'); // Index page uses H6 for description
//
//     if (sectionTitleH2 && sectionInfo) {
//         sectionTitleH2.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title} <a href="coursesTrainingsAndCertificates-details.html"><i class="bx bx-link"></i></a>`;
//     }
//     if (sectionDescriptionH6 && sectionInfo) {
//         sectionDescriptionH6.textContent = sectionInfo.details;
//     }
//
//     // 3. Clear existing static content
//     itemsContainer.innerHTML = '';
//
//     // 4. Generate and Append Course/Certificate Items
//     courses.forEach(item => {
//         // Concatenate filter tags into a single string for the class attribute
//         const filterClasses = item.filter_tags ? item.filter_tags.join(' ') : '';
//         const defaultTitle = item.title;
//         const defaultSource = item.source;
//
//         const itemHTML = `
//             <div class="col-lg-4 col-md-6 portfolio-item isotope-item ${filterClasses}" data-aos="fade-up" data-aos-delay="200">
//                 <div class="portfolio-content h-100">
//                     <img src="${item.image_path}" class="img-fluid" alt="Emran Ali - Certificate: ${defaultTitle}">
//                     <div class="portfolio-info">
//                         <h4>${defaultTitle} </h4>
//                         <p>${defaultSource}</p>
//                         <a href="${item.image_path}"
//                            title="${defaultSource}"
//                            data-gallery="portfolio-gallery-app"
//                            class="glightbox preview-link">
//                             <i class="bi bi-zoom-in"></i>
//                         </a>
//                         <a href="${item.link_target}"
//                            title="More Details"
//                            class="details-link">
//                             <i class="bi bi-link-45deg"></i>
//                         </a>
//                     </div>
//                 </div>
//             </div> `;
//         itemsContainer.innerHTML += itemHTML;
//     });
//
//     // 5. CRITICAL FIX: Reinitialize Isotope and GLightbox
//     // This is required to make filtering and lightbox work on newly inserted content.
//
//     if (typeof Isotope !== 'undefined' && typeof imagesLoaded !== 'undefined') {
//         const isoContainer = section.querySelector('.isotope-layout');
//         if (isoContainer) {
//             // Reinitialize Isotope to apply filters and layout to new elements
//             imagesLoaded(isoContainer, function() {
//                 // Ensure we only re-run initialization logic if it exists in main.js
//                 // This common structure re-initializes the Isotope filter grid
//                 new Isotope(isoContainer.querySelector('.isotope-container'), {
//                     itemSelector: '.isotope-item',
//                     layoutMode: 'masonry'
//                 });
//             });
//             // Reinitialize GLightbox for new gallery links
//             if (typeof GLightbox === 'function') {
//                 GLightbox({ selector: '.glightbox' });
//             }
//         }
//     }
// }




/**
 * Renders the Courses, Trainings, and Certificates section (ID: #coursesTrainingsCertificates)
 * for the main index page.
 * Handles the flat data structure: data.coursestrainingscertificates is the main array.
 * Filters items based on 'serial_no' and sorts them accordingly.
 * @param {object} coursesTrainingsCertificatesData // The wrapper object
 */
function renderCoursesTrainingsCertificates(coursesTrainingsCertificatesData) {
    if (!coursesTrainingsCertificatesData || !coursesTrainingsCertificatesData.coursestrainingscertificates) {
        console.error("renderCoursesTrainingsCertificates: Missing or invalid data structure. Expected 'coursestrainingscertificates' array.");
        return;
    }

    const section = document.getElementById('coursesTrainingsCertificates');
    if (!section) return;

    const sectionInfo = coursesTrainingsCertificatesData.section_info;
    // CRITICAL FIX: Get the flat array of items from the correct key
    const rawItems = coursesTrainingsCertificatesData.coursestrainingscertificates;

    const sectionTitleContainer = section.querySelector('.section-title');
    const filtersContainer = section.querySelector('.portfolio-filters');
    const contentContainer = section.querySelector('.isotope-container');

    if (!sectionTitleContainer || !filtersContainer || !contentContainer) {
        console.error("renderCoursesTrainingsCertificates: Target containers not found for Index page.");
        return;
    }

    // 1. Render Section Title and Description
    const sectionTitleH2 = sectionTitleContainer.querySelector('h2');
    const sectionDescriptionH6 = sectionTitleContainer.querySelector('h6');

    if (sectionTitleH2 && sectionInfo) {
        sectionTitleH2.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title} <a href="coursesTrainingsAndCertificates-details.html"><i class="bx bx-link"></i></a>`;
    }
    if (sectionDescriptionH6 && sectionInfo) {
        sectionDescriptionH6.textContent = sectionInfo.details;
    }

    // --- 2. Aggregate, Filter, and Sort Items ---
    let allItems = [];
    let filterTags = new Set(['*']);

    rawItems.forEach(item => {
        // Filter: Include only items with a non-empty serial_no
        if (item.serial_no && item.serial_no.toString().trim() !== "") {
            // Synthesize filter tags from the item's array of tags
            if (Array.isArray(item.filter_tags)) {
                item.filter_tags.forEach(tag => {
                    filterTags.add(tag);
                });
            }

            // Store the item with its filter tags as a space-separated string (for class attribute)
            allItems.push({
                ...item,
                filter_classes_raw: Array.isArray(item.filter_tags) ? item.filter_tags.join(' ') : ''
            });
        }
    });

    // Sort: Numerically based on the 'serial_no' key
    allItems.sort((a, b) => parseInt(a.serial_no) - parseInt(b.serial_no));

    // --- 3. Render Filters (Categories) ---
    filtersContainer.innerHTML = '';

    const filterNames = {
        '*': 'All',
        'filter-cert': 'Certificate',
        'filter-train': 'Training',
        'filter-cour': 'Course',
        'filter-conf': 'Conference',
        'filter-boot': 'Bootcamp'
        // Add other filters as needed
    };

    filterTags.forEach(tag => {
        const displayName = filterNames[tag] || tag;
        const isActive = tag === '*' ? 'filter-active' : '';
        filtersContainer.innerHTML += `<li data-filter=".${tag}" class="${isActive}">${displayName}</li>`;
    });

    // --- 4. Render Filtered and Sorted Items ---
    contentContainer.innerHTML = '';

    allItems.forEach(item => {
        // The tags are already prefixed with 'filter-' in your JSON (e.g., "filter-cert")
        const finalFilterClasses = item.filter_classes_raw;
        const imageSrc = item.image_path; // Using image_path directly
        const sourceShort = item.source.split(' - ').slice(-1)[0]; // Using the Source field for the short description

        const itemHTML = `
            <div class="col-lg-4 col-md-6 portfolio-item isotope-item ${finalFilterClasses}" data-aos="fade-up" data-aos-delay="200">
                <div class="portfolio-content h-100">
                    <img src="${imageSrc}" class="img-fluid" alt="Emran Ali - ${item.title} Certificate">
                    <div class="portfolio-info">
                        <h4>${item.title} </h4>
                        <p>${sourceShort}</p>
                        <a href="${item.image_path}"
                           title="${item.title}"
                           data-gallery="portfolio-gallery-app"
                           class="glightbox preview-link"><i class="bi bi-zoom-in"></i></a>
                        <a href="${item.link_target}"
                           title="More Details"
                           class="details-link"><i class="bi bi-link-45deg"></i></a>
                    </div>
                </div>
            </div>`;

        contentContainer.innerHTML += itemHTML;
    });
}



/**
 * Renders the Courses, Trainings, and Certificates section (ID: #coursesTrainingsCertificates)
 * for the printable_cv.html page.
 * ULTRA-SPECIFIC FIX: Targets the table container using a precise query selector.
 * @param {object} coursesData
 */
function renderCoursesTrainingsCertificatesCV(coursesData) {
    const ArrayOfObjects = (arr) => Array.isArray(arr) && arr.every(item => typeof item === 'object' && item !== null);

    // 1. Guard check uses the correct 'coursestrainingscertificates' key
    if (!coursesData || !ArrayOfObjects(coursesData.coursestrainingscertificates)) return;

    const section = document.getElementById('coursesTrainingsCertificates');
    if (!section) return;

    const sectionInfo = coursesData.section_info;
    const courses = coursesData.coursestrainingscertificates;

    // CRITICAL FIX: Target the container by its unique class combination inside #main_cv.
    // This selector targets the <div> that CONTAINS the <table> structure.
    const container = document.querySelector('#main_cv #coursesTrainingsCertificates + .row.skills-content.skills-animation.ps-3.pe-3');

    if (!container) {
        console.error("CertificatesCV: Failed to find the table content container.");
        return;
    }

    // 2. Render Section Title and Description
    const sectionTitleH2 = section.querySelector('h2');
    // The description <p> tag is often a sibling of H2 in this CV layout
    const sectionDescriptionP = section.querySelector('p');

    if (sectionTitleH2 && sectionInfo) {
        sectionTitleH2.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title} <a href="coursesTrainingsAndCertificates-details.html"><i class="bx bx-link"></i></a>`;
    }
    if (sectionDescriptionP && sectionInfo) {
        // Ensure the description is only written if the p tag exists
        sectionDescriptionP.textContent = sectionInfo.details;
    }

    // 3. Define Table Headers
    const headers = sectionInfo.table_headers;
    let headerHTML = headers.map(header => `<td>${header}</td>`).join('');

    // 4. Start building the table HTML structure
    let tableHTML = `
        <table>
            <thead>
                <tr>
                    ${headerHTML}
                </tr>
            </thead>
            <tbody>
    `;

    // 5. Generate Table Body Rows
    courses.forEach(item => {
        const details = item.details;

        // // Compile key information and source into the single 'Description' cell
        // const description = details.description;

        // // Compile key information and source into the single 'Description' cell
        // const keyInfoList = details.key_information
        //     ? details.key_information.map(info => `<li>${info}</li>`).join('')
        //     : '';

        // Use item.link_target for the subject link
        const subjectLink = item.link_target
            ? `<a href="${item.link_target}">${item.title}</a>`
            : item.title;

        const descriptionContent = `
            ${item.source} (${details.date}) <br>
            ${details.description} 
        `;

        // const descriptionContent = `
        //     ${item.source} (${details.date}) <br>
        //     ${item.source} (${details.description})
        //     <ul style="list-style-type: disc; margin-left: 20px;">
        //         ${keyInfoList}
        //     </ul>
        // `;

        tableHTML += `
            <tr>
                <td>${subjectLink}</td>
                <td>${descriptionContent}</td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    // 6. Inject the content and add necessary spacing
    // This replaces the static <table> and any surrounding content within the container.
    container.innerHTML = tableHTML + '<p></p>';
}



/**
 * Renders the Courses, Trainings, and Certificates section for the coursesTrainingsAndCertificates-details.html page.
 * Renders data using the 'details' object and updates page headers.
 * FIX: Ensures the correct 'coursestrainingscertificates' JSON key is used.
 * @param {object} coursesData
 */
function renderCoursesTrainingsCertificatesDetails(coursesData) {
    const ArrayOfObjects = (arr) => Array.isArray(arr) && arr.every(item => typeof item === 'object' && item !== null);

    // 1. Validate data structure using the expected key 'coursestrainingscertificates'
    if (!coursesData || !ArrayOfObjects(coursesData.coursestrainingscertificates)) {
        console.error("CertificatesDetails: Invalid or missing coursestrainingscertificates data.");
        return;
    }

    const courses = coursesData.coursestrainingscertificates;
    const sectionInfo = coursesData.section_info;
    const container = document.getElementById('coursesTrainingsCertificatesDetails_main');

    if (!container) return;

    // --- 2. Update Page Title, H1, and Breadcrumb ---
    if (sectionInfo) {
        // Update Document Title (<title> tag)
        document.title = `Emran Ali - ${sectionInfo.title} Details`;

        // Update H1 Page Title (targets .page-title h1)
        const pageTitleH1 = document.querySelector('.page-title h1');
        if (pageTitleH1) {
            pageTitleH1.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title} Details`;
        }

        // Update Breadcrumb (targets .breadcrumbs li.current)
        const breadcrumbCurrent = document.querySelector('.breadcrumbs li.current');
        if (breadcrumbCurrent) {
            breadcrumbCurrent.textContent = `${sectionInfo.title} Details`;
        }
    }

    // 3. Render Details Content
    // The container specifically holding the list of awards (div.row)
    const detailsContainer = container.querySelector('.row');
    if (!detailsContainer) {
        console.error("CertificatesDetails: Failed to find the details container (.row).");
        return;
    }

    detailsContainer.innerHTML = ''; // Clear existing static content

    let allCoursesHTML = '';

    courses.forEach(item => {
        const details = item.details;

        // Format key information into an HTML list
        const keyInfoList = details.key_information
            ? details.key_information.map(info => `<br>- ${info}`).join('')
            : 'N/A';

        // Check if certificate_link exists to determine the link for the header
        const titleLinkHTML = details.certificate_link
            ? `<a target="_blank" href="${details.certificate_link}">${item.title}</a>`
            : item.title;

        // Check if certificate_link exists to determine the link for the certificate image preview
        const imageLink = details.certificate_link || item.image_path;

        const detailsHTML = `
            <div id="${item.id_ref}" class="general-info" data-aos="fade-up" data-aos-delay="200">
                <h3>${titleLinkHTML} </h3>
                
                ${item.image_path ? 
                    `<div>
                        <a href="${item.image_path}" 
                           title="${item.source}" 
                           data-gallery="portfolio-gallery-app" 
                           class="glightbox preview-link">
                            <img src="${item.image_path}" class="portfolio-content responsive-img" alt="Certificate: ${item.title}">
                        </a>
                    </div>` : ''
                }

                <p class="description">
                    <br><strong>Type: </strong> ${details.type}
                    <br><strong>Description: </strong> ${details.description}
                    ${details.course_link ? `<br><strong>Course Link: </strong> <a target="_blank" href="${details.course_link}">${details.course_link} <i class="bx bx-link-external"></i></a>` : ''}
                    <br><strong>Offering Organisation: </strong> ${details.offering_organization}
                    <br><strong>Funding Organisation: </strong> ${details.funding_organization || 'N/A'}
                    <br><strong>Key Information: </strong> ${keyInfoList}
                    <br><strong>Date: </strong> ${details.date}
                    ${details.certificate_link ? `<br><strong>Certificate Link: </strong> <a target="_blank" href="${details.certificate_link}">${details.certificate_link} <i class="bx bx-link-external"></i></a>` : ''}
                </p>
            </div> `;
        allCoursesHTML += detailsHTML;
    });

    // Append all generated content once
    detailsContainer.innerHTML = allCoursesHTML;

    // 4. CRITICAL FIX: Reinitialize GLightbox
    // Since images were dynamically added, GLightbox needs to be re-run for the zoom feature to work.
    if (typeof GLightbox === 'function') {
        GLightbox({ selector: '.glightbox' });
    }
}



/**
 * Renders the Projects section (ID: #projects) for the main index page.
 * Uses the card layout with links to the details page.
 * @param {object} projectsData
 */
function renderProjects(projectsData) {
    const ArrayOfObjects = (arr) => Array.isArray(arr) && arr.every(item => typeof item === 'object' && item !== null);

    // 1. Guard check uses the correct 'projects' key
    if (!projectsData || !ArrayOfObjects(projectsData.projects)) return;

    const section = document.getElementById('projects');
    if (!section) return;

    const sectionInfo = projectsData.section_info;
    const projects = projectsData.projects;

    // Target the section title area and the awards container
    const sectionTitleContainer = section.querySelector('.section-title');
    const projectsContainer = section.querySelector('.container .row.gy-4');

    if (!sectionTitleContainer || !projectsContainer) return;

    // 2. Render Section Title and Description
    const sectionTitleH2 = sectionTitleContainer.querySelector('h2');
    const sectionDescriptionH6 = sectionTitleContainer.querySelector('h6'); // Index page uses H6 for description

    if (sectionTitleH2 && sectionInfo) {
        sectionTitleH2.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title} <a href="projects-details.html"><i class="bx bx-link"></i></a>`;
    }
    if (sectionDescriptionH6 && sectionInfo) {
        sectionDescriptionH6.textContent = sectionInfo.details;
    }

    // 3. Clear existing static content
    projectsContainer.innerHTML = '';

    // 4. Generate and Append Project Cards
    projects.forEach(project => {
        // Construct the project description combining Project Type and Short Description
        const descriptionHTML = `
            <strong>Project:</strong> ${project.title}<br>
            <strong>Funding:</strong> ${project.funding_organization} (${project.timeframe_details.split('|')[0].trim()})
        `;
        // const descriptionHTML = `
        //     <strong>Role:</strong> ${project.role}<br>
        //     <strong>Project:</strong> ${project.short_description}<br>
        //     <strong>Organization:</strong> ${project.organization}
        // `;

        const projectHTML = `
            <div class="col-lg-4 col-md-6 service-item d-flex" data-aos="fade-up" data-aos-delay="100">
                <div class="icon flex-shrink-0"><i class="${sectionInfo.icon_class || 'bx bx-bulb'}"></i></div>
                <div>
                    <h4 class="title">
                        <a href="projects-details.html#${project.id_ref}" class="stretched-link">${project.role}</a>
                    </h4>
                    <p class="description">${descriptionHTML}</p>
                </div>
            </div> `;
        projectsContainer.innerHTML += projectHTML;
    });
}



/**
 * Renders the Projects section (ID: #projects) for the printable_cv.html page.
 * Uses the card layout suitable for printing.
 * @param {object} projectsData
 */
function renderProjectsCV(projectsData) {
    const ArrayOfObjects = (arr) => Array.isArray(arr) && arr.every(item => typeof item === 'object' && item !== null);

    // 1. Guard check uses the correct 'projects' key
    if (!projectsData || !ArrayOfObjects(projectsData.projects)) return;

    const section = document.getElementById('projects');
    if (!section) return;

    const sectionInfo = projectsData.section_info;
    const projects = projectsData.projects;

    // CRITICAL FIX: Target the container by its unique class combination inside #main_cv.
    // The Projects list container uses the class 'row gy-4 ps-3 pe-3'. We use sibling traversal for reliability.
    let projectsContainer = section.nextElementSibling;

    // Traverse siblings until we find the awards container (the first element with class 'row')
    while (projectsContainer && !projectsContainer.classList.contains('row')) {
        projectsContainer = projectsContainer.nextElementSibling;
    }

    if (!projectsContainer) {
        console.error("ProjectsCV: Failed to find the projects container.");
        return;
    }

    // 2. Render Section Title and Description (CV page uses P for description)
    const sectionTitleH2 = section.querySelector('h2');
    const sectionDescriptionP = section.querySelector('p');

    if (sectionTitleH2 && sectionInfo) {
        sectionTitleH2.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title} <a href="projects-details.html"><i class="bx bx-link"></i></a>`;
    }
    if (sectionDescriptionP && sectionInfo) {
        sectionDescriptionP.textContent = sectionInfo.details;
    }

    // 3. Clear existing static content
    projectsContainer.innerHTML = '';

    // 4. Generate and Append Project Cards (CV style - simplified link, no data-aos)
    projects.forEach(project => {
        // Construct the project description combining Project Type and Short Description
        const descriptionHTML = `
            <strong>Project:</strong> ${project.title}<br>
            <strong>Funding:</strong> ${project.funding_organization} (${project.timeframe_details.split('|')[0].trim()})
        `;

        const projectHTML = `
            <div class="col-lg-4 col-md-6 service-item d-flex">
                <div class="icon flex-shrink-0"><i class="${sectionInfo.icon_class || 'bx bx-bulb'}"></i></div>
                <div>
                    <a href="projects-details.html#${project.id_ref}">${project.role}</a>
                    <p class="description">${descriptionHTML}</p>
                </div>
            </div> `;
        projectsContainer.innerHTML += projectHTML;
    });

    // Add spacing after the last item
    projectsContainer.innerHTML += '<p></p>';
}



/**
 * Renders the Projects section for the projects-details.html page.
 * Renders data using the rich project descriptions and updates page headers.
 * @param {object} projectsData
 */
function renderProjectsDetails(projectsData) {
    const ArrayOfObjects = (arr) => Array.isArray(arr) && arr.every(item => typeof item === 'object' && item !== null);

    // 1. Guard check uses the correct 'projects' key
    if (!projectsData || !ArrayOfObjects(projectsData.projects)) return;

    const projects = projectsData.projects;
    const sectionInfo = projectsData.section_info;
    const container = document.getElementById('projectsDetails_main');

    if (!container) return;

    // --- 2. Update Page Title, H1, and Breadcrumb ---
    if (sectionInfo) {
        // Update Document Title (<title> tag)
        document.title = `Emran Ali - ${sectionInfo.title} Details`;

        // Update H1 Page Title (targets .page-title h1)
        const pageTitleH1 = document.querySelector('.page-title h1');
        if (pageTitleH1) {
            pageTitleH1.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title} Details`;
        }

        // Update Breadcrumb (targets .breadcrumbs li.current)
        const breadcrumbCurrent = document.querySelector('.breadcrumbs li.current');
        if (breadcrumbCurrent) {
            breadcrumbCurrent.textContent = `${sectionInfo.title} Details`;
        }
    }

    // 3. Render Details Content
    const detailsContainer = container.querySelector('.row');
    if (!detailsContainer) return;

    detailsContainer.innerHTML = ''; // Clear existing static content

    let allProjectsHTML = '';

    projects.forEach(project => {
        // Check for collaboration org to display the most relevant organization icon/image
        const orgsDisplay = project.collaboration_organization || project.organization;

        const detailsHTML = `
            <div id="${project.id_ref}" class="general-info" data-aos="fade-up" data-aos-delay="200">
                <h3>${project.role} </h3>
                
                ${project.image_path ? 
                    `<div>
                        <img src="${project.image_path}" alt="Project Image" class="img-fluid" style="max-height: 150px;">
                    </div>` : ''
                }

                <p class="description">
                    <strong>Title: </strong> ${project.title} <br>
                    <strong>Basi Details: </strong> ${project.basic_details} <br>
                    <strong>Description: </strong> ${project.long_description} <br>
                    <strong>Fund: </strong> ${project.funding} <br>
                    <strong>Funding Organisation: </strong> ${project.funding_organization || 'N/A'} <br>
                    <strong>Collaboration Organisation: </strong> ${orgsDisplay} <br>
                    <strong>Period: </strong> ${project.timeframe_details} <br>
                    ${project.url_link ? `<strong>Link: </strong> <a target="_blank" href="${project.url_link}">View Link <i class="bx bx-link-external"></i></a>` : ''}
                </p>
            </div> `;
        allProjectsHTML += detailsHTML;
    });

    detailsContainer.innerHTML = allProjectsHTML;
}



/**
 * Renders the Memberships section (ID: #memberships) for the main index page.
 * Uses the card layout with links to the details page, pulling from the final flat structure.
 * @param {object} membershipsData
 */
function renderMemberships(membershipsData) {
    const ArrayOfObjects = (arr) => Array.isArray(arr) && arr.every(item => typeof item === 'object' && item !== null);

    if (!membershipsData || !ArrayOfObjects(membershipsData.memberships)) return;

    const section = document.getElementById('memberships');
    if (!section) return;

    const sectionInfo = membershipsData.section_info;
    const memberships = membershipsData.memberships;

    // Target the section title area and the memberships container
    const sectionTitleContainer = section.querySelector('.section-title');
    const membershipsContainer = section.querySelector('.container .row.gy-4');

    if (!sectionTitleContainer || !membershipsContainer) return;

    // 2. Render Section Title and Description
    const sectionTitleH2 = sectionTitleContainer.querySelector('h2');
    const sectionDescriptionH6 = sectionTitleContainer.querySelector('h6');

    if (sectionTitleH2 && sectionInfo) {
        sectionTitleH2.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title} <a href="memberships-details.html"><i class="bx bx-link"></i></a>`;
    }
    if (sectionDescriptionH6 && sectionInfo) {
        sectionDescriptionH6.textContent = sectionInfo.details;
    }

    // 3. Clear existing static content
    membershipsContainer.innerHTML = '';

    // 4. Generate and Append Membership Cards
    memberships.forEach(membership => {
        // Use the pre-calculated description_short field
        const descriptionHTML = membership.description_short;

        const membershipHTML = `
            <div class="col-lg-4 col-md-6 service-item d-flex" data-aos="fade-up" data-aos-delay="100">
                <div class="icon flex-shrink-0"><i class="${membership.icon_class || 'bx bx-group'}"></i></div>
                <div>
                    <h4 class="title">
                        <a href="memberships-details.html#${membership.id_ref}" class="stretched-link">${membership.title}</a>
                    </h4>
                    <p class="description">${descriptionHTML}</p>
                </div>
            </div> `;
        membershipsContainer.innerHTML += membershipHTML;
    });
}



/**
 * Renders the Memberships section (ID: #memberships) for the printable_cv.html page.
 * Uses the card layout suitable for printing, pulling from the final flat structure.
 * @param {object} membershipsData
 */
function renderMembershipsCV(membershipsData) {
    const ArrayOfObjects = (arr) => Array.isArray(arr) && arr.every(item => typeof item === 'object' && item !== null);

    if (!membershipsData || !ArrayOfObjects(membershipsData.memberships)) return;

    const section = document.getElementById('memberships');
    if (!section) return;

    const sectionInfo = membershipsData.section_info;
    const memberships = membershipsData.memberships;

    // CRITICAL: Find the container adjacent to the section title
    let membershipsContainer = section.nextElementSibling;

    // Traverse siblings until we find the container (the first element with class 'row')
    while (membershipsContainer && !membershipsContainer.classList.contains('row')) {
        membershipsContainer = membershipsContainer.nextElementSibling;
    }

    if (!membershipsContainer) {
        console.error("MembershipsCV: Failed to find the memberships container.");
        return;
    }

    // 2. Render Section Title and Description (CV page uses P for description)
    const sectionTitleH2 = section.querySelector('h2');
    const sectionDescriptionP = section.querySelector('p');

    if (sectionTitleH2 && sectionInfo) {
        sectionTitleH2.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title} <a href="memberships-details.html"><i class="bx bx-link"></i></a>`;
    }
    if (sectionDescriptionP && sectionInfo) {
        sectionDescriptionP.textContent = sectionInfo.details;
    }

    // 3. Clear existing static content
    membershipsContainer.innerHTML = '';

    // 4. Generate and Append Membership Cards (CV style)
    memberships.forEach(membership => {
        // Use the pre-calculated description_short field
        const descriptionHTML = membership.description_short;

        const membershipHTML = `
            <div class="col-lg-4 col-md-6 service-item d-flex">
                <div class="icon flex-shrink-0"><i class="${membership.icon_class || 'bx bx-group'}"></i></div>
                <div>
                    <a href="memberships-details.html#${membership.id_ref}">${membership.title}</a>
                    <p class="description">${descriptionHTML}</p>
                </div>
            </div> `;
        membershipsContainer.innerHTML += membershipHTML;
    });

    // Add spacing after the last item
    membershipsContainer.innerHTML += '<p></p>';
}



/**
 * Renders the Memberships section for the memberships-details.html page.
 * Renders data using the full fields from the final flat structure and updates page headers.
 * @param {object} membershipsData
 */
function renderMembershipsDetails(membershipsData) {
    const ArrayOfObjects = (arr) => Array.isArray(arr) && arr.every(item => typeof item === 'object' && item !== null);

    if (!membershipsData || !ArrayOfObjects(membershipsData.memberships)) return;

    const memberships = membershipsData.memberships;
    const sectionInfo = membershipsData.section_info;

    // The details page HTML uses 'honorsAwardsDetails_main' as an ID for the main container (we will use the correct ID if available)
    const container = document.getElementById('membershipsDetails_main') || document.getElementById('honorsAwardsDetails_main');

    if (!container) return;

    // --- 2. Update Page Title, H1, and Breadcrumb ---
    if (sectionInfo) {
        document.title = `Emran Ali - ${sectionInfo.title} Details`;

        const pageTitleH1 = document.querySelector('.page-title h1');
        if (pageTitleH1) {
            pageTitleH1.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title} Details`;
        }

        const breadcrumbCurrent = document.querySelector('.breadcrumbs li.current');
        if (breadcrumbCurrent) {
            breadcrumbCurrent.textContent = `${sectionInfo.title} Details`;
        }
    }

    // 3. Render Details Content
    const detailsContainer = container.querySelector('.row');
    if (!detailsContainer) return;

    detailsContainer.innerHTML = ''; // Clear existing static content

    let allMembershipsHTML = '';

    memberships.forEach(membership => {

        // Use the flat structure fields
        const hasExpiryDisplay = membership.has_expiry ? 'True' : 'False';
        const roleLink = membership.url_link ?
            `<a target="_blank" href="${membership.url_link}">${membership.role} <i class="bx bx-link-external"></i></a>` :
            membership.role;

        const detailsHTML = `
            <div id="${membership.id_ref}" class="general-info" data-aos="fade-up" data-aos-delay="200">
                <h3>${membership.title} </h3>
                
                <p class="description">
                    <strong>Role: </strong> ${roleLink} <br>
                    <strong>Organisation: </strong> ${membership.organization_name || 'N/A'} <br>
                    <strong>Institute: </strong> ${membership.organization_name || 'N/A'} <br>
                    <strong>Address: </strong> ${membership.location || 'N/A'} <br>
                    <strong>Has Expiry: </strong> ${hasExpiryDisplay} <br>
                    <strong>Validity Period: </strong> ${membership.timeframe} <br>
                    <strong>Description: </strong> ${membership.description_full || 'N/A'} <br>
                </p>
            </div> `;
        allMembershipsHTML += detailsHTML;
    });

    detailsContainer.innerHTML = allMembershipsHTML;
}



/**
 * Renders the Sessions and Events section (ID: #sessionsEvents) for the main index page.
 * Uses the ultra-robust selector for the index page.
 * @param {object} sessionsEventsData // This is the wrapper object: { section_info: {...}, sessionsevents: [...] }
 */
function renderSessionsEvents(sessionsEventsData) {
    const ArrayOfObjects = (arr) => Array.isArray(arr) && arr.every(item => typeof item === 'object' && item !== null);

    // 1. Robust Guard Check
    if (!sessionsEventsData || !ArrayOfObjects(sessionsEventsData.sessionsevents)) {
        console.error("renderSessionsEvents: Data wrapper object or 'sessionsevents' array is missing/invalid.");
        return;
    }

    const section = document.getElementById('sessionsEvents');
    if (!section) return;

    const sectionInfo = sessionsEventsData.section_info;
    const events = sessionsEventsData.sessionsevents;

    // CRITICAL FIX: Target the specific row that holds the items, which is inside the SECOND .container in the section.
    const sectionTitleContainer = section.querySelector('.section-title');
    let eventsContainer = section.querySelector('.container:not(.section-title) > .row.gy-4');
    if (!eventsContainer) {
        eventsContainer = section.querySelector('.container .row.gy-4'); // Fallback
    }

    if (!sectionTitleContainer || !eventsContainer) {
        console.error("renderSessionsEvents: Target containers not found. Index page selector failed.");
        return;
    }

    // 2. Render Section Title and Description (Index uses H6)
    const sectionTitleH2 = sectionTitleContainer.querySelector('h2');
    const sectionDescriptionH6 = sectionTitleContainer.querySelector('h6');

    if (sectionTitleH2 && sectionInfo) {
        sectionTitleH2.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title} <a href="sessionsAndEvents-details.html"><i class="bx bx-link"></i></a>`;
    }
    if (sectionDescriptionH6 && sectionInfo) {
        sectionDescriptionH6.textContent = sectionInfo.details;
    }

    // 3. Clear existing static content
    eventsContainer.innerHTML = '';

    // 4. Generate and Append Event Cards
    events.forEach(event => {
        const descriptionHTML = `${event.description} - ${event.organization} on ${event.date}`;

        const eventHTML = `
            <div class="col-lg-4 col-md-6 service-item d-flex" data-aos="fade-up" data-aos-delay="100">
                <div class="icon flex-shrink-0"><i class="${event.icon_class || 'bi bi-calendar-event'}"></i></div>
                <div>
                    <h4 class="title">
                        <a href="sessionsAndEvents-details.html#${event.id_ref}" class="stretched-link">${event.title}</a>
                    </h4>
                    <p class="description">${descriptionHTML}</p>
                </div>
            </div> `;
        eventsContainer.innerHTML += eventHTML;
    });
}



/**
 * Renders the Sessions and Events section (ID: #sessionsEvents) for the printable_cv.html page.
 * Uses the robust sibling traversal selector for the CV page.
 * @param {object} sessionsEventsData // This is the wrapper object
 */
function renderSessionsEventsCV(sessionsEventsData) {
    const ArrayOfObjects = (arr) => Array.isArray(arr) && arr.every(item => typeof item === 'object' && item !== null);

    // 1. Robust Guard Check
    if (!sessionsEventsData || !ArrayOfObjects(sessionsEventsData.sessionsevents)) {
        console.error("renderSessionsEventsCV: Data wrapper object or 'sessionsevents' array is missing/invalid.");
        return;
    }

    const section = document.getElementById('sessionsEvents');
    if (!section) return;

    const sectionInfo = sessionsEventsData.section_info;
    const events = sessionsEventsData.sessionsevents;

    // CRITICAL FIX: Use the specific classes found in printable_cv.html
    let eventsContainer = document.querySelector('#sessionsEvents + .row.gy-4.ps-3.pe-3');

    if (!eventsContainer) {
        // Fallback using sibling traversal used previously
        let nextSibling = section.nextElementSibling;
        while (nextSibling && (nextSibling.nodeType !== 1 || !nextSibling.classList.contains('row'))) {
            nextSibling = nextSibling.nextElementSibling;
        }
        if (nextSibling) {
            eventsContainer = nextSibling;
        }
    }

    if (!eventsContainer) {
        console.error("SessionsEventsCV: Failed to find the events container.");
        return;
    }

    // 2. Render Section Title and Description (CV page uses P for description)
    const sectionTitleH2 = section.querySelector('h2');
    const sectionDescriptionP = section.querySelector('p');

    if (sectionTitleH2 && sectionInfo) {
        sectionTitleH2.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title} <a href="sessionsAndEvents-details.html"><i class="bx bx-link"></i></a>`;
    }
    if (sectionDescriptionP && sectionInfo) {
        sectionDescriptionP.textContent = sectionInfo.details;
    }

    // 3. Clear existing static content
    eventsContainer.innerHTML = '';

    // 4. Generate and Append Event Cards
    events.forEach(event => {
        // Construct the description: Organization + Description
        const descriptionHTML = `${event.description} - ${event.organization} on ${event.date}`;

        const eventHTML = `
            <div class="col-lg-4 col-md-6 service-item d-flex">
                <div class="icon flex-shrink-0"><i class="${event.icon_class || 'bi bi-calendar-event'}"></i></div>
                <div>
                    <a href="sessionsAndEvents-details.html#${event.id_ref}">${event.title}</a>
                    <p class="description">${descriptionHTML}</p>
                </div>
            </div> `;
        eventsContainer.innerHTML += eventHTML;
    });

    // Add spacing after the last item
    eventsContainer.innerHTML += '<p></p>';
}



/**
 * Renders the Sessions and Events section for the sessionsAndEvents-details.html page.
 * CRITICAL FIX: Uses the incorrect but present section ID: #membershipsDetails and maps keys accurately.
 * @param {object} sessionsEventsData // This is the wrapper object
 */
function renderSessionsEventsDetails(sessionsEventsData) {
    const ArrayOfObjects = (arr) => Array.isArray(arr) && arr.every(item => typeof item === 'object' && item !== null);

    // 1. Robust Guard Check
    if (!sessionsEventsData || !ArrayOfObjects(sessionsEventsData.sessionsevents)) {
        console.error("renderSessionsEventsDetails: Data wrapper object or 'sessionsevents' array is missing/invalid.");
        return;
    }

    const events = sessionsEventsData.sessionsevents;
    const sectionInfo = sessionsEventsData.section_info;

    // CRITICAL FIX: Target the incorrect ID present in the HTML: #membershipsDetails
    const mainSection = document.getElementById('membershipsDetails');

    if (!mainSection) {
        console.error("renderSessionsEventsDetails: Main section container (#membershipsDetails) not found.");
        return;
    }

    // --- 2. Update Page Title, H1, and Breadcrumb ---
    if (sectionInfo) {
        document.title = `Emran Ali - ${sectionInfo.title} Details`;

        // This targets the h1 in the Page Title div at the top of the page
        const pageTitleH1 = document.querySelector('.page-title h1');
        if (pageTitleH1) {
            pageTitleH1.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title} Details`;
        }

        const breadcrumbCurrent = document.querySelector('.breadcrumbs li.current');
        if (breadcrumbCurrent) {
            breadcrumbCurrent.textContent = `${sectionInfo.title} Details`;
        }
    }

    // 3. Render Details Content
    const detailsContainer = mainSection.querySelector('.row');
    if (!detailsContainer) {
        console.error("renderSessionsEventsDetails: Inner details container (.row) not found.");
        return;
    }

    detailsContainer.innerHTML = ''; // Clear existing static content

    let allEventsHTML = '';

    events.forEach(event => {
        // The HTML keys (Role, Title, Organisation, Date) must map to the JSON fields (title, description, organization, date)

        const detailsHTML = `
            <div id="${event.id_ref}" class="general-info" data-aos="fade-up" data-aos-delay="200">
                <h3>${event.title} </h3>
                <p class="description">
                    <strong>Role: </strong> ${event.title} <br>
                    <strong>Title: </strong> ${event.description} <br>
                    <strong>Type: </strong> ${event.type || 'N/A'} <br>
                    <strong>Organisation: </strong> ${event.organization || 'N/A'} <br>
                    <strong>Date: </strong> ${event.date} <br>
                    ${event.url_link ? `<strong>Link: </strong> <a target="_blank" href="${event.url_link}">View Link <i class="bx bx-link-external"></i></a>` : ''}
                </p>
            </div> `;
        allEventsHTML += detailsHTML;
    });

    detailsContainer.innerHTML = allEventsHTML;
}



/**
 * Renders the Languages section (ID: #languages) for the main index page.
 * Uses the flag icon class (fi fi-xx) if present, otherwise default.
 * @param {object} languagesData // The wrapper object
 */
function renderLanguages(languagesData) {
    const ArrayOfObjects = (arr) => Array.isArray(arr) && arr.every(item => typeof item === 'object' && item !== null);

    if (!languagesData || !ArrayOfObjects(languagesData.languages)) {
        console.error("renderLanguages: Data wrapper object or 'languages' array is missing/invalid.");
        return;
    }

    const section = document.getElementById('languages');
    if (!section) return;

    const sectionInfo = languagesData.section_info;
    const languages = languagesData.languages;

    // Target the section title area and the languages container
    const sectionTitleContainer = section.querySelector('.section-title');
    const languagesContainer = section.querySelector('.container .row.gy-4');

    if (!sectionTitleContainer || !languagesContainer) {
        console.error("renderLanguages: Target containers not found. Index page selector failed.");
        return;
    }

    // 2. Render Section Title and Description
    const sectionTitleH2 = sectionTitleContainer.querySelector('h2');
    const sectionDescriptionH6 = sectionTitleContainer.querySelector('h6');

    if (sectionTitleH2 && sectionInfo) {
        sectionTitleH2.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title} <a href="languages-details.html"><i class="bx bx-link"></i></a>`;
    }
    if (sectionDescriptionH6 && sectionInfo) {
        sectionDescriptionH6.textContent = sectionInfo.details;
    }

    // 3. Clear existing static content
    languagesContainer.innerHTML = '';

    // 4. Generate and Append Language Cards
    languages.forEach(language => {
        // Use flag icon class if present, otherwise default generic icon
        const iconContent = language.icon_class
            ? `<span class="flag-icon-container"><span class="${language.icon_class}"></span></span>`
            : `<i class="bx bx-conversation"></i>`;

        const iconElement = `<div class="icon flex-shrink-0">${iconContent}</div>`;

        // Use the details field for the short description
        const descriptionHTML = language.details;

        const languageHTML = `
            <div class="col-lg-4 col-md-6 service-item d-flex" data-aos="fade-up" data-aos-delay="100">
                ${iconElement}
                <div>
                    <h4 class="title">
                        <a href="languages-details.html#${language.id_ref}" class="stretched-link">${language.language}</a>
                    </h4>
                    <p class="description">${descriptionHTML}</p>
                </div>
            </div> `;
        languagesContainer.innerHTML += languageHTML;
    });
}



/**
 * Renders the Languages section (ID: #languages) for the printable_cv.html page.
 * Uses the flag icon class (fi fi-xx) or a default icon.
 * @param {object} languagesData // The wrapper object
 */
function renderLanguagesCV(languagesData) {
    const ArrayOfObjects = (arr) => Array.isArray(arr) && arr.every(item => typeof item === 'object' && item !== null);

    if (!languagesData || !ArrayOfObjects(languagesData.languages)) {
        console.error("renderLanguagesCV: Data wrapper object or 'languages' array is missing/invalid.");
        return;
    }

    const section = document.getElementById('languages');
    if (!section) return;

    const sectionInfo = languagesData.section_info;
    const languages = languagesData.languages;

    // CRITICAL: Find the container based on CV structure
    const languagesContainer = document.querySelector('#languages + .row.gy-4.ps-3.pe-3');

    if (!languagesContainer) {
        console.error("renderLanguagesCV: Failed to find the languages container.");
        return;
    }

    // 2. Render Section Title and Description (CV page uses P for description)
    const sectionTitleH2 = section.querySelector('h2');
    const sectionDescriptionP = section.querySelector('p');

    if (sectionTitleH2 && sectionInfo) {
        sectionTitleH2.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title} <a href="languages-details.html"><i class="bx bx-link"></i></a>`;
    }
    if (sectionDescriptionP && sectionInfo) {
        sectionDescriptionP.textContent = sectionInfo.details;
    }

    // 3. Clear existing static content
    languagesContainer.innerHTML = '';

    // 4. Generate and Append Language Cards
    languages.forEach(language => {
        // Use flag icon class if present, otherwise default generic icon
        const iconContent = language.icon_class
            ? `<span class="flag-icon-container"><span class="${language.icon_class}"></span></span>`
            : `<i class="bx bx-conversation"></i>`;

        const iconElement = `<div class="icon flex-shrink-0">${iconContent}</div>`;

        // Use the details field for the short description
        const descriptionHTML = language.details;

        const languageHTML = `
            <div class="col-lg-4 col-md-6 service-item d-flex">
                ${iconElement}
                <div>
                    <a href="languages-details.html#${language.id_ref}">${language.language}</a>
                    <p class="description">${descriptionHTML}</p>
                </div>
            </div> `;
        languagesContainer.innerHTML += languageHTML;
    });

    // Add spacing after the last item
    languagesContainer.innerHTML += '<p></p>';
}



/**
 * Renders the Languages section for the languages-details.html page.
 * Handles the nested 'test_scores' array for full details.
 * @param {object} languagesData // The wrapper object
 */
function renderLanguagesDetails(languagesData) {
    const ArrayOfObjects = (arr) => Array.isArray(arr) && arr.every(item => typeof item === 'object' && item !== null);

    if (!languagesData || !ArrayOfObjects(languagesData.languages)) {
        console.error("renderLanguagesDetails: Data wrapper object or 'languages' array is missing/invalid.");
        return;
    }

    const languages = languagesData.languages;
    const sectionInfo = languagesData.section_info;

    const innerMainContainer = document.getElementById('languagesDetails_main');

    if (!innerMainContainer) {
        console.error("renderLanguagesDetails: Main details container (languagesDetails_main) not found.");
        return;
    }

    // --- 2. Update Page Title, H1, and Breadcrumb ---
    if (sectionInfo) {
        const title = sectionInfo.title;
        document.title = `Emran Ali - ${title} Details`;

        const pageTitleH1 = document.querySelector('.page-title h1');
        if (pageTitleH1) {
            pageTitleH1.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${title} Details`;
        }

        const breadcrumbCurrent = document.querySelector('.breadcrumbs li.current');
        if (breadcrumbCurrent) {
            breadcrumbCurrent.textContent = `${title} Details`;
        }
    }

    // 3. Render Details Content
    const detailsContainer = innerMainContainer.querySelector('.row');
    if (!detailsContainer) {
        console.error("renderLanguagesDetails: Inner details container (.row) not found.");
        return;
    }

    detailsContainer.innerHTML = ''; // Clear existing static content

    let allLanguagesHTML = '';

    languages.forEach(language => {
        let testDetailsHTML = '';

        if (language.test_scores && language.test_scores.length > 0) {
            language.test_scores.forEach(score => {
                const breakdown = score.proficiency_breakdown;
                const breakdownText = breakdown
                    ? `LRWS (${breakdown.listening}, ${breakdown.reading}, ${breakdown.writing}, ${breakdown.speaking})`
                    : '';

                let scoreText = '';
                if (score.test_name && score.test_score) {
                    scoreText = `${score.test_name} (${score.test_score}) - ${breakdownText} - ${score.test_year}`;
                } else if (breakdownText) {
                    scoreText = breakdownText;
                } else {
                    scoreText = '(N/A)';
                }

                if (scoreText) {
                    testDetailsHTML += `<li>${scoreText}</li>`;
                }
            });
        }

        // Wrap the list in a UL if there are scores, otherwise output (N/A)
        const finalTestDetails = testDetailsHTML ? `<ul>${testDetailsHTML}</ul>` : '(N/A)';

        // Main Details content
        const languageName = language.language;
        const description = language.details;

        const detailsHTML = `
            <div id="${language.id_ref}" class="general-info" data-aos="fade-up" data-aos-delay="200">
                <h3>${languageName} </h3>
                <p class="description">
                    <strong>Description: </strong> ${description} <br>
                    <strong>Language Test Details: </strong> ${finalTestDetails} <br>
                </p>
            </div> `;
        allLanguagesHTML += detailsHTML;
    });

    detailsContainer.innerHTML = allLanguagesHTML;
}



/**
 * Renders the Portfolios section (ID: #portfolios) for the main index page.
 * Uses the card layout with links to the details page.
 * @param {object} portfoliosData
 */
function renderPortfolios(portfoliosData) {
    const ArrayOfObjects = (arr) => Array.isArray(arr) && arr.every(item => typeof item === 'object' && item !== null);

    // 1. Guard check uses the correct 'portfolios' key
    if (!portfoliosData || !ArrayOfObjects(portfoliosData.portfolios)) {
        console.error("renderPortfolios: Data wrapper object or 'portfolios' array is missing/invalid.");
        return;
    }

    const section = document.getElementById('portfolios');
    if (!section) return;

    const sectionInfo = portfoliosData.section_info;
    const portfolios = portfoliosData.portfolios;

    // Target the section title area and the portfolios container
    const sectionTitleContainer = section.querySelector('.section-title');
    const portfoliosContainer = section.querySelector('.container .row.gy-4');

    if (!sectionTitleContainer || !portfoliosContainer) {
        console.error("renderPortfolios: Target containers not found. Index page selector failed.");
        return;
    }

    // 2. Render Section Title and Description
    const sectionTitleH2 = sectionTitleContainer.querySelector('h2');
    const sectionDescriptionH6 = sectionTitleContainer.querySelector('h6'); // Index page uses H6 for description

    if (sectionTitleH2 && sectionInfo) {
        sectionTitleH2.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title} <a href="portfolios-details.html"><i class="bx bx-link"></i></a>`;
    }
    if (sectionDescriptionH6 && sectionInfo) {
        sectionDescriptionH6.textContent = sectionInfo.details;
    }

    // 3. Clear existing static content
    portfoliosContainer.innerHTML = '';

    // 4. Generate and Append Portfolio Cards
    portfolios.forEach(item => {
        // Construct the card content: Title + link to GitHub + description
        const titleHTML = `${item.title} | <a target="_blank" href="${item.portfolio_url}"><i class="bx bx-link-external"></i></a>`;

        const itemHTML = `
            <div class="col-lg-4 col-md-6 service-item d-flex" data-aos="fade-up" data-aos-delay="100">
                <div class="icon flex-shrink-0"><i class="${item.icon_class || 'bi-images'}"></i></div>
                <div>
                    <h4 class="title">
                        <a href="portfolios-details.html#${item.id_ref}" class="stretched-link">${item.title}</a>
                    </h4>
                    <p class="description">${item.description}</p>
                    <p class="mt-2"><a target="_blank" href="${item.portfolio_url}" style="font-size: smaller;"><i class="bx bx-link-external"></i> View on GitHub</a></p>
                </div>
            </div> `;
        portfoliosContainer.innerHTML += itemHTML;
    });
}



/**
 * Renders the Portfolios section (ID: #portfolios) for the printable_cv.html page.
 * Uses the card layout suitable for printing.
 * @param {object} portfoliosData
 */
function renderPortfoliosCV(portfoliosData) {
    const ArrayOfObjects = (arr) => Array.isArray(arr) && arr.every(item => typeof item === 'object' && item !== null);

    // 1. Guard check uses the correct 'portfolios' key
    if (!portfoliosData || !ArrayOfObjects(portfoliosData.portfolios)) {
        console.error("renderPortfoliosCV: Data wrapper object or 'portfolios' array is missing/invalid.");
        return;
    }

    const section = document.getElementById('portfolios');
    if (!section) return;

    const sectionInfo = portfoliosData.section_info;
    const portfolios = portfoliosData.portfolios;

    // CRITICAL: Find the container adjacent to the section title based on CV structure
    const portfoliosContainer = document.querySelector('#portfolios + .row.gy-4.ps-3.pe-3');

    if (!portfoliosContainer) {
        console.error("renderPortfoliosCV: Failed to find the portfolios container.");
        return;
    }

    // 2. Render Section Title and Description (CV page uses P for description)
    const sectionTitleH2 = section.querySelector('h2');
    const sectionDescriptionP = section.querySelector('p');

    if (sectionTitleH2 && sectionInfo) {
        sectionTitleH2.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title} <a href="portfolios-details.html"><i class="bx bx-link"></i></a>`;
    }
    if (sectionDescriptionP && sectionInfo) {
        sectionDescriptionP.textContent = sectionInfo.details;
    }

    // 3. Clear existing static content
    portfoliosContainer.innerHTML = '';

    // 4. Generate and Append Portfolio Cards (CV style)
    portfolios.forEach(item => {
        // Construct the link and description
        const linkHTML = `<a target="_blank" href="${item.portfolio_url}">View on GitHub <i class="bx bx-link-external"></i></a>`;
        const descriptionHTML = `${item.description}<br>${linkHTML}`;

        const itemHTML = `
            <div class="col-lg-4 col-md-6 service-item d-flex">
                <div class="icon flex-shrink-0"><i class="${item.icon_class || 'bi-images'}"></i></div>
                <div>
                    <a href="portfolios-details.html#${item.id_ref}">${item.title}</a>
                    <p class="description">${descriptionHTML}</p>
                </div>
            </div> `;
        portfoliosContainer.innerHTML += itemHTML;
    });

    // Add spacing after the last item
    portfoliosContainer.innerHTML += '<p></p>';
}



/**
 * Renders the Portfolios section for the portfolios-details.html page.
 * Renders data using the full fields from the JSON structure and updates page headers.
 * @param {object} portfoliosData
 */
function renderPortfoliosDetails(portfoliosData) {
    const ArrayOfObjects = (arr) => Array.isArray(arr) && arr.every(item => typeof item === 'object' && item !== null);

    // 1. Guard check uses the correct 'portfolios' key
    if (!portfoliosData || !ArrayOfObjects(portfoliosData.portfolios)) {
        console.error("renderPortfoliosDetails: Data wrapper object or 'portfolios' array is missing/invalid.");
        return;
    }

    const portfolios = portfoliosData.portfolios;
    const sectionInfo = portfoliosData.section_info;

    // Target the specific section container using the actual ID from the HTML
    const innerMainContainer = document.getElementById('portfoliosDetails_main');

    if (!innerMainContainer) {
        console.error("renderPortfoliosDetails: Main details container (portfoliosDetails_main) not found.");
        return;
    }

    // --- 2. Update Page Title, H1, and Breadcrumb ---
    if (sectionInfo) {
        document.title = `Emran Ali - ${sectionInfo.title} Details`;

        const pageTitleH1 = document.querySelector('.page-title h1');
        if (pageTitleH1) {
            pageTitleH1.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title} Details`;
        }

        const breadcrumbCurrent = document.querySelector('.breadcrumbs li.current');
        if (breadcrumbCurrent) {
            breadcrumbCurrent.textContent = `${sectionInfo.title} Details`;
        }
    }

    // 3. Render Details Content
    const detailsContainer = innerMainContainer.querySelector('.row');
    if (!detailsContainer) {
        console.error("renderPortfoliosDetails: Inner details container (.row) not found.");
        return;
    }

    detailsContainer.innerHTML = ''; // Clear existing static content

    let allPortfoliosHTML = '';

    portfolios.forEach(item => {

        // Ensure URLs are used correctly. Platform is hardcoded as 'GitHub' based on context.
        const detailsHTML = `
            <div id="${item.id_ref}" class="general-info" data-aos="fade-up" data-aos-delay="200">
                <h3>${item.title} </h3>
                <p class="description">
                    <strong>Platform: </strong> GitHub <br>
                    <strong>Description: </strong> ${item.description} <br>
                    <strong>Link: </strong> <a target="_blank" href="${item.portfolio_url}">${item.portfolio_url} <i class="bx bx-link-external"></i></a> <br>
                </p>
            </div> `;
        allPortfoliosHTML += detailsHTML;
    });

    detailsContainer.innerHTML = allPortfoliosHTML;
}



/**
 * Renders the Volunteerings section (ID: #volunteerings) for the main index page.
 * Uses the summary_text field for the card description.
 * @param {object} volunteeringsData
 */
function renderVolunteerings(volunteeringsData) {
    const ArrayOfObjects = (arr) => Array.isArray(arr) && arr.every(item => typeof item === 'object' && item !== null);

    // 1. Guard check uses the correct 'volunteerings' key
    if (!volunteeringsData || !ArrayOfObjects(volunteeringsData.volunteerings)) {
        console.error("renderVolunteerings: Data wrapper object or 'volunteerings' array is missing/invalid.");
        return;
    }

    const section = document.getElementById('volunteerings');
    if (!section) return;

    const sectionInfo = volunteeringsData.section_info;
    const volunteerings = volunteeringsData.volunteerings;

    // Target the section title area and the volunteerings container
    const sectionTitleContainer = section.querySelector('.section-title');
    const volunteeringsContainer = section.querySelector('.container .row.gy-4');

    if (!sectionTitleContainer || !volunteeringsContainer) {
        console.error("renderVolunteerings: Target containers not found. Index page selector failed.");
        return;
    }

    // 2. Render Section Title and Description
    const sectionTitleH2 = sectionTitleContainer.querySelector('h2');
    const sectionDescriptionH6 = sectionTitleContainer.querySelector('h6'); // Index page uses H6 for description

    if (sectionTitleH2 && sectionInfo) {
        sectionTitleH2.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title} <a href="volunteerings-details.html"><i class="bx bx-link"></i></a>`;
    }
    if (sectionDescriptionH6 && sectionInfo) {
        sectionDescriptionH6.textContent = sectionInfo.details;
    }

    // 3. Clear existing static content
    volunteeringsContainer.innerHTML = '';

    // 4. Generate and Append Volunteering Cards
    volunteerings.forEach(item => {

        const itemHTML = `
            <div class="col-lg-4 col-md-6 service-item d-flex" data-aos="fade-up" data-aos-delay="100">
                <div class="icon flex-shrink-0"><i class="${item.icon_class || 'bx bxs-donate-heart'}"></i></div>
                <div>
                    <h4 class="title">
                        <a href="volunteerings-details.html#${item.id_ref}" class="stretched-link">${item.title}</a>
                    </h4>
                    <p class="description">${item.summary_text}</p>
                </div>
            </div> `;
        volunteeringsContainer.innerHTML += itemHTML;
    });
}



/**
 * Renders the Volunteerings section (ID: #volunteerings) for the printable_cv.html page.
 * Uses the summary_text field for the card description.
 * @param {object} volunteeringsData
 */
function renderVolunteeringsCV(volunteeringsData) {
    const ArrayOfObjects = (arr) => Array.isArray(arr) && arr.every(item => typeof item === 'object' && item !== null);

    // 1. Guard check uses the correct 'volunteerings' key
    if (!volunteeringsData || !ArrayOfObjects(volunteeringsData.volunteerings)) {
        console.error("renderVolunteeringsCV: Data wrapper object or 'volunteerings' array is missing/invalid.");
        return;
    }

    const section = document.getElementById('volunteerings');
    if (!section) return;

    const sectionInfo = volunteeringsData.section_info;
    const volunteerings = volunteeringsData.volunteerings;

    // CRITICAL: Find the container adjacent to the section title based on CV structure
    const volunteeringsContainer = document.querySelector('#volunteerings + .row.gy-4.ps-3.pe-3');

    if (!volunteeringsContainer) {
        console.error("renderVolunteeringsCV: Failed to find the volunteerings container.");
        return;
    }

    // 2. Render Section Title and Description (CV page uses P for description)
    const sectionTitleH2 = section.querySelector('h2');
    const sectionDescriptionP = section.querySelector('p');

    if (sectionTitleH2 && sectionInfo) {
        sectionTitleH2.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title} <a href="volunteerings-details.html"><i class="bx bx-link"></i></a>`;
    }
    if (sectionDescriptionP && sectionInfo) {
        sectionDescriptionP.textContent = sectionInfo.details;
    }

    // 3. Clear existing static content
    volunteeringsContainer.innerHTML = '';

    // 4. Generate and Append Volunteering Items (CV style)
    volunteerings.forEach(item => {
        // Use summary_text for the description in the CV format
        const descriptionHTML = `${item.summary_text}`;

        const itemHTML = `
            <div class="col-lg-4 col-md-6 service-item d-flex">
                <div class="icon flex-shrink-0"><i class="${item.icon_class || 'bx bxs-donate-heart'}"></i></div>
                <div>
                    <a href="volunteerings-details.html#${item.id_ref}">${item.title}</a>
                    <p class="description">${descriptionHTML}</p>
                </div>
            </div> `;
        volunteeringsContainer.innerHTML += itemHTML;
    });

    // Add spacing after the last item
    volunteeringsContainer.innerHTML += '<p></p>';
}



/**
 * Renders the Volunteerings section for the volunteerings-details.html page.
 * DEFENSIVE FIX: Reverts to col-lg-6/6 and adds defensive CSS to force proper rendering.
 * @param {object} volunteeringsData
 */
function renderVolunteeringsDetails(volunteeringsData) {
    const ArrayOfObjects = (arr) => Array.isArray(arr) && arr.every(item => typeof item === 'object' && item !== null);

    if (!volunteeringsData || !ArrayOfObjects(volunteeringsData.volunteerings)) {
        console.error("renderVolunteeringsDetails: Data wrapper object or 'volunteerings' array is missing/invalid.");
        return;
    }

    const volunteerings = volunteeringsData.volunteerings;
    const sectionInfo = volunteeringsData.section_info;

    const innerMainContainer = document.getElementById('volunteeringDetails_main');

    if (!innerMainContainer) {
        console.error("renderVolunteeringsDetails: Main details container (volunteeringDetails_main) not found.");
        return;
    }

    // --- 2. Update Page Title, H1, and Breadcrumb ---
    if (sectionInfo) {
        document.title = `Emran Ali - ${sectionInfo.title} Details`;

        const pageTitleH1 = document.querySelector('.page-title h1');
        if (pageTitleH1) {
            pageTitleH1.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title} Details`;
        }

        const breadcrumbCurrent = document.querySelector('.breadcrumbs li.current');
        if (breadcrumbCurrent) {
            breadcrumbCurrent.textContent = `${sectionInfo.title} Details`;
        }
    }

    // 3. Render Details Content
    const outerRowContainer = innerMainContainer.querySelector('.row');
    if (!outerRowContainer) {
        console.error("renderVolunteeringsDetails: Inner details container (.row) not found.");
        return;
    }

    outerRowContainer.innerHTML = ''; // Clear existing static content

    let allVolunteeringsHTML = '';

    volunteerings.forEach(item => {
        const itemDetails = item.details || {};

        // 1. Build the Description content
        const descriptionHTML = `
            <p class="description" style="margin-top: 0;">
                <strong>Involvement:</strong> ${item.summary_text} <br>
                <strong>Cause:</strong> ${itemDetails.cause || 'N/A'} <br>
                <strong>Organisation:</strong> ${item.organization || 'N/A'} <br>
                <strong>Description:</strong> ${itemDetails.description_full || 'N/A'} <br>
                ${itemDetails.url_link ? `<strong>Link:</strong> <a target="_blank" href="${itemDetails.url_link}">${itemDetails.url_link} <i class="bx bx-link-external"></i></a> <br>` : ''}
                <strong>Period:</strong> ${itemDetails.period || item.timeframe_details || 'N/A'} <br>
            </p>
        `;

        // 2. Handle image and layout structure (FORCING STACKING)
        let contentColumns = '';

        if (itemDetails.image_path) {
            // Case 1: Image exists -> Force Image to be 70% wide and span 12 columns
            contentColumns = `
                <div class="col-lg-12 mb-3">
                    <img src="${itemDetails.image_path}" class="img-fluid" alt="Volunteering Image" style="max-width: 70%; height: auto; display: block;">
                </div>
                <div class="col-lg-12">
                    ${descriptionHTML}
                </div>
            `;
        } else {
            // Case 2: No image -> Use single 12-column span for text
            contentColumns = `
                <div class="col-lg-12">
                    ${descriptionHTML}
                </div>
            `;
        }

        // 3. Combine into the final item structure
        const finalItemHTML = `
            <div id="${item.id_ref}" class="general-info" data-aos="fade-up" data-aos-delay="200">
                <h3>${item.title} </h3>
                <div class="row">
                    ${contentColumns}
                </div>
            </div> `;

        allVolunteeringsHTML += finalItemHTML;
    });

    outerRowContainer.innerHTML = allVolunteeringsHTML;
}



/**
 * Renders the Publications section (ID: #publications) for the main index page.
 * Dynamically renders categorized lists using the resume-style 2-column layout,
 * pulling category headings (e.g., 'Journals (N)') directly from the JSON keys.
 * @param {object} publicationsData
 */
function renderPublications(publicationsData) {
    if (!publicationsData || !publicationsData.publications) {
        console.error("renderPublications: Data wrapper object or 'publications' section is missing/invalid.");
        return;
    }

    const section = document.getElementById('publications');
    if (!section) return;

    const sectionInfo = publicationsData.section_info;
    const pubs = publicationsData.publications;

    // --- 1. Locate the containers based on the existing HTML structure ---
    const sectionTitleContainer = section.querySelector('.section-title');
    // Target the main row container below .container which will hold the two col-lg-6 divs.
    const contentContainer = section.querySelector('.container .row');

    if (!sectionTitleContainer || !contentContainer) {
        console.error("renderPublications: Target containers not found. Ensure <section id='publications'> contains a .section-title and a child .container with a direct .row inside.");
        return;
    }

    // Clear the existing content (the two static col-lg-6 divs)
    contentContainer.innerHTML = '';

    // 2. Render Section Title and Description
    const sectionTitleH2 = sectionTitleContainer.querySelector('h2');
    const sectionDescriptionH6 = sectionTitleContainer.querySelector('h6');

    if (sectionTitleH2 && sectionInfo) {
        sectionTitleH2.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title} <a href="publications-details.html"><i class="bx bx-link"></i></a>`;
    }
    if (sectionDescriptionH6 && sectionInfo) {
        sectionDescriptionH6.textContent = sectionInfo.details;
    }

    // --- 3. Initialize column builders ---
    let leftColumnContent = '';
    let rightColumnContent = '';

    // Helper to generate a resume item
    const generateResumeItem = (item) => {
        const linkKey = item.journal_link ? 'journal_link' : 'conference_link';
        const link = item[linkKey];
        // Use the last segment of the URL for display
        const linkDisplay = link ? `<a target="_blank" href="${link}">${link.split('/').slice(-1).join('/')} <i class="bx bx-link-external"></i> </a>` : 'N/A';

        return `
            <div class="resume-item pb-0" data-aos="fade-up" data-aos-delay="200">
                <h4>${item.title} </h4>
                <div id="${item.id_ref}">
                    ${item.citation_text}
                    <transparent_button onclick="CopyToClipboard('${item.id_ref}')"><i class="bx bx-copy"></i></transparent_button>
                </div>
                <p><strong>DOI/Link:</strong> ${linkDisplay}</p>
            </div>`;
    };

    // --- 4. Iterate through categories and build columns ---
    const categories = ['journals', 'conferences', 'posters'];

    categories.forEach(categoryKey => {
        const categoryData = pubs[categoryKey];
        if (!categoryData || !categoryData.items || categoryData.items.length === 0) return;

        // Dynamic Heading Fix: Capitalize the key (e.g., 'journals' -> 'Journals')
        const categoryTitle = categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);

        // Retrieve the count
        const itemCount = categoryData.items.length;

        let categoryHTML = '';

        // Add Category Header - MODIFIED TO INCLUDE (itemCount)
        // Note: Check if the current column content is empty before adding a margin-top style
        const columnContentReference = categoryData.column === 'left' ? leftColumnContent : rightColumnContent;
        const marginTopStyle = (columnContentReference === '' || categoryKey === 'posters') ? '0' : '30px';

        categoryHTML += `<h3 class="resume-title" style="margin-top: ${marginTopStyle};">
                            <a href="publications-details.html#pub_${categoryKey}"><i class="${categoryData.icon_class}"></i> 
                            ${categoryTitle} (${itemCount}) <i class="bx bx-link"></i></a>
                        </h3>`;

        // Add Publication Items
        categoryData.items.forEach(item => {
            categoryHTML += generateResumeItem(item, categoryData);
        });

        // Append to the correct column based on JSON field
        if (categoryData.column === 'left') {
            leftColumnContent += categoryHTML;
        } else if (categoryData.column === 'right') {
            rightColumnContent += categoryHTML;
        }
    });

    // --- 5. Wrap content in Bootstrap columns and inject ---

    let finalHTML = '';

    if (leftColumnContent) {
        finalHTML += `<div class="col-lg-6" data-aos="fade-up" data-aos-delay="100">${leftColumnContent}</div>`;
    }
    if (rightColumnContent) {
        finalHTML += `<div class="col-lg-6" data-aos="fade-up" data-aos-delay="200">${rightColumnContent}</div>`;
    }

    contentContainer.innerHTML = finalHTML;
}



/**
 * Renders the Publications section (ID: #publications) for the printable_cv.html page.
 * Generates the native HTML <table> structure, dynamically reading categories,
 * and includes the count of items (N) next to the category title.
 * NOTE: Section description rendering is removed.
 * @param {object} publicationsData
 */
function renderPublicationsCV(publicationsData) {
    if (!publicationsData || !publicationsData.publications) {
        console.error("renderPublicationsCV: Data wrapper object or 'publications' section is missing/invalid.");
        return;
    }

    const section = document.getElementById('publications');
    if (!section) return;

    const sectionInfo = publicationsData.section_info;
    const pubs = publicationsData.publications;

    // CRITICAL: Robust selector - Find the content container.
    const publicationsContainer = section.nextElementSibling;

    if (!publicationsContainer || !publicationsContainer.classList.contains('row')) {
        console.error("renderPublicationsCV: Failed to find the CV publications container. Expected immediate sibling with class 'row ps-3 pe-3'.");
        return;
    }

    // 2. Render Section Title (but NOT the Description)
    const sectionTitleH2 = section.querySelector('h2');
    const sectionDescriptionP = section.querySelector('p');

    if (sectionTitleH2 && sectionInfo) {
        sectionTitleH2.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title} <a href="publications-details.html"><i class="bx bx-link"></i></a>`;
    }

    // REMOVED: Rendering the section description text
    /*
    if (sectionDescriptionP && sectionInfo) {
        sectionDescriptionP.textContent = sectionInfo.details;
    }
    */

    // 3. Clear existing static content
    publicationsContainer.innerHTML = '';

    let allPublicationsHTML = '';

    // Helper to generate a single publication item row (<tr><td>...</td></tr>)
    const renderPublicationItem = (item) => {
        const link = item.journal_link || item.conference_link;
        const linkDisplay = link ? `<a target="_blank" href="${link}">${link.split('/').slice(-1).join('/')} <i class="bx bx-link-external"></i> </a>` : 'N/A';

        return `
            <tr>
                <td>
                    <h6>${item.title}</h6>
                    <div id="${item.id_ref}_cv">
                        ${item.citation_text}
                        <transparent_button onclick="CopyToClipboard('${item.id_ref}_cv')"><i class="bx bx-copy"></i></transparent_button>
                    </div>
                    <p><strong>DOI/Link:</strong> ${linkDisplay}</p>
                </td>
            </tr>
        `;
    };

    // Helper to render an entire categorized <table> block
    const renderCategoryTable = (categoryKey, categoryData) => {
        const items = categoryData.items;
        if (!items || items.length === 0) return '';

        // Dynamically set the display name and ADD THE COUNT (items.length)
        const displayName = categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);

        let tableHTML = `
            <table>
                <thead>
                    <tr>
                        <td>
                            <h6><a href="publications-details.html#pub_${categoryKey}"><i class="${categoryData.icon_class}"></i> 
                            ${displayName} (${items.length}) <i class="bx bx-link"></i></a></h6>
                        </td>
                    </tr>
                </thead>
                <tbody>
        `;

        items.forEach(item => {
            tableHTML += renderPublicationItem(item);
        });

        tableHTML += `
                </tbody>
            </table>
        `;
        return tableHTML;
    };

    // 4. Generate Content for all Categories DYNAMICALLY
    const categoryKeys = Object.keys(pubs);

    categoryKeys.forEach(key => {
        if (pubs[key] && typeof pubs[key] === 'object' && pubs[key].items) {
            allPublicationsHTML += renderCategoryTable(key, pubs[key]);
        }
    });

    // Inject all table content into the row container
    publicationsContainer.innerHTML = allPublicationsHTML;

    // Add spacing after the last item
    publicationsContainer.innerHTML += '<p></p>';
}



/**
 * Renders the Publications section for the publications-details.html page.
 * Renders categorized lists including titles, abstracts, and full citations/links,
 * and includes the count of items (N) next to the category title.
 * This version uses a safer content clearing strategy to prevent duplication.
 * @param {object} publicationsData
 */
function renderPublicationsDetails(publicationsData) {
    if (!publicationsData || !publicationsData.publications) {
        console.error("renderPublicationsDetails: Data wrapper object or 'publications' section is missing/invalid.");
        return;
    }

    const pubs = publicationsData.publications;
    const sectionInfo = publicationsData.section_info;

    // NOTE: The HTML ID in publications-details.html uses 'volunteeringDetails_main'.
    const innerMainContainer = document.getElementById('volunteeringDetails_main');

    if (!innerMainContainer) {
        console.error("renderPublicationsDetails: Main details container not found.");
        return;
    }

    // --- 2. Update Page Title, H1, and Breadcrumb ---
    if (sectionInfo) {
        document.title = `Emran Ali - ${sectionInfo.title} Details`;

        const pageTitleH1 = document.querySelector('.page-title h1');
        if (pageTitleH1) {
            pageTitleH1.innerHTML = `<i class="${sectionInfo.icon_class}"></i> ${sectionInfo.title} Details`;
        }

        const breadcrumbCurrent = document.querySelector('.breadcrumbs li.current');
        if (breadcrumbCurrent) {
            breadcrumbCurrent.textContent = `${sectionInfo.title} Details`;
        }
    }

    // 3. Clear existing static content in the parent container
    // We clear the entire inner HTML of the main container and rebuild the content inside a fresh container.
    innerMainContainer.innerHTML = '<div class="container"><div id="dynamic-publications-row" class="row"></div></div>';

    // Set the new target container
    const detailsContainer = document.getElementById('dynamic-publications-row');

    if (!detailsContainer) {
        console.error("renderPublicationsDetails: Dynamic row container not found after creation.");
        return;
    }

    let allPublicationsHTML = '';

    // Helper function to render a single publication item
    const renderItem = (item, type, sub_type) => {
        const link = item.journal_link || item.conference_link;
        const linkDisplay = link ? `<a target="_blank" href="${link}">${link.split('/').slice(-1).join('/')} <i class="bx bx-link-external"></i> </a>` : 'N/A';

        const abstractCleaned = item.abstract.replace(/\n/g, '<br>');

        return `
            <div id="${item.id_ref}" class="general-info" data-aos="fade-up" data-aos-delay="200">
                <h3>${item.title} </h3>
                <p class="description">
                    <br><strong>Type: </strong> ${type}
                    <br><strong>Sub-Type: </strong> ${sub_type}
                    <br><strong>Title: </strong> ${item.title}
                    <br><strong>Abstract: </strong> ${abstractCleaned}
                    <br><strong>Citation: </strong>
                </p>
                <div id="${item.id_ref}_citation">
                    ${item.citation_text}
                    <transparent_button onclick="CopyToClipboard('${item.id_ref}_citation')"> <i class="bx bx-copy"></i> </transparent_button>
                </div>
                <p><strong>DOI/Link:</strong> ${linkDisplay} </p>
            </div>`;
    };

    // Helper to render a category block (Header + Items)
    const renderCategoryBlock = (categoryKey, categoryData) => {
        const items = categoryData.items;
        if (!items || items.length === 0) return '';

        // Dynamically set the display name and ADD THE COUNT (items.length)
        const displayName = categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);

        let blockHTML = `
            <div class="col-lg-12">
                <div id="pub_${categoryKey}" class="general-cat" data-aos="fade-up" data-aos-delay="200">
                    <h5><i class="${categoryData.icon_class}"></i> ${displayName} (${items.length}) </h5>
                </div>
            </div>`;

        items.forEach(item => {
            blockHTML += `<div class="col-lg-12">` + renderItem(item, categoryData.type, categoryData.sub_type) + `</div>`;
        });
        return blockHTML;
    };

    // 4. Generate Content for all Categories
    const categoryKeys = Object.keys(pubs);
    categoryKeys.forEach(key => {
        if (pubs[key] && typeof pubs[key] === 'object' && pubs[key].items) {
            allPublicationsHTML += renderCategoryBlock(key, pubs[key]);
        }
    });

    detailsContainer.innerHTML = allPublicationsHTML;
}








/**
 * Renders the Menu Footer (Sidebar Footer: ID: #menu_footer).
 * @param {object} footerMeta
 * @param {object} assetData
 */
function renderMenuFooter(footerMeta, assetData) {
    if (!footerMeta || !footerMeta.menu_footer) return;

    const menuFooter = footerMeta.menu_footer;
    const container = document.getElementById('menu_footer');
    if (!container) return;

    // --- CRITICAL FIX: Get the current year dynamically ---
    let copyrightYear= menuFooter.copyright_year || 'AUTO';
    if (copyrightYear && copyrightYear.toUpperCase() == 'AUTO') {
        // 1. If 'AUTO', use the current year
        copyrightYear = new Date().getFullYear();
        console.log("Getting current year", copyrightYear)
    }

    // Use the logo path from assets
    const logoPath = `assets/img/${assetData.icons.logo_png}`;

    // 1. Render Copyright Block
    const copyrightHTML = `
        <div class="copyright">
          <p style="text-align: center;">
            © Copyright · ${copyrightYear} <strong><span> 
<!--            © Copyright · ${menuFooter.copyright_year} <strong><span> -->
            <a href="${menuFooter.copyright_logo_link}"> <img style="height: 20px;" src="${logoPath}" alt="Logo" class="img-fluid rounded-circle"> </a> 
            <a href="${menuFooter.copyright_text_link}"> ${menuFooter.copyright_owner} </a> 
            </span></strong>
          </p>
        </div>
    `;

    // 2. Render Credits/Links Block
    const linksHTML = menuFooter.links.map(link =>
        `<a href="${link.url}"> ${link.label} </a>`
    ).join(' | ');

    const creditsHTML = `
        <div class="credits">
            ${linksHTML}
        </div>
    `;

    // Replace the container content
    container.innerHTML = `
        <div class="container">
            ${copyrightHTML}
            ${creditsHTML}
        </div>
    `;
}


/**
 * Renders the Global Page Footer (ID: #footer).
 * @param {object} footerMeta
 */
function renderPageFooter(footerMeta)
{
    if (!footerMeta || !footerMeta.main_page_footer) return;

    const pageFooter = footerMeta.main_page_footer;
    const container = document.getElementById('footer');
    if (!container) return;

    // Ensure the container has the correct class and inner structure
    container.innerHTML = `
        <div class="container">
            <div class="copyright text-center ">
                <p>© <span>Copyright</span> <strong class="px-1 sitename">${pageFooter.sitename}</strong><span>All Rights Reserved</span></p>
            </div>
            <div class="credits">
                Designed by <a target="_blank" href="${pageFooter.design_link}">${pageFooter.design_credit}</a>
            </div>
        </div>
    `;
}




// --- 4. MAIN INITIALIZATION ---

/**
 * Main function to orchestrate data loading and rendering.
 */
async function initializeSite() {
    await loadAllData();

    if (Object.keys(SITE_DATA).length > 0) {
        console.log('Rendering site with loaded data...');

        const pathName = window.location.pathname;
        const fileName = pathName.substring(pathName.lastIndexOf('/') + 1);

        let menuToRender;
        const mainPages = ['index.html', '', 'printable_cv.html'];

        if (mainPages.includes(fileName)) {
            menuToRender = SITE_DATA.site.navigation.main_menu;
            // --- CRITICAL FIX: OVERRIDE HOME LINK FOR PRINTABLE CV PAGE ---
            if (fileName === 'printable_cv.html') {
                const homeItem = menuToRender.find(item => item.label.startsWith('Home'));
                if (homeItem) {
                    // Change the URL to navigate back instead of scrolling to #hero
                    // detailMenu = SITE_DATA.site.navigation.details_menu;
                    // homeItem.url = detailMenu.find(item => item.label.startsWith('Back')).url;
                    // homeItem.url = 'javascript:history.back()';
                    // Change the URL to navigate back instead of scrolling to #about of the home page
                    homeItem.url = './index.html#about';
                }
            }
        }
        else {
            menuToRender = SITE_DATA.site.navigation.details_menu;
        }

        // 1. RENDER CORE HEADER AND HERO SECTIONS
        updateDocumentMetadata(SITE_DATA.site.site_info);
        renderHeader(SITE_DATA.personal_info, SITE_DATA.site);
        renderMenuFooter(SITE_DATA.site.footer_meta, SITE_DATA.site.assets);
        renderPageFooter(SITE_DATA.site.footer_meta);
        renderNavigation({main_menu: menuToRender});
        renderNavDropdowns();

        // 2. RENDER PAGE-SPECIFIC SECTIONS
        if (fileName === 'printable_cv.html') {
            // --- CV PAGE RENDERING ---

            // Render About section (CV has partial static content)
            renderAboutCV(SITE_DATA.personal_info);

            // Key Metrics
            renderKeyMetricsCV(SITE_DATA.key_metrics);

            // Education
            renderEducationsCV(SITE_DATA.education);

            // Professional Experiences
            renderProfessionalExperiencesCV(SITE_DATA.professional_experience);

            // --- EXPERTISE AND ACHIEVEMENTS BLOCK (ORDER MATTERS) ---
            renderExpertiseAndAchievementsCV(SITE_DATA.expertise_achievements);

            // Skills and Tools
            renderSkillsToolsCV(SITE_DATA.skills);

            // Honors and Awards
            renderHonorsAwardsCV(SITE_DATA.honors_awards);

            // Courses, Trainings and Certificates
            renderCoursesTrainingsCertificatesCV(SITE_DATA.courses_trainings_certificates);

            // --- ADD THE CV PROJECTS CALL HERE ---
            renderProjectsCV(SITE_DATA.projects);

            // --- ADD THE CV MEMBERSHIPS CALL HERE ---
            renderMembershipsCV(SITE_DATA.memberships);

            // --- ADD THE CV SESSIONS AND EVENTS CALL HERE ---
            renderSessionsEventsCV(SITE_DATA.sessions_events);

            // --- ADD THE CV LANGUAGES CALL HERE ---
            renderLanguagesCV(SITE_DATA.languages);

            // --- ADD THE CV PORTFOLIOS CALL HERE ---
            renderPortfoliosCV(SITE_DATA.portfolios);

            // --- ADD THE CV VOLUNTEERINGS CALL HERE ---
            renderVolunteeringsCV(SITE_DATA.volunteerings);

            // --- ADD THE CV PUBLICATIONS CALL HERE ---
            renderPublicationsCV(SITE_DATA.publications);
        }
        else if (fileName === 'skillsAndTools-details.html') {
            renderSkillsToolsDetails(SITE_DATA.skills);
        }
        else if (fileName === 'honorsAndAwards-details.html') {
            renderHonorsAwardsDetails(SITE_DATA.honors_awards);
        }
        else if (fileName === 'coursesTrainingsAndCertificates-details.html') {
            renderCoursesTrainingsCertificatesDetails(SITE_DATA.courses_trainings_certificates);
        }
        else if (fileName === 'projects-details.html') {
            renderProjectsDetails(SITE_DATA.projects);
        }
        else if (fileName === 'memberships-details.html') {
            renderMembershipsDetails(SITE_DATA.memberships);
        }
        else if (fileName === 'sessionsAndEvents-details.html') {
            renderSessionsEventsDetails(SITE_DATA.sessions_events);
        }
        else if (fileName === 'languages-details.html') {
            renderLanguagesDetails(SITE_DATA.languages);
        }
        else if (fileName === 'portfolios-details.html') {
            renderPortfoliosDetails(SITE_DATA.portfolios);
        }
        else if (fileName === 'volunteerings-details.html') {
            renderVolunteeringsDetails(SITE_DATA.volunteerings);
        }
        else if (fileName === 'publications-details.html') {
            if (SITE_DATA.publications) renderPublicationsDetails(SITE_DATA.publications);
        }
        else {
            // --- INDEX PAGE RENDERING (Default Fallback) ---

            // Hero Section (often static, but might use personal_info)
            renderHero(SITE_DATA.personal_info);

            // About Section
            renderAbout(SITE_DATA.personal_info);

            // Key Metrics
            renderKeyMetrics(SITE_DATA.key_metrics);

            // Education
            renderEducations(SITE_DATA.education);

            // Professional Experiences
            renderProfessionalExperiences(SITE_DATA.professional_experience);

            // --- EXPERTISE AND ACHIEVEMENTS BLOCK (ORDER MATTERS) ---
            renderExpertiseAndAchievements(SITE_DATA.expertise_achievements);

            // Skills and Tools
            renderSkillsTools(SITE_DATA.skills);

            // Honors and Awards
            renderHonorsAwards(SITE_DATA.honors_awards);

            // Courses, Trainings and Certificates
            renderCoursesTrainingsCertificates(SITE_DATA.courses_trainings_certificates);

            // --- ADD THE INDEX PROJECTS CALL HERE ---
            renderProjects(SITE_DATA.projects);

            // --- ADD THE INDEX MEMBERSHIPS CALL HERE ---
            renderMemberships(SITE_DATA.memberships);

            // --- ADD THE INDEX SESSIONS AND EVENTS CALL HERE ---
            renderSessionsEvents(SITE_DATA.sessions_events);

            // --- ADD THE INDEX LANGUAGES CALL HERE ---
            renderLanguages(SITE_DATA.languages);

            // --- ADD THE INDEX PORTFOLIOS CALL HERE ---
            renderPortfolios(SITE_DATA.portfolios);

            // --- ADD THE INDEX VOLUNTEERINGS CALL HERE ---
            renderVolunteerings(SITE_DATA.volunteerings);

            // --- ADD THE INDEX PUBLICATIONS CALL HERE ---
            renderPublications(SITE_DATA.publications);
        }

        // 3. RE-INITIALIZE DYNAMIC LIBRARIES
        // This is the crucial step for Typed.js
        if (typeof initTypedAnimation === 'function') {
            console.log('initTypedAnimation found! Rendering dynamic items on the site with loaded data...');
            initTypedAnimation();
        } else {
            console.log('initTypedAnimation not found! ');
            console.warn('initTypedAnimation not found. Ensure main.js is loaded and includes this global function.');
        }

        // Other theme initializations
        if (typeof initAOS === 'function') initAOS();
        if (typeof initPureCounter === 'function') initPureCounter();

        console.log('Dynamic rendering complete.');
    }
}

// --- 5. EXECUTION ---
document.addEventListener('DOMContentLoaded', initializeSite);