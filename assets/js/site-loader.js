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
function renderPageFooter(footerMeta) {
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
        } else {
            menuToRender = SITE_DATA.site.navigation.details_menu;
        }

        // 1. RENDER CORE HEADER AND HERO SECTIONS
        updateDocumentMetadata(SITE_DATA.site.site_info);
        renderHeader(SITE_DATA.personal_info, SITE_DATA.site);
        renderMenuFooter(SITE_DATA.site.footer_meta, SITE_DATA.site.assets);
        renderPageFooter(SITE_DATA.site.footer_meta);
        renderNavigation({main_menu: menuToRender});
        renderNavDropdowns();

        // 2. RENDER MAIN BODY SECTIONS
        if (fileName === 'printable_cv.html') {
            // Render simplified CV version for printing
            renderAboutCV(SITE_DATA.personal_info);
            // We will add other CV rendering functions here later (e.g., renderKeyMetricsCV)
            // --- ADD THE KEY METRICS CV CALL HERE ---
            renderKeyMetricsCV(SITE_DATA.key_metrics);

            // --- VERIFY THIS CALL ---
            renderEducationsCV(SITE_DATA.education);

            // --- ADD THE PROFESSIONAL EXPERIENCES CV CALL HERE ---
            renderProfessionalExperiencesCV(SITE_DATA.professional_experience);
        }
        else {
            // Render full index page content
            renderHero(SITE_DATA.personal_info); // Hero is only on index.html
            renderAbout(SITE_DATA.personal_info);
            // --- ADD THE KEY METRICS INDEX CALL HERE ---
            renderKeyMetrics(SITE_DATA.key_metrics);

            // --- UNCOMMENT THIS CALL ---
            renderEducations(SITE_DATA.education);

            // --- VERIFY THIS CALL IS HERE ---
            renderProfessionalExperiences(SITE_DATA.professional_experience);

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