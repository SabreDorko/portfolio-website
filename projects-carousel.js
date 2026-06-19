const projects = [
  {
    title: 'keyQuack',
    shortDescription:
      'A desktop pet built in Godot that tracks your keyboard activity and rewards active use via a fishing minigame.',
    fullDescription:
      'keyQuack is a desktop pet that tracks keyboard activity and rewards productivity. The project encourages progress via a fishing minigame, encouraging active use when work gets boring.',
    tech: ['Godot', 'GDScript', 'Python', '2D Assets'],
    links: [
      { label: 'View on Itch.io', url: 'https://sabredorko.itch.io/keyquack' }
    ],
    thumbnail: 'images/project-keyquack',
    media: [
      {
        type: 'image',
        src: 'images/project-keyquack',
        alt: 'keyQuack thumbnail'
      },
      {
        type: 'image',
        src: 'images/keyquack-fishing-menus',
        alt: 'Fishing menus'
      },
    ]
  },
  {
    title: 'Bond Builder',
    shortDescription:
      'A work-in-progress sandbox game built in Unity where players can build molecules from individual atoms.',
    fullDescription:
      'Bond Builder is a 3D sandbox that allows players to build molecules from individual atoms. It supports electron display, bond types, and algorithmic molecule name generation.',
    tech: ['Unity', 'C#', 'Simulation Systems'],
    links: [{ label: 'View Demo Video', url: 'https://youtu.be/Xq2t3gfDcBk?si=8QdUuaNx0oI5io0r' }],
    thumbnail: 'images/project-bond-builder',
    media: [
      {
        type: 'image',
        src: 'images/project-bond-builder',
        alt: 'Bond Builder thumbnail'
      },
      {
        type: 'image',
        src: 'images/bond-builder-table',
        alt: 'In-game assembly table'
      },
      {
        type: 'youtube',
        videoId: 'Xq2t3gfDcBk',
        alt: 'Bond Builder demo video'
      }
    ]
  },
  {
    title: 'Owlbear Extensions',
    shortDescription:
      'Using the Owlbear API, I have developed two extensions to manage character sheets for different tabletop RPG systems.',
    fullDescription:
      'These Owlbear extensions provide character sheet managers for two niche TTRPGs. Being built on the Owlbear API allows players to access and edit their character sheets without needing to toggle between multiple apps or browser tabs.',
    tech: ['HTML', 'Owlbear API', 'Vite', 'JavaScript'],
    links: [
      { label: 'Will of The Cursed Extension', url: 'https://github.com/SabreDorko/JJK-WoCS-Owlbear-Sheets' },
      { label: 'Kids on Bikes Extension', url: 'https://github.com/SabreDorko/KoB-Character-Sheets-Owlbear-Extension' }
    ],
    thumbnail: 'images/project-owlbear',
    media: [
      {
        type: 'image',
        src: 'images/project-owlbear',
        alt: 'Extensions enabled in Owlbear'
      },
    ]
  },
  {
    title: 'Patchy',
    shortDescription:
      'A bug triage companion for indie developers that pools reports from GitHub, itch.io, and Discord into one sorted dashboard.',
    fullDescription:
      'Patchy is a bug triage tool built for indie developers and small studios. It pools reports from wherever they come in — GitHub Issues, itch.io, Discord, direct developer notes — and processes them in one place. Every incoming report gets scored algorithmically by category, severity, and uniqueness, then routed accordingly so your inbox isn\'t the triage system.',
    tech: ['Python', 'Discord API', 'NLP'],
    links: [
      { label: 'Read the Post', url: 'blog.html?slug=bug-report-compilation-triage' }
    ],
    thumbnail: 'images/patchy-header',
    media: [
      {
        type: 'image',
        src: 'images/patchy-header',
        alt: 'Patchy — Bug triage for indie developers'
      },
    ]
  },
  {
    title: 'Portfolio Website',
    shortDescription:
      'The website you\'re reading right now! Built to showcase my work with my own personal touch and style.',
    fullDescription:
      'This website is built to showcase work with strong visual identity and smooth interactions. The projects module supports card-level browsing and a media-rich modal for deeper case-study style walkthroughs.',
    tech: ['HTML', 'CSS', 'JavaScript'],
    links: [{ label: '', url: '' }],
    thumbnail: 'images/project-portfolio',
    media: [
      {
        type: 'image',
        src: 'images/project-portfolio',
        alt: 'Portfolio preview'
      },
    ]
  }
];

