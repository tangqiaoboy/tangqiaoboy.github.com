/**
 * QQApi provides api for web pages which are embeded into qq client
 * web pages could use these api to invoke client capabilities
 * you may include this script in your page like this:
 * 
 * <script src="http://qqlocal/api/qqapi.js"></script>
 */
iOSQQApi = {
    /**
     * Helper method for opening an url
     * @param url
     */
    _openURL: function(url){
        //create an iframe to send the request
        var i = document.createElement('iframe');
        i.style.display = 'none';
        i.onload = function() { i.parentNode.removeChild(i); };
        i.src = url;
        document.body.appendChild(i);
    
        //read return value
        var returnValue = iOSQQApi.__RETURN_VALUE;
        iOSQQApi.__RETURN_VALUE = undefined;
        return returnValue;
    },

    _invokeClientMethod: function(module, name, parameters){
        var url = 'jsbridge://' + module + '/' + name + '?p=' + encodeURIComponent(JSON.stringify(parameters || {}));
        console.log('[API]' + url);
        var r = iOSQQApi._openURL(url);
        return r ? r.result : null;
    },

    _createGlobalFuncForCallback: function(callback){
        if (callback) {
            var name = '__GLOBAL_CALLBACK__' + (iOSQQApi.__globalFuncIndex++)
            window[name] = function(){
                var args = arguments;
                var func = (typeof callback == "function") ? callback : window[callback];
                //we need to use setimeout here to avoid ui thread being frezzen
                setTimeout(function(){ func.apply(null, args); }, 0);
            };
            return name;
        }
        return null;
    },
    
    //兼容旧接口
    isAppInstalled: function(){
        return iOSQQApi.app.isAppInstalled.apply(null, arguments);
    },
    isAppInstalledBatch: function(){
        return iOSQQApi.app.isAppInstalledBatch.apply(null, arguments);
    },

    __globalFuncIndex: 0,
    __RETURN_VALUE: undefined,
    
    /**
     * Device Module ================================================================================================
     */
    device: {
        isMobileQQ:         function(){ return iOSQQApi._invokeClientMethod('device', 'isMobileQQ');        },
        systemName:         function(){ return iOSQQApi._invokeClientMethod('device', 'systemName');        },
        systemVersion:      function(){ return iOSQQApi._invokeClientMethod('device', 'systemVersion');     },
        model:              function(){ return iOSQQApi._invokeClientMethod('device', 'model');             },
        modelVersion:       function(){ return iOSQQApi._invokeClientMethod('device', 'modelVersion');      },
        qqVersion:          function(){ return iOSQQApi._invokeClientMethod('device', 'qqVersion');         },
        qqBuild:            function(){ return iOSQQApi._invokeClientMethod('device', 'qqBuild');           }
    },

    /**
     * Application Module ===========================================================================================
     */
    app: {
        /**
         查询单个应用是否已安装
         @param {String} scheme 比如'mqq'
         @return {Boolean}
         */
        isAppInstalled: function(scheme) {
            return iOSQQApi._invokeClientMethod('app', 'isInstalled', {'scheme':scheme});
        },
    
        /**
         批量查询指定应用是否已安装
         @param {Array<String>} schemes 比如['mqq', 'mqqapi']
         @return {Array<Boolean>}
         */
        isAppInstalledBatch: function(schemes) {
            return iOSQQApi._invokeClientMethod('app', 'batchIsInstalled', {'schemes':schemes});
        }
    },
    
    /**
     * Navigation Module ============================================================================================
     */
    nav: {
        /**
         返回打开webview的上一层view controller
         */
        popBack: function(){
            iOSQQApi._invokeClientMethod('nav', 'popBack');
        },

        /**
         按指定方式重刷当前页面
         */
        reload: function(options){
            iOSQQApi._invokeClientMethod('nav', 'reload', options);
        },
        
        showLoading: function(){
            iOSQQApi._invokeClientMethod('nav', 'showLoading');
        },
        hideLoading: function(){
            iOSQQApi._invokeClientMethod('nav', 'hideLoading');
        },
        setLoadingColor: function(r, g, b){
            iOSQQApi._invokeClientMethod('nav', 'setLoadingColor', {'r':r, 'g':g, 'b':b});
        },

        setActionButton: function(title, callback){
            var callbackName = callback ? iOSQQApi._createGlobalFuncForCallback(callback) : null;
            iOSQQApi._invokeClientMethod('nav', 'setActionButton', {'title':title, 'callback':callbackName});
        },
        
        /**
         推入展示指定公众帐号详情信息的view controller
         @param {String} uin
         */
        showOfficalAccountDetail: function(uin){
            iOSQQApi._invokeClientMethod('nav', 'showOfficalAccountDetail', {'uin':uin});
        },

        /**
         推入新WebView来打开指定url
         @param {String} url
         @param {Object} options 用于控制WebView的展现和行为
                         - {String} style               WebView样式，可取如下值：
                            - 'topbar'                      顶部控制栏模式（默认）/1
                            - 'topbarWithoutShare'          顶部控制栏模式（没分享入口）/4
                            - 'bottombar'                   底部工具栏模式 /2
                            - 'bottombarWithoutShare'       底部工具栏模式（没分享入口）/5
                        - {String} relatedAccount       相关帐号
                        - {String} relatedAccountType   相关帐号类型
                            - 'officalAccount'              公众帐号
         */
        openLinkInNewWebView: function(url, options){
            if (!options) {
                options = {};
            }
            options.styleCode = 1;
            if (options && options.style) {
                switch(options.style){
                    case 'topbarWithoutShare':      options.styleCode = 4; break;
                    case 'bottombar':               options.styleCode = 2; break;
                    case 'bottombarWithoutShare':   options.styleCode = 5; break;
                }
            }
            iOSQQApi._invokeClientMethod('nav', 'openLinkInNewWebView', {'url':url, 'options':options});
        },

        openLinkInSafari: function(url){
            iOSQQApi._invokeClientMethod('nav', 'openLinkInSafari', {'url':url});
        }
    },
    
    /**
     * Data Module ==================================================================================================
     */
    data: {
        userInfo: function(){
            return iOSQQApi._invokeClientMethod('data', 'userInfo');
        },

        currentLocation: function(callback){
            var callbackName = callback ? iOSQQApi._createGlobalFuncForCallback(callback) : null;
            return iOSQQApi._invokeClientMethod('data', 'queryCurrentLocation', {'callback':callbackName});
        },

        /**
         拉取json数据
         @param {String} url
         @param {Object} params 请求参数
         @param {Object} options 请求配置
                         - method: 'GET'/'POST', 默认为GET
                         - timeout: 超时时间，默认无超时时间
         @param {Function/String} 回调函数（或该函数的名字），参数格式：function(responseText, context, httpStatusCode){ ... }
         @param {Object} context 会原样传入到callback内
         */
        fetchJson: function(url, params, options, callback, context){
            //query parameters
            components = ["_t=" + (new Date()).getTime()];
            if (params) {
                for(var key in params){
                    components.push(key + '=' + encodeURIComponent(params[key]));
                }
            };
            options = options || {};
            //callback function
            var callbackName = callback ? iOSQQApi._createGlobalFuncForCallback(callback) : null;
            //send request to url via client
            iOSQQApi._invokeClientMethod('data', 'fetchJson', {
                'method': options['method'] || 'GET',
                'timeout': options['timeout'] || -1,
                'url': url,
                'params': components.join('&'),
                'callback': callbackName,
                'context': JSON.stringify(context)
            });
        },
        /**
         批量获取当前用户指定应用的openid
         @param {Array<String>} appID数组
         @param {Object} options
         @param {Function/String} callback
         @param {Object} context
         */
        batchFetchOpenID: function(appIDs, options, callback, context){
            iOSQQApi.data.fetchJson(
                'http://cgi.connect.qq.com/api/get_openids_by_appids',
                {'appids': JSON.stringify(appIDs)},
                null, callback, null
            );
        }
    }
}