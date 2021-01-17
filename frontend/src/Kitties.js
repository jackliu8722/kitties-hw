import React, { useEffect, useState } from 'react';
import { Form, Grid } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';

import KittyCards from './KittyCards';

export default function Kitties (props) {
  const { api, keyring } = useSubstrate();
  const { accountPair } = props;

  const [kittyCnt, setKittyCnt] = useState(0);
  const [kittyDNAs, setKittyDNAs] = useState([]);
  const [kittyOwners, setKittyOwners] = useState([]);
  const [kittyPrices, setKittyPrices] = useState([]);
  const [kitties, setKitties] = useState([]);
  const [status, setStatus] = useState('');

  const fetchKittyCnt = () => {
    let unsubscribe;
    api.query.kittiesModule.kittiesCount(count => {
      console.log("Kitties count:", count.toString())
      setKittyCnt(count.toNumber());
    }).then(unsub => {
      unsubscribe = unsub;
    }).catch(console.error);

    return () => unsubscribe && unsubscribe();
  };

  const fetchKitties = () => {

    let unsubscribe;

    const kitty_ids = Array.from(Array(kittyCnt), (v, k) => k);
    console.log(kitty_ids)

    let kitties = [];
    api.query.kittiesModule.kitties.multi(kitty_ids,dnas => {
      api.query.kittiesModule.kittyOwners.multi(kitty_ids,owners => {
        api.query.kittiesModule.kittyPrices.multi(kitty_ids,prices => {
          console.log(dnas)
          console.log(owners)
          console.log(prices)

          kitty_ids.forEach((item,index,arr) => {
            let kitty = {
              id: index,
              dna: dnas[index].unwrap(),
              owner: keyring.encodeAddress(owners[index].unwrap()),
              price: prices[index].isEmpty ? 'No price' : prices[index].unwrap(),
            };

            kitties[index] = kitty;

          })

          setKitties(kitties);
        }).then(unsub => {
          unsubscribe = unsub;
        }).catch(console.error);
      }).then(unsub => {
        unsubscribe = unsub;
      }).catch(console.error);

    }).then(unsub => {
      unsubscribe = unsub;
    }).catch(console.error);

    return () => unsubscribe && unsubscribe();
  };

  const populateKitties = () => {
    /* TODO: 加代码，从 substrate 端读取数据过来 */

  };

  useEffect(fetchKittyCnt, [api, keyring]);
  useEffect(fetchKitties, [api, kittyCnt]);
  useEffect(populateKitties, [kittyDNAs, kittyOwners]);

  return <Grid.Column width={16}>
    <h1>小毛孩</h1>

    <KittyCards kitties={kitties} accountPair={accountPair} setStatus={setStatus}/>
    <Form style={{ margin: '1em 0' }}>
      <Form.Field style={{ textAlign: 'center' }}>
        <TxButton
          accountPair={accountPair} label='创建小毛孩' type='SIGNED-TX' setStatus={setStatus}
          attrs={{
            palletRpc: 'kittiesModule',
            callable: 'create',
            inputParams: [],
            paramFields: []
          }}
        />
      </Form.Field>
    </Form>
    <div style={{ overflowWrap: 'break-word' }}>{status}</div>
  </Grid.Column>;
};