const projectsTrack = document.getElementById('projects-track');
const projectsViewport = document.querySelector('.projects-viewport');
const projectsPrev = document.getElementById('projects-prev');
const projectsNext = document.getElementById('projects-next');
const projectsPagination = document.getElementById('projects-pagination');

const modal = document.getElementById('project-modal');
const modalOverlay = document.getElementById('project-modal-overlay');
const modalClose = document.getElementById('project-modal-close');
const modalMain = document.getElementById('project-modal-main');
const galleryViewport = document.querySelector('.gallery-viewport');
const galleryTrack = document.getElementById('gallery-track');
const galleryPrev = document.getElementById('gallery-prev');
const galleryNext = document.getElementById('gallery-next');
const galleryPagination = document.getElementById('gallery-pagination');
const galleryCaption = document.getElementById('gallery-caption');
const projectDots = [];
const galleryDots = [];

let cardsPerPage = getCardsPerPage();
let firstVisibleProjectIndex = 0;
let isProjectAnimating = false;
let currentProjectIndex = 0;
let galleryIndex = 0;
let isGalleryAnimating = false;
let gallerySwipePointerId = null;
let gallerySwipeStartX = 0;
let gallerySwipeStartY = 0;
let isGalleryTouchActive = false;

const gallerySwipeThreshold = 48;

function buildImageCandidates(assetPath) {
  if (!assetPath) return [];

  const hasExtension = /\.(png|jpe?g|webp|svg)$/i.test(assetPath);
  if (hasExtension) return [assetPath];

  return ['.png', '.jpg', '.jpeg', '.webp', '.svg'].map((ext) => `${assetPath}${ext}`);
}

function applyImageFallback(imgElement, assetPath) {
  const candidates = buildImageCandidates(assetPath);
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

function getCardsPerPage() {
  if (window.innerWidth <= 900) return 1;
  return 3;
}

function renderProjects() {
  projectsTrack.innerHTML = '';

  for (let i = 0; i < projects.length; i += 1) {
    const projectIndex = (firstVisibleProjectIndex + i) % projects.length;
    projectsTrack.appendChild(createProjectCard(projects[projectIndex], projectIndex));
  }

  ensureProjectPaginationDots();

  updateProjectSizing();
  setVisibleProjectWindow();
  updateProjectPagination();
}

function ensureProjectPaginationDots() {
  if (projectDots.length === projects.length) return;

  projectsPagination.innerHTML = '';
  projectDots.length = 0;

  for (let i = 0; i < projects.length; i += 1) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'page-dot';
    dot.setAttribute('aria-label', `Go to project ${i + 1}`);
    dot.addEventListener('click', () => goToProject(i));
    projectsPagination.appendChild(dot);
    projectDots.push(dot);
  }
}

function setVisibleProjectWindow(extraVisibleIndices = []) {
  const cards = Array.from(projectsTrack.querySelectorAll('.project-card'));
  const visible = new Set(extraVisibleIndices);

  for (let i = 0; i < cardsPerPage; i += 1) {
    visible.add(i);
  }

  cards.forEach((card, index) => {
    const shouldShow = visible.has(index);
    card.classList.toggle('is-hidden', !shouldShow);
    card.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
    if (!shouldShow) {
      card.setAttribute('tabindex', '-1');
    } else {
      card.setAttribute('tabindex', '0');
    }
  });
}

function setVisibleProjectWindowInstant(extraVisibleIndices = []) {
  projectsTrack.classList.add('instant-visibility');
  setVisibleProjectWindow(extraVisibleIndices);
  requestAnimationFrame(() => {
    projectsTrack.classList.remove('instant-visibility');
  });
}

