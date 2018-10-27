import 'colors';
import * as express from 'express';
import { Response, Request, NextFunction } from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import * as path from 'path';

import { Config, Interfaces } from '../config/base';
import { Web3Control } from '../controlers/web3';
import { WsConfig } from './config';
import { wsforeman } from './ws';

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use('/*', (req: Request, res: Response, next: NextFunction) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

const server = http.createServer(app);

export class WsServer {

  private ws: WebSocket.Server;
  private port: number;
  private wallet: Web3Control;


  constructor(port: number = 8999, password: string) {
    this.wallet = new Web3Control(password, Config.ENV.numberOf);
    this.wallet.env = Config.ENV.web;
    this.port = port;
    this.ws = new WebSocket.Server({ server });
    this.httpRun();
    this.soket();
  }

  private httpRun(): void {
    server.listen(process.env.PORT || this.port, () => {
      console.log(`Http server started on port ${server.address()['port']}`.green);
      console.log(`ws server is started on port ${this.port}`.cyan);
    });
  }

  private soket(): void {
    this.ws.on(WsConfig.CONNECTION, async (ws: WebSocket) => {
      // Create soket connecting. //
      ws.on(WsConfig.MESSAGE, (message: string) => {
        let emitObjec: object;
  
        try {
          emitObjec = JSON.parse(message);
        } catch (err) {
          console.log(err.massage);
        }
  
        wsforeman({
          type: emitObjec['type'],
          body: emitObjec['body'],
          ws: ws,
          wallet: this.wallet
        });
  
      });

      const gas = await this.wallet.onGas();
  
      ws.send(JSON.stringify({
        type: Config.WSEvent.RUN,
        body: {
          gasPrice: this.wallet.gasPrice,
          gasLimit: gas.gasLimit,
          gasUsed: gas.gasUsed,
          addresses: this.wallet.onWalletExport()
        }
      }));
  
      console.log('soket: client'.green);
    });
  }

}
