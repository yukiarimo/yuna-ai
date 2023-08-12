import SwiftUI

struct ContentView: View {
    @State private var isShowingVideoCall = false
    let chats = ["Science", "Math", "Jokes"]
    
    var body: some View {
        NavigationView {
            ZStack {
                Color.green
                    .edgesIgnoringSafeArea(.all)
                
                VStack(spacing: 20) {
                    HStack {
                        Button(action: {
                            // Handle camera button action
                        }) {
                            Image(systemName: "command.circle.fill")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .frame(width: 50)
                                .foregroundColor(.white)
                                .padding(8)
                                .background(Color.white.opacity(0.4))
                                .clipShape(Circle())
                        }
                        .buttonStyle(PlainButtonStyle())
                        
                        Spacer()
                        
                        NavigationLink(destination: YunaView()
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
                        
                        Text("Yuna")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                        
                        Spacer()
                        
                        Button(action: {
                            isShowingVideoCall.toggle()
                        }) {
                            Image(systemName: "phone.circle.fill")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .frame(width: 50)
                                .foregroundColor(.white)
                                .padding(8)
                                .background(Color.white.opacity(0.4))
                                .clipShape(Circle())
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
                    .sheet(isPresented: $isShowingVideoCall, content: {
                        VideoCallView()
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                    })
                    .padding(.horizontal)
                    .padding(.top, -10)
                    
                    Spacer()
                    
                    VStack(spacing: 10) {
                        ForEach(chats, id: \.self) { chat in
                            HStack {
                                Image(systemName: "line.horizontal.3")
                                    .foregroundColor(.white)
                                    .padding(.trailing, 10)
                                
                                Text(chat)
                                    .font(.title)
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                            }
                            .padding(.vertical, 12)
                        }
                    }
                    .padding(.horizontal)
                    .background(Color.white.opacity(0.2))
                    .cornerRadius(10)
                    
                    Spacer()
                    
                    VStack {
                        ZStack {
                            Circle()
                                .foregroundColor(Color.blue)
                                .frame(width: 80, height: 80)
                            
                            NavigationLink(destination: SettingsView()
                                .navigationBarBackButtonHidden(true)
                            ) {
                                Image(systemName: "gear")
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
                        
                        Text("Settings")
                            .font(.title)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(LinearGradient(gradient: Gradient(colors: [Color.blue, Color.purple]), startPoint: .leading, endPoint: .trailing))
                    .cornerRadius(16)
                    .shadow(color: Color.black.opacity(0.3), radius: 10, x: 0, y: 5)
                    .padding(.horizontal)
                    .padding(.bottom, 10)
                    
                }
                .padding()
            }
        }
        .accentColor(.white)
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
