/* =============================================
   GitHub Profile Finder — app.js
   ============================================= */

// ⚠️ PASTE YOUR NEW GITHUB TOKEN HERE (keep this file private, never share it)
const TOKEN = "https://api.github.com/users/";

// Language → colour mapping (matches GitHub's colours)
const LANG_COLORS = {
  JavaScript: '#f7df1e',
  TypeScript: '#3178c6',
  Python:     '#3572A5',
  Java:       '#b07219',
  'C++':      '#f34b7d',
  C:          '#555555',
  'C#':       '#178600',
  Ruby:       '#701516',
  Go:         '#00ADD8',
  Rust:       '#dea584',
  PHP:        '#4F5D95',
  Swift:      '#F05138',
  Kotlin:     '#A97BFF',
  Dart:       '#00B4AB',
  HTML:       '#e34c26',
  CSS:        '#563d7c',
  Shell:      '#89e051',
  Lua:        '#000080',
  Vue:        '#41b883',
  SCSS:       '#c6538c',
  Svelte:     '#ff3e00',
  Elixir:     '#6e4a7e',
  Haskell:    '#5e5086',
};

/* ------------------------------------------
   Utility helpers
   ------------------------------------------ */

/**
 * Escape HTML special characters to prevent XSS.
 * @param {*} s - value to escape
 * @returns {string}
 */
function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Format large numbers to compact form (e.g. 1200 → "1.2k").
 * @param {number} n
 * @returns {string}
 */
function fmtNum(n) {
  n = n || 0;
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'k';
  return String(n);
}

/**
 * Format an ISO date string to a human-readable date.
 * @param {string} s - ISO date string
 * @returns {string}
 */
function fmtDate(s) {
  return new Date(s).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

/* ------------------------------------------
   Search actions
   ------------------------------------------ */

/**
 * Fill the input with a preset username and trigger a search.
 * Called by the suggestion buttons in the HTML.
 * @param {string} name
 */
function quickSearch(name) {
  document.getElementById('userInput').value = name;
  fetchProfile();
}

// Allow pressing Enter inside the search input
document.getElementById('userInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') fetchProfile();
});

/**
 * Read the username from the input, call the GitHub API,
 * then hand off to render() or show an error.
 */
