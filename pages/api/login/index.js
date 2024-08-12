
import { redirect } from 'next/navigation'
import crypto from 'crypto';
import { serialize } from 'v8';
var stateKey = 'spotify_auth_state';
import querystring from 'querystring';
import { config } from 'dotenv';
config();
const { CLIENT_ID } = process.env;

/**
 * The redirect URI for the Spotify OAuth process.
 * This is the URI to which Spotify will redirect the user after authorization.
 */
var redirect_uri = 'http://localhost:3000/api/callback'; // Your redirect uri

/**
 * Generates a random string of given length.
 * @param {number} length - The length of the random string to generate.
 * @returns {string} - The generated random string.
 */
const generateRandomString = (length) => {
    // Generate a random bytes array of length 60
    const randomBytes = crypto.randomBytes(60);
    // Convert the bytes array to a hex string
    const hexString = randomBytes.toString('hex');
    // Return a substring of the hex string of the given length
    return hexString.slice(0, length);
}

/**
 * This function handles the HTTP request and redirects the user to Spotify's authorization page.
 * It generates a random state string and sets it as a cookie.
 * It then redirects the user to Spotify's authorization page with the necessary parameters.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @return {Promise<void>} - A Promise that resolves when the function is done executing.
 */
export default async function handler(req, res) {
    if (req.method === 'GET') {
        // Generate a random state string
        var state = generateRandomString(16);
        // Set the state string as a cookie
        res.setHeader('Set-Cookie', serialize(stateKey, state, { path: '/' }));
        // Define the required scope for the authorization
        var scope = 'user-read-currently-playing user-modify-playback-state';
        // Redirect the user to Spotify's authorization page with the necessary parameters
        res.writeHead(307, {
            location: 'https://accounts.spotify.com/authorize?' +
                querystring.stringify({
                    response_type: 'code', // Request an authorization code
                    client_id: CLIENT_ID, // The client ID
                    scope: scope, // The required scope
                    redirect_uri: redirect_uri, // The redirect URI
                    state: state // The state string
                })
        });
        res.end();
    }
}
