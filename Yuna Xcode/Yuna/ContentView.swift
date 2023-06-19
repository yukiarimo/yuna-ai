import SwiftUI

struct ContentView: View {
    @State private var isShowingVideoCall = false
    let chats = ["Science", "Math", "Jokes"]

    var body: some View {
        NavigationView {
            ZStack {
                Color.green
                    .edgesIgnoringSafeArea(.all)

                VStack {
                    HStack {
                        Button(action: {
                        }) {
                            Image(systemName: "command.circle")
                                .font(.system(size: 35))
                                .foregroundColor(Color.green)
                                .padding(4)
                                .background(Circle().foregroundColor(Color.white))
                                .shadow(color: Color("CustomGreen").opacity(0.5), radius: 10, x: 0, y: 0)
                        }
                        .buttonStyle(PlainButtonStyle())

                        Spacer()

                        NavigationLink(destination: YunaView()
                            .navigationBarBackButtonHidden(true)
                        ) {
                            Image("Yuna")
                                .resizable()
                                .scaledToFit()
                                .clipShape(Circle())
                                .overlay(Circle().stroke(Color.white, lineWidth: 2))
                                .shadow(radius: 3)
                                .frame(width: 50)
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
                            Image(systemName: "phone.circle")
                                .font(.system(size: 35))
                                .foregroundColor(Color.green)
                                .padding(4)
                                .background(Circle().foregroundColor(Color.white))
                                .shadow(color: Color("CustomGreen").opacity(0.5), radius: 10, x: 0, y: 0)
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

                    VStack {
                        LazyVGrid(columns: [
                            GridItem(.flexible(), spacing: 20),
                            GridItem(.flexible(), spacing: 20)
                        ], spacing: 20) {
                            ForEach(chats, id: \.self) { chat in
                                Text(chat)
                                    .foregroundColor(.white)
                                    .font(.headline)
                                    .frame(width: 150, height: 150)
                                    .padding(.horizontal, 20)
                                    .padding(.vertical, 10)
                                    .background(Color.white.opacity(0.2))
                                    .cornerRadius(10)
                            }
                        }
                        .padding(.horizontal)
                    }
                    .frame(height: 300)

                    Spacer()

                    VStack {
                        Image(systemName: "gear")
                            .font(.system(size: 40))
                            .foregroundColor(.white)
                            .padding()
                            .background(Color.blue)
                            .clipShape(Circle())

                        Text("Settings")
                            .foregroundColor(.white)
                            .font(.headline)
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.white.opacity(0.2))
                    .cornerRadius(10)
                    .padding(.horizontal)
                    .padding(.bottom, 10)
                }
            }
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
