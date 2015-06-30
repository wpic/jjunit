load 'my-mock-server.js'

SimpleDateFormat = Java.type 'java.text.SimpleDateFormat'
Date = Java.type("java.util.Date");

dateFormat = new SimpleDateFormat 'yyyy-MM-dd hh:mm'
scripts = [
    name: 'sample.js'
    content: ''
    temp: 'function(a) {}'
    committed: false
    lastEdit: dateFormat.format new Date()
]

handlers = [
        method: 'GET'
        path: '/rest/scripts'
        handler: (param) -> scripts
    ,
        method: 'GET'
        path: '/rest/scripts/$name'
        handler: (param) ->
            for script in scripts
                if script.name is param.name
                    return script
    ,
        method: 'POST'
        path: '/rest/scripts/$name'
        accept: 'application/json'
        handler: (param, data) ->
            scripts.push
                name: param.name
                committed: false
                temp: data
                lastEdit: dateFormat.format new Date()
            return null
    ,
        method: 'PUT'
        path: '/rest/scripts/$name'
        accept: 'text/plain'
        handler: (param, data) ->
            for script in scripts
                if script.name is param.name
                    script.temp = data
                    script.lastEdit = dateFormat.format new Date()
                    script.committed = false
                    return null
    ,
        method: 'PUT'
        path: '/rest/scripts/commit/$name'
        handler: (param) ->
            for script in scripts
                if script.name is param.name
                    script.content = script.temp
                    script.lastEdit = dateFormat.format new Date()
                    script.committed = true
                    return null
    ,
        method: 'DELETE'
        path: '/rest/scripts/$name'
        handler: (param) ->
            for i,script in scripts
                if scripts[i].name is param.name
                    scripts.splice(i, 1)
                    return null
]

server = new MyMockServer 'sample/', handlers
server.start()


