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
        VStack(spacing: 0) {
            HStack {
                Button(action: {
                    isShowingPopover = true
                }) {
                    Image(systemName: "hammer.circle")
                        .font(.system(size: 35))
                        .foregroundColor(Color.green)
                        .padding(4)
                        .background(Circle().foregroundColor(Color.white))
                        .shadow(color: Color("CustomGreen").opacity(0.5), radius: 10, x: 0, y: 0)
                }
                .buttonStyle(PlainButtonStyle())
                .popover(isPresented: $isShowingPopover) {
                    VStack {
                        Button("Option 1") {
                            // Handle Option 1 selection
                        }
                        Button("Option 2") {
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
                        .overlay(Circle().stroke(Color.white, lineWidth: 2))
                        .shadow(radius: 3)
                        .frame(width: 50)
                }
                .buttonStyle(PlainButtonStyle())
                
                Spacer()
                
                Button(action: {
                    isShowingVideoCall.toggle()
                }) {
                    Image(systemName: "iphone.gen2.circle")
                        .font(.system(size: 35))
                        .foregroundColor(Color.green)
                        .padding(4)
                        .background(Circle().foregroundColor(Color.white))
                        .shadow(color: Color("CustomGreen").opacity(0.5), radius: 10, x: 0, y: 0)
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
            .background()
            .shadow(color: Color.black.opacity(0.2), radius: 10, x: 0, y: 10)
            
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
            .textSelection(.enabled)
            .rotationEffect(.degrees(180))
            .background(Color.gray.opacity(0.1))
            .onAppear(perform: getMessages)
            
            // Contains the Message bar
            ZStack(alignment: .trailing) {
                HStack {
                    TextField("Say to Yuna", text: $messageText)
                        .padding(.horizontal, 20)
                        .cornerRadius(20)
                        .foregroundColor(.gray)
                        .overlay(RoundedRectangle(cornerRadius: 20)
                            .stroke(Color.gray, lineWidth: 0))
                    
                    Button(action: {
                        sendMessage(message: messageText, type: "general")
                    }) {
                        Image(systemName: "arrow.up.message.fill")
                            .font(.system(size: 40))
                            .foregroundColor(Color.green)
                    }
                    .simultaneousGesture(LongPressGesture().onEnded { _ in
                        isShowingSendOptions.toggle()
                    })
                    .padding(.trailing, 10)

                }
                .padding(.horizontal, 20)
                .padding(.vertical, 5)
                .background()
                .cornerRadius(16)
                .shadow(color: Color.gray.opacity(0.1), radius: 5, x: 0, y: 5)
                
                if isShowingSendOptions {
                    HStack {
                        Button(action: {
                            (sendMessage(message: messageText, type: "yuna"))
                        }) {
                            Image(systemName: "person.circle")
                                .foregroundColor(Color.green)
                                .font(.system(size: 30))
                        }
                        Button(action: {
                            (sendMessage(message: messageText, type: "story"))
                        }) {
                            Image(systemName: "square.and.pencil.circle")
                                .foregroundColor(Color.green)
                                .font(.system(size: 30))
                        }
                        Button(action: {
                            (sendMessage(message: messageText, type: "gpt"))
                        }) {
                            Image(systemName: "command.circle")
                                .foregroundColor(Color.green)
                                .font(.system(size: 30))
                        }
                        Button(action: {
                            (sendMessage(message: messageText, type: "search"))
                        }) {
                            Image(systemName: "magnifyingglass.circle")
                                .foregroundColor(Color.green)
                                .font(.system(size: 30))
                        }
                        Button(action: {
                            isShowingSendOptions.toggle()
                        }) {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundColor(Color.red)
                                .font(.system(size: 30))
                        }
                    }                 .background(Color.white.opacity(0.8))
                        .cornerRadius(30)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 10)
                        .shadow(color: Color.gray.opacity(0.5), radius: 10, x: 0, y: 5)
                }
            }
            .ignoresSafeArea(.all)
            .padding()
            .background(Color.gray.opacity(0.1))
            .shadow(color: Color.gray.opacity(0.5), radius: 10, x: 0, y: 5)
        }
        .edgesIgnoringSafeArea(.bottom)
    }
}

struct ContentView_Previews2: PreviewProvider {
    static var previews: some View {
        YunaView()
    }
}