async function fetchProfile() {
  const username = document.getElementById('userInput').value.trim();
  if (!username) return;

  const el = document.getElementById('result');

  // Show loading spinner
  el.innerHTML = `
    <div class="loading-wrap">
      <div class="loader"></div><br>
      fetching <span style="color:var(--green)">${esc(username)}</span>...
    </div>`;

  try {
    // Attach token header (raises rate limit from 60 → 5,000 req/hour)
    const headers = TOKEN && TOKEN !== 'PASTE_YOUR_NEW_TOKEN_HERE'
      ? { 'Authorization': `Bearer ${TOKEN}` }
      : {};

    // Fetch user profile and top repos in parallel
    const [uRes, rRes] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers }),
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=stars&per_page=6`, { headers }),
    ]);

    if (!uRes.ok) {
      el.innerHTML = `<div class="error-card">user "${esc(username)}" not found on GitHub</div>`;
      return;
    }

    const user  = await uRes.json();
    const repos = rRes.ok ? await rRes.json() : [];

    render(user, repos);

  } catch (err) {
    el.innerHTML = `<div class="error-card">network request failed — check your connection</div>`;
  }
}

/* ------------------------------------------
   Rendering
   ------------------------------------------ */

/**
 * Build and inject the full profile + repos HTML.
 * @param {object} u     - GitHub user object
 * @param {object[]} repos - GitHub repos array
 */
function render(u, repos) {
  const el = document.getElementById('result');

  // ---- Info chips (location, company, website, twitter) ----
  const chips = [];

  if (u.location) {
    chips.push(`
      <span class="chip">
        <svg viewBox="0 0 16 16">
          <path d="M8 0a5 5 0 00-5 5c0 3.75 5 11 5 11s5-7.25 5-11a5 5 0 00-5-5zm0 7a2 2 0 110-4 2 2 0 010 4z"/>
        </svg>
        ${esc(u.location)}
      </span>`);
  }

  if (u.company) {
    chips.push(`
      <span class="chip">
        <svg viewBox="0 0 16 16">
          <path d="M1.5 14.5v-13h9v13h-9zm1-12v11h7v-11h-7zm6 2h-5v1h5v-1zm0 2h-5v1h5v-1zm0 2h-5v1h5v-1zm5 8v-8l-3-3v11h3z"/>
        </svg>
        ${esc(u.company.replace(/^@/, ''))}
      </span>`);
  }

  if (u.blog) {
    const blogUrl = u.blog.startsWith('http') ? u.blog : 'https://' + u.blog;
    chips.push(`
      <span class="chip">
        <svg viewBox="0 0 16 16">
          <path d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0
            .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83
            l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75
            0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"/>
        </svg>
        <a href="${esc(blogUrl)}" target="_blank">${esc(u.blog.replace(/^https?:\/\//, ''))}</a>
      </span>`);
  }

  if (u.twitter_username) {
    chips.push(`
      <span class="chip">
        <svg viewBox="0 0 16 16">
          <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0016 3.542
            a6.658 6.658 0 01-1.889.518 3.301 3.301 0 001.447-1.817 6.533 6.533 0 01-2.087.793A3.286 3.286 0
            007.875 6.03a9.325 9.325 0 01-6.767-3.429 3.289 3.289 0 001.018 4.382A3.323 3.323 0 01.64 6.575v.045
            a3.288 3.288 0 002.632 3.218 3.203 3.203 0 01-.865.115 3.23 3.23 0 01-.614-.057 3.283 3.283 0 003.067
            2.277A6.588 6.588 0 010 13.398a9.29 9.29 0 005.034 1.474"/>
        </svg>
        @${esc(u.twitter_username)}
      </span>`);
  }

  // ---- Repos grid ----
  const reposHtml = repos.length === 0 ? '' : `
    <div class="repos-section">
      <div class="section-title">top repositories</div>
      <div class="repo-grid">
        ${repos.map(buildRepoCard).join('')}
      </div>
    </div>`;

  // ---- Inject full profile HTML ----
  el.innerHTML = `
    <div class="profile-card">
      <div class="profile-banner"></div>
      <div class="profile-body">

        <div class="profile-top">
          <div class="avatar-wrap">
            <img class="avatar" src="${esc(u.avatar_url)}" alt="${esc(u.login)}" />
            <div class="avatar-ring"></div>
          </div>
          <div class="profile-meta">
            <div class="profile-name">${esc(u.name || u.login)}</div>
            <div class="profile-login">${esc(u.login)}</div>
            ${u.bio ? `<p class="profile-bio">${esc(u.bio)}</p>` : ''}
            <a class="gh-btn" href="https://github.com/${esc(u.login)}" target="_blank">
              <svg width="13" height="13" viewBox="0 0 16 16" style="fill:currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
                  0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
                  -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66
                  .07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15
                  -.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27
                  .68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12
                  .51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48
                  0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8
                  c0-4.42-3.58-8-8-8z"/>
              </svg>
              view on github ↗
            </a>
          </div>
        </div>

        <div class="stats-row">
          <div class="stat">
            <div class="stat-val">${fmtNum(u.followers)}</div>
            <div class="stat-lbl">Followers</div>
          </div>
          <div class="stat">
            <div class="stat-val">${fmtNum(u.following)}</div>
            <div class="stat-lbl">Following</div>
          </div>
          <div class="stat">
            <div class="stat-val">${fmtNum(u.public_repos)}</div>
            <div class="stat-lbl">Repos</div>
          </div>
        </div>

        ${chips.length ? `<div class="info-chips">${chips.join('')}</div>` : ''}

      </div>
      <div class="member-since">joined github on ${fmtDate(u.created_at)}</div>
    </div>

    ${reposHtml}`;
}

/**
 * Build the HTML string for a single repository card.
 * @param {object} r - GitHub repo object
 * @returns {string}
 */
function buildRepoCard(r) {
  const dotColor = LANG_COLORS[r.language] || '#666';

  const descHtml = r.description
    ? `<p class="repo-desc">${esc(r.description)}</p>`
    : `<p class="repo-desc" style="color:var(--subtle);font-style:italic;">no description</p>`;

  const starHtml = r.stargazers_count
    ? `<span class="repo-badge star">★ ${fmtNum(r.stargazers_count)}</span>`
    : '';

  const forkHtml = r.forks_count
    ? `<span class="repo-badge fork">⑂ ${fmtNum(r.forks_count)}</span>`
    : '';

  const langHtml = r.language
    ? `<span class="repo-badge">
         <span class="lang-dot" style="background:${dotColor}"></span>
         ${esc(r.language)}
       </span>`
    : '';

  return `
    <div class="repo-card">
      <a class="repo-name" href="${esc(r.html_url)}" target="_blank">${esc(r.name)}</a>
      ${descHtml}
      <div class="repo-footer">
        ${starHtml}
        ${forkHtml}
        ${langHtml}
      </div>
    </div>`;
}
