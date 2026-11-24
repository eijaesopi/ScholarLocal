import Image from 'next/image'
import Link from 'next/link'
import styles from './ScholarLocalAdminBrand.module.css'

const logoPath = '/scholarlocal-logo.png'

export function AdminIcon() {
  return (
    <Image
      className={styles.icon}
      src={logoPath}
      alt="ScholarLocal"
      width={1200}
      height={1200}
      unoptimized
    />
  )
}

export function AdminLogo() {
  return (
    <div className={styles.logo}>
      <Image
        className={styles.logoImage}
        src={logoPath}
        alt=""
        width={1200}
        height={1200}
        unoptimized
      />
      <span className={styles.logoText}>
        <strong>ScholarLocal</strong>
        <small>PUP ITECH Repository</small>
      </span>
    </div>
  )
}

export function AdminNavBrand() {
  return (
    <Link className={styles.navBrand} href="/admin">
      <Image
        className={styles.navBrandImage}
        src={logoPath}
        alt=""
        width={1200}
        height={1200}
        unoptimized
      />
      <span className={styles.navBrandCopy}>
        <strong>ScholarLocal</strong>
        <small>Repository Administration</small>
      </span>
    </Link>
  )
}
