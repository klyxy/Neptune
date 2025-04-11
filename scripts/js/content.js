// Start
console.log("Deploying Neptune");

// Constants
const now = new Date(); // Current date
const manifest = chrome.runtime.getManifest(); // Manifest

// Loaded data
let g_data = {};

// Load data
chrome.storage.local.get({
    // Backup defaults

    // Theme
    theme: "light", // Theme
    accent: "blue", // Accent color
    logo: "default", // Logo in the top left
    legacy: false, // Legacy view 

    // QOL
    recent: true, // Autoload recently completed
    grade: "advanced", // Grade report colors & (Grade Category) text
    profile: true, // Remove profile picture
    spellcheck: true, // Spell check

    // Name
    firstName: null,
    lastName: null,
}, (data) => {
    // Log
    console.log(data);

    // Name title
    if (window.location.href.includes("learn.sowashco.org/user") && (data.firstName || data.lastName)) {
        document.title = "learn.sowashco.org/" // Disguise loading
    }

    // Set data
    g_data = data

    // Set attributes
    document.documentElement.setAttribute("data-add-theme", data.theme)
    document.documentElement.setAttribute("data-accent", data.accent)
    document.documentElement.setAttribute("data-grade", data.grade)
    document.documentElement.setAttribute("data-profile", data.profile)

    // Remove profile on user page
    if (window.location.href.includes("learn.sowashco.org/user")) {
        document.documentElement.setAttribute("data-user", true)
    }

    // Legacy attribute
    if (data.legacy === true) {
        document.documentElement.setAttribute("data-theme", "legacy");
    }
});

// Replaces name
function nameReplacer(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        if (g_data.firstName && g_data.firstLegal) {
            if (node.previousElementSibling && node.previousElementSibling.tagName === "LABEL" && node.previousElementSibling.textContent === "First Name: ") {
                node.textContent = node.textContent.replace(new RegExp(g_data.firstLegal, "g"), g_data.firstName);

                // Add (legalname)
                let span = document.createElement("span");
                span.textContent = node.textContent;
                node.parentNode.appendChild(span, node);
                span.insertAdjacentHTML("beforebegin", `<i id="name-pass">(${g_data.firstLegal})</i>`);
            } else {
                node.textContent = node.textContent.replace(new RegExp(g_data.firstLegal, "g"), g_data.firstName);
            }
        }

        if (g_data.lastName && g_data.lastLegal) {
            if (node.previousElementSibling && node.previousElementSibling.tagName === "LABEL" && node.previousElementSibling.textContent === "Last Name: ") {
                node.textContent = node.textContent.replace(new RegExp(g_data.lastLegal, "g"), g_data.lastName);

                // Add (legalname)
                let span = document.createElement("span");
                span.textContent = node.textContent;
                node.parentNode.appendChild(span, node);
                span.insertAdjacentHTML("beforebegin", `<i id="name-pass">(${g_data.lastLegal})</i>`);
            } else {
                node.textContent = node.textContent.replace(new RegExp(g_data.lastLegal, "g"), g_data.lastName);
            }
        }
    } else {
        node.childNodes.forEach(nameReplacer);
    }
}

// Observers
// Dropdown Neptune
const NeptuneObserver = new MutationObserver(() => {
    // Add Neptune option in dropdown 
    let dropdown_menu = document.querySelector("ul[role='menu']");

    if (dropdown_menu) { // If menu
        // Constants
        const settings = Array.from(dropdown_menu.querySelectorAll("a")).find(item => item.textContent.trim() === "Settings");
        const Neptune = Array.from(dropdown_menu.querySelectorAll("a")).find(item => item.textContent.trim() === "Neptune");

        if (settings && !Neptune) { // Check it doesn't exist already
            let Neptune = settings.cloneNode(true); // Clone
            Neptune.textContent = "Neptune";
            Neptune.href = chrome.runtime.getURL("scripts/html/options.html");
            Neptune.style = "color: #d8a1f7 !important";
            settings.parentNode.insertAdjacentElement("afterend", Neptune);
        }
    }
});

// Spell check
const spellcheckObserver = new MutationObserver(() => {
    let spellcheck = document.querySelector("#edit-submission_spellchecker")

    if (spellcheck) { // If spellcheck
        spellcheck.click()
        spellcheckObserver.disconnect()
        spellcheckObserver.observe(document.body, { childList: true, subtree: true });
    }
});


// Name
const nameObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE && node.id !== "name-pass") {
                    nameReplacer(node);
                }
            });
        }
    }
});

