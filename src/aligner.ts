import * as Echogarden from 'echogarden';
import { Timeline } from 'echogarden/dist/utilities/Timeline.js';
export interface Words{
    start: number;
    end: number;
    punctuated_word: string;
}
export async function alignAudioWithTranscript(inputAudio: Uint8Array, transcript: string, language_code:string): Promise<Words[]> {
    try {
        const options: Echogarden.AlignmentOptions = {
            engine: 'whisper',
            language:language_code,
        };
        const result = await Echogarden.align(inputAudio, transcript, options);
        addMissingPunctuation(result.wordTimeline, transcript, 1);
        // Map word timeline to Words array
        const words: Words[] = result.wordTimeline.map(word => ({
            start: word.startTime,
            end: word.endTime,
            punctuated_word: word.text
        }));

        return words; 
    } catch (error) {
        console.error('Error during alignment:', error);
        return []; 
    }
}
/**
 * 
 * @param wordTimeline 
 * @param transcript 
 * @param threshold 
 * * We know we have some punctuations and quotes missing from the wordtimeline. 
 * The idea is, first we collect all missing gaps between words and store them in the wordingText.
 * He here we must always have these 3 scenarios:
 * if the symbol belongs to current word then for the word text there will not space at the beginning of the wordText. 
 *      eg:"hello, world" -> so we asign to current one.
 * If the symbols belongs to the next word then for the next word text there will not space at the end of the wordText.
 *     eg: "hello 'world'" -> so we asign to next one.
 * If there is no space in the wordText at begenning and at last, then there must be space in between the wordText.
 *  eg: "hello, 'shanu'" -> so we asign to both."
 * so at any cost it will fall in any of theese scenairos. 
 * 
 * @returns 
 */
// TODO for french this will not work, since there will be space before the punctuation. Bonjure ? esta. Like this.
function addMissingPunctuation(wordTimeline: Timeline, transcript: string, threshold: number = 1) {
    wordTimeline.forEach((currWord, i) => {
        const nextWord = wordTimeline[i + 1];

        // Edge case for the first word
        if (i === 0 && currWord.startOffsetUtf16 != 0) {
            currWord.text = transcript.substring(0, currWord.startOffsetUtf16) + currWord.text;
            currWord.text = currWord.text.trim();
        }

        if (nextWord && nextWord.startOffsetUtf16 != null && currWord.endOffsetUtf16 != null && (nextWord.startOffsetUtf16 - currWord.endOffsetUtf16) > threshold) {
            const wordingText = transcript.substring(currWord.endOffsetUtf16, nextWord.startOffsetUtf16);

            if (wordingText.charAt(0) === ' ') {
                nextWord.text = wordingText + nextWord.text;
                nextWord.text = nextWord.text.trim();
            } else if (wordingText.charAt(wordingText.length - 1) === ' ') {
                currWord.text = currWord.text + wordingText;
                currWord.text = currWord.text.trim();
            } else {
                const splitterIndex = wordingText.indexOf(' ');
                if (splitterIndex !== -1) {
                    currWord.text = currWord.text + wordingText.substring(0, splitterIndex);
                    nextWord.text = wordingText.substring(splitterIndex) + nextWord.text;
                    nextWord.text = nextWord.text.trim();
                    currWord.text = currWord.text.trim();
                }
            }
        }
    });

    // Handle the last word
    const lastWord = wordTimeline[wordTimeline.length - 1];
    if (lastWord.endOffsetUtf16 != null && lastWord.endOffsetUtf16 != transcript.length) {
        lastWord.text = lastWord.text + transcript.substring(lastWord.endOffsetUtf16, transcript.length);
        lastWord.text = lastWord.text.trim();
    }
}

