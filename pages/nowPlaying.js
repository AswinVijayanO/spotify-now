import React, { useEffect, useRef, useState } from 'react';
import styles from "./nowPlaying.module.css";
import PlaySvg from './assets/play.svg';
import PauseSvg from './assets/pause.svg';
import PreviousSvg from './assets/previous.svg';
import NextSvg from './assets/nextItem.svg';
import Image from 'next/image';
const stepSize = 10000
/**
 * Retrieves the top 5 accent colors from an image URL.
 * @param {string} imageUrl - The URL of the image.
 * @returns {Promise<string[]>} - A promise that resolves to an array of top 5 accent colors.
 */
async function getAccentColorsFromImageUrl(imageUrl) {
    // Create a new Image object and set its source to the provided image URL.
    let Image = window.Image;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    // Wait for the image to load.
    await new Promise(resolve => {
        img.onload = resolve;
    });

    // Create a canvas element and set its dimensions to match the image.
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    // Get the 2D rendering context of the canvas.
    const ctx = canvas.getContext('2d');

    // Draw the image onto the canvas.
    ctx.drawImage(img, 0, 0);

    // Get the pixel data of the image.
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    // Create an object to store the colors and their frequencies.
    const colors = {};

    // Iterate over each pixel and extract its color.
    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];
        const color = `rgb(${r}, ${g}, ${b})`;
        colors[color] = (colors[color] || 0) + 1;
    }

    // Sort the colors based on their frequencies in descending order.
    const sortedColors = Object.keys(colors).sort((a, b) => colors[b] - colors[a]);

    // Return the top 5 accent colors.
    return sortedColors.slice(0, 5);
}
const Artist = ({ name, href, type }) => {
    return <a className={styles.font} href={href}>{name}{" "}</a>
}
const LandingPage = () => {
    const [nowPlayingData, setNowPlayingData] = useState(null);
    const [volume, setVolume] = useState(50);
    const [loading, setLoading] = useState(false)

    const timerref = useRef(null)


    const handleVolumeChange = (e) => {
        setVolume(e.target.value);
        volumeChange(e.target.value)
    };
    useEffect(() => {

        fetchNowPlaying()
        timerref.current = setTimeout(() => {
            fetchNowPlaying()
        }, stepSize)

        return () => clearTimeout(timerref.current);
    }, []);


    const playNext = () => {
        setLoading(true)
        fetch(`https://api.spotify.com/v1/me/player/next`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
        }).then(() => {
            fetchNowPlaying().then(() => setLoading(false))
        })
    }
    const playPause = () => {
        setLoading(true)
        if (nowPlayingData?.is_playing) {
            fetch(`https://api.spotify.com/v1/me/player/pause`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            }).then(() => {
                fetchNowPlaying().then(() => setLoading(false))

            })
        } else {
            fetch(`https://api.spotify.com/v1/me/player/play`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            }).then(() => {
                fetchNowPlaying().then(() => setLoading(false))
            })
        }
    }
    const playPrevious = () => {
        setLoading(true)
        fetch(`https://api.spotify.com/v1/me/player/previous`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
        }).then(() => {
            fetchNowPlaying().then(() => setLoading(false))
        })

    }
    const volumeChange = (volume) => {

        fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volume}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
        })
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
        if (timerref.current) clearTimeout(timerref.current)
        timerref.current = setTimeout(() => {
            fetchNowPlaying()
        }, stepSize)
    };
    let images = nowPlayingData?.item?.album?.images
    let imageUrl = images ? images[0].url : null
    useEffect(() => {
        if (imageUrl) {
            getAccentColorsFromImageUrl(imageUrl).then((colors) => {
                console.log(colors)
                // Get the root element
                const root = document.documentElement;

                // Update the CSS variables
                const color = colors[4]
                const opacity = 0.2;
                const bgColor = `rgba(${color.slice(4, -1)}, ${opacity})`;
                root.style.setProperty('--primary-color', colors[0]); // Update primary color
                root.style.setProperty('--secondary-color', colors[1]); // Update secondary color
                root.style.setProperty('--background-color', bgColor); // Update background color
            })
        }
    }, [imageUrl])
    return (
        <div className={loading ? styles.loading : ''}>
            {nowPlayingData && images && (
                <div
                    style={{
                        backgroundImage: `url(${images[0].url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundBlendMode: 'multiply',
                    }}
                >
                    <div className={styles.container}>
                        <div className={styles.vision}>
                            <div>
                                <img className={styles.image} src={images[0].url} height={images[0].height} width={images[0].width} />
                            </div>

                            <div className={styles.controls}>
                                <h2 className={[styles.font, styles.now].join(" ")}>Now Playing</h2>
                                <p className={[styles.font,styles.title].join(" ")}>{nowPlayingData.item.name}</p>
                                <span> by</span>
                                <div className={styles.artists}>

                                    {
                                        nowPlayingData.item.artists.map((artist, index) => (
                                            <>
                                                {nowPlayingData.item.artists.length != 1 && index === nowPlayingData.item.artists.length - 1 ? <p className={styles.font}>and</p> : null}
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
                                    <div className={styles.button} onClick={playNext}>
                                        <Image src={NextSvg} alt="Next" />
                                    </div>

                                </div>
                                <div className={styles.volume}>
                                    <div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={volume}
                                            onChange={handleVolumeChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {
                !nowPlayingData && <p className={styles.font}>No song is playing</p>
            }
        </div>
    );
};

export default LandingPage;