function createProjectCard(project, actualIndex) {
  const card = document.createElement('article');
  card.className = 'project-card';
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Open details for ${project.title}`);
  card.dataset.projectIndex = String(actualIndex);

  card.innerHTML = `
    <img class="project-card-media" alt="${project.title} preview" loading="lazy">
    <div class="project-card-body">
      <h2>${project.title}</h2>
      <p>${project.shortDescription}</p>
      <div class="project-card-links">
        ${project.links.map((link) => `<a href="${link.url}" target="_blank" rel="noopener">${link.label}</a>`).join('')}
      </div>
    </div>
  `;

  const cardImage = card.querySelector('.project-card-media');
  applyImageFallback(cardImage, project.thumbnail);

  card.addEventListener('click', () => {
    openProjectModal(Number(card.dataset.projectIndex));
  });
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openProjectModal(Number(card.dataset.projectIndex));
    }
  });

  return card;
}

function updateProjectSizing() {
  const gapPx = cardsPerPage === 1 ? 16 : 24;
  const cardWidth = `calc((100% - ${(cardsPerPage - 1) * gapPx}px) / ${cardsPerPage})`;
  const cards = projectsTrack.querySelectorAll('.project-card');
  cards.forEach((card) => {
    card.style.minWidth = cardWidth;
  });
  projectsTrack.style.transition = 'none';
  projectsTrack.style.transform = 'translateX(0px)';
  requestAnimationFrame(() => {
    projectsTrack.style.transition = 'transform 0.35s ease';
  });
  setVisibleProjectWindow();
}

function getProjectStepSize() {
  const card = projectsTrack.querySelector('.project-card');
  if (!card) return 0;

  const cardStyle = window.getComputedStyle(projectsTrack);
  const gap = parseFloat(cardStyle.columnGap || cardStyle.gap || '24');
  const cardWidth = card.getBoundingClientRect().width;
  return cardWidth + gap;
}

function goToNextProject() {
  if (isProjectAnimating) return;

  const step = getProjectStepSize();
  if (!step) return;

  isProjectAnimating = true;
  if (projectsViewport) {
    projectsViewport.classList.add('is-rotating');
  }
  updateProjectPagination((firstVisibleProjectIndex + 1) % projects.length);
  void projectsPagination.offsetWidth;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setVisibleProjectWindow([cardsPerPage]);
      projectsTrack.style.transition = 'transform 0.35s ease';
      projectsTrack.style.transform = `translateX(-${step}px)`;
    });
  });

  const onTransitionEnd = () => {
    projectsTrack.removeEventListener('transitionend', onTransitionEnd);

    const firstCard = projectsTrack.firstElementChild;
    if (firstCard) {
      projectsTrack.appendChild(firstCard);
    }

    projectsTrack.style.transition = 'none';
    projectsTrack.style.transform = 'translateX(0px)';
    void projectsTrack.offsetWidth;
    projectsTrack.style.transition = 'transform 0.35s ease';

    firstVisibleProjectIndex = (firstVisibleProjectIndex + 1) % projects.length;
    setVisibleProjectWindowInstant();
    isProjectAnimating = false;
    if (projectsViewport) {
      requestAnimationFrame(() => {
        projectsViewport.classList.remove('is-rotating');
      });
    }
    updateProjectPagination();
  };

  projectsTrack.addEventListener('transitionend', onTransitionEnd);
}

function goToPrevProject() {
  if (isProjectAnimating) return;

  const step = getProjectStepSize();
  if (!step) return;

  isProjectAnimating = true;
  if (projectsViewport) {
    projectsViewport.classList.add('is-rotating');
  }
  updateProjectPagination((firstVisibleProjectIndex - 1 + projects.length) % projects.length);
  void projectsPagination.offsetWidth;

  const lastCard = projectsTrack.lastElementChild;
  if (lastCard) {
    projectsTrack.insertBefore(lastCard, projectsTrack.firstElementChild);
  }

  projectsTrack.style.transition = 'none';
  projectsTrack.style.transform = `translateX(-${step}px)`;
  void projectsTrack.offsetWidth;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setVisibleProjectWindow([cardsPerPage]);
      projectsTrack.style.transition = 'transform 0.35s ease';
      projectsTrack.style.transform = 'translateX(0px)';
    });
  });

  const onTransitionEnd = () => {
    projectsTrack.removeEventListener('transitionend', onTransitionEnd);
    projectsTrack.style.transition = 'none';
    projectsTrack.style.transform = 'translateX(0px)';
    void projectsTrack.offsetWidth;
    projectsTrack.style.transition = 'transform 0.35s ease';

    firstVisibleProjectIndex = (firstVisibleProjectIndex - 1 + projects.length) % projects.length;
    setVisibleProjectWindowInstant();
    isProjectAnimating = false;
    if (projectsViewport) {
      requestAnimationFrame(() => {
        projectsViewport.classList.remove('is-rotating');
      });
    }
    updateProjectPagination();
  };

  projectsTrack.addEventListener('transitionend', onTransitionEnd);
}

function goToProject(projectIndex) {
  firstVisibleProjectIndex = ((projectIndex % projects.length) + projects.length) % projects.length;
  renderProjects();
}

function updateProjectPagination(activeIndex = firstVisibleProjectIndex) {
  ensureProjectPaginationDots();

  projectDots.forEach((dot, index) => {
    dot.classList.toggle('active', index === activeIndex);
  });
}

function openProjectModal(projectIndex) {
  currentProjectIndex = projectIndex;
  galleryIndex = 0;

  const project = projects[projectIndex];
  const tech = project.tech.join(' | ');
  const links = project.links
    .map((link) => `<a href="${link.url}" target="_blank" rel="noopener">${link.label}</a>`)
    .join('');

  modalMain.innerHTML = `
    <h2 id="project-modal-title">${project.title}</h2>
    <p class="project-tech">Tech: ${tech}</p>
    <p>${project.fullDescription}</p>
    <div class="project-modal-links">${links}</div>
  `;

  renderGallery();
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  galleryTrack.innerHTML = '';
  galleryPagination.innerHTML = '';
  galleryDots.length = 0;
  galleryCaption.textContent = '';
  document.body.style.overflow = '';
}

function createGalleryMediaNode(item) {
  if (item.type === 'youtube') {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${item.videoId}`;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.loading = 'lazy';
    return iframe;
  }

  if (item.type === 'video' && item.src) {
    const video = document.createElement('video');
    video.controls = true;
    video.preload = 'metadata';

    const source = document.createElement('source');
    source.src = item.src;
    video.appendChild(source);

    const posterCandidates = buildImageCandidates(item.poster || '');
    if (posterCandidates.length > 0) {
      video.poster = posterCandidates[0];
    }

    return video;
  }

  const image = document.createElement('img');
  image.loading = 'lazy';

  if (item.type === 'video') {
    image.alt = 'Video placeholder';
    applyImageFallback(image, item.poster || 'images/gallery-video-placeholder');
  } else {
    image.alt = item.alt || 'Project media';
    applyImageFallback(image, item.src);
  }

  return image;
}

