
import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <main className={styles.main}>
      <Link href="/api/login">
        <button className={styles.button}>Login with Spotify</button>
      </Link>
    </main>
  );
}