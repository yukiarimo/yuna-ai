import SwiftUI
import Foundation
import UserNotifications

extension Color {
    init(hex: UInt, alpha: Double = 1.0) {
        let red = Double((hex & 0xFF0000) >> 16) / 255.0
        let green = Double((hex & 0x00FF00) >> 8) / 255.0
        let blue = Double(hex & 0x0000FF) / 255.0
        self.init(.sRGB, red: red, green: green, blue: blue, opacity: alpha)
    }
}

struct Message: Decodable {
    let sender: String
    let content: String
    let imageUrl: String?
}

struct ContentView: View {
    var body: some View {
        NavigationView {
            TabView {
                YunaTabView()
                    .ignoresSafeArea(.all)
                YunaGPTTabView()
                    .ignoresSafeArea(.all)
            }
            .ignoresSafeArea(.all)
        }
    }
}

struct YunaTabView: View {
    @State private var messages = [Message]()
    @State private var messageText = ""
    @State private var isShowingPopover = false
    @State var inputText: String = ""
    @State var msglist: [String] = []
    @State private var isShowingSendOptions = false
    @State private var isShowingVideoCall = false
    @Environment(\.presentationMode) var presentationMode
    
    func sendMessage(message: String, type: String) {
        guard let url = URL(string: "http://Yukis-MacBook-Pro.local:3000/ai") else { return }
        let jsonString = """
                        {
                            "data": "\(message)",
                            "type": "\(type)"
                        }
                        """
        guard let messageData = jsonString.data(using: .utf8) else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.httpBody = messageData
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
                withAnimation {
                    if let responseData = data, let responseString = String(data: responseData, encoding: .utf8) {
                        let userMessage = Message(sender: "user", content: message, imageUrl: nil)
                        let botMessage = Message(sender: "bot", content: responseString, imageUrl: nil)
                        messages.append(userMessage)
                        messages.append(botMessage)
                        messageText = ""
                    }
                }
            }
        }.resume()
    }
    
    func getMessages() {
        guard let url = URL(string: "http://Yukis-MacBook-Pro.local:3000/dialog") else {
            return
        }
        
        URLSession.shared.dataTask(with: url) { data, response, error in
            if let error = error {
                print("Error: \(error.localizedDescription)")
                return
            }
            
            if let data = data {
                do {
                    let json = try JSONDecoder().decode([String: [Message]].self, from: data)
                    if let messages = json["messages"] {
                        DispatchQueue.main.async {
                            self.messages = messages
                        }
                    }
                } catch {
                    print("Error decoding JSON: \(error.localizedDescription)")
                }
            }
        }.resume()
    }
    
    var body: some View {
        VStack {
            ScrollView {
                ForEach(messages.indices, id: \.self) { index in
                    let message = messages[index]
                    // Check if the message is sent by the user or the bot
                    if message.sender == "user" {
                        // User message styles
                        let newMessage = message.content
                        HStack {
                            Spacer()
                            Text(newMessage)
                                .padding(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                                .foregroundColor(.white)
                                .background(Color(hex: 0x107869).opacity(0.7))
                                .cornerRadius(10)
                                .shadow(color: Color(hex: 0x107869).opacity(0.5), radius: 5, x: 0, y: 2)
                                .padding(.horizontal, 16)
                                .padding(.bottom, 10)
                        }
                    } else {
                        // Bot message styles
                        HStack {
                            Text(message.content)
                                .padding(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                                .background(Color(hex: 0xD65187).opacity(0.7))
                                .cornerRadius(10)
                                .foregroundColor(.white)
                                .shadow(color: Color(hex: 0xD65187).opacity(0.5), radius: 5, x: 0, y: 2)
                                .padding(.horizontal, 16)
                                .padding(.bottom, 10)
                            Spacer()
                        }
                        
                        // Show image if imageUrl is not nil
                        if let imageUrl = message.imageUrl {
                            if let url = URL(string: imageUrl), let imageData = try? Data(contentsOf: url) {
                                Image(uiImage: UIImage(data: imageData)!)
                                    .resizable()
                                    .aspectRatio(contentMode: .fit)
                                    .frame(height: 200)
                                    .padding(.bottom, 10)
                            }
                        }
                    }
                }
                .rotationEffect(.degrees(180))
            }
            .rotationEffect(.degrees(180))
            .background(Color.gray.opacity(0.1))
            .onAppear(perform: getMessages)
            
            HStack {
                TextField("Say to Yuna", text: $messageText)
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(10)
                    .padding(.horizontal, 5)
                
                Button {
                    sendMessage(message: messageText, type: "general")
                } label: {
                    Image("Yuna")
                        .resizable()
                        .scaledToFit()
                        .clipShape(Circle())
                        .shadow(radius: 3)
                        .frame(width: 40)
                }
                .padding(.horizontal, 5)
                .foregroundColor(Color.clear)
                .buttonStyle(PlainButtonStyle())
                .clipShape(Circle())
            }
            .padding(.horizontal, 10)
        }
        .navigationTitle("Yuna")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct YunaGPTTabView: View {
    var body: some View {
        Text("Hi")
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
