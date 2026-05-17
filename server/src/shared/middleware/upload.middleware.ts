import multer from "multer";
import { AppError } from "../errors/app-error";

const allowedMimeTypes = new Map<string, string>([
  ["application/pdf", "pdf"],
  ["image/vnd.dwg", "dwg"],
  ["application/acad", "dwg"],
  ["application/dxf", "dxf"],
  ["image/x-dxf", "dxf"],
  ["application/octet-stream", "bin"],
]);

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    const fileExtension = file.originalname.split(".").pop()?.toLowerCase();
    if (!fileExtension || !["pdf", "dwg", "dxf"].includes(fileExtension)) {
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
