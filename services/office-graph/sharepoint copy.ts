/*
  url = https://site.sharepoint.com/sites/site-name/lists/list-name/items/item-id
  */
export async function splitUrl(url: string) {
  const parts1 = url.split("https://");
  const parts2 = parts1[1].split("/sites/");
  const dns = parts2[0];
  const parts3 = parts2[1].split("/");
  const site = parts3[0];
  const siteUrl = "https://" + dns + "/sites/" + site;
  return { siteUrl, host: "https://" + dns, site };
}
