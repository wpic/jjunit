## What's this for?

Very small and fast and easy edit http server for mocking api and testing HTML components in your projects.
You can easily load all the static assets and also compile Coffeescript and LESS on fly!

## How to use it?

You need to setup Java8.

```
jjs -cp my-mock-server-VERSION.jar YOUR_SCRIPT.JS
```

In your script file to can use ```MyMockServer``` class by passing to argument:

* basedir: Base directory for static assets.
* handlers: handlers for rest APIs. (for example see sample/my-server.js)

For Example:

```
jjs -cp my-mock-server-1.0-SNAPSHOT.jar sample/my-server.js
```

You can use pom file to generate jar file ```mvn package assembly:single``` for download it from [releases page](https://github.com/wpic/my-mock-server/releases) (Unzip it).