function resetGallerySwipe() {
  gallerySwipePointerId = null;
  gallerySwipeStartX = 0;
  gallerySwipeStartY = 0;
  isGalleryTouchActive = false;
}

function canSwipeGalleryTarget(target) {
  return !(target instanceof Element && target.closest('video, button, a'));
}

function canSwipeGallery() {
  if (!modal.classList.contains('open') || isGalleryAnimating) return false;

  const media = projects[currentProjectIndex] ? projects[currentProjectIndex].media : [];
  if (media.length <= 1) return false;

  return true;
}

function handleGallerySwipe(deltaX, deltaY) {
  if (Math.abs(deltaX) < gallerySwipeThreshold) return;
  if (Math.abs(deltaX) <= Math.abs(deltaY)) return;

  if (deltaX < 0) {
    goToNextGallery();
  } else {
    goToPrevGallery();
  }
}

function handleGalleryPointerDown(event) {
  if (event.pointerType !== 'touch' || !canSwipeGallery()) return;
  if (!canSwipeGalleryTarget(event.target)) return;

  gallerySwipePointerId = event.pointerId;
  gallerySwipeStartX = event.clientX;
  gallerySwipeStartY = event.clientY;
}

function handleGalleryPointerUp(event) {
  if (event.pointerId !== gallerySwipePointerId) return;

  const deltaX = event.clientX - gallerySwipeStartX;
  const deltaY = event.clientY - gallerySwipeStartY;
  resetGallerySwipe();
  handleGallerySwipe(deltaX, deltaY);
}

function handleGalleryPointerCancel(event) {
  if (event.pointerId === gallerySwipePointerId) {
    resetGallerySwipe();
  }
}

function handleGalleryTouchStart(event) {
  if (!canSwipeGallery()) return;
  if (!canSwipeGalleryTarget(event.target)) return;

  const touch = event.changedTouches[0];
  if (!touch) return;

  isGalleryTouchActive = true;
  gallerySwipeStartX = touch.clientX;
  gallerySwipeStartY = touch.clientY;
}

