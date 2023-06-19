import SwiftUI

struct Message: Decodable {
    let sender: String
    let text: String
    let imageUrl: String?
}

struct ContentView: View {
    @State private var messages = [Message]()
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                ForEach(messages.indices, id: \.self) { index in
                    let message = messages[index]
                    
                    VStack(alignment: message.sender == "user" ? .leading : .trailing, spacing: 5) {
                        Text(message.text)
                            .padding(10)
                            .background(Color.gray)
                            .cornerRadius(10)
                        
                        if let imageUrl = message.imageUrl {
                            if let url = URL(string: imageUrl), let imageData = try? Data(contentsOf: url) {
                                Image(uiImage: UIImage(data: imageData)!)
                                    .resizable()
                                    .aspectRatio(contentMode: .fit)
                                    .frame(height: 200)
                            }
                        }
                    }
                }
            }
            .padding()
        }
        .onAppear {
            fetchMessages()
        }
    }
    
    func fetchMessages() {
        guard let url = URL(string: "http://Yukis-MacBook-Pro.local:3000/test123") else {
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
}
