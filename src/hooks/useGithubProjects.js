import { useEffect, useState } from 'react';
import { github, projects as curated } from '../data';

const CACHE_KEY = `gh-repos-${github.username}`;
const CACHE_MS = 30 * 60 * 1000; // 30 menit, supaya tidak kena batas 60 request/jam dari GitHub
const THEMES = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'];

const LANG_INFO = {
  Dart: ['mobile', '📱'],
  Kotlin: ['mobile', '📱'],
  Swift: ['mobile', '📱'],
  'C#': ['game', '🎮'],
  TypeScript: ['backend', '⚙️'],
  Go: ['backend', '⚙️'],
  Python: ['backend', '🐍'],
  PHP: ['web', '🌐'],
  HTML: ['web', '🌐'],
  CSS: ['web', '🌐'],
  JavaScript: ['web', '🌐'],
  Vue: ['web', '🌐'],
};

const hidden = new Set(github.hide.map((n) => n.toLowerCase()));
const broken = new Set((github.brokenDemos || []).map((u) => u.replace(/\/$/, '')));
const repoUrl = (name) => `https://github.com/${github.username}/${name}`;

// Proyek di data.js (dipakai juga sebagai cadangan kalau GitHub tidak bisa diakses)
function fromCurated(p, i) {
  return { theme: THEMES[i % THEMES.length], tags: [], ...p, url: repoUrl(p.repo), label: `github/${p.repo}` };
}

// Gabungkan data live dari GitHub dengan pengaturan di data.js
function merge(repos) {
  const byName = new Map(curated.map((p) => [p.repo.toLowerCase(), p]));
  return repos
    .filter((r) => !r.fork && !r.archived && !hidden.has(r.name.toLowerCase()))
    .map((r, i) => {
      const own = byName.get(r.name.toLowerCase()) || {};
      const [cat, emoji] = LANG_INFO[r.language] || ['web', '📦'];
      const homepage = r.homepage && !broken.has(r.homepage.replace(/\/$/, '')) ? r.homepage : null;
      return {
        title: r.name.replace(/[-_]/g, ' '),
        cat,
        emoji,
        theme: THEMES[i % THEMES.length],
        desc: r.description || 'No description yet. Check out the code on GitHub.',
        tags: r.language ? [r.language] : [],
        demo: homepage,
        demoType: 'app',
        ...own,
        repo: r.name,
        url: r.html_url,
        label: `github/${r.name}`,
        stars: r.stargazers_count,
        updated: r.pushed_at,
        // urutan: yang bisa dicoba dulu, lalu yang terakhir di-update
        _order: (own.demo || homepage ? 0 : 1) * 1e13 - Date.parse(r.pushed_at || 0),
      };
    })
    .sort((a, b) => a._order - b._order);
}

function readCache() {
  try {
    const c = JSON.parse(sessionStorage.getItem(CACHE_KEY));
    if (c && Date.now() - c.t < CACHE_MS) return c.repos;
  } catch {}
  return null;
}

// Satu permintaan ke GitHub dipakai bersama oleh semua komponen (Projects, statistik About, dll.)
let inflight = null;
function loadRepos() {
  if (!inflight) {
    inflight = fetch(`https://api.github.com/users/${github.username}/repos?per_page=100&sort=pushed`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((repos) => {
        const slim = repos.map(({ name, description, language, homepage, html_url, stargazers_count, pushed_at, fork, archived }) => ({
          name, description, language, homepage, html_url, stargazers_count, pushed_at, fork, archived,
        }));
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), repos: slim }));
        } catch {}
        return slim;
      })
      .catch((e) => {
        inflight = null; // boleh dicoba lagi nanti
        throw e;
      });
  }
  return inflight;
}

export default function useGithubProjects() {
  const [state, setState] = useState(() => {
    const cached = readCache();
    return cached ? { list: merge(cached), status: 'live' } : { list: curated.map(fromCurated), status: 'loading' };
  });

  useEffect(() => {
    if (state.status === 'live') return;
    let alive = true;
    loadRepos()
      .then((repos) => alive && setState({ list: merge(repos), status: 'live' }))
      .catch(() => alive && setState((s) => ({ ...s, status: 'offline' })));
    return () => {
      alive = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return state;
}
