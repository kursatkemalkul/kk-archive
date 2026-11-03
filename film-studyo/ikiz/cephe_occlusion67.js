// Retired storefront CPU occlusion pass. The normal renderer already handles
// opaque-wall depth. Do not rescan machine meshes or change their draw layers.
// Preserve the existing entry point without changing the main viewer module.
export function cepheOcclusion67(){
 return {before(){},after(){}};
}
