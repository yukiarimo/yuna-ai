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

struct ServerResponse: Decodable {
    let content: String
}

class NetworkManager {
    static let shared = NetworkManager()
    private let baseURL = "http://yuki.local:4848"
    
    func sendText(_ text: String, completion: @escaping (String) -> Void) {
        let urlString = baseURL
        guard let url = URL(string: urlString) else {
            completion("Invalid URL")
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        let parameters: [String: String] = ["input_text": "<|user|>" + text + "<|bot|>"]
        request.httpBody = parameters
            .map { key, value in "\(key)=\(value)" }
            .joined(separator: "&")
            .data(using: .utf8)
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            guard let data = data, error == nil else {
                completion("Error: \(error?.localizedDescription ?? "Unknown error")")
                return
            }
            
            if let responseString = String(data: data, encoding: .utf8) {
                completion(responseString)
            } else {
                completion("Invalid response")
            }
        }.resume()
    }
}


struct YunaView: View {
    @State private var messages = [Message]()
    @State private var messageText = ""
    @State private var isShowingPopover = false
    @State var inputText: String = ""
    @State var msglist: [String] = []
    @State private var isShowingSendOptions = false
    @State private var isShowingVideoCall = false
    @Environment(\.presentationMode) var presentationMode
    
    func sendMessage(message: String, type: String) {
        let userMessage = Message(sender: "user", content: messageText, imageUrl: nil)
        messages.append(userMessage) // Append the user message to messages
        
        NetworkManager.shared.sendText(messageText) { response in
            let botMessage = Message(sender: "bot", content: response, imageUrl: nil)
            DispatchQueue.main.async {
                messages.append(botMessage)
                messageText = ""
            }
        }
    }
    
    
    func getMessages() {
        guard let url = URL(string: "http://Yukis-MacBook-Pro.local:4848/dialog") else {
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
        VStack(spacing: 0) {
            HStack {
                Button(action: {
                    isShowingPopover = true
                }) {
                    Image(systemName: "circle.grid.2x2.fill")
                        .font(.system(size: 30))
                        .foregroundColor(Color.pink)
                        .padding(10)
                        .background(Circle().foregroundColor(Color.white))
                        .shadow(color: Color.pink.opacity(0.5), radius: 10, x: 0, y: 0)
                }
                .buttonStyle(PlainButtonStyle())
                .popover(isPresented: $isShowingPopover) {
                    VStack {
                        Button("💖 Option 1 💖") {
                            // Handle Option 1 selection
                        }
                        Button("💕 Option 2 💕") {
                            // Handle Option 2 selection
                        }
                    }
                    .padding()
                }

                Spacer()

                Button(action: {
                    presentationMode.wrappedValue.dismiss()
                }) {
                    Image("Yuna")
                        .resizable()
                        .scaledToFit()
                        .clipShape(Circle())
                        .overlay(Circle().stroke(Color.pink, lineWidth: 2))
                        .shadow(radius: 3)
                        .frame(width: 60)
                }
                .buttonStyle(PlainButtonStyle())

                Spacer()

                Button(action: {
                    isShowingVideoCall.toggle()
                }) {
                    Image(systemName: "video.fill")
                        .font(.system(size: 30))
                        .foregroundColor(Color.pink)
                        .padding(10)
                        .background(Circle().foregroundColor(Color.white))
                        .shadow(color: Color.pink.opacity(0.5), radius: 10, x: 0, y: 0)
                }
                .buttonStyle(PlainButtonStyle())
                .sheet(isPresented: $isShowingVideoCall, content: {
                    VideoCallView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                })
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 5)
            .padding(.top, -10)
            .background(
                ZStack {
                    Color.pink.opacity(0.2)
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color.pink, lineWidth: 1)
                }
            )
            .shadow(color: Color.pink.opacity(0.2), radius: 10, x: 0, y: 10)

            Divider()

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
                                .background(Color.pink.opacity(0.8))
                                .cornerRadius(10)
                                .shadow(color: Color.pink.opacity(0.5), radius: 5, x: 0, y: 2)
                                .padding(.horizontal, 16)
                                .padding(.bottom, 10)
                        }
                    } else {
                        // Bot message styles
                        HStack {
                            Text(message.content)
                                .padding(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                                .background(Color.pink.opacity(0.8))
                                .cornerRadius(10)
                                .foregroundColor(.white)
                                .shadow(color: Color.pink.opacity(0.5), radius: 5, x: 0, y: 2)
                                .padding(.horizontal, 16)
                                .padding(.bottom, 10)
                            Spacer()
                        }

                    }
                }
                .rotationEffect(.degrees(180))
            }
            .textSelection(.enabled)
            .rotationEffect(.degrees(180))
            .background(Color.pink.opacity(0.1))
            .onAppear(perform: getMessages)

            // Contains the Message bar
            ZStack(alignment: .trailing) {
                HStack {
                    TextField("Say to Yuna", text: $messageText)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 10)
                        .background(RoundedRectangle(cornerRadius: 20).fill(Color.pink.opacity(0.1)))
                        .foregroundColor(.pink)
                        .padding(.trailing, 10)

                    Button(action: {
                        sendMessage(message: messageText, type: "general")
                    }) {
                        Image(systemName: "paperplane.fill")
                            .font(.system(size: 30))
                            .foregroundColor(Color.pink)
                    }
                    .simultaneousGesture(LongPressGesture().onEnded { _ in
                        isShowingSendOptions.toggle()
                    })
                    .padding(.trailing, 10)
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 5)
                .background(
                    ZStack {
                        Color.pink.opacity(0.2)
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(Color.pink, lineWidth: 1)
                    }
                )
                .shadow(color: Color.pink.opacity(0.1), radius: 5, x: 0, y: 5)

                if isShowingSendOptions {
                    HStack {
                        Button(action: {
                            sendMessage(message: messageText, type: "yuna")
                        }) {
                            Image(systemName: "person.crop.circle.fill")
                                .foregroundColor(Color.pink)
                                .font(.system(size: 30))
                        }
                        Button(action: {
                            sendMessage(message: messageText, type: "story")
                        }) {
                            Image(systemName: "square.and.pencil")
                                .foregroundColor(Color.pink)
                                .font(.system(size: 30))
                        }
                        Button(action: {
                            sendMessage(message: messageText, type: "gpt")
                        }) {
                            Image(systemName: "lightbulb.fill")
                                .foregroundColor(Color.pink)
                                .font(.system(size: 30))
                        }
                        Button(action: {
                            sendMessage(message: messageText, type: "search")
                        }) {
                            Image(systemName: "magnifyingglass")
                                .foregroundColor(Color.pink)
                                .font(.system(size: 30))
                        }
                        Button(action: {
                            isShowingSendOptions.toggle()
                        }) {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundColor(Color.red)
                                .font(.system(size: 30))
                        }
                    }
                    .background(Color.white.opacity(0.8))
                    .cornerRadius(30)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
                    .shadow(color: Color.pink.opacity(0.5), radius: 10, x: 0, y: 5)
                }
            }
            .ignoresSafeArea(.all)
            .padding()
            .background(Color.green.opacity(0.1))
            .shadow(color: Color.pink.opacity(0.5), radius: 10, x: 0, y: 5)
        }
        .edgesIgnoringSafeArea(.bottom)
    }

}

struct ContentView_Previews2: PreviewProvider {
    static var previews: some View {
        YunaView()
    }
}