function handleGalleryTouchEnd(event) {
  if (!isGalleryTouchActive) return;

  const touch = event.changedTouches[0];
  if (!touch) {
    resetGallerySwipe();
    return;
  }

  const deltaX = touch.clientX - gallerySwipeStartX;
  const deltaY = touch.clientY - gallerySwipeStartY;
  resetGallerySwipe();
  handleGallerySwipe(deltaX, deltaY);
}

function handleGalleryTouchCancel() {
  resetGallerySwipe();
}

function ensureGalleryPaginationDots() {
  const media = projects[currentProjectIndex] ? projects[currentProjectIndex].media : [];

  if (galleryDots.length === media.length) return;

  galleryPagination.innerHTML = '';
  galleryDots.length = 0;

  media.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'page-dot';
    dot.setAttribute('aria-label', `Go to media slide ${index + 1}`);
    dot.addEventListener('click', () => {
      if (galleryIndex === index || isGalleryAnimating) return;
      galleryIndex = index;
      renderGallery(index);
    });
    galleryPagination.appendChild(dot);
    galleryDots.push(dot);
  });
}

function updateGalleryCaption() {
  const media = projects[currentProjectIndex] ? projects[currentProjectIndex].media : [];
  const current = media[galleryIndex];
  galleryCaption.textContent = current ? current.caption || current.alt || '' : '';
}

function updateGalleryPagination(activeIndex = galleryIndex) {
  ensureGalleryPaginationDots();

  galleryDots.forEach((dot, index) => {
    dot.classList.toggle('active', index === activeIndex);
  });
}

function updateGalleryControls() {
  const media = projects[currentProjectIndex] ? projects[currentProjectIndex].media : [];
  const isSingleSlide = media.length <= 1;
  galleryPrev.disabled = isSingleSlide;
  galleryNext.disabled = isSingleSlide;
}

function renderGallery(startIndex = galleryIndex) {
  const project = projects[currentProjectIndex];
  const media = project.media || [];
  const maxIndex = Math.max(0, media.length - 1);

  galleryIndex = Math.min(Math.max(startIndex, 0), maxIndex);
  galleryTrack.innerHTML = '';

  media.forEach((_, offset) => {
    const item = media[(galleryIndex + offset) % media.length];
    const slide = document.createElement('div');
    slide.className = 'gallery-slide';

    slide.appendChild(createGalleryMediaNode(item));
    galleryTrack.appendChild(slide);
  });

  galleryTrack.style.transition = 'none';
  galleryTrack.style.transform = 'translateX(0px)';
  void galleryTrack.offsetWidth;
  galleryTrack.style.transition = 'transform 0.35s ease';

  updateGalleryControls();
  updateGalleryCaption();
  updateGalleryPagination();
}

function getGalleryStepSize() {
  const slide = galleryTrack.querySelector('.gallery-slide');
  if (!slide) return 0;

  return slide.getBoundingClientRect().width;
}

function goToGallery(index) {
  const media = projects[currentProjectIndex].media;
  const maxIndex = Math.max(0, media.length - 1);
  const normalizedIndex = ((index % media.length) + media.length) % media.length;
  galleryIndex = Math.min(Math.max(normalizedIndex, 0), maxIndex);
  renderGallery(galleryIndex);
}

function goToNextGallery() {
  const media = projects[currentProjectIndex].media;
  if (isGalleryAnimating || media.length <= 1) return;

  const step = getGalleryStepSize();
  if (!step) return;

  isGalleryAnimating = true;
  updateGalleryPagination((galleryIndex + 1) % media.length);
  updateGalleryCaption();
  void galleryPagination.offsetWidth;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      galleryTrack.style.transition = 'transform 0.35s ease';
      galleryTrack.style.transform = `translateX(-${step}px)`;
    });
  });

  const onTransitionEnd = () => {
    galleryTrack.removeEventListener('transitionend', onTransitionEnd);

    const firstSlide = galleryTrack.firstElementChild;
    if (firstSlide) {
      galleryTrack.appendChild(firstSlide);
    }

    galleryTrack.style.transition = 'none';
    galleryTrack.style.transform = 'translateX(0px)';
    void galleryTrack.offsetWidth;
    galleryTrack.style.transition = 'transform 0.35s ease';

    galleryIndex = (galleryIndex + 1) % media.length;
    updateGalleryCaption();
    updateGalleryPagination();
    isGalleryAnimating = false;
  };

  galleryTrack.addEventListener('transitionend', onTransitionEnd);
}

