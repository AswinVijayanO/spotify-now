import React, { useEffect, useState } from 'react';
import styles from "./landing.module.css";
import PlaySvg from './assets/play.svg';
import PauseSvg from './assets/pause.svg';
import PreviousSvg from './assets/previous.svg';
import NextSvg from './assets/nextItem.svg';
import Image from 'next/image';

const Artist = ({ name, href, type }) => {
  return <a className={styles.font} href={href}>{name}{" "}</a>
}
const LandingPage = () => {
  const [nowPlayingData, setNowPlayingData] = useState(null);
  useEffect(() => {
  
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const accessToken = urlParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token');

      if (accessToken && refreshToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        fetchNowPlaying()
        setInterval(() => {
          fetchNowPlaying()
        }, 10000)
        // Redirect to a different page or perform other actions
      }
    
  }, []);

  const playNext = () => {

    fetch(`https://api.spotify.com/v1/me/player/next`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    fetchNowPlaying()
  }
  const playPause = () => {
    if (nowPlayingData?.is_playing) {
      fetch(`https://api.spotify.com/v1/me/player/pause`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setNowPlayingData({...nowPlayingData,is_playing:false})
    } else {
      fetch(`https://api.spotify.com/v1/me/player/play`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setNowPlayingData({...nowPlayingData,is_playing:true})
    }
  }
  const playPrevious = () => {

    fetch(`https://api.spotify.com/v1/me/player/previous`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    fetchNowPlaying()
  }
  const fetchNowPlaying = async () => {
    let at = localStorage.getItem('accessToken')
    if (at) {
      const response = await fetch('/api/nowPlaying', {
        headers: {
          Authorization: `Bearer ${at}`,
        },
      });    
      const data = await response.json();
      // if (JSON.stringify(data.item) === JSON.stringify(nowPlayingData?.item)) return
      setNowPlayingData(data);
    }
  };
  let images = nowPlayingData?.item.album.images
  return (
    <div>


      {nowPlayingData && (
        <div
          style={{
            backgroundImage: `url(${images[0].url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'multiply',
          }}
        >


          <div className={styles.container}

          >
            <h2 className={[styles.font, styles.now].join(" ")}>Now Playing</h2>
            <div>
              <img className={styles.image} src={images[0].url} height={images[0].height} width={images[0].width} />

            </div>

            <div className={styles.artists}>
              <p className={styles.font}>{nowPlayingData.item.name} by</p>
              {
                nowPlayingData.item.artists.map((artist,index) => (
                  <>
                  {nowPlayingData.item.artists.length!=1 &&index === nowPlayingData.item.artists.length-1 ? <p className={styles.font}>and</p> : null}
                  <Artist name={artist.name} href={artist.href} type={artist.type} />
                  </>
                ))
              }
            </div>
            <div className={styles.plabackControls}>
          <div className={styles.button} onClick={playPrevious}>
            <Image src={PreviousSvg} alt="Previous" />
          </div>
          <div className={styles.button} onClick={playPause}>
            {nowPlayingData.is_playing ? (
              <Image src={PauseSvg} alt="Pause" />
            ) : (
              <Image src={PlaySvg} alt="Play" />
            )}
          </div>
          <div  className={styles.button} onClick={playNext}>
            <Image src={NextSvg} alt="Next" />
          </div>
        </div>
          </div>
        </div>
      )}
      {/* Add your landing page content here */}
    </div>
  );
};

export default LandingPage;