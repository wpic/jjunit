## What's this for?

Very small and fast and easy edit http server for mocking api and testing HTML components in your projects.
You can easily load all the static assets and also compile Coffeescript and LESS on fly!

## How to use it?

You need to setup Java8.

```
jjs -cp jjunit.jar YOUR_SERVER_SCRIPT.JS
```

In your script file you can use ```JJUnit``` class by passing to argument:

* basedir: Base directory for static assets.
* handlers: handlers for rest APIs. (for example see sample/server.js)

For Example:

```
jjs -cp jjunit.jar sample/start.js
```

You can use pom file to generate jar file ```mvn package assembly:single``` for download it from [releases page](https://github.com/wpic/jjunit/releases) (Unzip it).
