import SwiftUI
import Foundation
import Combine

struct TestView: View {
    @State private var inputText = ""
        @State private var serverResponse = ""

        var body: some View {
            VStack {
                TextField("Enter your text", text: $inputText)
                    .padding()
                Button("Send to Server") {
                    NetworkManager.shared.sendText(inputText) { response in
                        DispatchQueue.main.async {
                            serverResponse = response
                        }
                    }
                }
                .padding()
                Text("Server Response:")
                Text(serverResponse)
            }
            .padding()
        }
}

struct TestView_Previews: PreviewProvider {
    static var previews: some View {
        TestView()
    }
}
