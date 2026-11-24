'use client'

import Image from 'next/image'
import { FormEvent, ReactNode, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  loginAction,
  logoutAction,
  registerAction,
  requestDownloadAction,
  searchStudiesAction,
} from '@/app/(frontend)/actions'

const scholarLocalLogo = '/scholarlocal-logo.png'

type Screen = 'home' | 'results' | 'details' | 'about' | 'login' | 'admin' | 'superAdmin'

export type Study = {
  id: string
  slug: string
  title: string
  authors: string
  year: string
  department: string
  program: string
  abstract: string
  keywords: string[]
  pdfUrl?: string
}

type DownloadRequestStatus = 'Pending' | 'Approved' | 'Denied'

type CurrentUser = {
  email: string
  fullName: string
  program: string
  studentId: string
}

type DownloadRequest = {
  id: string
  studyTitle: string
  requester: string
  studentId: string
  program: string
  requestedAt: string
  purpose: string
  status: DownloadRequestStatus
}

type SimilarityMatch = {
  id: string
  score: number
}

const programCodes = ['DIT', 'DCvET', 'DCET', 'DEET', 'DECET', 'DMET', 'DOMT', 'DRET']

const programs = [
  'Diploma in Information Technology (DIT)',
  'Diploma in Civil Engineering Technology (DCvET)',
  'Diploma in Computer Engineering Technology (DCET)',
  'Diploma in Electrical Engineering Technology (DEET)',
  'Diploma in Electronics Engineering Technology (DECET)',
  'Diploma in Mechanical Engineering Technology (DMET)',
  'Diploma in Office Management Technology (DOMT)',
  'Diploma in Railway Engineering Technology (DRET)',
]

function Icon({
  name,
  size = 20,
}: {
  name: 'search' | 'arrow' | 'book' | 'file' | 'user' | 'lock' | 'mail' | 'chevron' | 'download'
  size?: number
}) {
  const paths: Record<typeof name, ReactNode> = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    book: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
        <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5z" />
      </>
    ),
    file: (
      <>
        <path d="M6 2h8l4 4v16H6z" />
        <path d="M14 2v5h5M9 13h6M9 17h6" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5M5 21h14" />
      </>
    ),
  }

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

function Seal({ large = false }: { large?: boolean }) {
  return (
    <Image
      className={large ? 'seal seal-large' : 'seal'}
      src={scholarLocalLogo}
      alt="ScholarLocal research repository logo"
      width={1200}
      height={1200}
      unoptimized
    />
  )
}

function Header({ screen, navigate }: { screen: Screen; navigate: (screen: Screen) => void }) {
  return (
    <header className="site-header">
      <div className="topline" />
      <div className="nav-shell">
        <button className="brand" onClick={() => navigate('home')} aria-label="ScholarLocal home">
          <Seal />
          <span className="brand-copy">
            <strong>ScholarLocal</strong>
            <small>PUP Institute of Technology</small>
          </span>
        </button>
        <nav aria-label="Primary navigation">
          <button className={screen === 'home' ? 'active' : ''} onClick={() => navigate('home')}>
            Home
          </button>
          <button
            className={screen === 'results' ? 'active' : ''}
            onClick={() => navigate('results')}
          >
            Browse All Studies
          </button>
          <button className={screen === 'about' ? 'active' : ''} onClick={() => navigate('about')}>
            About
          </button>
          <button className="login-nav" onClick={() => navigate('login')}>
            <Icon name="user" size={17} /> Login
          </button>
        </nav>
      </div>
    </header>
  )
}

