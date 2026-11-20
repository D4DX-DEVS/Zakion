// The largest single file the admin accepts, in bytes and as shown to people: videos up to 25 MB, everything else (images and PDF) up to 15 MB.
// next.config.ts lets one whole request be twice the video limit (serverActions.bodySizeLimit), because the Library form can send several
// files at once; each file is still checked against its own limit one by one.
export const MAX_IMAGE = 15 * 1024 * 1024;
export const MAX_VIDEO = 25 * 1024 * 1024;
export const IMAGE_LABEL = "15 MB";
export const VIDEO_LABEL = "25 MB";

const isVideo = (type: string) => type.startsWith("video/");
/** The size limit, in bytes, for a file of this MIME type. */
export const maxUpload = (type: string) => (isVideo(type) ? MAX_VIDEO : MAX_IMAGE);
/** The same limit as people read it ("25 MB"). */
export const maxUploadLabel = (type: string) => (isVideo(type) ? VIDEO_LABEL : IMAGE_LABEL);
/** One sentence naming both limits, for pages that take any kind of file. */
export const LIMITS_TEXT = `Images and PDFs can be up to ${IMAGE_LABEL}, videos up to ${VIDEO_LABEL}.`;
