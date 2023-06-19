import SwiftUI

struct ToolsView: View {
    let tools = ["Tool 1", "Tool 2", "Tool 3", "Tool 4", "Tool 5", "Tool 6"]
    let columns = [GridItem(.flexible(minimum: 0, maximum: .infinity)), GridItem(.flexible(minimum: 0, maximum: .infinity))]

    var body: some View {
        VStack {
            Spacer()
            HStack {
                Spacer()
                BlockToolCardView(toolName: tools[0])
                    .frame(width: 300, height: 200)
                Spacer()
                BlockToolCardView(toolName: tools[1])
                    .frame(width: 300, height: 200)
                Spacer()
            }
            Spacer()
            HStack {
                Spacer()
                BlockToolCardView(toolName: tools[0])
                    .frame(width: 300, height: 200)
                Spacer()
                BlockToolCardView(toolName: tools[1])
                    .frame(width: 300, height: 200)
                Spacer()
            }
            Spacer()
            HStack {
                Spacer()
                BlockToolCardView(toolName: tools[0])
                    .frame(width: 300, height: 200)
                Spacer()
                BlockToolCardView(toolName: tools[1])
                    .frame(width: 300, height: 200)
                Spacer()
            }
            Spacer()
        }
    }
}


struct BlockToolCardView: View {
    let toolName: String
    
    var body: some View {
        VStack(spacing: 0) {
            VStack(spacing: 0) {
                HStack {
                    Text(toolName)
                        .font(.title)
                        .fixedSize(horizontal: false, vertical: true)
                        .lineSpacing(1)
                }
                Spacer()
                Image("Yuna")
                    .resizable()
                    .scaledToFit()
                    .clipShape(Circle())
                    .overlay(Circle().stroke(Color.white, lineWidth: 2))
                    .shadow(radius: 3)
                    .frame(width: 50)
            }
            .padding(50)
        }
        .background {
            Rectangle()
                .fill(Color.gray)
        }
        .mask {
            RoundedRectangle(cornerRadius: 16, style: .continuous)
        }
    }
}

struct ContentView_Previews4: PreviewProvider {
    static var previews: some View {
        ToolsView()
    }
}
