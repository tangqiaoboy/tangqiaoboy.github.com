
iOSQQApi = {
    // ...
    app: {
        /**
         查询单个应用是否已安装
         @param {String} scheme 比如'mqq'
         @return {Boolean}
         */
        isAppInstalled: function(scheme) {
            return iOSQQApi._invokeClientMethod(
                'app', 'isInstalled', 
                {'scheme':scheme});
        },
    
        /**
         批量查询指定应用是否已安装
         @param {Array<String>} schemes 
                比如['mqq', 'mqqapi']
         @return {Array<Boolean>}
         */
        isAppInstalledBatch: function(schemes) {
            return iOSQQApi._invokeClientMethod(
                'app','batchIsInstalled', 
                {'schemes':schemes});
        }
    },
    // ...
}
