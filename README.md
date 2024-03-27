# easyport-webusb

A WebUSB implementation of the EasyPort protocol


> [!IMPORTANT]
> **CHROME ONLY**

The site is hosted on vercel at --> https://easyport-webusb.vercel.app/


---

> [!WARNING]
This is a **A VERY BUGGY** and **incomplete** implementation of the EasyPort protocol for WebUSB. This is a work in progress and should not be used in production.

## Usage

The EasyPort class is a wrapper around the WebUSB API. It is used to connect to a device and send and receive data.



```js
import { EasyPort } from './index.js';
let easyport = new EasyPort();
await easyport.chooseDevice();
await easyport.openDevice();

// Turn on Bit 1
easyport.writeString('MA1.0.0=1'); 

// Read the response which should be 8 bytes
let response = await easyport.readString(8);
```


## Development

This is a standalone index.js and index.html file that can be run locally.

No drivers should be needed for this to work.