import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { SSMClient, GetParametersCommand } from "@aws-sdk/client-ssm";
import { AWS_REGION } from "./constants.js";
import { v4 as uuidv4 } from 'uuid';
const s3 = new S3Client({ region: AWS_REGION }); // Set your AWS region
async function uploadContentToS3(audio, timeline, bucketName, user_id, script_titile) {
    const uid = uuidv4();
    const [audioKey, timelineKey] = [`${user_id}/assets/${script_titile}/audio_${uid}.mp3`, `${user_id}/assets/${script_titile}/template_${uid}.json`];
    const uploadPromises = [
        s3.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: audioKey,
            Body: Buffer.from(audio),
            ContentType: "audio/mp3",
        })),
        s3.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: timelineKey,
            Body: Buffer.from(JSON.stringify(timeline)),
            ContentType: "application/json",
        }))
    ];
    await Promise.all(uploadPromises);
    return {
        audioUrl: `https://${bucketName}.s3.${AWS_REGION}.amazonaws.com/${audioKey}`,
        timelineUrl: `https://${bucketName}.s3.${AWS_REGION}.amazonaws.com/${timelineKey}`
    };
}
async function getParameters(voice) {
    const ssmClient = new SSMClient({ region: AWS_REGION }); // Change region if needed
    try {
        const params = {
            Names: ["/snapflow/configs/GOOGLE_API_KEY", `/snapflow/voices/${voice}`],
            WithDecryption: true, // Needed for SecureString
        };
        const command = new GetParametersCommand(params);
        const response = await ssmClient.send(command);
        let googleApiKey = "";
        let googleVoice = "";
        response.Parameters?.forEach(param => {
            if (param.Name === "/snapflow/configs/GOOGLE_API_KEY") {
                googleApiKey = param.Value;
            }
            else if (param.Name === `/snapflow/voices/${voice}`) {
                googleVoice = param.Value;
            }
        });
        return { googleApiKey, googleVoice };
    }
    catch (error) {
        console.error("Error fetching parameters:", error.message);
        throw error;
    }
}
export function getLangaugeCode(googleVoice) {
    const parts = googleVoice && googleVoice.split('-');
    return parts.length > 1 ? `${parts[0]}-${parts[1]}` : '';
}
export { uploadContentToS3, getParameters };
