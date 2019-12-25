export function getModel() {
  return {}
}

/*
// TODO: Broken global state, needs model API for live updates
var db = null

var model = null

// TODO: Name is inappropriate now for a multiple call "promise"
function getModel(db_url=null) {
  if (db_url == null) {
    db_url = "./hq_needs"
  }
  db = new LocalStorage(db_url)


  //var db = require('pouchdb')(db_url)
  return new Promise((resolve, reject) => {
    db.allDocs({
      include_docs: true,
      update_seq: true}
    ).then(docs => {
      // TODO: validate docs against a schema?

      var groupBy = function(xs, key) {
        return xs.reduce(function(rv, x) {
          (rv[x[key]] = rv[x[key]] || []).push(x);
          return rv;
        }, {});
      };

      var items = docs.rows.map(row => row.doc).filter(doc => doc.type == "item")

      model = groupBy(items, 'store')
      
      resolve(model)

      console.log(docs)
      console.log(model)

      db.changes({
        include_docs: true,
        since: docs.update_seq,
        live: true
      }).on('change', change => {
        console.log("change detected: ", change)

        // TODO: More effective data structure
        
        for (var key in model[change.doc.store]) {

          if (model[change.doc.store][key]._id == change.doc._id) {
            model[change.doc.store][key] = change.doc;
            m.redraw() // TODO: move this out of model
            return;
          }
          
        }

        model[change.doc.store].push(change.doc)
        m.redraw() // TODO: move this out of model
      }).catch(error => console.log(error))


    }).catch(reject)
  })
}

const setItemState = (item) => {
  db.put(item)
}

export {getModel}

export default {getModel, setItemState}
*/