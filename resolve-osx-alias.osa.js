#! /usr/bin/osascript -l JavaScript

/* Usage: resolve-osx-alias [<path>]

  Prints the absolute path of the provided path to standard out. If the path is an alias, the absolute path of
  the target of the alias is shown. Aliases are the macOS shortcuts you can create using Finder's "Make Alias"
  context menu command.

  Good to Know:

   - If path is a relative path, it is resolved relative to the current working directory. 
   - If path is omitted, the path is assumed to be the current working directory. 
   - If path provided is not an alias, the absolute path of the item is displayed.
   - If path is not a valid path, it will be shown unchanged. 
   - If the resolved path is a folder, it will be shown with a trailing slash.

  When debug is turned on, the following pretty prints the JSON debug messages:
  resolve-osx-alias ~/Desktop/a.workflow.alias 2> >(perl -pe 's|^DEBUG||' | cut -f2- -d: | jq '.')

*/

const DEBUG = false;
const EMPTY = '';

function run(parameters) {

  importStandardLibrary();

  const absolutePath = makePathAbsolute(parameters && parameters[0] ? parameters[0] : "."); 
  const isValidPath  = doesPathExist(absolutePath) && isAliasPath(absolutePath);
  const resolvedPath = isValidPath ? resolve(absolutePath) : absolutePath;

  log( { parameters, absolutePath, isValidPath } );

  return /* JXA writes this to stdout */ resolvedPath;
}

function resolve(absolutePath) {

  const segments  = absolutePath.split('/').filter(element => element.length > 0);
  const basename  = segments.length > 0 ? segments.slice(-1)[0] : EMPTY;
  const ancestors = segments.length > 1 ? segments.slice(0, segments.length - 1) : [];

  const navigator = getNavigatorForDirectory(ancestors);
  const resolvedPath = getAliasTargetPath(navigator, basename);

  log( { absolutePath, segments, basename, resolvedPath } );

  return resolvedPath;
}

function getNavigatorForDirectory(directoryPathSegments) {

  let navigator = Application("Finder").startupDisk;

  for(index = 0; index < directoryPathSegments.length; index++) {

    navigator = navigator.items.byName(directoryPathSegments[index]);
  }

  return navigator; 
}

function getAliasTargetPath(enclosingDirectoryNavigator, aliasName) {

  const target = aliasName ? 
                 enclosingDirectoryNavigator.aliasFiles.byName(aliasName).originalItem : 
                 enclosingDirectoryNavigator;

  log( { targetUrl : target.url() } );

  return target.url().replace(/^file:\/\//, '');
}

function getPathFromFileSystemItemEntry(itemEntry) {

  return itemEntry ? itemEntry.url().replace(/^file:\/\//, EMPTY) : EMPTY; 
}

function doesPathExist(absolutePath) { 

  const pathObject = Path(absolutePath);

  return Application('Finder').exists(pathObject);
}

function isAliasPath(absolutePath) {

  const pathObject = Path(absolutePath);
   
  return getCurrentApplication().infoFor(pathObject).alias;
}

function isFolderPath(absolutePath) {

  const pathObject = Path(absolutePath);
   
  return getCurrentApplication().infoFor(pathObject).folder;
}

function makePathAbsolute(path) {

  const changedPath = standardizePath(path); 

  let absolutePath = isPathAbsolute(changedPath) ? 
                     changedPath : 
                     standardizePath( getCurrentWorkingDirectory() + '/' + path);

  absolutePath =  isFolderPath(absolutePath) && ! doesPathContainTrailingSlash(absolutePath) ? 
                  absolutePath + '/' : 
                  absolutePath ;

  log( { absolutePath } );

  return absolutePath;

}

function isPathAbsolute(path) {

  return path && path.length > 0 && path[0] === "/";
}

function doesPathContainTrailingSlash(path) {

  return path && path.length > 0 && path[path.length - 1] === "/";
}

function standardizePath(path) {

  return $(path).stringByStandardizingPath.js; 
}

function getCurrentWorkingDirectory() {
  
  return  $.getenv('PWD');
}

function getCurrentApplication() {

  const app = Application.currentApplication();
  app.includeStandardAdditions = true;

  return app;
}

function importStandardLibrary() {

  ObjC.import('stdlib');
}

function log(entries) {

 
 DEBUG && console.log( "DEBUG: " + JSON.stringify(entries) );

}

