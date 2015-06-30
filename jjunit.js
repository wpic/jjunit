/* ########################### Server ##################################*/

// try to load required Jar file it deos not in class pass
/*try {
    Java.type('io.undertow.Undertow');
} catch (e) {
    // Load data
    var File = Java.type('java.io.File');
    var file = new File('jjunit.jar');
    if (file.exists()) {
        var URLClassLoader = Java.type('java.net.URLClassLoader');
        new URLClassLoader([file.toURL()], file.getClass().getClassLoader());

        Java.type('io.undertow.Undertow');
    }
    else {
        print('jjunit.jar file does not find');
    }
}*/

function MyMockServer(base, handlers) {
    var Undertow = Java.type("io.undertow.Undertow");
    var Handlers = Java.type("io.undertow.Handlers");
    var Headers = Java.type("io.undertow.util.Headers");
    var HttpHandler = Java.type("io.undertow.server.HttpHandler");
    var FileResourceManager = Java.type("io.undertow.server.handlers.resource.FileResourceManager");
    var File = Java.type('java.io.File');
    var Scanner = Java.type('java.util.Scanner');
    var JCoffeeScriptCompiler = Java.type('org.jcoffeescript.JCoffeeScriptCompiler');
    var Less = Java.type("com.inet.lib.less.Less");
    var FileUtils = Java.type('org.apache.commons.io.FileUtils');
    var ByteBuffer = Java.type("java.nio.ByteBuffer");
    var String = Java.type("java.lang.String");

    var dir = new File(base);

    var isNewer = function(dir, file, ext) {
        if (file.exists()) {
            var files = FileUtils.listFiles(dir, [ext], true);
            for each (f in files) {
                if (f.lastModified() > file.lastModified()) {
                    return true;
                }
            }
            return false;
        }
        return true;
    }

    var toCss = function(name) {
        //var engine = new LessEngine();
        var file = new File(dir, name);
        if (file.exists()) {
            var cache = new File(dir, name + ".cache");
            var newer = isNewer(dir, cache, 'less');
            if (newer) {
                //var less = new Scanner(file).useDelimiter("\\A").next();
                var css = Less.compile(file, false);
                FileUtils.writeStringToFile(cache, css);
                return css;
            }
            else {
                return FileUtils.readFileToString(cache);
            }
        }
    }

    var toJs = function(name) {
        var compiler = new JCoffeeScriptCompiler();
        var file = new File(dir, name);
        if (file.exists()) {
            var cache = new File(dir, name + ".cache");
            var newer = isNewer(dir, cache, 'coffee');
            if (newer) {
                print('Recompile coffees script file');

                var coffeescript = new Scanner(file).useDelimiter("\\A").next();
                var js = compiler.compile(coffeescript);
                FileUtils.writeStringToFile(cache, js);
                return js;
            }
            else {
                return FileUtils.readFileToString(cache);
            }
        }
    }

    var myHandlers = [].concat(handlers);
     for each (h in myHandlers) {
        h.regex = new RegExp(h.path.replace(/\$[^/]+/, '(.*?)') + '$');
    }

    var myHttpHandler = new HttpHandler {

        handleRequest: function(exchange) {
            var path = exchange.getRequestURI();
            var defaultHandler = Handlers.resource(frm).addWelcomeFiles("/index.html");
            var method = exchange.getRequestMethod();

            for each (h in myHandlers) {
                if (h.regex.test(path) && method.equalToString(h.method)) {
                    // OK, try to handle rest service
                    var result;

                    // makes params
                    // TODO: Ugly design has to change later
                    var requestParts = h.path.split('/');
                    var responseParts = path.split('/');
                    var params = {};

                    for (var i = 0; i < requestParts.length; i++) {
                        if (requestParts[i].startsWith('$')) {
                            params[requestParts[i].substring(1)] = responseParts[i];
                        }
                    }

                    var data;
                    if (method.equalToString('POST') || method.equalToString('PUT')) {
                        data = new Scanner(exchange.getRequestChannel()).useDelimiter("\\A").next();

                        var content = exchange.getRequestHeaders().getFirst('Content-Type');

                        // convert to json if it can
                        if (content === 'application/json') {
                            data = JSON.parse(data);
                        }
                    }

                    result = h.handler(params, data);

                    if (result === null) {
                        exchange.setResponseCode(204);
                    }
                    else if (result === undefined) {
                        exchange.setResponseCode(404);
                    }
                    else {
                        if (typeof(result) == 'string') {
                            if (result.startsWith('<')) {
                                exchange.getResponseHeaders().put(Headers.CONTENT_TYPE, 'text/html');
                            }
                            else {
                                exchange.getResponseHeaders().put(Headers.CONTENT_TYPE, 'text/plain');
                            }
                            exchange.getResponseSender().send(result);
                        }
                        else {
                            exchange.getResponseHeaders().put(Headers.CONTENT_TYPE, 'application/json');
                            exchange.getResponseSender().send(JSON.stringify(result));
                        }
                    }

                    return;
                }
            }

            var handled = false;
            if (path.endsWith('.css')) {
                var file = new File(dir, exchange.getRequestURI());
                if (!file.exists()) {
                    exchange.getResponseHeaders().put(Headers.CONTENT_TYPE, 'text/css');
                    var css = toCss(path.substring(0, path.length() - 3) + 'less');
                    if (css != undefined) {
                        exchange.getResponseSender().send(css);
                        handled = true;
                    }
                }
            }
            else if (path.endsWith('.js')) {
                var file = new File(dir, exchange.getRequestURI());
                if (!file.exists()) {
                    exchange.getResponseHeaders().put(Headers.CONTENT_TYPE, 'text/javascript');
                    var js = toJs(path.substring(0, path.length() - 2) + 'coffee');
                    if (js !== undefined) {
                        exchange.getResponseSender().send(js);
                        handled = true;
                    }
                }
            }

            if (!handled) {
                defaultHandler.handleRequest(exchange);
            }
        }

    }

    var frm = new FileResourceManager(dir, 100);

    this.server = Undertow.builder()
        .addHttpListener(8080, "0.0.0.0")
        .setHandler(myHttpHandler)
        .build();
}

MyMockServer.prototype.start = function() {
    this.server.start();

    // Wait for all thread to finish
    var Thread = Java.type("java.lang.Thread");
    Thread.currentThread().join();
}

var loadCoffee = function(path) {
    var JCoffeeScriptCompiler = Java.type('org.jcoffeescript.JCoffeeScriptCompiler');
    var File = Java.type('java.io.File');
    var Scanner = Java.type('java.util.Scanner');
    var FileUtils = Java.type('org.apache.commons.io.FileUtils');

    if (path.endsWith('.js')) {
        load(path);
    }
    else if (path.endsWith('.coffee')) {
        var compiler = new JCoffeeScriptCompiler();
        var file = new File(path);
        var cache = new File(path + ".cache");

        var coffeescript = new Scanner(file).useDelimiter("\\A").next();
        var js = compiler.compile(coffeescript);
        FileUtils.writeStringToFile(cache, js);

        load(path + ".cache");
    }
    else {
        throw 'Illegal format: ' + path;
    }
}
