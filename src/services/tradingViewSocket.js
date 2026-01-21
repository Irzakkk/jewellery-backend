import WebSocket from "ws";

export function getMCXPrice(symbol = "MCX:GOLD1!") {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket("wss://data.tradingview.com/socket.io/websocket");

    ws.on("open", () => {
      // Create session
      const session = "qs_" + Math.random().toString(36).substr(2, 10);

      ws.send(`~m~${JSON.stringify({ m: "set_auth_token", p: ["unauthorized_user_token"] }).length}~m~${JSON.stringify({ m: "set_auth_token", p: ["unauthorized_user_token"] })}`);

      // Create quote session
      const quoteCreate = JSON.stringify({ m: "quote_create_session", p: [session] });
      ws.send(`~m~${quoteCreate.length}~m~${quoteCreate}`);

      // Add symbol
      const quoteAdd = JSON.stringify({ m: "quote_add_symbols", p: [session, symbol, { flags: 0 }] });
      ws.send(`~m~${quoteAdd.length}~m~${quoteAdd}`);
    });

    ws.on("message", msg => {
      const clean = msg.toString().replace(/~m~\d+~m~/g, "");

      try {
        const data = JSON.parse(clean);
        if (data.m === "qsd" && data.p[1].lp) {
          resolve({
            symbol,
            last: data.p[1].lp,
            bid: data.p[1].bid,
            ask: data.p[1].ask,
            high: data.p[1].high_price,
            low: data.p[1].low_price,
          });
          ws.close();
        }
      } catch {}
    });

    ws.on("error", reject);
  });
}
