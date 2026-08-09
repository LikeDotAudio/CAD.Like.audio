/**
 * Values baked in at build time by `define` in vite.config.ts.
 *
 * The revision stamp is set when the bundle is compiled, not when the app runs,
 * so what you read in the status bar identifies the deployed build.
 */
declare const __BUILD_STAMP__: string;
declare const __REPO_URL__: string;

/** Revision stamp of this build: YYYYMMDD.HH.MM, local time at compile. */
export const BUILD_STAMP: string = __BUILD_STAMP__;

/** Where the source for this build lives. */
export const REPO_URL: string = __REPO_URL__;