function goToPrevGallery() {
  const media = projects[currentProjectIndex].media;
  if (isGalleryAnimating || media.length <= 1) return;

  const step = getGalleryStepSize();
  if (!step) return;

  isGalleryAnimating = true;
  updateGalleryPagination((galleryIndex - 1 + media.length) % media.length);
  void galleryPagination.offsetWidth;

  const lastSlide = galleryTrack.lastElementChild;
  if (lastSlide) {
    galleryTrack.insertBefore(lastSlide, galleryTrack.firstElementChild);
  }

  galleryTrack.style.transition = 'none';
  galleryTrack.style.transform = `translateX(-${step}px)`;
  void galleryTrack.offsetWidth;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      galleryTrack.style.transition = 'transform 0.35s ease';
      galleryTrack.style.transform = 'translateX(0px)';
    });
  });

  const onTransitionEnd = () => {
    galleryTrack.removeEventListener('transitionend', onTransitionEnd);

    galleryTrack.style.transition = 'none';
    galleryTrack.style.transform = 'translateX(0px)';
    void galleryTrack.offsetWidth;
    galleryTrack.style.transition = 'transform 0.35s ease';

    galleryIndex = (galleryIndex - 1 + media.length) % media.length;
    updateGalleryCaption();
    updateGalleryPagination();
    isGalleryAnimating = false;
  };

  galleryTrack.addEventListener('transitionend', onTransitionEnd);
}

let projectSwipeStartX = 0;
let projectSwipeStartY = 0;
let isProjectTouchActive = false;
const projectSwipeThreshold = 48;

function handleProjectTouchStart(event) {
  if (isProjectAnimating) return;
  const touch = event.changedTouches[0];
  if (!touch) return;
  isProjectTouchActive = true;
  projectSwipeStartX = touch.clientX;
  projectSwipeStartY = touch.clientY;
}

function handleProjectTouchEnd(event) {
  if (!isProjectTouchActive) return;
  const touch = event.changedTouches[0];
  if (!touch) { isProjectTouchActive = false; return; }
  const deltaX = touch.clientX - projectSwipeStartX;
  const deltaY = touch.clientY - projectSwipeStartY;
  isProjectTouchActive = false;
  if (Math.abs(deltaX) < projectSwipeThreshold) return;
  if (Math.abs(deltaX) <= Math.abs(deltaY)) return;
  if (deltaX < 0) { goToNextProject(); } else { goToPrevProject(); }
}

projectsViewport.addEventListener('touchstart', handleProjectTouchStart, { passive: true });
projectsViewport.addEventListener('touchend', handleProjectTouchEnd, { passive: true });

projectsPrev.addEventListener('click', goToPrevProject);
projectsNext.addEventListener('click', goToNextProject);
galleryPrev.addEventListener('click', goToPrevGallery);
galleryNext.addEventListener('click', goToNextGallery);
modalClose.addEventListener('click', closeProjectModal);
modalOverlay.addEventListener('click', closeProjectModal);
galleryViewport.addEventListener('pointerdown', handleGalleryPointerDown);
galleryViewport.addEventListener('pointerup', handleGalleryPointerUp);
galleryViewport.addEventListener('pointercancel', handleGalleryPointerCancel);
galleryViewport.addEventListener('touchstart', handleGalleryTouchStart, { passive: true });
galleryViewport.addEventListener('touchend', handleGalleryTouchEnd, { passive: true });
galleryViewport.addEventListener('touchcancel', handleGalleryTouchCancel, { passive: true });

window.addEventListener('keydown', (event) => {
  if (!modal.classList.contains('open')) return;

  if (event.key === 'Escape') {
    closeProjectModal();
  } else if (event.key === 'ArrowRight') {
    goToNextGallery();
  } else if (event.key === 'ArrowLeft') {
    goToPrevGallery();
  }
});

window.addEventListener('resize', () => {
  const nextCardsPerPage = getCardsPerPage();
  if (nextCardsPerPage === cardsPerPage) return;

  cardsPerPage = nextCardsPerPage;
  renderProjects();
});

renderProjects();