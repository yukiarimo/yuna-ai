import SwiftUI

struct BottomButtonView: View {
    let imageSystemName: String
    let text: String
    
    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: imageSystemName)
                .imageScale(.large)
                .frame(height: 26)
                .clipped()
            Text(text)
                .font(.caption2)
        }
        .frame(maxWidth: .infinity)
        .clipped()
        .frame(height: 45)
        .clipped()
        .foregroundColor(.secondary)
    }
}

struct SendInputView: View {
    @Binding var text: String
    let actionButton: () -> Void
    
    var body: some View {
        HStack {
            TextField("Say to Yuna ...", text: $text)
                .padding(8)
                .background(Color.gray.opacity(0.4))
                .cornerRadius(8)
            
            Button(action: actionButton) {
                Image(systemName: "arrow.up.message.fill")
                    .padding(.horizontal, 8)
                    .padding(.vertical, 8)
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(8)
            }
        }
    }
}
