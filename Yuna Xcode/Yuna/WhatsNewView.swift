import SwiftUI

struct WhatsNewView: View {
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
            VStack {
                Text("What's New in Yuna AI")
                    .font(.largeTitle.weight(.bold))
                    .frame(width: 240)
                    .clipped()
                    .multilineTextAlignment(.center)
                    .padding(.top, 82)
                    .padding(.bottom, 52)
                VStack(spacing: 28) {
                    HStack {
                        Image(systemName: "square.and.arrow.up")
                            .foregroundColor(.blue)
                            .font(.title.weight(.regular))
                            .frame(width: 60, height: 50)
                            .clipped()
                        VStack(alignment: .leading, spacing: 3) {
                            Text("Collaborate in Messages")
                                .font(.footnote.weight(.semibold))
                            Text("Easily share, discuss, and see updates about your presentation.")
                                .font(.footnote)
                                .foregroundColor(.secondary)
                        }
                        .fixedSize(horizontal: false, vertical: true)
                        Spacer()
                    }
                }
                NavigationLink(destination: SettingsView()) {
                    HStack(alignment: .firstTextBaseline) {
                        Text("Complete feature list")
                        Image(systemName: "chevron.forward")
                            .imageScale(.small)
                    }
                    .padding(.top, 32)
                    .foregroundColor(.blue)
                    .font(.subheadline)
                }
                Spacer()
                Button(action: {
                    presentationMode.wrappedValue.dismiss()
                }, label: {
                    Text("Continue")
                })
                .font(.callout.weight(.semibold))
                .padding()
                .frame(maxWidth: .infinity)
                .clipped()
                .foregroundColor(.white)
                .background(.blue)
                .mask { RoundedRectangle(cornerRadius: 16, style: .continuous) }
                .padding(.bottom, 60)
            }
            .frame(maxWidth: .infinity)
            .padding(.horizontal, 29)
    }
}