function Home({
  query,
  setQuery,
  onSearch,
}: {
  query: string
  setQuery: (value: string) => void
  onSearch: (query: string) => void
}) {
  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSearch(query)
  }

  return (
    <main>
      <section className="hero">
        <div className="hero-inner">
          <p className="eyebrow">PUP ITECH RESEARCH REPOSITORY</p>
          <h1>
            Knowledge built by our community,
            <br />
            accessible to all.
          </h1>
          <p className="hero-copy">
            Discover applied research, technical projects, and diploma studies produced by the
            students and faculty of the PUP Institute of Technology.
          </p>
          <form className="search-panel" onSubmit={submit}>
            <div className="main-search">
              <Icon name="search" size={23} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by title, author, keyword, or topic"
                aria-label="Search studies"
              />
              <button type="submit">Search repository</button>
            </div>
            <div className="advanced-row">
              <span>Refine your search</span>
              <label>
                <span className="sr-only">Publication year</span>
                <select defaultValue="">
                  <option value="">All years</option>
                  <option>2024</option>
                  <option>2023</option>
                  <option>2022</option>
                </select>
              </label>
              <label>
                <span className="sr-only">Diploma program</span>
                <select defaultValue="">
                  <option value="">All diploma programs</option>
                  {programs.map((program) => (
                    <option key={program}>{program}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="sr-only">Author name</span>
                <input placeholder="Author name" />
              </label>
            </div>
          </form>
          <div className="quick-links">
            <span>Popular topics:</span>
            {['Machine Learning', 'IoT Systems', 'Renewable Energy', 'Railway Safety'].map(
              (topic) => (
                <button
                  key={topic}
                  onClick={() => {
                    setQuery(topic)
                    onSearch(topic)
                  }}
                >
                  {topic}
                </button>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="collection-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow maroon">EXPLORE THE ARCHIVE</p>
            <h2>Technical research built for real-world impact</h2>
          </div>
          <p>
            A focused collection of applied studies and technical innovations, preserved for the
            next generation of PUP ITECH researchers.
          </p>
        </div>
        <div className="stats-grid">
          <article>
            <Icon name="book" size={25} />
            <strong>100+</strong>
            <span>ITECH research studies</span>
          </article>
          <article>
            <Icon name="file" size={25} />
            <strong>8</strong>
            <span>Diploma programs</span>
          </article>
          <article>
            <span className="stat-year">1904</span>
            <strong>120 years</strong>
            <span>of PUP academic excellence</span>
          </article>
        </div>
      </section>
    </main>
  )
}

function Results({
  query,
  setQuery,
  onOpen,
  onSearch,
  matches,
  isSearching,
  studies,
}: {
  query: string
  setQuery: (value: string) => void
  onOpen: (studyId: string) => void
  onSearch: () => void
  matches: SimilarityMatch[] | null
  isSearching: boolean
  studies: Study[]
}) {
  const scoreById = new Map(matches?.map((match) => [match.id, match.score]))
  const visibleStudies = matches
    ? matches.flatMap((match) => {
        const study = studies.find((item) => item.id === match.id)
        return study ? [study] : []
      })
    : studies

  return (
    <main className="page-main">
      <section className="page-banner">
        <div className="content-wrap">
          <p className="eyebrow">PUP ITECH REPOSITORY</p>
          <h1>Search the collection</h1>
          <form
            className="compact-search"
            onSubmit={(event) => {
              event.preventDefault()
              onSearch()
            }}
          >
            <Icon name="search" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} />
            <button type="submit" disabled={isSearching}>
              {isSearching ? 'Ranking…' : 'Search'}
            </button>
          </form>
        </div>
      </section>
      <div className="content-wrap results-layout">
        <aside className="filter-sidebar">
          <div className="filter-title">
            <strong>Filter results</strong>
            <button>Clear all</button>
          </div>
          <FilterGroup
            title="Publication year"
            items={['2024', '2023', '2022', '2021 & earlier']}
          />
          <FilterGroup title="Diploma program" items={programs} />
        </aside>
        <section className="results-list">
          <div className="results-summary">
            <div>
              <p className="breadcrumb">
                Home <span>/</span> Search results
              </p>
              <h2>{query ? `Results for “${query}”` : 'All research studies'}</h2>
              <span>
                {isSearching
                  ? 'Calculating TF-IDF relevance…'
                  : `${visibleStudies.length} ${
                      visibleStudies.length === 1 ? 'study' : 'studies'
                    } ranked by cosine similarity`}
              </span>
            </div>
            <label className="sort-select">
              Sort by
              <select defaultValue="relevance">
                <option value="relevance">Most relevant</option>
                <option value="newest">Newest first</option>
              </select>
            </label>
          </div>
          {!isSearching && visibleStudies.length === 0 && (
            <div className="search-empty">
              <Icon name="search" size={27} />
              <strong>No matching studies found</strong>
              <span>Try broader keywords or a different research topic.</span>
            </div>
          )}
          {visibleStudies.map((study) => (
            <article className="result-card" key={study.title}>
              <div className="result-meta">
                <span>{study.program}</span>
                <span>{study.year}</span>
                {scoreById.has(study.id) && (
                  <span className="similarity-badge">
                    {Math.round((scoreById.get(study.id) ?? 0) * 100)}% relevance
                  </span>
                )}
              </div>
              <h3>{study.title}</h3>
              <p className="authors">By {study.authors}</p>
              <p className="abstract">{study.abstract}</p>
              <div className="card-footer">
                <span>{study.department}</span>
                <button onClick={() => onOpen(study.id)}>
                  View full document <Icon name="arrow" size={17} />
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}

function FilterGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <fieldset>
      <legend>{title}</legend>
      {items.map((item) => (
        <label key={item}>
          <input type="checkbox" />
          <span>{item}</span>
        </label>
      ))}
    </fieldset>
  )
}

function Details({
  navigate,
  downloadRequest,
  onRequestDownload,
  study,
  relatedMatches,
  studies,
  onOpenStudy,
}: {
  navigate: (screen: Screen) => void
  downloadRequest?: DownloadRequest
  onRequestDownload: (study: Study) => void
  study: Study
  relatedMatches: SimilarityMatch[]
  studies: Study[]
  onOpenStudy: (studyId: string) => void
}) {
  const [page, setPage] = useState(1)
  const [zoom, setZoom] = useState(100)
  const requestStatus = downloadRequest?.status

  return (
    <main className="details-main">
      <div className="content-wrap">
        <p className="breadcrumb details-breadcrumb">
          <button onClick={() => navigate('home')}>Home</button>
          <span>/</span>
          <button onClick={() => navigate('results')}>Search results</button>
          <span>/</span>
          Document details
        </p>
        <section className="document-intro">
          <div className="document-type">UNDERGRADUATE THESIS · {study.year}</div>
          <h1>{study.title}</h1>
          <p className="authors">By {study.authors}</p>
          <div className="keyword-row">
            {study.keywords.map((keyword) => (
              <span key={keyword}>{keyword}</span>
            ))}
          </div>
        </section>
        <div className="document-layout">
          <section className="viewer-column">
            <div className="viewer-heading">
              <div>
                <p className="eyebrow maroon">FULL DOCUMENT</p>
                <h2>Read the study</h2>
              </div>
              <button
                className={`outline-button download-request-button ${
                  requestStatus ? requestStatus.toLowerCase() : ''
                }`}
                onClick={() => onRequestDownload(study)}
                disabled={requestStatus === 'Pending'}
              >
                <Icon name={requestStatus === 'Approved' ? 'download' : 'lock'} size={17} />
                {requestStatus === 'Pending'
                  ? 'Request pending'
                  : requestStatus === 'Approved'
                    ? 'Download approved'
                    : requestStatus === 'Denied'
                      ? 'Request again'
                      : 'Request PDF download'}
              </button>
            </div>
            {requestStatus && (
              <div className={`download-request-message ${requestStatus.toLowerCase()}`}>
                <Icon name={requestStatus === 'Approved' ? 'download' : 'lock'} size={18} />
                <div>
                  <strong>
                    {requestStatus === 'Pending'
                      ? 'Your download request is awaiting admin review.'
                      : requestStatus === 'Approved'
                        ? 'Your request was approved. The PDF is ready to download.'
                        : 'Your previous request was not approved.'}
                  </strong>
                  <span>
                    {requestStatus === 'Pending'
                      ? 'You can continue reading the study while the repository office reviews it.'
                      : requestStatus === 'Approved'
                        ? 'Select “Download approved” to begin downloading the file.'
                        : 'You may submit a new request for administrator review.'}
                  </span>
                </div>
              </div>
            )}
            <div className="pdf-viewer">
              <div className="viewer-toolbar">
                <span>scholarlocal-itech-santos-et-al-2024.pdf</span>
                <div className="viewer-controls">
                  <button onClick={() => setPage(Math.max(1, page - 1))} aria-label="Previous page">
                    ‹
                  </button>
                  <span>{page} / 86</span>
                  <button onClick={() => setPage(Math.min(86, page + 1))} aria-label="Next page">
                    ›
                  </button>
                  <i />
                  <button onClick={() => setZoom(Math.max(75, zoom - 25))} aria-label="Zoom out">
                    −
                  </button>
                  <span>{zoom}%</span>
                  <button onClick={() => setZoom(Math.min(150, zoom + 25))} aria-label="Zoom in">
                    +
                  </button>
                </div>
              </div>
              <div className="pdf-canvas">
                <article className="pdf-page">
                  <div className="mini-seal">
                    <Seal />
                  </div>
                  <p>POLYTECHNIC UNIVERSITY OF THE PHILIPPINES</p>
                  <small>INSTITUTE OF TECHNOLOGY</small>
                  <h3>{study.title}</h3>
                  <div className="pdf-rule" />
                  <p className="pdf-by">A Research Study Presented by</p>
                  <strong>{study.authors}</strong>
                  <p className="pdf-year">Manila, Philippines · 2024</p>
                  <span className="page-number">{page}</span>
                </article>
              </div>
            </div>
            <section className="metadata-section">
              <h2>About this study</h2>
              <dl>
                <div>
                  <dt>Diploma program</dt>
                  <dd>{study.program}</dd>
                </div>
                <div>
                  <dt>Publication year</dt>
                  <dd>{study.year}</dd>
                </div>
                <div>
                  <dt>Document type</dt>
                  <dd>Diploma Research</dd>
                </div>
              </dl>
              <h3>Abstract</h3>
              <p>{study.abstract}</p>
            </section>
          </section>
          <aside className="related-sidebar">
            <p className="eyebrow maroon">YOU MAY ALSO LIKE</p>
            <h2>Related local studies</h2>
            {relatedMatches.map((match) => {
              const item = studies.find((candidate) => candidate.id === match.id)
              if (!item) return null
              return (
                <button className="related-item" key={item.id} onClick={() => onOpenStudy(item.id)}>
                  <span>
                    {Math.round(match.score * 100)}% similar · {item.year} · {item.program}
                  </span>
                  <strong>{item.title}</strong>
                  <small>
                    View study <Icon name="chevron" size={14} />
                  </small>
                </button>
              )
            })}
          </aside>
        </div>
      </div>
    </main>
  )
}

function Login({
  navigate,
  currentUser,
}: {
  navigate: (screen: Screen) => void
  currentUser: CurrentUser | null
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    const form = new FormData(event.currentTarget)

    startTransition(async () => {
      const result =
        mode === 'register'
          ? await registerAction({
              email: String(form.get('email') ?? ''),
              fullName: String(form.get('fullName') ?? ''),
              password: String(form.get('password') ?? ''),
              program: String(form.get('program') ?? ''),
              studentId: String(form.get('studentId') ?? ''),
            })
          : await loginAction({
              email: String(form.get('email') ?? ''),
              password: String(form.get('password') ?? ''),
            })

      if (!result.ok) {
        setMessage(result.error ?? 'Please try again.')
        return
      }

      router.refresh()
      navigate('home')
    })
  }

  const signOut = () => {
    startTransition(async () => {
      await logoutAction()
      router.refresh()
      setMessage('You have been signed out.')
    })
  }

  return (
    <main className="auth-main">
      <div className="watermark">
        <Seal large />
      </div>
      <section className="auth-card">
        <button className="auth-brand" onClick={() => navigate('home')}>
          <Seal />
          <span>
            <strong>ScholarLocal</strong>
            <small>PUP Research Repository</small>
          </span>
        </button>
        <div className="auth-heading">
          <p className="eyebrow maroon">SECURE INSTITUTIONAL ACCESS</p>
          <h1>
            {currentUser
              ? 'Account active'
              : mode === 'login'
                ? 'Welcome back'
                : 'Create your account'}
          </h1>
          <p>
            {currentUser
              ? `Signed in as ${currentUser.fullName}.`
              : mode === 'login'
                ? 'Sign in to submit and track PDF download requests.'
                : 'Register using your PUP institutional credentials.'}
          </p>
        </div>

        {currentUser ? (
          <div className="signed-in-card">
            <div>
              <strong>{currentUser.fullName}</strong>
              <span>
                {currentUser.studentId} · {currentUser.program}
              </span>
              <small>{currentUser.email}</small>
            </div>
            <button className="auth-submit" onClick={signOut} disabled={isPending}>
              {isPending ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            {mode === 'register' && (
              <>
                <label>
                  <span>Full name</span>
                  <div className="field">
                    <Icon name="user" size={18} />
                    <input
                      name="fullName"
                      autoComplete="name"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                </label>
                <label>
                  <span>Student ID</span>
                  <div className="field">
                    <Icon name="user" size={18} />
                    <input name="studentId" placeholder="2024-00000-MN-0" required />
                  </div>
                </label>
                <label>
                  <span>Diploma program</span>
                  <div className="field">
                    <Icon name="book" size={18} />
                    <select name="program" defaultValue="" required>
                      <option value="" disabled>
                        Select your program
                      </option>
                      {programCodes.map((program) => (
                        <option value={program} key={program}>
                          {program}
                        </option>
                      ))}
                    </select>
                  </div>
                </label>
              </>
            )}
            <label>
              <span>Institutional email</span>
              <div className="field">
                <Icon name="mail" size={18} />
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@iskolarngbayan.pup.edu.ph"
                  required
                />
              </div>
            </label>
            <label>
              <span>Password</span>
              <div className="field">
                <Icon name="lock" size={18} />
                <input
                  name="password"
                  type="password"
                  minLength={8}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="At least 8 characters"
                  required
                />
              </div>
            </label>
            <div className="privacy-notice">
              <div className="privacy-notice-heading">
                <Icon name="lock" size={16} />
                <strong>Data Privacy Notice</strong>
              </div>
              <p>
                In accordance with the Data Privacy Act of 2012 (Republic Act No. 10173), your
                information is processed only for account verification, repository access, and
                institutional research services.
              </p>
              {mode === 'register' && (
                <label className="privacy-consent">
                  <input type="checkbox" required />
                  <span>
                    I consent to this processing and will use repository documents for legitimate
                    academic purposes.
                  </span>
                </label>
              )}
            </div>
            {message && (
              <p className="form-message" role="alert">
                {message}
              </p>
            )}
            <button className="auth-submit" type="submit" disabled={isPending}>
              {isPending
                ? 'Please wait…'
                : mode === 'login'
                  ? 'Sign in to ScholarLocal'
                  : 'Create account'}
            </button>
          </form>
        )}

        {!currentUser && (
          <div className="auth-links">
            <button
              onClick={() => {
                setMessage('')
                setMode(mode === 'login' ? 'register' : 'login')
              }}
            >
              {mode === 'login' ? 'Register a new account' : 'Return to sign in'}
            </button>
            <span>·</span>
            <a href="/admin">Repository staff portal</a>
          </div>
        )}
        <p className="security-note">
          <Icon name="lock" size={14} /> Student sessions and repository staff access are kept
          separate.
        </p>
      </section>
    </main>
  )
}

function DashboardPanel({
  eyebrow,
  title,
  action,
  onAction,
  children,
}: {
  eyebrow: string
  title: string
  action?: string
  onAction?: () => void
  children: ReactNode
}) {
  return (
    <section className="admin-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow maroon">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        {action && (
          <button className="outline-button" onClick={onAction}>
            {action}
          </button>
        )}
      </div>
      {children}
    </section>
  )
}

function StatusBadge({ status }: { status: string }) {
  return <span className={`status ${status.toLowerCase().replace(' ', '-')}`}>{status}</span>
}

function AdminSection({
  section,
  act,
  downloadRequests,
  onUpdateDownloadRequest,
  studies,
}: {
  section: string
  act: (message: string) => void
  downloadRequests: DownloadRequest[]
  onUpdateDownloadRequest: (requestId: string, status: DownloadRequestStatus) => void
  studies: Study[]
}) {
  if (section === 'Download requests') {
    const pendingCount = downloadRequests.filter((request) => request.status === 'Pending').length
    const approvedCount = downloadRequests.filter((request) => request.status === 'Approved').length
    const deniedCount = downloadRequests.filter((request) => request.status === 'Denied').length

    return (
      <DashboardPanel eyebrow="CONTROLLED PDF ACCESS" title="Download requests">
        <div className="permission-note">
          <Icon name="lock" size={19} />
          <div>
            <strong>Administrator approval is required</strong>
            <span>
              Review the requester and intended use before granting access to the full research PDF.
            </span>
          </div>
        </div>
        <div className="detail-summary">
          <article>
            <strong>{pendingCount}</strong>
            <span>Awaiting review</span>
          </article>
          <article>
            <strong>{approvedCount}</strong>
            <span>Approved requests</span>
          </article>
          <article>
            <strong>{deniedCount}</strong>
            <span>Denied requests</span>
          </article>
        </div>
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Requested document</th>
                <th>Requester</th>
                <th>Purpose</th>
                <th>Requested</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {downloadRequests.length === 0 ? (
                <tr>
                  <td className="empty-table" colSpan={6}>
                    No PDF download requests have been submitted yet.
                  </td>
                </tr>
              ) : (
                downloadRequests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <strong>{request.studyTitle}</strong>
                      <small>{request.program}</small>
                    </td>
                    <td>
                      <strong>{request.requester}</strong>
                      <small>{request.studentId}</small>
                    </td>
                    <td>{request.purpose}</td>
                    <td>{request.requestedAt}</td>
                    <td>
                      <StatusBadge status={request.status} />
                    </td>
                    <td>
                      {request.status === 'Pending' ? (
                        <div className="request-actions">
                          <button
                            className="approve-action"
                            onClick={() => {
                              onUpdateDownloadRequest(request.id, 'Approved')
                              act(`Download access approved for ${request.requester}.`)
                            }}
                          >
                            Approve
                          </button>
                          <button
                            className="deny-action"
                            onClick={() => {
                              onUpdateDownloadRequest(request.id, 'Denied')
                              act(`Download request from ${request.requester} was denied.`)
                            }}
                          >
                            Deny
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            onUpdateDownloadRequest(request.id, 'Pending')
                            act(`Request from ${request.requester} returned to review.`)
                          }}
                        >
                          Reopen
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DashboardPanel>
    )
  }

  if (section === 'Submissions') {
    return (
      <DashboardPanel
        eyebrow="REVIEW WORKFLOW"
        title="Research submissions"
        action="Add new study"
        onAction={() => act('New study submission form opened.')}
      >
        <div className="detail-summary">
          <article>
            <strong>24</strong>
            <span>Awaiting initial review</span>
          </article>
          <article>
            <strong>7</strong>
            <span>Returned for revision</span>
          </article>
          <article>
            <strong>5</strong>
            <span>Ready to publish</span>
          </article>
        </div>
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Study</th>
                <th>Program</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {studies.slice(0, 5).map((study, index) => {
                const status = ['Pending', 'Pending', 'Revision', 'Approved', 'Pending'][index]
                return (
                  <tr key={study.title}>
                    <td>
                      <strong>{study.title}</strong>
                      <small>{study.authors}</small>
                    </td>
                    <td>{study.program.match(/\((.*?)\)/)?.[1]}</td>
                    <td>{['Today', 'Today', 'Yesterday', 'May 24', 'May 22'][index]}</td>
                    <td>
                      <StatusBadge status={status} />
                    </td>
                    <td>
                      <button onClick={() => act(`Review opened for “${study.title}”.`)}>
                        Review
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </DashboardPanel>
    )
  }

  if (section === 'Repository') {
    return (
      <DashboardPanel
        eyebrow="PUBLISHED COLLECTION"
        title="Repository records"
        action="Create record"
        onAction={() => act('New repository record form opened.')}
      >
        <div className="detail-summary">
          <article>
            <strong>100+</strong>
            <span>Published records</span>
          </article>
          <article>
            <strong>96+</strong>
            <span>PDFs available</span>
          </article>
          <article>
            <strong>4</strong>
            <span>Metadata only</span>
          </article>
        </div>
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Repository record</th>
                <th>Program</th>
                <th>Year</th>
                <th>File</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {studies.map((study, index) => (
                <tr key={study.title}>
                  <td>
                    <strong>{study.title}</strong>
                    <small>{study.authors}</small>
                  </td>
                  <td>{study.program.match(/\((.*?)\)/)?.[1]}</td>
                  <td>{study.year}</td>
                  <td>
                    <StatusBadge status={index === 6 ? 'Metadata only' : 'Available'} />
                  </td>
                  <td>
                    <button onClick={() => act(`Editing “${study.title}”.`)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardPanel>
    )
  }

  return (
    <div className="dashboard-grid">
      <DashboardPanel eyebrow="REPOSITORY ANALYTICS" title="Usage summary">
        <div className="report-metrics">
          {[
            ['1,284', 'Repository visits', '+18% from last month'],
            ['746', 'Document views', '58% of all visits'],
            ['186', 'PDF downloads', 'Last 7 days'],
            ['DIT', 'Most viewed program', '214 document views'],
          ].map(([value, label, detail]) => (
            <article key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{detail}</small>
            </article>
          ))}
        </div>
      </DashboardPanel>
      <DashboardPanel eyebrow="EXPORT CENTER" title="Available reports">
        <div className="settings-list">
          {[
            ['Monthly repository activity', 'Views, downloads, and searches for the current month'],
            ['Submission status report', 'Pending, approved, and returned submissions by program'],
            [
              'Program collection inventory',
              'Published records and file availability across all programs',
            ],
          ].map(([title, detail]) => (
            <div className="setting-row" key={title}>
              <div>
                <strong>{title}</strong>
                <small>{detail}</small>
              </div>
              <button onClick={() => act(`${title} is ready to export.`)}>Generate</button>
            </div>
          ))}
        </div>
      </DashboardPanel>
    </div>
  )
}

function SuperAdminSection({ section, act }: { section: string; act: (message: string) => void }) {
  if (section === 'User management') {
    const users = [
      ['2024-00128-MN-0', 'Angela M. Reyes', 'DIT', 'Student', 'Active'],
      ['2023-00416-MN-0', 'Paolo R. Santos', 'DCET', 'Student', 'Active'],
      ['2022-00891-MN-0', 'Christine L. Flores', 'DOMT', 'Student', 'Pending'],
      ['FAC-00142', 'Engr. Ramon C. Diaz', 'DEET', 'Faculty', 'Active'],
      ['2024-00673-MN-0', 'Mikaela P. Cruz', 'DRET', 'Student', 'Suspended'],
    ]
    return (
      <DashboardPanel
        eyebrow="ACCOUNT DIRECTORY"
        title="Institute user accounts"
        action="Add account"
        onAction={() => act('New account form opened.')}
      >
        <div className="detail-summary">
          <article>
            <strong>2,846</strong>
            <span>Active accounts</span>
          </article>
          <article>
            <strong>38</strong>
            <span>Pending verification</span>
          </article>
          <article>
            <strong>6</strong>
            <span>Suspended accounts</span>
          </article>
        </div>
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Account ID</th>
                <th>Program</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(([id, name, program, userRole, status]) => (
                <tr key={id}>
                  <td>
                    <strong>{name}</strong>
                    <small>
                      {userRole === 'Faculty'
                        ? 'name@pup.edu.ph'
                        : 'name@iskolarngbayan.pup.edu.ph'}
                    </small>
                  </td>
                  <td>{id}</td>
                  <td>{program}</td>
                  <td>{userRole}</td>
                  <td>
                    <StatusBadge status={status} />
                  </td>
                  <td>
                    <button onClick={() => act(`${name} account opened.`)}>Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardPanel>
    )
  }

  if (section === 'Administrators') {
    const admins = [
      ['Dr. Elena M. Cruz', 'Content Admin', 'ITECH Research Office', 'Active'],
      ['Prof. Luis R. Ramos', 'Content Admin', 'Information Technology', 'Active'],
      ['Ana P. Villareal', 'Metadata Admin', 'Office Management Technology', 'Pending'],
      ['Engr. Marco S. Lim', 'Reviewer', 'Mechanical Engineering Technology', 'Active'],
    ]
    return (
      <DashboardPanel
        eyebrow="ACCESS CONTROL"
        title="Administrator accounts"
        action="Invite administrator"
        onAction={() => act('Administrator invitation prepared.')}
      >
        <div className="permission-note">
          <Icon name="lock" size={19} />
          <div>
            <strong>Role-based access is enabled</strong>
            <span>
              Administrator permissions are assigned by responsibility and recorded in the audit
              log.
            </span>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Administrator</th>
                <th>Role</th>
                <th>Unit</th>
                <th>Last active</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin, index) => (
                <tr key={admin[0]}>
                  <td>
                    <strong>{admin[0]}</strong>
                    <small>ITECH institutional account</small>
                  </td>
                  <td>{admin[1]}</td>
                  <td>{admin[2]}</td>
                  <td>
                    {['12 minutes ago', 'Yesterday', 'Invitation sent', '3 hours ago'][index]}
                  </td>
                  <td>
                    <StatusBadge status={admin[3]} />
                  </td>
                  <td>
                    <button onClick={() => act(`${admin[0]} permissions opened.`)}>Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardPanel>
    )
  }

  return (
    <div className="dashboard-grid">
      <DashboardPanel eyebrow="REPOSITORY CONFIGURATION" title="System settings">
        <div className="settings-list">
          {[
            ['Public repository access', 'Allow visitors to browse approved records', 'Enabled'],
            ['Student self-registration', 'Accept verified PUP student email accounts', 'Enabled'],
            [
              'Submission review requirement',
              'Require administrator approval before publishing',
              'Enabled',
            ],
            [
              'AI Quick Read',
              'Generate draft summaries for administrator review',
              'Review required',
            ],
          ].map(([title, detail, value]) => (
            <div className="setting-row" key={title}>
              <div>
                <strong>{title}</strong>
                <small>{detail}</small>
              </div>
              <button onClick={() => act(`${title} settings opened.`)}>{value}</button>
            </div>
          ))}
        </div>
      </DashboardPanel>
      <DashboardPanel eyebrow="PLATFORM STATUS" title="Storage and services">
        <div className="service-list">
          {[
            ['Database', 'Operational', 'Last backup: Today, 02:00'],
            ['Document storage', '68% used', '34.2 GB of 50 GB'],
            ['Authentication', 'Operational', '2,846 active accounts'],
            ['Search index', 'Up to date', 'Last indexed 14 minutes ago'],
          ].map(([name, status, detail]) => (
            <article key={name}>
              <div>
                <strong>{name}</strong>
                <small>{detail}</small>
              </div>
              <StatusBadge status={status} />
            </article>
          ))}
        </div>
        <button className="save-settings" onClick={() => act('System settings saved.')}>
          Save system settings
        </button>
      </DashboardPanel>
    </div>
  )
}

function AdminDashboard({
  role,
  navigate,
  downloadRequests,
  onUpdateDownloadRequest,
  studies,
}: {
  role: 'admin' | 'superAdmin'
  navigate: (screen: Screen) => void
  downloadRequests: DownloadRequest[]
  onUpdateDownloadRequest: (requestId: string, status: DownloadRequestStatus) => void
  studies: Study[]
}) {
  const isSuperAdmin = role === 'superAdmin'
  const [section, setSection] = useState(isSuperAdmin ? 'Overview' : 'Submissions')
  const [notice, setNotice] = useState('')
  const menu = isSuperAdmin
    ? ['Overview', 'User management', 'Administrators', 'System settings']
    : ['Overview', 'Download requests', 'Submissions', 'Repository', 'Reports']
  const pendingDownloadRequests = downloadRequests.filter(
    (request) => request.status === 'Pending',
  ).length

  const act = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2400)
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <button className="admin-brand" onClick={() => navigate('home')}>
          <Seal />
          <span>
            <strong>ScholarLocal</strong>
            <small>Repository Administration</small>
          </span>
        </button>
        <div className="access-badge">
          <Icon name="lock" size={15} />
          {isSuperAdmin ? 'SUPER ADMINISTRATOR' : 'CONTENT ADMINISTRATOR'}
        </div>
        <nav className="admin-menu" aria-label="Administration">
          {menu.map((item) => (
            <button
              className={section === item ? 'active' : ''}
              key={item}
              onClick={() => setSection(item)}
            >
              <Icon
                name={
                  item.includes('User') || item.includes('Administrator')
                    ? 'user'
                    : item === 'Repository' ||
                        item === 'Submissions' ||
                        item === 'Download requests'
                      ? 'file'
                      : item === 'Reports'
                        ? 'book'
                        : 'lock'
                }
                size={18}
              />
              {item}
              {item === 'Download requests' && pendingDownloadRequests > 0 && (
                <span className="menu-count">{pendingDownloadRequests}</span>
              )}
            </button>
          ))}
        </nav>
        <button className="admin-signout" onClick={() => navigate('login')}>
          Sign out
        </button>
      </aside>
      <section className="admin-content">
        <header className="admin-topbar">
          <div>
            <p className="eyebrow maroon">
              {isSuperAdmin ? 'SYSTEM GOVERNANCE' : 'REPOSITORY MANAGEMENT'}
            </p>
            <h1>{section}</h1>
          </div>
          <div className="admin-profile">
            <span>
              <strong>{isSuperAdmin ? 'Office of the Director' : 'Repository Office'}</strong>
              <small>{isSuperAdmin ? 'Super Admin' : 'Admin'}</small>
            </span>
            <div>{isSuperAdmin ? 'OD' : 'RO'}</div>
          </div>
        </header>

        {notice && <div className="admin-notice">{notice}</div>}

        {section === 'Overview' ? (
          <>
            <div className="admin-welcome">
              <div>
                <span>{isSuperAdmin ? 'Institute-wide access' : 'Today’s workspace'}</span>
                <h2>
                  {isSuperAdmin
                    ? 'Manage access with confidence.'
                    : 'Keep PUP ITECH scholarship moving forward.'}
                </h2>
                <p>
                  {isSuperAdmin
                    ? 'Review platform health, administrator access, and institute account activity.'
                    : 'Review new submissions, maintain research records, and monitor repository activity.'}
                </p>
              </div>
              <button
                onClick={() =>
                  act(
                    isSuperAdmin
                      ? 'Administrator invitation prepared.'
                      : 'New study submission form opened.',
                  )
                }
              >
                {isSuperAdmin ? 'Invite administrator' : 'Add new study'}
              </button>
            </div>

            <div className="admin-stats">
              {(isSuperAdmin
                ? [
                    ['2,846', 'Active accounts', '+46 this month'],
                    ['12', 'Administrators', '2 pending invites'],
                    ['99.9%', 'System availability', 'All services normal'],
                    ['27', 'Audit events', 'Last 24 hours'],
                  ]
                : [
                    ['24', 'Pending review', '8 added today'],
                    ['100+', 'Published studies', '+24 this term'],
                    [String(pendingDownloadRequests), 'Download requests', 'Awaiting approval'],
                    ['7', 'Needs revision', 'Awaiting authors'],
                  ]
              ).map(([value, label, meta]) => (
                <article key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                  <small>{meta}</small>
                </article>
              ))}
            </div>

            <section className="admin-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow maroon">
                    {isSuperAdmin ? 'ACCESS CONTROL' : 'REVIEW QUEUE'}
                  </p>
                  <h2>{isSuperAdmin ? 'Administrator accounts' : 'Recent submissions'}</h2>
                </div>
                <button
                  className="outline-button"
                  onClick={() => setSection(isSuperAdmin ? 'Administrators' : 'Submissions')}
                >
                  View all
                </button>
              </div>
              <div className="admin-table-wrap">
                {isSuperAdmin ? (
                  <table>
                    <thead>
                      <tr>
                        <th>Administrator</th>
                        <th>Role</th>
                        <th>Unit</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Dr. Elena M. Cruz', 'Content Admin', 'ITECH Research Office', 'Active'],
                        [
                          'Prof. Luis R. Ramos',
                          'Content Admin',
                          'Information Technology',
                          'Active',
                        ],
                        [
                          'Ana P. Villareal',
                          'Metadata Admin',
                          'Office Management Technology',
                          'Pending',
                        ],
                      ].map((row) => (
                        <tr key={row[0]}>
                          <td>
                            <strong>{row[0]}</strong>
                            <small>ITECH account</small>
                          </td>
                          <td>{row[1]}</td>
                          <td>{row[2]}</td>
                          <td>
                            <span className={`status ${row[3].toLowerCase()}`}>{row[3]}</span>
                          </td>
                          <td>
                            <button onClick={() => act(`${row[0]} account opened.`)}>Manage</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Study</th>
                        <th>Submitted by</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studies.slice(0, 3).map((study, index) => (
                        <tr key={study.title}>
                          <td>
                            <strong>{study.title}</strong>
                            <small>{study.department}</small>
                          </td>
                          <td>{study.authors.split(',')[0]}</td>
                          <td>{['Today', 'Yesterday', 'May 22'][index]}</td>
                          <td>
                            <span className={`status ${index === 2 ? 'revision' : 'pending'}`}>
                              {index === 2 ? 'Revision' : 'Pending'}
                            </span>
                          </td>
                          <td>
                            <button onClick={() => act(`Review opened for “${study.title}”.`)}>
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </>
        ) : isSuperAdmin ? (
          <div className="dashboard-view">
            <SuperAdminSection section={section} act={act} />
          </div>
        ) : (
          <div className="dashboard-view">
            <AdminSection
              section={section}
              act={act}
              downloadRequests={downloadRequests}
              onUpdateDownloadRequest={onUpdateDownloadRequest}
              studies={studies}
            />
          </div>
        )}
      </section>
    </main>
  )
}

function About() {
  return (
    <main className="about-main">
      <div className="content-wrap about-layout">
        <div>
          <p className="eyebrow maroon">ABOUT THE REPOSITORY</p>
          <h1>
            Preserving innovation.
            <br />
            Advancing technology.
          </h1>
        </div>
        <div className="about-copy">
          <p>
            ScholarLocal is the research repository of the PUP Institute of Technology. It makes
            applied studies, technical projects, and innovations from its eight diploma programs
            more visible, discoverable, and useful to students, faculty, and communities.
          </p>
          <p>
            Through responsible digital preservation, the platform supports a culture of inquiry and
            strengthens the Institute&apos;s commitment to accessible, industry-relevant technical
            education.
          </p>
        </div>
      </div>
    </main>
  )
}

function Footer() {
  return (
    <footer>
      <div className="content-wrap footer-inner">
        <div>
          <strong>ScholarLocal</strong>
          <span>PUP Institute of Technology Research Repository</span>
        </div>
        <p>
          © 2026 Polytechnic University of the Philippines · The Country&apos;s 1st PolytechnicU
        </p>
      </div>
    </footer>
  )
}

function ScholarLocalShell({
  currentUser,
  downloadRequests,
  relatedStudies,
  studies,
}: {
  currentUser: CurrentUser | null
  downloadRequests: DownloadRequest[]
  relatedStudies: Record<string, SimilarityMatch[]>
  studies: Study[]
}) {
  const [screen, setScreen] = useState<Screen>('home')
  const [query, setQuery] = useState('')
  const [selectedStudyId, setSelectedStudyId] = useState(studies[0].id)
  const [searchMatches, setSearchMatches] = useState<SimilarityMatch[] | null>(null)
  const [isSearching, startSearchTransition] = useTransition()
  const [isRequestPending, startRequestTransition] = useTransition()
  const router = useRouter()
  const selectedStudy = studies.find((study) => study.id === selectedStudyId) ?? studies[0]

  const navigate = (next: Screen) => {
    setScreen(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const currentStudyRequest = downloadRequests.find(
    (request) => request.studyTitle === selectedStudy.title,
  )

  const openStudy = (studyId: string) => {
    setSelectedStudyId(studyId)
    navigate('details')
  }

  const search = (searchQuery = query) => {
    const normalizedQuery = searchQuery.trim()
    setQuery(searchQuery)
    navigate('results')

    if (!normalizedQuery) {
      setSearchMatches(null)
      return
    }

    startSearchTransition(async () => {
      const result = await searchStudiesAction({ query: normalizedQuery })
      if (!result.ok) {
        setSearchMatches([])
        return
      }
      setSearchMatches(result.results)
    })
  }

  const requestDownload = (study: Study) => {
    if (!currentUser) {
      navigate('login')
      return
    }

    if (currentStudyRequest?.status === 'Approved') {
      if (study.pdfUrl) {
        window.location.assign(study.pdfUrl)
      } else {
        window.alert('Your request is approved, but the repository PDF has not been uploaded yet.')
      }
      return
    }

    startRequestTransition(async () => {
      const result = await requestDownloadAction({
        purpose: 'Academic research reference',
        studyId: study.id,
      })
      if (!result.ok) {
        window.alert(result.error ?? 'The request could not be submitted.')
        return
      }
      router.refresh()
    })
  }

  const updateDownloadRequest = (_requestId: string, _status: DownloadRequestStatus) => {
    window.location.assign('/admin/collections/download-requests')
  }

  return (
    <div className="app-shell">
      {!['login', 'admin', 'superAdmin'].includes(screen) && (
        <Header screen={screen} navigate={navigate} />
      )}
      {screen === 'home' && <Home query={query} setQuery={setQuery} onSearch={search} />}
      {screen === 'results' && (
        <Results
          query={query}
          setQuery={setQuery}
          onOpen={openStudy}
          onSearch={() => search(query)}
          matches={searchMatches}
          isSearching={isSearching}
          studies={studies}
        />
      )}
      {screen === 'details' && (
        <Details
          navigate={navigate}
          downloadRequest={currentStudyRequest}
          onRequestDownload={requestDownload}
          study={selectedStudy}
          relatedMatches={relatedStudies[selectedStudy.id] ?? []}
          studies={studies}
          onOpenStudy={openStudy}
        />
      )}
      {isRequestPending && <div className="admin-notice">Submitting your secure request…</div>}
      {screen === 'login' && <Login navigate={navigate} currentUser={currentUser} />}
      {screen === 'admin' && (
        <AdminDashboard
          role="admin"
          navigate={navigate}
          downloadRequests={downloadRequests}
          onUpdateDownloadRequest={updateDownloadRequest}
          studies={studies}
        />
      )}
      {screen === 'superAdmin' && (
        <AdminDashboard
          role="superAdmin"
          navigate={navigate}
          downloadRequests={downloadRequests}
          onUpdateDownloadRequest={updateDownloadRequest}
          studies={studies}
        />
      )}
      {screen === 'about' && <About />}
      {!['login', 'admin', 'superAdmin'].includes(screen) && <Footer />}
    </div>
  )
}

export default function ScholarLocalApp({
  studies,
  currentUser,
  downloadRequests,
  relatedStudies,
}: {
  studies: Study[]
  currentUser: CurrentUser | null
  downloadRequests: DownloadRequest[]
  relatedStudies: Record<string, SimilarityMatch[]>
}) {
  if (studies.length === 0) {
    return (
      <main className="auth-main">
        <section className="auth-card">
          <p className="eyebrow maroon">SCHOLARLOCAL</p>
          <h1>The repository is being prepared.</h1>
          <p>No published studies are available yet. Please check back soon.</p>
        </section>
      </main>
    )
  }

  return (
    <ScholarLocalShell
      currentUser={currentUser}
      downloadRequests={downloadRequests}
      relatedStudies={relatedStudies}
      studies={studies}
    />
  )
}
