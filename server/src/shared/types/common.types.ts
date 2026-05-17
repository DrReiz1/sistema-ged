export type DocumentStatus = "active" | "archived" | "draft";

export interface PaginationQuery {
  page?: number;
  limit?: number;
}
