import { h as m } from "preact"

//import {Card, Checkbox, ListTile, List, Icon, TextField } from 'polythene-mithril'

/*
const Item = {
  view: vnode => {
    console.log("trigger redraw", vnode.attrs)
    vnode.state.checked = vnode.attrs.confirmed
    return m(ListTile, {
      title: vnode.attrs.name,
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
       })
    }
}

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
const NeedsApp = {
  view: (vnode) => {
    var stores = vnode.attrs.stores
    var keys = Object.keys(stores)
     return m('div', {id: 'mountpoint'}, [keys.map(store => m(StoreCard, { store: store, items: stores[store]} )), 
     ])

    },
//  oninit: vnode => { console.log('oninit') },
//  oncreate: vnode => console.log('oncreate'),
//  onupdate: vnode => console.log('onupdate'),
//  onbeforeupdate: vnode => console.log('onbeforeupdate')
}


//module.exports = { NeedsApp }
export default NeedsApp
