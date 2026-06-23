import { SetMetadata } from "@nestjs/common";

/** Marks a route handler/controller as not requiring authentication. */
export const IS_PUBLIC = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC, true);
