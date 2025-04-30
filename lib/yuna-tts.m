#import <AVFoundation/AVFoundation.h>

int main() {
    __block BOOL done = NO;
    [AVSpeechSynthesizer requestPersonalVoiceAuthorizationWithCompletionHandler:^(AVSpeechSynthesisPersonalVoiceAuthorizationStatus status){
        // authorization popup should be visible now
        done = YES;
    }];

    // Run the loop for a maximum of 10 seconds
    NSDate *loopUntil = [NSDate dateWithTimeIntervalSinceNow:10.0];
    while (!done && [loopUntil timeIntervalSinceNow] > 0) {
        [[NSRunLoop currentRunLoop] runMode:NSDefaultRunLoopMode beforeDate:[NSDate dateWithTimeIntervalSinceNow:0.1]];
    }

    return 0;
}