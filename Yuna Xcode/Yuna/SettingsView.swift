import SwiftUI

struct SettingsView: View {
    var body: some View {
        VStack(spacing: 14) {
            Text("❤️")
                .font(.system(size: 56))
            HStack {
                Spacer()
                Text("Welcome")
                    .font(.system(size: 31, weight: .medium))
                    .foregroundColor(.black)
                Spacer()
            }
            Text("Start by letting us know if any of the following are important to your nutrition.")
                .font(.system(size: 17))
                .multilineTextAlignment(.center)
                .foregroundColor(.black.opacity(0.5))
                .padding(.horizontal, 30)
                .lineSpacing(3)
                .padding(.bottom, 60)
            
            HStack(spacing: 14) {
                Text("🥘 Easy Prep")
                    .font(.system(size: 16, weight: .medium))
                    .padding(.vertical, 9)
                    .padding(.horizontal, 14)
                    .background(Color.clear)
                    .cornerRadius(17)
                    .shadow(color: Color(.displayP3, red: 0/255, green: 0/255, blue: 0/255).opacity(0.06), radius: 8, x: 0, y: 4)
            }
        }
    }
}
