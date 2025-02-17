// This file is for local testing. 
import { alignAudioWithTranscript, Words } from "./aligner.js";
import { getLangaugeCode, getParameters, uploadContentToS3 } from "./helpers.js";
import { synthesizeWithEchogram } from "./tts.js";
import os from 'os';
async function getTimepointsandAudio(transcript: string, narrativeSection: string[]) {
    console.log("shanu",os.homedir())
    const {googleApiKey, googleVoice} = await getParameters('STEPHEN');
    const language_code = getLangaugeCode(googleVoice);
    const { audioData, timepoints } = await synthesizeWithEchogram(narrativeSection, googleApiKey, googleVoice,language_code,1);
    const wordsTimepoints: Words[] = await alignAudioWithTranscript(audioData, transcript, language_code);

    const metadata = {
        marked_timepoints: timepoints,
        words: wordsTimepoints,
    };
   return  await uploadContentToS3(audioData,metadata,'aeneas4','user123',"phoenix");
    
}
const narrrative_section = [
    "In the year 2287, humanity had finally reached the stars, colonizing distant planets and moons throughout the galaxy.",
    "But as the United Earth Space Probe Agency (UESPA) continued to push the boundaries of space exploration, they began to realize that they were not alone in the universe.",
    "A strange energy signature, detected emanating from a distant planet on the edge of the galaxy, had caught the attention of UESPA scientists.",
    "The signature, dubbed the 'Aurora Signal', seemed to be a message, beckoning humanity to explore the unknown reaches of the galaxy.",
    "UESPA assembled a team of experts, led by the brilliant and fearless Commander Sarah Jenkins, to investigate the signal and uncover its secrets.",
    "The team set out on the state-of-the-art spacecraft, Aurora, equipped with cutting-edge technology and a crew of the best and brightest that humanity had to offer.",
    "As they journeyed deeper into the galaxy, they encountered strange and wondrous sights, from nebulae that shimmered like rainbow-hued curtains to black holes that warped the fabric of space-time itself.",
    "But they also encountered dangers, from hostile alien species to treacherous asteroid fields that threatened to destroy their ship.",
    "Despite the challenges they faced, the crew of the Aurora remained steadfast in their mission, driven by a sense of wonder and a thirst for discovery.",
    "And as they finally reached the source of the Aurora Signal, they were met with a revelation that would change humanity's understanding of the universe forever."
];

const script = "In the year 2287, humanity had finally reached the stars, colonizing distant planets and moons throughout the galaxy. But as the United Earth Space Probe Agency (UESPA) continued to push the boundaries of space exploration, they began to realize that they were not alone in the universe. A strange energy signature, detected emanating from a distant planet on the edge of the galaxy, had caught the attention of UESPA scientists. The signature, dubbed the 'Aurora Signal', seemed to be a message, beckoning humanity to explore the unknown reaches of the galaxy. UESPA assembled a team of experts, led by the brilliant and fearless Commander Sarah Jenkins, to investigate the signal and uncover its secrets. The team set out on the state-of-the-art spacecraft, Aurora, equipped with cutting-edge technology and a crew of the best and brightest that humanity had to offer. As they journeyed deeper into the galaxy, they encountered strange and wondrous sights, from nebulae that shimmered like rainbow-hued curtains to black holes that warped the fabric of space-time itself. But they also encountered dangers, from hostile alien species to treacherous asteroid fields that threatened to destroy their ship. Despite the challenges they faced, the crew of the Aurora remained steadfast in their mission, driven by a sense of wonder and a thirst for discovery. And as they finally reached the source of the Aurora Signal, they were met with a revelation that would change humanity's understanding of the universe forever.";

(async () => {
    try {
        const result = await getTimepointsandAudio(script, narrrative_section);
        console.log(result.timelineUrl);
        console.log(result.audioUrl);
    } catch (err) {
        console.error("Error:", err);
    }
})();
