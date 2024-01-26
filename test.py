import asyncio
import websockets

connected = set()

async def server(websocket, path):
    # Register.
    connected.add(websocket)
    try:
        async for message in websocket:
            print(message)
            for conn in connected:
                await conn.send(f'Got a new MSG FOR YOU: {message}')

                # start sending messages to the client every 100ms continuously counting from 0 to 100
                for i in range(100):
                    await conn.send(str(i))
                    await asyncio.sleep(0.1)
    finally:
        # Unregister.
        connected.remove(websocket)
    

start_server = websockets.serve(server, "localhost", 5000)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()