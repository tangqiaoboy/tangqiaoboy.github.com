
if ([[VersionAgent sharedInstance] isUpgraded]) {
    NSLog(@"app is upgraded");
    [FileUtils clearCacheDirectory];
    [[VersionAgent sharedInstance] saveAppVersion];
}
