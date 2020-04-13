import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonIcon, IonButton, IonInput, IonSpinner } from '@ionic/react';
import { bluetoothOutline } from 'ionicons/icons';

import { ConnectionContext } from './../providers/ConnectionProvider';

import './Home.css';



const Home: React.FC = () => {
  const [ command, setCommand ] = React.useState<string>('Bangle.buzz();');
  const { connect, disconnect, write, isDeviceConnected, isDeviceConnecting } = React.useContext(ConnectionContext);

  const onClickConnect = async () => {
    if (isDeviceConnected) {
      return await disconnect()
    };
    await connect();
  }

  const onClickWrite = async () => {
    await write(command);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="end">
            <IonButton>
              <IonIcon icon={bluetoothOutline}></IonIcon>
            </IonButton>
          </IonButtons>
          <IonTitle>BangleJS Companion</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonButton expand={"block"} fill={'solid'} size={'large'} color={'primary'} onClick={onClickConnect} disabled={isDeviceConnecting}>
          { isDeviceConnecting ? <IonSpinner name="dots" /> : isDeviceConnected ? 'Disconnect' : 'Connect' }
          
          </IonButton>
        <IonInput inputmode={'text'} value={command} onIonChange={e => setCommand(e.detail.value!) }/>
        <IonButton expand={"block"} fill={'solid'} size={'large'} color={'success'} onClick={onClickWrite} disabled={!isDeviceConnected}>Write</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Home;
