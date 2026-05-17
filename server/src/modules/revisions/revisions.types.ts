export interface CreateRevisionInput {
  documentId: string;
  actorUserId: string;
  fileName: string;
  fileExtension: string;
  fileBuffer: Buffer;
}
