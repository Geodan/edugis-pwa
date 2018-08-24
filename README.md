
> ## 🛠 Status: In Development

# EduGIS-lithtml

EduGIS, http://www.edugis.nl and http://kaart.edugis.nl is an application to acquaint students with Geographical Information Systems (GIS) without the need to first install software or download data.


## Pre-requisties
* git
* node with npm  
* polymer-cli `(npm install -g polymer-cli)`

## Get source and dependencies
```
# get source from github
git clone [this_repository]
cd this_rpository
# add dependencies
npm install
```

## Local run and develop
```
polymer serve
```
Browse to http://localhost:8081 (or another port)

## Build for static http server
If the application should run on http://your-server/your-path for ES5 compatible browsers, use:

```
polymer build --name es5-bundled --base-path your-path
```
The resulting static web files are generated under `build/es5-bundled/`


## TODOs

Many...