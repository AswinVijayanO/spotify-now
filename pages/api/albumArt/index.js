
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
    const artistParam = decodeURIComponent(req.query.artist).trim();
    const track = decodeURIComponent(req.query.track).trim();
    let artist = artistParam.split(",")[0]
    if (!artist || !track) {
        return res.status(400).json({ error: 'Artist and track are required' });
    }

    try {
        if (!accessToken) await getSpotifyToken();
        const resp = await fetch(`https://api.spotify.com/v1/search?q=track:${track} artist:${artist}&type=track`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        let response  = await resp.json();
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
            let albumArtUrl = "https://i.scdn.co/image/ab67616d0000b273d9194aa18fa4c9362b47464f"
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
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching album art' });
    }
}