import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { alignAudioWithTranscript } from "./src/aligner.js";
import { S3_BUCKET_NAME } from "./src/constants.js";
import { getLangaugeCode, getParameters, uploadContentToS3 } from "./src/helpers.js";
import { EventBody } from "./src/interfaces.js";
import { synthesizeWithEchogram } from "./src/tts.js";

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Received event:', JSON.stringify(event, null, 2));

    if (!event.body) {
      return createResponse(400, { message: 'No event body provided' });
    }

    const body = validateEventBody(JSON.parse(event.body));
    const { googleApiKey, googleVoice } = await getParameters(body.voice);
    const language_code = getLangaugeCode(googleVoice);

    const { audioData, timepoints } = await synthesizeWithEchogram(
      body.narrative_sections,
      googleApiKey,
      googleVoice,
      language_code,
      body.speaking_rate
    );
    console.log("google synthesize done, here timepoints", timepoints);
    const wordsTimepoints = await alignAudioWithTranscript(
      audioData,
      body.narrative_sections.join(' '),
      language_code
    );
    console.log("echogarden done, here are words", wordsTimepoints);
    const metadata = {
      marked_timepoints: timepoints,
      words: wordsTimepoints,
    };

    const { audioUrl, timelineUrl } = await uploadContentToS3(
      audioData,
      metadata,
      S3_BUCKET_NAME,
      body.user_id,
      body.script_titile.toLowerCase()
    );

    return createResponse(200, {
      message: 'Successfully processed the event',
      audioUrl,
      timelineUrl
    });

  } catch (error: unknown) {
    console.error('Error:', error);
    return error instanceof Error ? 
      createResponse(500, { message: 'Internal Server Error', error: error.message }) :
      createResponse(500, { message: 'Internal Server Error', error: 'Unknown error' });
  }
};

const createResponse = (statusCode: number, body: object): APIGatewayProxyResult => ({
  statusCode,
  body: JSON.stringify(body),
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  }
});

const validateEventBody = (body: any): EventBody => {
  if (!body.user_id || !body.script_titile || !body.voice || !body.narrative_sections || !Array.isArray(body.narrative_sections)) {
    throw new Error('Invalid request body structure');
  }
  return body as EventBody;
};
