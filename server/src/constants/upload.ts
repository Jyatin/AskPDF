import path from "path";

const UPLOAD_DIR = path.resolve(__dirname, "../../uploads");
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
const ALLOWED_MIME_TYPES = ["application/pdf"];

export { UPLOAD_DIR, MAX_FILE_SIZE, ALLOWED_MIME_TYPES };
