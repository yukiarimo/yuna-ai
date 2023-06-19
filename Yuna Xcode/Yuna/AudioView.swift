import SwiftUI
import Speech

struct AudioView: View {
    @Binding var scrum: DailyScrum
        @StateObject var scrumTimer = ScrumTimer()
        @StateObject var speechRecognizer = SpeechRecognizer()
        @State private var isRecording = false
        
        private var player: AVPlayer { AVPlayer.sharedDingPlayer }
        
        var body: some View {
            ZStack {
                RoundedRectangle(cornerRadius: 16.0)
                    .fill(scrum.theme.mainColor)
                VStack {
                    MeetingHeaderView(secondsElapsed: scrumTimer.secondsElapsed, secondsRemaining: scrumTimer.secondsRemaining, theme: scrum.theme)
                    MeetingTimerView(speakers: scrumTimer.speakers, theme: scrum.theme)
                    MeetingFooterView(speakers: scrumTimer.speakers, skipAction: scrumTimer.skipSpeaker)
                }
            }
            .padding()
            .foregroundColor(scrum.theme.accentColor)
            .onAppear {
                startScrum()
            }
            .onDisappear {
                endScrum()
            }
            .navigationBarTitleDisplayMode(.inline)
        }
        
        private func startScrum() {
            scrumTimer.reset(lengthInMinutes: scrum.lengthInMinutes, attendees: scrum.attendees)
            scrumTimer.speakerChangedAction = {
                player.seek(to: .zero)
                player.play()
            }
            speechRecognizer.resetTranscript()
            speechRecognizer.startTranscribing()
            isRecording = true
            scrumTimer.startScrum()
        }
        
        private func endScrum() {
            scrumTimer.stopScrum()
            speechRecognizer.stopTranscribing()
            let newHistory = History(attendees: scrum.attendees)
            scrum.history.insert(newHistory, at: 0)
        }

}

struct AudioView_Previews: PreviewProvider {
    static var previews: some View {
        AudioView()
    }
}
