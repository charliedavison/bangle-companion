import React from 'react';

interface ConnectionContextInterface {
    connect: () => Promise<void>,
    disconnect: () => Promise<void>,
    isDeviceConnected: boolean,
    isDeviceConnecting: boolean
    accelerometerValue: Int32Array
}

interface ConnectionProviderProps {
    children: React.ReactElement[]
}

export const ConnectionContext = React.createContext<ConnectionContextInterface>({
    connect: () => Promise.resolve(),
    disconnect: () => Promise.resolve(),
    isDeviceConnected: false,
    isDeviceConnecting: false,
    accelerometerValue: new Int32Array([0, 0, 0])
});

let bluetoothDevice: BluetoothDevice;
let bluetoothCharacteristic: BluetoothRemoteGATTCharacteristic;

export const ConnectionProvider = ({ children }: ConnectionProviderProps) => {
    // These details can be used to write arbitrary commands to the Bangle - useful for testing.
    // const bluetoothServiceUUID: BluetoothServiceUUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
    // const bluetoothCharacteristicUUID: BluetoothCharacteristicUUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';

    const bluetoothServiceUUID: BluetoothServiceUUID = 'f8b23a4d-89ad-4220-8c9f-d81756009f0c';
    const bluetoothCharacteristicUUID: BluetoothCharacteristicUUID = 'f8b23a4d-89ad-4220-8c9f-d81756009f0d';

    const [isDeviceConnected, setIsDeviceConnected] = React.useState<boolean>(false);
    const [isDeviceConnecting, setIsDeviceConnecting] = React.useState<boolean>(false);
    const [accelerometerValue, setAccelerometerValue] = React.useState<Int32Array>(new Int32Array([0, 0, 0]));

    const getConnectionFilter = (): RequestDeviceOptions => ({
        filters: [{ namePrefix: 'Bangle.js' }],
        optionalServices: [bluetoothServiceUUID]
    })

    const requestDevice = async (): Promise<BluetoothDevice> => {
        const filter = getConnectionFilter()
        return await navigator.bluetooth.requestDevice(filter);
    }

    const changedEvent = (e: any) => {
        setAccelerometerValue(new Int32Array(e.target.value.buffer));
    }

    const connect = async (): Promise<void> => {
        try {
            setIsDeviceConnecting(true);

            bluetoothDevice = await requestDevice();

            bluetoothDevice.addEventListener('gattserverdisconnected', () => {
                setIsDeviceConnected(false)
            })
            
            const bluetoothGATTServer = await bluetoothDevice.gatt?.connect();

            const bluetoothGATTService = await bluetoothGATTServer?.getPrimaryService(bluetoothServiceUUID);
            bluetoothCharacteristic = await bluetoothGATTService!.getCharacteristic(bluetoothCharacteristicUUID);
            
            bluetoothCharacteristic.addEventListener('characteristicvaluechanged', changedEvent);
            bluetoothCharacteristic.startNotifications();

            setIsDeviceConnected(true);
            setIsDeviceConnecting(false);

        } catch (err) {
            setIsDeviceConnecting(false);
            console.error(err);
        }
    }

    const disconnect = async (): Promise<void> => {
        await bluetoothDevice.gatt?.disconnect();
    }

    const write = async (value: string): Promise<void> => {
        const val = `${value}\n`;
        const buffer = new TextEncoder().encode(val).buffer;
        await bluetoothCharacteristic?.writeValue(buffer);
        console.log(`Written ${val} to watch`);
    }

    return (
        <ConnectionContext.Provider value={{ connect, disconnect, accelerometerValue, isDeviceConnected, isDeviceConnecting }}>
            {children}
        </ConnectionContext.Provider>
    )


}

