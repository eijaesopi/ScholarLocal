import Link from 'next/link'
import type { AdminViewProps } from 'payload'
import styles from './ScholarLocalAdminDashboard.module.css'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-PH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export default async function ScholarLocalAdminDashboard({ initPageResult }: AdminViewProps) {
  const { req } = initPageResult
  const user = req.user

  const [studyCount, userCount, requestCount, pendingRequestCount, recentStudies] =
    await Promise.all([
      req.payload.count({
        collection: 'studies',
        overrideAccess: false,
        req,
        user,
      }),
      req.payload.count({
        collection: 'users',
        overrideAccess: false,
        req,
        user,
      }),
      req.payload.count({
        collection: 'download-requests',
        overrideAccess: false,
        req,
        user,
      }),
      req.payload.count({
        collection: 'download-requests',
        overrideAccess: false,
        req,
        user,
        where: {
          status: {
            equals: 'pending',
          },
        },
      }),
      req.payload.find({
        collection: 'studies',
        depth: 0,
        limit: 3,
        overrideAccess: false,
        req,
        sort: '-createdAt',
        user,
      }),
    ])

  const stats = [
    ['Research studies', String(studyCount.totalDocs), 'Managed repository records'],
    ['Student accounts', String(userCount.totalDocs), 'Registered PUP researchers'],
    ['Download requests', String(requestCount.totalDocs), 'All protected PDF requests'],
    ['Awaiting approval', String(pendingRequestCount.totalDocs), 'Needs repository review'],
  ]

  return (
    <main className={styles.dashboard}>
      <div className={styles.headingRow}>
        <div>
          <p className={styles.eyebrow}>Repository management</p>
          <h1>Overview</h1>
        </div>
        <span className={styles.headingMeta}>PUP Institute of Technology</span>
      </div>

      <section className={styles.welcome}>
        <div>
          <span className={styles.welcomeLabel}>Today’s workspace</span>
          <h2>Keep PUP ITECH scholarship moving forward.</h2>
          <p>Review requests, maintain research records, and manage repository access.</p>
        </div>
        <Link className={styles.primaryAction} href="/admin/collections/studies/create">
          Add new study
        </Link>
      </section>

      <section className={styles.stats} aria-label="Repository statistics">
        {stats.map(([label, value, meta]) => (
          <article className={styles.stat} key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{meta}</small>
          </article>
        ))}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <p className={styles.eyebrow}>Repository records</p>
            <h2>Recent studies</h2>
          </div>
          <Link className={styles.outlineAction} href="/admin/collections/studies">
            View all
          </Link>
        </div>

        {recentStudies.docs.length > 0 ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Study</th>
                  <th>Authors</th>
                  <th>Program</th>
                  <th>Added</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentStudies.docs.map((study) => (
                  <tr key={study.id}>
                    <td>
                      <strong className={styles.studyTitle}>{study.title}</strong>
                      <small className={styles.studyMeta}>{study.department}</small>
                    </td>
                    <td>{study.authors}</td>
                    <td>
                      <span className={styles.status}>{study.program}</span>
                    </td>
                    <td>{formatDate(study.createdAt)}</td>
                    <td>
                      <Link
                        className={styles.rowAction}
                        href={`/admin/collections/studies/${study.id}`}
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={styles.empty}>No research studies are available yet.</p>
        )}
      </section>
    </main>
  )
}
