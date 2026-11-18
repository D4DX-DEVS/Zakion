// The largest single file the admin accepts (images, video and PDF), in bytes and as shown to people.
// next.config.ts lets one whole request be twice this (serverActions.bodySizeLimit), because the Library form can send several files at
// once; each file is still checked against this limit one by one.
export const MAX_UPLOAD = 15 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = "15 MB";
