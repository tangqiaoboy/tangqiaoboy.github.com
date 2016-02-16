
v6 = _objc_msgSend(&OBJC_CLASS___VersionAgent, 
                   "sharedInstance");
v7 = objc_retainAutoreleasedReturnValue(v6);
v41 = _objc_msgSend(v7, "isUpgraded");
objc_release(v7);
if ( v41 )
{
    NSLog(CFSTR("app is upgraded"), v41);
    _objc_msgSend(&OBJC_CLASS___FileUtils, 
                  "clearCacheDirectory");
    v8 = _objc_msgSend(&OBJC_CLASS___VersionAgent,
                       "sharedInstance");
    v9 = objc_retainAutoreleasedReturnValue(v8);
    _objc_msgSend(v9, "saveAppVersion");
    objc_release(v9);
}