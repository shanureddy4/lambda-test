import { synthesize } from 'echogarden/dist/synthesis/GoogleCloudTTS.js';
export async function synthesizeWithEchogram(
    narrativeSections:string[],
    apiKey:string,
    voice:string,
    language_code?:string,
    speaking_rate?:number){
    const markedScript = `<speak> ${narrativeSections
        .map((section, index) => `${section}<mark name="marked_${index}"/>`)
        .join(' ')} </speak>`;
    const input = {
        text :markedScript,
        apiKey:apiKey,
        languageCode : language_code,
        voice: voice,
        speakingRate: speaking_rate,
        pitchDeltaSemitones: 0.0,
        volumeGainDecibels:0.0,
        ssml:true
    }
    const { audioData, timepoints } =  await synthesize(
        input.text,
        input.apiKey,
        input.languageCode,
        input.voice,
        input.speakingRate,
        input.pitchDeltaSemitones,
        input.volumeGainDecibels,
        input.ssml
    )
    return {audioData,timepoints}
    
}