// On content load
window.addEventListener("DOMContentLoaded", () => {
    // Set legal name
    let name = document.querySelector("#header > header > nav > ul:nth-child(2) > li:nth-child(6) > div > button > div > div._2Id_D.KWgmS._14XBn.util-neon-avatar-3J4cU > img");

    if (name) {
        let full = name.alt.split(" ")
        g_data.firstLegal = full[0]

        // Set lastLegal
        if (full.length == 2) {
            g_data.lastLegal = full[1]
        } else {
            // In the event of using display middle name
            let element = document.querySelectorAll("*");
            for (let el of element) {
                if (el.textContent.includes(g_data.firstLegal) && el.textContent.split(" ").length == 5977) {
                    let words = el.textContent.split(" ");
                    let index = words.indexOf(g_data.firstLegal);
                    g_data.lastLegal = words[index+2];
                    console.log("Backup: Set lastLegal to " + g_data.lastLegal) // Log
                    
                    break;
                } else if (el.alt && el.alt.includes(g_data.firstLegal) && el.alt.split(" ").length == 6) {
                    let words = el.alt.split(" ");
                    g_data.lastLegal = words[5]
                    console.log("Backup: Set lastLegal to " + g_data.lastLegal) // Log
                
                    break;
                }
            }
            if (!g_data.lastLegal) {
                if (document.querySelector("#edit-user-name-last-wrapper > div") && document.querySelector("#edit-user-name-last-wrapper > div").textContent) {
                    g_data.lastLegal = document.querySelector("#edit-user-name-last-wrapper > div").textContent
                    console.log("Backup: Set lastLegal to " + g_data.lastLegal) // Log
                }
            }
        }

        if (window.location.href.includes("learn.sowashco.org/user") || window.location.href.includes("/run/user/")) {
            let string = g_data.firstLegal + (g_data.lastLegal ? " " + g_data.lastLegal : "") + " | Schoology";

            if (g_data.firstName && g_data.firstLegal) {
                string = string.replace(new RegExp(g_data.firstLegal, "g"), g_data.firstName);
                document.title = string
            }
            if (g_data.lastName && g_data.lastLegal) {
                string = string.replace(new RegExp(g_data.lastLegal, "g"), g_data.lastName);
                document.title = string
            }
        }
    }

    // Observer
    if (document.body) {
        document.documentElement.style.visibility = "visible"; // Reveal the page

        // Neptune
        NeptuneObserver.observe(document.body, { childList: true, subtree: true });

        // Name
        if (g_data.firstName || g_data.lastName) {
            nameObserver.observe(document.body, { childList: true, subtree: true });
            nameReplacer(document.body);
        }

        // Spell check
        if (window.location.href.includes("learn.sowashco.org/assignment") && g_data.spellcheck === true) {
            spellcheckObserver.observe(document.body, { childList: true, subtree: true });
        }
    }

    // Fix PRIVACY POLICY
    const privacy_policy = document.querySelector("#site-navigation-footer > div > footer > div > div > nav > ul > li.Footer-vertical-divider-3-9qQ._1D8fw._2s0LQ > a");
    if (privacy_policy) {
        privacy_policy.style.textTransform = "none";
    }

    // Recently completed
    if (g_data.recent === true) {
        let button = document.querySelector(".button-reset.clickable.refresh-button");

        if (button) { // If button
            button.click()
        }
    }

    // Logo
    if (g_data.logo === "hide") {
        // Hide Logo
        let img = document.querySelector(".util-height-six-3PHnk.util-width-auto-1-HYR.util-max-width-sixteen-3-tkk.fjQuT._1tpub._2JX1Q > img") || document.querySelector("#header > header > nav > ul:nth-child(1) > li:nth-child(1) > a");

        if (img) {
            img.src = chrome.runtime.getURL("images/brand/SoWashCo.png");
            img.style.setProperty("visibility", "hidden", "important");
        }
    } else if (g_data.logo === "remove") {
        // Remove Logo
        let img = document.querySelector("#header > header > nav > ul:nth-child(1) > li:nth-child(1) > a") || document.querySelector("#header > header > nav > ul:nth-child(1) > li:nth-child(1) > a");

        if (img) {
            img.src = chrome.runtime.getURL("images/brand/SoWashCo.png");
            img.style.setProperty("display", "none", "important");
        }
    } else {
        // Replace Logo
        let img = document.querySelector(".util-height-six-3PHnk.util-width-auto-1-HYR.util-max-width-sixteen-3-tkk.fjQuT._1tpub._2JX1Q > img") || document.querySelector("#header > header > nav > ul:nth-child(1) > li:nth-child(1) > a");

        if (img) {
            img.src = chrome.runtime.getURL("images/brand/SoWashCo.png");
            img.style.setProperty("display", "block", "important");
        }
    }

    // Advanced grading
    if (g_data.grade == "advanced") {
        let category = document.querySelector("#center-top > div.content-top > div > div.info-container.not-admin > div.grading-info > div.grading-category.assignment-param");

        // If category
        if (category) {
            const textContent = category.textContent.trim();
            const words = textContent.split(" ");
            const categoryContent = words[1];

            const gradeText = document.querySelector("#center-top > div.content-top > div > div.info-container.not-admin > div.grading-grade > span.grade-title")
            gradeText.innerHTML = "Grade: (<i>" + categoryContent + "</i>)";
        }
    }

    // Footer (Neptune V.0)
    const support = document.querySelector("#site-navigation-footer > div > footer > div > div > nav > ul > li:nth-child(2)");
    if (support) {
        let Neptune = support.cloneNode(true);

        if (Neptune) {
            let a = Neptune.querySelector("a"); // <a>
            a.style = "color: #d8a1f7 !important; text-transform: none !important";
            a.href = chrome.runtime.getURL("scripts/html/options.html");
            a.textContent = ("Neptune " + manifest.version);

            support.parentElement.appendChild(Neptune);
        }
    }

});

// End
setTimeout(() => {
    console.log("Deployed Neptune");
}, 0);