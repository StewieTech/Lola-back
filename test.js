const express = require('express');
const { Configuration, OpenAIApi } = require("openai");

const app = express();
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post('/', async (req, res) => {
    const { message } = req.body;
    // Enhancing the prompt with descriptive cues for breaths and natural pauses
    const inputText = `So, um, ... [takes a deep breath] ... like, ${message}, you know? ... [pauses] ... Yeah, that's, like, super interesting. [breathes out] ... Um, what else can we explore together?`;

    try {
        const response = await openai.createAudio({
            model: "tts-1",
            voice: "nova",
            input: inputText,
            // Consider adjusting parameters for a slower pace if available
        });

        // Assuming response.path provides the path or URL to the generated audio
        const audioUrl = response.data.url; // Adjust based on actual API response structure

        console.log(audioUrl);
        if(audioUrl) {
            res.json({
                url: audioUrl
            });
        }
    } catch (error) {
        console.error("Error generating TTS:", error);
        res.status(500).json({ message: "Error generating text-to-speech" });
    }
});

const port = 3002;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
