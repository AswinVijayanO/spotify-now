
import sharp from 'sharp';
const { CLIENT_ID, CLIENT_SECRET } = process.env;
let accessToken = '';
async function getSpotifyToken() {
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
        },
        body: new URLSearchParams({ grant_type: 'client_credentials' })
      });
  
      const tokenData = await tokenResponse.json();
      accessToken = tokenData.access_token;
}
export default async function handler(req, res) {
    const artist = req.query.artist;
    const track = req.query.track;

    if (!artist || !track) {
        return res.status(400).json({ error: 'Artist and track are required' });
    }

    try {
        if (!accessToken) await getSpotifyToken();
        console.log("accesstoken",accessToken);
        const resp = await fetch(`https://api.spotify.com/v1/search?q=track:${track} artist:${artist}&type=track`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        let response  = await resp.json();
        console.log(response);
        if (response.tracks.items.length > 0) {
            const albumArtUrl = response.tracks.items[0].album.images[0].url;
            const imgresponse = await fetch(albumArtUrl);
            const buffer = Buffer.from(await imgresponse.arrayBuffer());
        
            // Resize the image to 300x300 pixels
            const resizedImage = await sharp(buffer)
              .resize(240, 240)
              .toFormat('jpeg')
              .toBuffer();
        
            // Set the response headers and send the image
            res.setHeader('Content-Type', 'image/jpeg');
            res.setHeader('Content-Length', resizedImage.length);
            res.send(resizedImage);
        } else {
            res.json({ albumArtUrl: 'Album art not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching album art' });
    }
}