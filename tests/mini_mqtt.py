"""Крошечный MQTT-брокер поверх WebSocket — только для теста комнат по коду (net_test.py).
Умеет CONNECT, SUBSCRIBE, PUBLISH (QoS 0, рассылка всем подписчикам темы), PINGREQ, DISCONNECT."""
import asyncio, base64, hashlib, struct, threading

GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'


def _pkt(h, body):
    n, L = len(body), bytearray()
    while True:
        d = n % 128
        n //= 128
        if n:
            d |= 128
        L.append(d)
        if not n:
            break
    return bytes([h]) + bytes(L) + bytes(body)


class Broker:
    def __init__(self):
        self.subs = {}  # тема -> множество клиентов
        self.port = 0
        self.published = 0

    async def _frame_out(self, w, data):
        n = len(data)
        hdr = bytes([0x82]) + (bytes([n]) if n < 126 else bytes([126]) + struct.pack('>H', n) if n < 65536 else bytes([127]) + struct.pack('>Q', n))
        w.write(hdr + data)
        await w.drain()

    async def _client(self, r, w):
        head = b''
        while b'\r\n\r\n' not in head:
            c = await r.read(1024)
            if not c:
                return
            head += c
        lines = head.decode('latin1').split('\r\n')
        hd = {l.split(':', 1)[0].strip().lower(): l.split(':', 1)[1].strip() for l in lines[1:] if ':' in l}
        acc = base64.b64encode(hashlib.sha1((hd['sec-websocket-key'] + GUID).encode()).digest()).decode()
        w.write(('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + acc + '\r\nSec-WebSocket-Protocol: mqtt\r\n\r\n').encode())
        await w.drain()
        buf, mine = b'', set()
        try:
            while True:
                b0, b1 = await r.readexactly(2)
                op, n = b0 & 15, b1 & 127
                if n == 126:
                    n = struct.unpack('>H', await r.readexactly(2))[0]
                elif n == 127:
                    n = struct.unpack('>Q', await r.readexactly(8))[0]
                mask = await r.readexactly(4) if b1 & 128 else b'\0\0\0\0'
                data = bytes(x ^ mask[i % 4] for i, x in enumerate(await r.readexactly(n)))
                if op == 8:
                    break
                if op not in (0, 1, 2):
                    continue
                buf += data
                while len(buf) >= 2:
                    mul, ln, i = 1, 0, 1
                    while True:
                        if i >= len(buf):
                            break
                        d = buf[i]; i += 1; ln += (d & 127) * mul; mul *= 128
                        if not d & 128:
                            break
                    if len(buf) < i + ln:
                        break
                    h0, body, buf = buf[0], buf[i:i + ln], buf[i + ln:]
                    t = h0 >> 4
                    if t == 1:
                        await self._frame_out(w, _pkt(0x20, [0, 0]))
                    elif t == 8:
                        pid, tl = body[0:2], (body[2] << 8) | body[3]
                        topic = body[4:4 + tl].decode()
                        self.subs.setdefault(topic, set()).add(w)
                        mine.add(topic)
                        await self._frame_out(w, _pkt(0x90, list(pid) + [0]))
                    elif t == 3:
                        tl = (body[0] << 8) | body[1]
                        topic = body[2:2 + tl].decode()
                        self.published += 1
                        for o in list(self.subs.get(topic, ())):
                            try:
                                await self._frame_out(o, _pkt(0x30, body))
                            except Exception:
                                pass
                    elif t == 12:
                        await self._frame_out(w, _pkt(0xD0, []))
                    elif t == 14:
                        raise ConnectionError
        except (asyncio.IncompleteReadError, ConnectionError, OSError):
            pass
        finally:
            for tp in mine:
                self.subs.get(tp, set()).discard(w)
            w.close()

    def start(self):
        ready = threading.Event()

        def run():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            srv = loop.run_until_complete(asyncio.start_server(self._client, '127.0.0.1', 0))
            self.port = srv.sockets[0].getsockname()[1]
            ready.set()
            loop.run_forever()

        threading.Thread(target=run, daemon=True).start()
        ready.wait(5)
        return self
