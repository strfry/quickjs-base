import { h, Component } from "preact"
import { print_object } from "./util.mjs"

//import {Card, Checkbox, ListTile, List, Icon, TextField } from 'polythene-mithril'

class Item extends Component {
  state = {
    name: "Item",
    checked: false
  }
  render(props, state) {
    console.log("trigger redraw", props, state)
    state.checked = attrs.confirmed
    return h('li', //ListTile, 
    {
      title: props.name,
      /*
      front: 
        m('paper-checkbox', {
          size: 'large',
          style: { color: 'limegreen'} ,
  //        value: model.confirmed,
          defaultChecked: vnode.attrs.confirmed,

          onChange: state => {
            var doc = vnode.attrs
            doc.confirmed = state.checked
            model.setItemState(doc)
          },
          checked: vnode.state.checked,
         }),
         */
       })
    }
}

/*

const addIconSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'
const AddIcon = m(Icon, {svg: m.trust(addIconSVG), size: 'large' })

const ItemEntryBox = {
  view: vnode => 
    m(ListTile,
      m(TextField, {
        require: true,
        autofocus: true,
        disabled: true
      })
    )
}

const StoreCard = {
  view: vnode => 
    m(Card, {
      //shadowDepth: 5,
      content: [
        {
          actions: {
            content: [
              m('.flex', { key: "space"}),
              m(IconButton, {icon: AddIcon} )
            ]            
          }
        },
      ]
      },
      m(List, {
          header: {
            title: vnode.attrs.store,
          },          
          tiles: [
            vnode.attrs.items.map(item => m(Item, item)),
            m(ItemEntryBox, vnode.attrs)
          ]
        } )
    )
}
*/

/*
const StoreCard = {
  view: vnode => 
    m(Card, {
      content: [
        {
          m(List, {
            header: {title: vnode.attrs.store},
            tiles: vnode.attrs.items.map(item => m(Item, item))
          }),
        actions: {
          content: [
            m(IconButton, {icon: AddIcon} )
          ]
        }
      }
    })
}
*/
//export 


class StoreCard extends Component {
  render(props) {
    return h('ul', null, props.store)
  }
}

class NeedsApp extends Component {
  state = {
    stores: [{}, {}]
  };

  render (props, state) {
     state.stores = props.stores

     var keys = Object.keys(state.stores)
     
     var stores = keys.map(store => h(StoreCard, { store: store, items: state.stores[store]}))
     return stores
  }
//  oninit: vnode => { console.log('oninit') },
//  oncreate: vnode => console.log('oncreate'),
//  onupdate: vnode => console.log('onupdate'),
//  onbeforeupdate: vnode => console.log('onbeforeupdate')
}


export default NeedsApp
