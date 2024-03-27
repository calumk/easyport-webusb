class EasyPort {
    constructor() {
        this.name = "Hello"


        this.device = null
        this.port = null
        this.serial = {}


        this.plc = {
            inputs: 0,
            outputs: 0
        }

        this.monitoringModeListener = (value) => {},
        this.registerNewMonitoringModeListener = (listener) => {
            this.monitoringModeListener = listener;
        }

        
    }


    chooseDevice = async () => {
        const filters = [{ vendorId: 0x0403, productId: 0xaf80 }];
        this.device = await navigator.usb.requestDevice({ filters: filters });
    }

    openDevice = async () => {
        await this.device.open();
        if (this.device.configuration === null) {
            await this.device.selectConfiguration(1);
        }
        await this.device.claimInterface(0);

        this.monitoringModeListener(this.plc)
        this.purge();
    }

    purge = async () => {
        // twice? is this enough? 
        await this.device.transferIn(1, 64);
        await this.device.transferIn(1, 64);
        await this.device.transferIn(1, 64);
    }

    stringToUtf8Bytes = (text) => {
        return Uint8Array.from(
            Array.from(text).map((letter) => letter.charCodeAt(0))
        );
    };

    Utf8BytesToString = (bytes) => {
        let arr = new Uint8Array(bytes);
        // remove the first two bytes
        let strippedbytes = arr.slice(2, arr.length - 1);
        // also remove the last byte
        // strippedbytes = strippedbytes.slice(0, strippedbytes.length - 1);
        return String.fromCharCode(...strippedbytes);
    };

    toHex = (number) => {
        // This is a superlazy way to convert a number to a hex string, it also handles strings and booleans
        // if number is a string, convert it to a number
        if (typeof number === 'string') {
            number = parseInt(number);
        }
        // if number is a boolean, convert it to a number
        if( number === true || number === false ){
            number = number ? 1 : 0;
        }
    
        return number.toString(16);
    }


    writeString = async (string) => {
        let view = this.stringToUtf8Bytes(string + "\r");
        await this.device.transferOut(2, view);
    }

    readString = async (length = 0) => {
        let data = await this.tryToGetData(length);
        let result = this.Utf8BytesToString(data.buffer);

        // console.log(result)
        if(result.length == length) {
            return {
                data: result,
                success: true
            }
        }else{
            return {
                data: result,
                success: false
            }
        }
    };

    tryToGetData = async (length, depth = 0) => {
        depth++;
        if (depth > 2) {
            return new Uint8Array(0);
        }
        let delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        await delay(15);
        let result = await this.device.transferIn(1, 64);
        let data = result.data;
        // console.log("data: ", data);
    
        if (data.byteLength <= length) {
            // console.log("reading again", depth);
            data = await this.tryToGetData(length, depth);
        }
        return data;
    };

    simpleMonitorMode = async () => {
        console.log("MonitorModeEnabled")
        setInterval(async () => {
            let time = new Date().getTime()
            await this.writeString("DEW1.0")

            let inputs = await this.readString(10) // Answer is 10 bytes long
            if(inputs.success) {
                // console.log("Inputs: ", inputs.data)
                // split the string at the = sign
                this.plc.inputs = parseInt(inputs.data.split("=")[1], 16);
            }

            await this.writeString(`MAW1.0=${this.toHex(this.plc.outputs)}`)
            await this.readString(5) // Answer is at least 5 bytes long
            // console.log(this.plc)
            this.monitoringModeListener(this.plc)
            console.log("Time Taken: ", new Date().getTime() - time)
        }, 500)
    }


}

export { EasyPort };