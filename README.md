# easyport-webusb

A WebUSB implementation of the EasyPort protocol

Some information on a related project is here : https://dev.to/calumk/festo-didactic-easyport-nodejs-using-ftdi-d2xx-2bod


The index.html is hosted on vercel at https://easyport-webusb.vercel.app/


> [!WARNING]
A VERY buggyy and incomplete implementation of the EasyPort protocol for WebUSB. This is a work in progress and should not be used in production.


```js
import { EasyPort } from './index.js';
let easyport = new EasyPort();
await easyport.chooseDevice();
await easyport.openDevice();

// Turn on Bit 1
easyport.writeString('MA1.0.0=1'); 

// Read the response which should be 8 bytes
let response = await easyport.readString(8);