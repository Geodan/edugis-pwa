const getRootUrl=() => {
  const url = new URL(document.baseURI);
  return url.origin + url.pathname.split('/').map((part,idx,arr)=>idx===arr.length-1?'':part).join('/');
}
export const rootUrl = getRootUrl();
export default rootUrl;
