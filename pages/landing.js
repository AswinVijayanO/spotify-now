import React, { useEffect} from 'react';
import styles from "./landing.module.css";

/**
 * The LandingPage component is the entry point of the app.
 * It checks the query string for an access token and a refresh token.
 * If both are present, it stores them in local storage and redirects the user to the nowPlaying page.
 *
 * @return {React.ReactElement} The rendered component.
 */
const LandingPage = () => {
  useEffect(() => {
    // Get the query string parameters
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');

    // If both access token and refresh token are present, store them in local storage and redirect the user to the nowPlaying page
    if (accessToken && refreshToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      window.location.href = `/nowPlaying`
    }
  }, []);

  return (
    <div className={styles.container}>
      {"Welcome to Spotify."}
    </div>
  );
};

export default LandingPage;