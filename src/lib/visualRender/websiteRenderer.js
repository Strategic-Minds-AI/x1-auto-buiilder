// Website renderer — dispatches to the appropriate layout renderer based on
// the template's `layout` field. Each layout is structurally different.
import { renderWebsiteLayout } from "./websiteLayouts.js";
import { DEFAULT_CONFIG } from "./studioConfig.js";

const BROWSER = { w: 760, h: 460 };

export function renderWebsite(template, config) {
  const html = renderWebsiteLayout(template);
  return {
    frame: "browser",
    designW: BROWSER.w,
    designH: BROWSER.h,
    html,
  };
}