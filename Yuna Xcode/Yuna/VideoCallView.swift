import SwiftUI
import WebKit

struct VideoCallView: View {
    @State private var webViewURL = "https://www.example.com"
    @State private var showWebView = false
    @State private var isShowingAudioCall = false
    
    var body: some View {
        VStack {
            Image("Yuna")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: 300, height: 300)
                .clipShape(RoundedRectangle(cornerRadius: 16))
                .shadow(radius: 3)
            
            if showWebView {
                WebView(urlString: webViewURL)
                    .frame(width: 300, height: 300)
                    .cornerRadius(16)
                    .shadow(radius: 3)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
            } else {
                Image(systemName: "person.fill")
                    .font(.system(size: 300))
                    .frame(width: 300, height: 300)
                    .cornerRadius(16)
                    .shadow(radius: 3)
                    .background(.white)
                    .shadow(color: Color.gray.opacity(0.5), radius: 10, x: 0, y: 5)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
            }
            
            HStack {
                Button(action: {
                    isShowingAudioCall.toggle()
                }) {
                    Image(systemName: "mic.fill")
                        .font(.system(size: 30))
                        .foregroundColor(.white)
                        .padding(20)
                        .background(Color.green)
                        .clipShape(Circle())
                }
                .buttonStyle(PlainButtonStyle())
                .sheet(isPresented: $isShowingAudioCall, content: {
                    AudioView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                })
                
                Button(action: {
                    showWebView.toggle() // Toggle the WebView visibility
                }) {
                    Image(systemName: "camera.fill")
                        .font(.system(size: 30))
                        .foregroundColor(.white)
                        .padding(20)
                        .background(Color.blue)
                        .clipShape(Circle())
                }
                
                Button(action: {
                    // Handle end call button action
                }) {
                    Image(systemName: "phone.fill")
                        .font(.system(size: 30))
                        .foregroundColor(.white)
                        .padding(20)
                        .background(Color.red)
                        .clipShape(Circle())
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 5)
            .background(Color.white.opacity(0.8))
            .cornerRadius(16)
            .shadow(color: Color.gray.opacity(0.5), radius: 10, x: 0, y: 5)
        }
        .padding(.bottom, -10)
    }
}

struct WebView: UIViewRepresentable {
    let urlString: String
    
    func makeUIView(context: Context) -> WKWebView {
        guard let url = URL(string: urlString) else {
            return WKWebView()
        }
        let webView = WKWebView()
        webView.load(URLRequest(url: url))
        return webView
    }
    
    func updateUIView(_ uiView: WKWebView, context: Context) {
        guard let url = URL(string: urlString) else {
            return
        }
        let request = URLRequest(url: url)
        uiView.load(request)
    }
}

struct VideoCallView_Previews: PreviewProvider {
    static var previews: some View {
        VideoCallView()
    }
}
