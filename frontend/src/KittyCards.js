import React from 'react';
import { Button, Card, Grid, Message, Modal, Form, Label } from 'semantic-ui-react';

import KittyAvatar from './KittyAvatar';
import { TxButton } from './substrate-lib/components';

// --- About Modal ---

const TransferModal = props => {
  const { kitty, accountPair, setStatus } = props;
  const [open, setOpen] = React.useState(false);
  const [formValue, setFormValue] = React.useState({target:null});

  const formChange = key => (ev, el) => {
    /* TODO: 加代码 */
    console.log(key)
    console.log(el)
    setFormValue((prev => ({ ...prev, [key]: el.value })));
    console.log(formValue)
  };

  const confirmAndClose = (unsub) => {
    unsub();
    setOpen(false);
  };

  return <Modal onClose={() => setOpen(false)} onOpen={() => setOpen(true)} open={open}
    trigger={<Button basic color='blue'>转让</Button>}>
    <Modal.Header>毛孩转让</Modal.Header>
    <Modal.Content><Form>
      <Form.Input fluid label='毛孩 ID' readOnly value={kitty.id}/>
      <Form.Input fluid label='转让对象' placeholder='对方地址' onChange={formChange('target')}/>
    </Form></Modal.Content>
    <Modal.Actions>
      <Button basic color='grey' onClick={() => setOpen(false)}>取消</Button>
      <TxButton
        accountPair={accountPair} label='确认转让' type='SIGNED-TX' setStatus={setStatus}
        onClick={confirmAndClose}
        attrs={{
          palletRpc: 'kittiesModule',
          callable: 'transfer',
          inputParams: [formValue.target, kitty.id],
          paramFields: [true, true]
        }}
      />
    </Modal.Actions>
  </Modal>;
};


const KittyOwner = props =>{
  const {kitty, accountPair, setStatus} = props;
  if (kitty.owner == accountPair.address) {
    return (
      <Label style={{backgroundColor:'green'}}>
        It's myself.
      </Label>
    )
  }else {
    return null;
  }
}

// --- About Kitty Card ---

const KittyCard = props => {
  const { kitty, accountPair, setStatus } = props;

    console.log(kitty);


  return (
    <Card>
      <Card.Content>
        <KittyOwner kitty={kitty} accountPair={accountPair} setStatus={setStatus}/>
        <KittyAvatar dna={kitty.dna} />
        <Message>
          <Card.Header>ID:{kitty.id}</Card.Header><br/>
          <Card.Meta style={{overflowWrap: 'break-word'}}>DNA:{kitty.dna.join(",")}</Card.Meta><br/>
          <span style={{overflowWrap: 'break-word'}}>Owner:{kitty.owner}</span><br/>
          <span>{kitty.price}</span><br/>
        </Message>
      </Card.Content>
      <Card.Content extra>
        <TransferModal kitty={kitty} accountPair={accountPair} setStatus={setStatus}/>
      </Card.Content>
    </Card>
  );
};

const KittyCards = props => {
  const { kitties, accountPair, setStatus } = props;
  console.log(kitties)
  if (kitties.length > 0 ) {
    return <div>
      <Grid stackable columns='equal'>
        {
          kitties.map(item => {
            return (
              <Grid.Column width={5}>
                <KittyCard kitty={item} accountPair={accountPair} setStatus={setStatus}/>
              </Grid.Column>
            )
          })
        }
      </Grid>
    </div>

  }else {
    return <div>No kitty</div>;
  }

};

export default KittyCards;
