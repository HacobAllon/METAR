import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.get('/metar/:icao', async (req, res) => {
  try {
    const icao = req.params.icao.toUpperCase();
    const response = await axios.get(`https://metar.vatsim.net/${icao}`, {
      headers: { Accept: 'text/plain' },
      maxBodyLength: Infinity
    });
    res.send({ raw: response.data });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
