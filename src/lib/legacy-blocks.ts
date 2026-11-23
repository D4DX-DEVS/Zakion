// The stored pages still carry two blocks from the original deck build (class "zk"): the Technology Partners logo grid and the "Power Your
// Future" call to action. Inner pages no longer show them, so they are cut out when the page is drawn. The stored pages stay as they are, and
// the same two blocks can still be added to any page as the editable blocks (Settings > Section order). The home page is left alone: it
// rebuilds everything between its banner and footer from its own block list.
const LEGACY = /<section class="zk[^"]*" id="(?:technology-partners|power-your-future)">[\s\S]*?<\/section>/g;

export function stripLegacyBlocks(body: string, path: string): string {
  return path === "/" ? body : body.replace(LEGACY, "");
}
