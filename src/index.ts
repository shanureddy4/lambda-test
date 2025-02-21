// This file is for local testing. 
import { alignAudioWithTranscript, Words } from "./aligner.js";
import { getLangaugeCode, getParameters, uploadContentToS3 } from "./helpers.js";
import { synthesizeWithEchogram } from "./tts.js";
import os from 'os';
os.homedir = function () {
    return '/home/user';
  };
async function getTimepointsandAudio(transcript: string, narrativeSection: string[]) {
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
const narrative_section = [
    "In a world ravaged by nuclear war, humanity teetered on the brink of extinction. The once blue skies were now a permanent gray, casting a morose shadow over the ruins of civilization.",
    "Amidst this desolate landscape, a young woman named Ava emerged as a beacon of hope. She had managed to survive the initial blast, and had spent years scavenging for food and supplies in the ruins of a once great city.",
    "But Ava's life took a dramatic turn when she stumbled upon a hidden underground bunker, filled with advanced technology and a cryptic message from the past.",
    "The message spoke of a secret organization, dedicated to rebuilding society and restoring the planet to its former glory.",
    "Ava knew she had to find this organization, and join their fight for a better future.",
    "She set out on a perilous journey across the ruins of the world, facing countless dangers and challenges along the way.",
    "But Ava refused to give up, driven by a fierce determination to survive and to make a difference.",
    "Finally, after months of traveling, Ava found the organization she had been searching for. They were a group of scientists and engineers, working tirelessly to develop new technologies and restore the planet.",
    "Ava joined their ranks, using her skills and experience to help them in their mission.",
    "Together, they worked towards a brighter future, one where humanity could thrive once more.",
    "And Ava, the young woman who had once been alone in a desolate world, had finally found a new family and a new purpose in life."
  ]

  const script = "In a world ravaged by nuclear war, humanity teetered on the brink of extinction. The once blue skies were now a permanent gray, casting a morose shadow over the ruins of civilization. Amidst this desolate landscape, a young woman named Ava emerged as a beacon of hope. She had managed to survive the initial blast, and had spent years scavenging for food and supplies in the ruins of a once great city. But Ava's life took a dramatic turn when she stumbled upon a hidden underground bunker, filled with advanced technology and a cryptic message from the past. The message spoke of a secret organization, dedicated to rebuilding society and restoring the planet to its former glory. Ava knew she had to find this organization, and join their fight for a better future. She set out on a perilous journey across the ruins of the world, facing countless dangers and challenges along the way. But Ava refused to give up, driven by a fierce determination to survive and to make a difference. Finally, after months of traveling, Ava found the organization she had been searching for. They were a group of scientists and engineers, working tirelessly to develop new technologies and restore the planet. Ava joined their ranks, using her skills and experience to help them in their mission. Together, they worked towards a brighter future, one where humanity could thrive once more. And Ava, the young woman who had once been alone in a desolate world, had finally found a new family and a new purpose in life.";
(async () => {
    try {
        const result = await getTimepointsandAudio(script, narrative_section);
        console.log(result.timelineUrl);
        console.log(result.audioUrl);
    } catch (err) {
        console.error("Error:", err);
    }
})();
