import React from 'react';

interface ConnectionContextInterface {
    connect: () => Promise<void>,
    disconnect: () => Promise<void>,
    write: (value: string) => Promise<void>,
    isDeviceConnected: boolean,
    isDeviceConnecting: boolean
}

interface ConnectionProviderProps {
    children: React.ReactElement[]
}

export const ConnectionContext = React.createContext<ConnectionContextInterface>({
    connect: () => Promise.resolve(),
    disconnect: () => Promise.resolve(),
    write: () => Promise.resolve(),
    isDeviceConnected: false,
    isDeviceConnecting: false
});

let bluetoothDevice: BluetoothDevice;
let bluetoothCharacteristic: BluetoothRemoteGATTCharacteristic;

export const ConnectionProvider = ({ children }: ConnectionProviderProps) => {
    const bluetoothServiceUUID: BluetoothServiceUUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
    const bluetoothCharacteristicUUID: BluetoothCharacteristicUUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';

    const [isDeviceConnected, setDeviceConnected] = React.useState<boolean>(false);
    const [isDeviceConnecting, setIsDeviceConnecting] = React.useState<boolean>(false);

    const getConnectionFilter = (): RequestDeviceOptions => ({
        filters: [{ namePrefix: 'Bangle.js' }],
        optionalServices: [bluetoothServiceUUID]
    })

    const requestDevice = async (): Promise<BluetoothDevice> => {
        const filter = getConnectionFilter()
        return await navigator.bluetooth.requestDevice(filter);
    }

    const connect = async (): Promise<void> => {
        try {
            setIsDeviceConnecting(true);

            const bluetoothDevice = await requestDevice();

            bluetoothDevice.addEventListener('gattserverdisconnected', () => {
                setDeviceConnected(false)
            })

            const bluetoothGATTServer = await bluetoothDevice.gatt?.connect();
            const bluetoothGATTService = await bluetoothGATTServer?.getPrimaryService(bluetoothServiceUUID);
            bluetoothCharacteristic = await bluetoothGATTService!.getCharacteristic(bluetoothCharacteristicUUID);
            setDeviceConnected(true);
            setIsDeviceConnecting(false);

            // Write a buzz to the watch to test connection.
            await write('Bangle.buzz();')
        } catch (err) {
            setIsDeviceConnecting(false);
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
        <ConnectionContext.Provider value={{ connect, disconnect, write, isDeviceConnected, isDeviceConnecting }}>
            {children}
        </ConnectionContext.Provider>
    )


}

