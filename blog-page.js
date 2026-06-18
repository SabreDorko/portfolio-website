const posts = [
  {
    slug: 'introducing-keyquack',
    title: 'Introducing keyQuack',
    date: '2026-04-20',
    project: 'keyQuack',
    tags: ['APSU'],
    cover: 'images/project-keyquack',
  },
  {
    slug: 'keyquack-first-update',
    title: 'First Update — Quality of Life Fixes',
    date: '2026-05-08',
    project: 'keyQuack',
    tags: ['APSU'],
    cover: 'images/project-keyquack',
  },
  {
    slug: 'bug-report-compilation-triage',
    title: 'Bug Report Compilation & Triage',
    date: '2026-06-17',
    project: 'Patchy',
    tags: ['Altivum Inc.'],
    cover: 'images/patchy-header',
  },
];

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

function getSlugFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('slug');
}

function findPost(slug) {
  return posts.find((a) => a.slug === slug) || null;
}

async function loadBlogContent(slug) {
  const response = await fetch(`blog/${encodeURIComponent(slug)}.html`);
  if (!response.ok) throw new Error('Post not found');
  return response.text();
}

async function renderBlogPage() {
  const slug = getSlugFromURL();
  const titleEl = document.getElementById('blog-title');
  const dateEl = document.getElementById('blog-date');
  const projectEl = document.getElementById('blog-project');
  const tagsEl = document.getElementById('blog-tags');
  const bodyEl = document.getElementById('blog-body');
  const coverEl = document.getElementById('blog-cover');

  if (!slug) {
    titleEl.textContent = 'Post Not Found';
    bodyEl.innerHTML = '<p>No post was specified. <a href="index.html#blog">Browse all posts</a>.</p>';
    return;
  }

  const post = findPost(slug);

  if (!post) {
    titleEl.textContent = 'Post Not Found';
    bodyEl.innerHTML = '<p>This post doesn\'t exist. <a href="index.html#blog">Browse all posts</a>.</p>';
    return;
  }

  document.title = `${post.title} | Jay Walpole`;
  titleEl.textContent = post.title;
  dateEl.textContent = formatBlogDate(post.date);

  if (tagsEl) {
    const projectTag = post.project
      ? `<span class="blog-project-tag">${post.project}</span>`
      : '';
    const tagChips = post.tags
      ? post.tags.map((tag) => `<span class="blog-tag">${tag}</span>`).join('')
      : '';
    tagsEl.innerHTML = projectTag + tagChips;
  }

  if (post.cover && coverEl) {
    const img = document.createElement('img');
    img.alt = `${post.title} cover`;
    applyBlogImageFallback(img, post.cover);
    coverEl.appendChild(img);
    coverEl.style.display = 'block';
  }

  try {
    const content = await loadBlogContent(slug);
    bodyEl.innerHTML = content;
  } catch {
    bodyEl.innerHTML = '<p>Unable to load post content. <a href="index.html#blog">Browse all posts</a>.</p>';
  }
}

renderBlogPage();
