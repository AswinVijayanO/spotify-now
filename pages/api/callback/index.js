
import request from 'request';
var stateKey = 'spotify_auth_state';
import querystring from 'querystring';
import { config } from 'dotenv';
config();
const { CLIENT_ID, CLIENT_SECRET } = process.env;

var client_id = CLIENT_ID; // your clientId
var client_secret = CLIENT_SECRET; // Your secret


var redirect_uri = 'http://localhost:3000/api/callback'; // Your redirect uri
import { cookies } from 'next/headers'
/**
 * This function handles the callback from Spotify's OAuth process.
 * It exchanges the authorization code for an access token and a refresh token.
 * It also retrieves the user's information from the Spotify API.
 *
 * @param {NextApiRequest} req - the request object
 * @param {NextApiResponse} res - the response object
 * @return {Promise<void>} - a Promise that resolves when the function is done executing
 */
export default async function handler(req, res) {
    // Check if the request method is GET
    if (req.method === 'GET') {
        // Get the authorization code and state from the query parameters
        var code = req.query.code || null;
        var state = req.query.state || null;

        // Set up the request options for exchanging the authorization code for tokens
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                Authorization: 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        };

        // Make the request to exchange the authorization code for tokens
        request.post(authOptions, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                // Get the access token and refresh token from the response body
                var access_token = body.access_token,
                    refresh_token = body.refresh_token;

                // Set up the request options for retrieving the user's information from the Spotify API
                var options = {
                    url: 'https://api.spotify.com/v1/me',
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    json: true
                };

                // Make the request to retrieve the user's information
                request.get(options, function (error, response, body) {
                    console.log(body);
                });

                // Redirect the user to the landing page with the access token and refresh token as query parameters
                res.redirect('/landing?' + querystring.stringify({ access_token: access_token, refresh_token: refresh_token }))
            }
        });
    }
}
