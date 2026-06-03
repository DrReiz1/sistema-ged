import multer from "multer";
import { AppError } from "../errors/app-error";

const allowedMimeTypes = new Map<string, string>([
  ["application/pdf", "pdf"],
  ["image/vnd.dwg", "dwg"],
  ["application/acad", "dwg"],
  ["application/dxf", "dxf"],
  ["image/x-dxf", "dxf"],
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/jpg", "jpg"],
  ["image/webp", "webp"],
  ["application/octet-stream", "bin"],
]);

const allowedExtensions = ["pdf", "dwg", "dxf", "png", "jpg", "jpeg", "webp"];
const extensionAliases: Record<string, string> = {
  jpeg: "jpg",
};

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    const rawExtension = file.originalname.split(".").pop()?.toLowerCase();
    const fileExtension = rawExtension ? (extensionAliases[rawExtension] ?? rawExtension) : undefined;
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      callback(new AppError("Unsupported file type", 400));
      return;
    }

    const mime = allowedMimeTypes.get(file.mimetype);
    if (mime && mime !== "bin" && mime !== fileExtension) {
      callback(new AppError("File extension does not match mime type", 400));
      return;
    }

    callback(null, true);
  },
});
