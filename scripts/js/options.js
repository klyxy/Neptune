// Refresh Page
function refresh() {
    chrome.storage.local.get(['theme', 'accent'], (data) => {

        // Theme
        document.documentElement.setAttribute("data-theme", data.theme || "light");

        // Accent
        if (data.accent) {
            document.documentElement.setAttribute("data-accent", data.accent);
        }
    });
}

// Page Load
document.addEventListener('DOMContentLoaded', function () {
    // Change Icon
    // Get Date
    const now = new Date()
    const icon = document.querySelector("#icon")

    // Date
    if ((now.getMonth() === 5) && (icon)) {
        icon.src = "../../images/icons/alt128.png";
    }

    // Elements
    const modal = document.getElementById("modal");
    const version = document.getElementById('version');
    const versionHeader = document.getElementById("version-header")
    const memory = document.getElementById("memory");
    const close = document.getElementById("close");
    const build = document.getElementById("build");

    // Manifest
    const manifest = chrome.runtime.getManifest()

    // Version Button
    if (version) {
        version.textContent = `Version ${manifest.version}`;

        // Modal Open (Click)
        version.addEventListener("click", function () {
            const memoryPerformance = performance.memory

            // Memory
            if (memory) {
                memory.textContent = `Memory Usage: ${Math.round(memoryPerformance.usedJSHeapSize / 1024 / 1024)} MB / ${Math.round(memoryPerformance.totalJSHeapSize / 1024 / 1024)} MB`;
            }

            modal.style.display = "block";
        });
    } else {
        console.error("Missing: version")
    }

    // Version Header
    if (versionHeader) {
        versionHeader.textContent = `Version ${manifest.version}`;
    } else {
        console.error("Missing: versionHeader")
    }

    // Build
    if (build) {
        build.textContent = `Build: ${manifest.version}`;
    } else {
        console.error("Missing: build")
    }

    // Close (Click)
    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    load();

    // Save (Click)
    document.getElementById('save').addEventListener('click', function () {
        save(true);
    });
});

// Save Function
function save(display) {
    document.getElementById('save').disabled = true;

    setTimeout(() => {
        document.getElementById('save').disabled = false;
    }, 2000);

    const options = {

        // Theme
        theme: document.getElementById('theme').value,
        accent: document.getElementById('accent').value,
        logo: document.getElementById('logo').value,

        // Name
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,

        // QOL
        grade: document.getElementById('grade').value,
        profile: document.getElementById('profile').checked,
        recent: document.getElementById('recent').checked,
        spellcheck: document.getElementById('spell-check').checked,

        // Other
        legacy: document.getElementById('legacy').checked,
    };

    // Save
    chrome.storage.local.set(options, () => {
        const status = document.getElementById('status');

        if (display == true) {
            status.style.display = "inline-block";
            status.style.opacity = 1;
        }

        // Update
        refresh();

        // Fade Status
        setTimeout(() => {
            status.style.opacity = 0;
        }, 750);
        setTimeout(() => {
            status.style.display = "none";
        }, 1050);
    });
}

// Load Function
function load() {
    chrome.storage.local.get({
        // Defaults

        // Theme
        theme: "light",
        accent: 'blue',
        logo: 'default',

        // Name
        firstName: null,
        lastName: null,

        // QOL
        grade: 'advanced',
        profile: true,
        recent: true,

        spellcheck: true,

        // Other
        legacy: false,
    }, (items) => {
        // Element Ids
        console.log(items)
        // Theme
        document.getElementById('theme').value = items.theme;
        document.getElementById('accent').value = items.accent;
        document.getElementById('logo').value = items.logo;

        // Name
        document.getElementById('firstName').value = items.firstName;
        document.getElementById('lastName').value = items.lastName;

        // QOL
        document.getElementById('grade').value = items.grade;
        document.getElementById('profile').checked = items.profile;
        document.getElementById('recent').checked = items.recent;
        document.getElementById('spell-check').checked = items.spellcheck;

        // Other
        document.getElementById('legacy').checked = items.legacy;
    });
};

// Reset
document.getElementById('reset-data').addEventListener('click', function () {
    // Confirm
    if (confirm('Are you sure you want to reset all data?')) {
        chrome.storage.local.clear(() => {
            const status = document.getElementById('reset-status');

            load();
            setTimeout(() => {
                save(false);
            }, 50);
            setTimeout(() => {
                refresh();
            }, 70)

            modal.style.display = "none"
            status.style.display = "inline-block";
            status.style.opacity = 1;

            // Fade Status
            setTimeout(() => {
                status.style.opacity = 0;
            }, 750);
            setTimeout(() => {
                status.style.display = "none";
            }, 1050);
        });
    }
});

// Update On Page Load
refresh();