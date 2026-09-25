#import <React/RCTViewManager.h>
#import <React/RCTUIManager.h>
#import "RCTBridge.h"
#import "Utils.h"

@interface G2MarkdownTextManager : RCTViewManager
@end

@implementation G2MarkdownTextManager

RCT_EXPORT_MODULE(G2MarkdownText)

- (UIView *)view
{
  return [[UIView alloc] init];
}

RCT_CUSTOM_VIEW_PROPERTY(color, NSString, UIView)
{
}

@end

@interface G2MarkdownTextRunManager : RCTViewManager
@end

@implementation G2MarkdownTextRunManager

RCT_EXPORT_MODULE(G2MarkdownTextRun)

- (UIView *)view
{
  return nil;
}

@end
