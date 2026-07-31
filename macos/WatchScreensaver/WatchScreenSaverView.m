#import <ScreenSaver/ScreenSaver.h>
#import <WebKit/WebKit.h>
#import <objc/message.h>

@interface WatchScreenSaverView : ScreenSaverView <WKNavigationDelegate>
@property(nonatomic, strong) WKWebView *webView;
@property(nonatomic, assign) BOOL previewMode;
@property(nonatomic, assign) long long lastSecondsHandTick;
@end

@implementation WatchScreenSaverView

- (instancetype)initWithFrame:(NSRect)frame isPreview:(BOOL)isPreview {
  self = [super initWithFrame:frame isPreview:isPreview];
  if (self) {
    _previewMode = isPreview;
    _lastSecondsHandTick = -1;
    self.animationTimeInterval = 1.0 / 30.0;
    self.wantsLayer = YES;
    self.layer.backgroundColor = [NSColor colorWithRed:0.945
                                                green:0.914
                                                 blue:0.878
                                                alpha:1.0]
                                     .CGColor;
    [NSDistributedNotificationCenter.defaultCenter
        addObserver:self
           selector:@selector(screensaverWillStop:)
               name:@"com.apple.screensaver.willstop"
             object:nil];
  }
  return self;
}

- (void)dealloc {
  [NSDistributedNotificationCenter.defaultCenter removeObserver:self];
}

- (void)startAnimation {
  [super startAnimation];
  if (!self.previewMode) {
    [self ensureFullSize];
  }
  [self installWebView];
  [self updateWebViewFrame];
}

- (void)stopAnimation {
  [super stopAnimation];
  [self reconcileAfterStop];
}

- (void)teardownWebView {
  [self.webView stopLoading];
  self.webView.navigationDelegate = nil;
  [self.webView removeFromSuperview];
  self.webView = nil;
}

- (void)screensaverWillStop:(NSNotification *)notification {
  [self reconcileAfterStop];
}

- (void)reconcileAfterStop {
  __weak typeof(self) weakSelf = self;
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1.0 * NSEC_PER_SEC)),
                 dispatch_get_main_queue(), ^{
                   WatchScreenSaverView *strongSelf = weakSelf;
                   if (!strongSelf || !strongSelf.webView) {
                     return;
                   }

                   BOOL windowIsVisible =
                       strongSelf.window != nil && strongSelf.window.isVisible;
                   if (windowIsVisible) {
                     [strongSelf startAnimation];
                   } else {
                     [strongSelf teardownWebView];
                   }
                 });
}

- (void)ensureFullSize {
  if (self.bounds.size.width > 1 && self.bounds.size.height > 1) {
    return;
  }
  NSSize size = NSScreen.mainScreen.frame.size;
  if (size.width > 1 && size.height > 1) {
    [self setFrameSize:size];
  }
}

- (NSRect)webViewTargetFrame {
  if (self.previewMode && self.bounds.size.width > 1 && self.bounds.size.height > 1) {
    return self.bounds;
  }

  NSScreen *screen = self.window.screen ?: NSScreen.mainScreen;
  NSSize screenSize = screen.frame.size;
  if (screenSize.width > 1 && screenSize.height > 1) {
    if (self.bounds.size.width > 1 && self.bounds.size.height > 1) {
      return NSMakeRect(0, 0, MIN(self.bounds.size.width, screenSize.width),
                        MIN(self.bounds.size.height, screenSize.height));
    }
    return NSMakeRect(0, 0, screenSize.width, screenSize.height);
  }
  return self.bounds;
}

- (void)installWebView {
  if (self.webView) {
    return;
  }

  WKWebViewConfiguration *configuration = [[WKWebViewConfiguration alloc] init];
  configuration.suppressesIncrementalRendering = NO;
  configuration.websiteDataStore = [WKWebsiteDataStore nonPersistentDataStore];

  NSString *visibilityOverride =
      @"try {"
       "Object.defineProperty(Document.prototype, 'hidden', {"
       "configurable: true, get: function() { return false; }});"
       "Object.defineProperty(Document.prototype, 'visibilityState', {"
       "configurable: true, get: function() { return 'visible'; }});"
       "} catch (error) {}";
  WKUserScript *visibilityScript =
      [[WKUserScript alloc] initWithSource:visibilityOverride
                            injectionTime:WKUserScriptInjectionTimeAtDocumentStart
                         forMainFrameOnly:NO];
  [configuration.userContentController addUserScript:visibilityScript];

  self.webView = [[WKWebView alloc] initWithFrame:[self webViewTargetFrame]
                                    configuration:configuration];
  SEL occlusionSelector = NSSelectorFromString(@"_setWindowOcclusionDetectionEnabled:");
  if ([self.webView respondsToSelector:occlusionSelector]) {
    ((void (*)(id, SEL, BOOL))objc_msgSend)(self.webView, occlusionSelector, NO);
  }
  self.webView.navigationDelegate = self;
  if (@available(macOS 13.0, *)) {
    self.webView.underPageBackgroundColor = [NSColor colorWithRed:0.945
                                                            green:0.914
                                                             blue:0.878
                                                            alpha:1.0];
  }
  if (@available(macOS 13.3, *)) {
    self.webView.inspectable = YES;
  }
  [self addSubview:self.webView];

  NSURL *webDirectory =
      [[NSBundle bundleForClass:self.class] URLForResource:@"web" withExtension:nil];
  NSURL *indexURL = [webDirectory URLByAppendingPathComponent:@"index.html"];
  if (indexURL && webDirectory) {
    [self.webView loadFileURL:indexURL allowingReadAccessToURL:webDirectory];
  }
}

- (void)updateWebViewFrame {
  self.webView.frame = [self webViewTargetFrame];
}

- (void)viewDidMoveToWindow {
  [super viewDidMoveToWindow];
  [self updateWebViewFrame];
}

- (void)layout {
  [super layout];
  [self updateWebViewFrame];
}

- (void)setFrameSize:(NSSize)newSize {
  [super setFrameSize:newSize];
  [self updateWebViewFrame];
}

- (void)resizeSubviewsWithOldSize:(NSSize)oldSize {
  [super resizeSubviewsWithOldSize:oldSize];
  [self updateWebViewFrame];
}

- (void)animateOneFrame {
  NSTimeInterval now = NSDate.date.timeIntervalSince1970;
  long long tick = (long long)floor(now * 8.0);
  if (tick == self.lastSecondsHandTick || !self.webView) {
    return;
  }
  self.lastSecondsHandTick = tick;

  double rotation = (double)(tick % 480) * 0.75;
  NSString *script = [NSString
      stringWithFormat:
          @"(()=>{const hand=document.querySelector('[data-seconds-hand]');"
           "if(hand){hand.style.animation='none';"
           "hand.style.transform='rotate(%.6fdeg)';}})()",
          rotation];
  [self.webView evaluateJavaScript:script completionHandler:nil];
}

- (void)webView:(WKWebView *)webView
    didFailNavigation:(WKNavigation *)navigation
             withError:(NSError *)error {
  NSLog(@"5212 screensaver navigation failed: %@", error);
}

- (void)webView:(WKWebView *)webView
    didFailProvisionalNavigation:(WKNavigation *)navigation
                       withError:(NSError *)error {
  NSLog(@"5212 screensaver provisional navigation failed: %@", error);
}

- (void)webViewWebContentProcessDidTerminate:(WKWebView *)webView {
  NSLog(@"5212 screensaver WebContent process terminated; reloading");
  [webView reload];
}

- (BOOL)hasConfigureSheet {
  return NO;
}

@end
