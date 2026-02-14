// ==UserScript==
// @name         CleanYouTube
// @namespace    http://tampermonkey.net/
// @version      4.2
// @description  Clean YouTube: No feed, no shorts, no sidebar. Centered search.
// @author       Lukas Hzb
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @match        *://www.youtube.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    /* --- CONFIGURATION: CSS --- */
    const css = `
        /* === PART 1: GLOBAL RULES (Home & Search) === */

        /* ALWAYS hide Voice Search & unnecessary elements */
        #voice-search-button,
        ytd-voice-search-renderer,
        ytd-notification-topbar-button-renderer,
        ytd-masthead #buttons,
        #guide-button,
        #guide,
        ytd-mini-guide-renderer {
            display: none !important;
        }

        /* Inner search icon (magnifying glass inside the search box) */
        /* Hide the icon AND collapse its reserved space to prevent the
           search bar from shifting left on focus */
        .ytSearchboxComponentInnerSearchIcon {
            display: none !important;
            width: 0 !important;
            min-width: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: hidden !important;
        }

        /* Lock padding on the search input area so it does not shift
           when focused (YouTube normally adds space for the hidden icon) */
        .ytSearchboxComponentInputBox {
            padding: 2px 4px 2px 16px !important;
            /* YouTube sets margin-left: 32px when unfocused (to reserve
               space for the search icon) and removes it on focus.
               Force it to 0 to prevent the visible width jump. */
            margin: 0 !important;
            flex: 1 1 0 !important;
            min-width: 0 !important;
        }

        /* Ensure the input container is a proper flex row so that
           inputBox + searchButton always fill it without resizing */
        .ytSearchboxComponentInputContainer {
            padding: 0 !important;
            display: flex !important;
            flex-wrap: nowrap !important;
            align-items: stretch !important;
        }

        /* Remove the 40px left margin that YouTube puts on the host,
           which causes the search bar to appear shifted to the right */
        .ytSearchboxComponentHost {
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
        }

        /* Cap the suggestions dropdown to the width of the inputBox */
        .ytSearchboxComponentSuggestionsContainer {
            max-width: 100% !important;
            box-sizing: border-box !important;
        }

        /* Search history / personalized suggestions (not general suggestions) */
        .ytSuggestionComponentPersonalizedSuggestion {
            display: none !important;
        }

        /* === PART 2: HOMEPAGE (Clean Mode) === */

        /* Hide Feed & Sidebar completely */
        body[data-clean-mode="true"] #page-manager,
        body[data-clean-mode="true"] #secondary,
        body[data-clean-mode="true"] #secondary-inner {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
        }

        /* MASTER CONTAINER: Force Fullscreen & Centering */
        body[data-clean-mode="true"] #masthead-container {
            position: fixed !important;
            inset: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: var(--yt-spec-base-background, #fff) !important;
            z-index: 99999 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            border-bottom: none !important;
            box-shadow: none !important;
            /* Shift content slightly upward for visual centering */
            /* padding-bottom: 15vh !important;  <-- Didn't work well with flex/box-sizing */
            box-sizing: border-box !important;
        }

        /* Flex Container for Logo & Search (stacked) */
        body[data-clean-mode="true"] ytd-masthead,
        body[data-clean-mode="true"] ytd-masthead > #container {
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            /* Move content up visually (not mathematically) */
            transform: translateY(-3vh) !important;
        }

        /* 1. LOGO */
        body[data-clean-mode="true"] ytd-masthead #start {
            width: auto !important;
            height: auto !important;
            margin: 0 0 25px 0 !important;
            padding: 0 !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            order: 1 !important;
            flex: 0 0 auto !important;
        }
        /* Skip-navigation element inside #start has residual width */
        body[data-clean-mode="true"] #skip-navigation {
            display: none !important;
        }
        body[data-clean-mode="true"] #logo-icon {
            transform: scale(2.0) !important;
            width: 100% !important;
        }


        /* 2. SEARCH CONTAINER */
        body[data-clean-mode="true"] ytd-masthead #center {
            order: 2 !important;
            width: 640px !important;
            min-width: 640px !important;
            max-width: 640px !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            margin: 0 !important;
            padding: 0 !important;
            flex: 0 0 auto !important;
        }

        /* 3. THE ACTUAL SEARCH BAR (Size & Style) */
        body[data-clean-mode="true"] ytd-searchbox {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            flex: 1 1 auto !important;
        }

        /* Inner search box components must also fill full width */
        body[data-clean-mode="true"] ytd-searchbox .ytSearchboxComponentHost,
        body[data-clean-mode="true"] ytd-searchbox #container,
        body[data-clean-mode="true"] ytd-searchbox .ytSearchboxComponentInputContainer {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
        }

        /* Search Form Design (Google Style) */
        body[data-clean-mode="true"] ytd-searchbox form {
            background-color: var(--yt-spec-base-background, #fff) !important;
            border: 1px solid var(--yt-spec-10-percent-layer, #dfe1e5) !important;
            box-shadow: 0 1px 6px rgba(32,33,36,0.1) !important;
            border-radius: 24px !important;
            height: 48px !important;
            display: flex !important;
            align-items: center !important;
            padding: 0 10px 0 15px !important;
            margin: 0 !important;
            width: 100% !important;
        }

        /* Hover Effects */
        body[data-clean-mode="true"] ytd-searchbox form:hover,
        body[data-clean-mode="true"] ytd-searchbox form:focus-within {
            background-color: var(--yt-spec-base-background, #fff) !important;
            box-shadow: 0 1px 6px rgba(32,33,36,0.28) !important;
            border-color: transparent !important;
        }

        /* Hide icons top right (End) */
        body[data-clean-mode="true"] ytd-masthead #end {
            display: none !important;
        }


        /* === PART 3: SEARCH RESULTS (Search Mode) === */

        /* Hide EVERYTHING except Header & Results */
        body[data-search-mode="true"] #chips-wrapper,
        body[data-search-mode="true"] ytd-feed-filter-chip-bar-renderer,
        body[data-search-mode="true"] #header, /* Filter bar */
        body[data-search-mode="true"] ytd-masthead #end {
            display: none !important;
        }

        /* Center search bar on results page */
        body[data-search-mode="true"] ytd-masthead #container {
            justify-content: center !important;
            position: relative !important;
        }

        /* Fix logo to the left (absolute) so it doesn't shift the center */
        body[data-search-mode="true"] ytd-masthead #start {
            position: absolute !important;
            left: 16px !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
            margin: 0 !important;
        }

        /* Search centered */
        body[data-search-mode="true"] ytd-masthead #center {
            margin: 0 auto !important;
            flex: 0 1 640px !important;
            width: auto !important;
        }

        /* Fix for Search Results: Remove Page Manager Margin (centered)
           AND create space at the top (80px) so the search has room */
        body[data-search-mode="true"] #page-manager {
            margin-left: 0 !important;
            padding-left: 0 !important;
            margin-top: 80px !important;
        }

        /* === PART 4: CHANNEL PAGES (Channel Mode) === */

        /* Hide Sidebar on Channel Pages */
        body[data-channel-mode="true"] #secondary,
        body[data-channel-mode="true"] #secondary-inner {
            display: none !important;
        }

        /* Remove Page Manager Margin on Channel Pages too (optional, if needed) */
        body[data-channel-mode="true"] #page-manager {
            margin-left: 0 !important;
        }

        /* === GLOBAL: REMOVE ANNOYANCES === */

        /* Remove "Report search predictions" */
        .ytSearchboxComponentReportButton {
            display: none !important;
        }

        /* Hide thumbnails in search suggestions */
        .ytSuggestionComponentVisualSuggestThumbnail,
        .ytSuggestionComponentIcon,
        .ytSearchboxComponentSuggestionThumbnail {
            display: none !important;
        }

        /* === GLOBAL: HIDE SHORTS === */

        /* Navigation (Sidebar) */
        ytd-guide-entry-renderer:has(a[href^="/shorts"]),
        ytd-mini-guide-entry-renderer:has(a[href^="/shorts"]),
        ytm-pivot-bar-item-renderer[item-id="shorts"] {
            display: none !important;
        }

        /* Fallback for browsers without :has */
        ytd-guide-entry-renderer a[href^="/shorts"],
        ytd-mini-guide-entry-renderer a[href^="/shorts"] {
            display: none !important;
        }

        /* Shorts Shelves (Home, Search, Channel) */
        ytd-reel-shelf-renderer,
        ytd-rich-shelf-renderer[is-shorts] {
            display: none !important;
        }

        /* Shorts Videos in Grids/Lists */
        ytd-video-renderer:has(a[href^="/shorts"]),
        ytd-grid-video-renderer:has(a[href^="/shorts"]),
        ytd-rich-item-renderer:has(a[href^="/shorts"]) {
            display: none !important;
        }

        /* Channel Tabs */
        yt-tab-shape[tab-title="Shorts"] {
            display: none !important;
        }
    `;

    // Inject CSS
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);


    /* --- LOGIC (Detect Home vs. Search vs. Channel) --- */

    function updateMode() {
        const body = document.body;
        if (!body) return;

        const path = window.location.pathname;
        const href = window.location.href;

        // Definitions
        const isResults = href.includes('/results');
        const isWatch = href.includes('/watch');
        const isHome = path === '/' && !isResults && !isWatch;

        // 1. Home Mode
        if (isHome) {
            if (body.getAttribute('data-clean-mode') !== 'true') {
                body.setAttribute('data-clean-mode', 'true');
            }
        } else {
            if (body.getAttribute('data-clean-mode') === 'true') {
                body.removeAttribute('data-clean-mode');
            }
        }

        // 2. Search Mode
        if (isResults) {
             if (body.getAttribute('data-search-mode') !== 'true') {
                body.setAttribute('data-search-mode', 'true');
            }
        } else {
            if (body.getAttribute('data-search-mode') === 'true') {
                body.removeAttribute('data-search-mode');
            }
        }

        // 3. Channel Mode (Hide Sidebar)
        const isChannel = href.includes('/@') || href.includes('/channel/') || href.includes('/c/') || href.includes('/u/');
        if (isChannel) {
            if (body.getAttribute('data-channel-mode') !== 'true') {
                 body.setAttribute('data-channel-mode', 'true');
            }
        } else {
             if (body.getAttribute('data-channel-mode') === 'true') {
                 body.removeAttribute('data-channel-mode');
             }
        }
    }

    // Trigger
    updateMode();
    window.addEventListener('yt-navigate-start', updateMode);
    window.addEventListener('yt-navigate-finish', updateMode);
    window.addEventListener('popstate', updateMode);

    // Observer
    const observer = new MutationObserver((mutations) => {
        updateMode();
    });

    const initObserver = setInterval(() => {
        if (document.body) {
            observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'style'] });
            clearInterval(initObserver);
        }
    }, 100);

    // Safety Loop
    setInterval(updateMode, 500);

})();
