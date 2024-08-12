
  import { headers } from "next/headers";

  export default async function handler(req, res) {

    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    const response = await fetch(`https://api.spotify.com/v1/me/player/currently-playing`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if(response.status == 200) {
        const data = await response.json();
        res.send(data)
    } else {
        res.send({
            item: null })
    }
  
  }