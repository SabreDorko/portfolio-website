const posts = [
  {
    slug: 'introducing-keyquack',
    title: 'Introducing keyQuack',
    date: '2026-04-20',
    project: 'keyQuack',
    tags: ['APSU'],
    cover: 'images/project-keyquack',
    excerpt:
      'keyQuack is a productivity desktop pet that tracks your keyboard activity and rewards active use through a fishing minigame.',
  },
  {
    slug: 'keyquack-first-update',
    title: 'First Update — Quality of Life Fixes',
    date: '2026-05-08',
    project: 'keyQuack',
    tags: ['APSU'],
    cover: 'images/project-keyquack',
    excerpt:
      'Addressing early feedback — saving dive progress between sessions, reducing grind, and adding an hours field to the timer.',
  },
  {
    slug: 'bug-report-compilation-triage',
    title: 'Bug Report Compilation & Triage',
    date: '2026-06-17',
    project: 'Patchy',
    tags: ['Altivum Inc.'],
    cover: 'images/patchy-header',
    excerpt:
      'You shipped. People are playing. And now the reports are coming in. How do small teams handle the flood of scattered, noisy bug reports?',
  },
];

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function buildBlogImageCandidates(assetPath) {
  if (!assetPath) return [];
  if (/\.(png|jpe?g|webp|svg)$/i.test(assetPath)) return [assetPath];
  return ['.png', '.jpg', '.jpeg', '.webp', '.svg'].map((ext) => `${assetPath}${ext}`);
}

function applyBlogImageFallback(imgElement, assetPath) {
  const candidates = buildBlogImageCandidates(assetPath);
  if (candidates.length === 0) return;

  let current = 0;
  imgElement.onerror = () => {
    current += 1;
    if (current < candidates.length) {
      imgElement.src = candidates[current];
    }
  };
  imgElement.src = candidates[current];
}

function formatBlogDate(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function createBlogCard(post) {
  const card = document.createElement('a');
  card.className = 'blog-card';
  card.dataset.slug = post.slug;
  card.href = `blog.html?slug=${encodeURIComponent(post.slug)}`;

  const coverHTML = post.cover
    ? `<img class="blog-card-cover" alt="${post.title} cover" loading="lazy">`
    : '';

  const projectHTML = post.project
    ? `<span class="blog-project-tag">${post.project}</span>`
    : '';

  const tagsHTML = post.tags && post.tags.length > 0
    ? `<div class="blog-card-tags">${post.tags.map((tag) => `<span class="blog-tag">${tag}</span>`).join('')}</div>`
    : '';

  card.innerHTML = `
    ${coverHTML}
    <div class="blog-card-content">
      <div class="blog-card-meta">
        <span class="blog-card-date">${formatBlogDate(post.date)}</span>
      </div>
      ${projectHTML ? `<div class="blog-card-tags">${projectHTML}${post.tags ? post.tags.map((tag) => `<span class="blog-tag">${tag}</span>`).join('') : ''}</div>` : tagsHTML}
      <h2>${post.title}</h2>
      <p>${post.excerpt}</p>
      <span class="blog-read-more">Read More <i class="fa-solid fa-arrow-right"></i></span>
    </div>
  `;

  if (post.cover) {
    const coverImg = card.querySelector('.blog-card-cover');
    applyBlogImageFallback(coverImg, post.cover);
  }

  return card;
}

let blogInitialized = false;
let layoutTimeout = null;

function renderBlog(filter) {
  const grid = document.getElementById('blog-grid');
  if (!grid) return;

  const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!blogInitialized) {
    blogInitialized = true;
    sorted.forEach((post, index) => {
      const card = createBlogCard(post);
      card.style.animationDelay = `${index * 0.08}s`;
      grid.appendChild(card);
    });
    return;
  }

  if (layoutTimeout) {
    clearTimeout(layoutTimeout);
    layoutTimeout = null;
  }

  const query = (filter || '').toLowerCase().trim();
  const matchingSlugs = new Set(
    query
      ? sorted.filter((post) =>
          post.title.toLowerCase().includes(query) ||
          (post.tags && post.tags.some((tag) => tag.toLowerCase().includes(query))) ||
          (post.project && post.project.toLowerCase().includes(query))
        ).map((p) => p.slug)
      : sorted.map((p) => p.slug)
  );

  const cards = Array.from(grid.querySelectorAll('.blog-card'));

  cards.forEach((card) => {
    card.style.animation = 'none';
    if (card.style.display !== 'none') {
      card.style.opacity = '1';
      card.style.transform = '';
    }
  });

  const toHide = [];
  const toShow = [];
  const staying = [];

  cards.forEach((card) => {
    const shouldShow = matchingSlugs.has(card.dataset.slug);
    const isVisible = card.style.display !== 'none';

    if (!shouldShow && isVisible) toHide.push(card);
    else if (shouldShow && !isVisible) toShow.push(card);
    else if (shouldShow && isVisible) staying.push(card);
  });

  if (toHide.length === 0 && toShow.length === 0) {
    updateNoResults(grid, matchingSlugs.size);
    return;
  }

  const firstRects = new Map();
  staying.forEach((card) => {
    firstRects.set(card.dataset.slug, card.getBoundingClientRect());
  });

  toHide.forEach((card) => {
    card.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    card.style.opacity = '0';
    card.style.transform = 'scale(0.95)';
  });

  layoutTimeout = setTimeout(() => {
    layoutTimeout = null;

    toHide.forEach((card) => {
      card.style.display = 'none';
      card.style.transition = '';
      card.style.transform = '';
    });

    toShow.forEach((card) => {
      card.style.display = '';
      card.style.opacity = '0';
      card.style.transform = 'translateY(12px)';
    });

    staying.forEach((card) => {
      const firstRect = firstRects.get(card.dataset.slug);
      if (!firstRect) return;

      const lastRect = card.getBoundingClientRect();
      const dx = firstRect.left - lastRect.left;
      const dy = firstRect.top - lastRect.top;

      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;

      card.style.transition = 'none';
      card.style.transform = `translate(${dx}px, ${dy}px)`;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          card.style.transition = 'transform 0.3s ease';
          card.style.transform = '';
        });
      });
    });

    requestAnimationFrame(() => {
      toShow.forEach((card, index) => {
        setTimeout(() => {
          card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          card.style.opacity = '1';
          card.style.transform = '';
        }, index * 60);
      });
    });

    updateNoResults(grid, matchingSlugs.size);
  }, 200);
}

function updateNoResults(grid, visibleCount) {
  let noResults = grid.querySelector('.blog-no-results');

  if (visibleCount === 0) {
    if (!noResults) {
      noResults = document.createElement('p');
      noResults.className = 'blog-no-results';
      noResults.textContent = 'No posts matched your search.';
      grid.appendChild(noResults);
    }
  } else if (noResults) {
    noResults.remove();
  }
}

const blogSearchInput = document.getElementById('blog-search');
if (blogSearchInput) {
  blogSearchInput.addEventListener('input', debounce(() => {
    renderBlog(blogSearchInput.value);
  }, 250));
}

renderBlog();
