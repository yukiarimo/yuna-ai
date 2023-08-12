import SwiftUI

struct SettingsView: View {
    @State private var enableNotifications = true
    @State private var enableSound = true
    @State private var selectedTheme = 0
    @State private var volume = 50

    let themes = ["Light", "Dark", "System"]

    var body: some View {
        VStack(spacing: 20) {
            VStack(spacing: 10) {
                Text("Settings")
                    .font(.title)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                
                NavigationLink(destination: ContentView()
                    .navigationBarBackButtonHidden(true)
                ) {
                    Image("Yuna")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 60)
                        .clipShape(Circle())
                        .overlay(Circle().stroke(Color.white, lineWidth: 2))
                        .shadow(radius: 3)
                }
                .navigationBarBackButtonHidden(true)
            }
            .padding()
            .frame(maxWidth: .infinity)
            .background(LinearGradient(gradient: Gradient(colors: [.purple, .blue]), startPoint: .leading, endPoint: .trailing))
            .cornerRadius(16)
            .shadow(color: Color.black.opacity(0.3), radius: 10, x: 0, y: 5)
            .padding(.horizontal)
            
            Spacer()
            
            VStack(spacing: 10) {
                Toggle("Enable Notifications", isOn: $enableNotifications)
                    .toggleStyle(SwitchToggleStyle(tint: .purple))
                
                Toggle("Enable Sound", isOn: $enableSound)
                    .toggleStyle(SwitchToggleStyle(tint: .purple))
                
                VStack(alignment: .leading) {
                    Text("Theme")
                        .font(.headline)
                        .foregroundColor(.primary)
                    
                    Picker(selection: $selectedTheme, label: Text("Theme")) {
                        ForEach(0..<themes.count) { index in
                            Text(themes[index])
                                .tag(index)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                }
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(16)
            .shadow(color: Color.black.opacity(0.2), radius: 10, x: 0, y: 5)
            .padding(.horizontal)
            
            VStack(spacing: 10) {
                Toggle("Enable Notifications", isOn: $enableNotifications)
                    .toggleStyle(SwitchToggleStyle(tint: .purple))
                
                Toggle("Enable Sound", isOn: $enableSound)
                    .toggleStyle(SwitchToggleStyle(tint: .purple))
                
                VStack(alignment: .leading) {
                    Text("Theme")
                        .font(.headline)
                        .foregroundColor(.primary)
                    
                    Picker(selection: $selectedTheme, label: Text("Theme")) {
                        ForEach(0..<themes.count) { index in
                            Text(themes[index])
                                .tag(index)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                }
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(16)
            .shadow(color: Color.black.opacity(0.2), radius: 10, x: 0, y: 5)
            .padding(.horizontal)
        }
        .padding()
        .background(Color(.systemBackground))
        .edgesIgnoringSafeArea(.all)
        .navigationBarTitle("Settings")
    }
}

struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        SettingsView()
    }
}
