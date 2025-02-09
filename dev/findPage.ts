import fs from "fs";
import path from "path";

// Helper function to recursively read the directory and find files
const readDirRecursive = (dir: string, filelist: string[] = []) => {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      filelist = readDirRecursive(filepath, filelist);
    } else {
      filelist.push(filepath);
    }
  });
  return filelist;
};

// Function to get the list of all files in the /app directory
const getAllFilesInAppDirectory = (appDir: string) => {
  const files = readDirRecursive(appDir);
  return files;
};

export { getAllFilesInAppDirectory };
function getRouteFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return path.join(urlObj.pathname, "page.tsx");
  } catch (error) {
    console.error("Invalid URL:", error);
    return "";
  }
}

function matchPath(paths: string[], url: string) {
  const segments = url.split("/").filter((segment) => segment);

  let matchedPath = null;
  let matchedSegments = 0;

  paths.forEach((path) => {
    const pathSegments = path.split("/").filter((segment) => segment);

    let isMatch = true;
    let wildcardDepth = 0;

    for (let i = 0; i < pathSegments.length; i++) {
      const pathSegment = pathSegments[i];
      const urlSegment = segments[i];

      if (pathSegment.startsWith("[") && pathSegment.endsWith("]")) {
        // Single segment wildcard
        if (!urlSegment) {
          isMatch = false;
          break;
        }
      } else if (
        pathSegment.startsWith("[[...") &&
        pathSegment.endsWith("]]")
      ) {
        // Multi-segment wildcard
        wildcardDepth = pathSegments.length - i - 1;
        break;
      } else if (pathSegment !== urlSegment) {
        isMatch = false;
        break;
      }
    }

    if (isMatch && pathSegments.length - wildcardDepth > matchedSegments) {
      matchedSegments = pathSegments.length - wildcardDepth;
      matchedPath = path;
    }
  });

  return matchedPath;
}

// Function to map URLs to file paths
const findPageFileForUrl = (url: string, appDir: string) => {
  const files = getAllFilesInAppDirectory(appDir)
    .map((file) => {
      return file.substring(appDir.length + 1).toLowerCase();
    })
    .filter((file) => {
      return file.endsWith("/layout.tsx") || file.endsWith("/page.tsx");
    });

  const routeElements = path.join(url.toLowerCase(), "page.tsx");

  return path.join(appDir, matchPath(files, routeElements)!);
};

export { findPageFileForUrl };
