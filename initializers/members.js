var pg = require('pg').native,
  _ = require("underscore");

exports.members = function(api, next){

  api.members = {

    // methods

    /*
    * Returns all members from from pg
    *
    * Returns a collection of member records
    */
    list: function(next) {
      var client = new pg.Client(api.configData.pg.connString);
      client.connect(function(err) {
        if (err) { console.log(err); }
        var sql = "select id, sfid, name, email__c from member__c limit 5";
        client.query(sql, function(err, rs) {
          next(rs['rows']);
        })
      })
    },

    /*
    * Returns a specific member from pg by membername
    *
    * membername - the name of the member to fetch
    * fields - the list of fields to return.  If no fields are specified then the default
    * are passed in form the action.
    *
    * Returns JSON containing the keys specified from the fields
    */
    fetch: function(membername, fields, next) {
      var client = new pg.Client(api.configData.pg.connString);
      client.connect(function(err) {
        if (err) { console.log(err); }
        var sql = "select " + fields+ " from member__c where name = $1";
        client.query(sql, [membername], function(err, rs) {
          next(rs['rows']);
        })
      })
    },

    /*
    * Updates a specific members field(s) in pg (members__c).
    *
    * membername - the name of the member to update
    * fieldsHash - the hash of the fields=values to update. If no fields are defined,
    * return a "No fields to update!" message with "success:false".
    *
    * Returns
    */
    update: function( membername, fieldsHash, next ) {
      var client = new pg.Client(api.configData.pg.connString);
      client.connect(function(err) {
        if (err) { console.log(err); }
        
        // construct the string in form of:
        // key1='value1',key2='value2',keyN='valueN'
        
        // chaining with underscore...
        var updates = _.chain(fieldsHash)
          // get the pairs in an array as [ key:"value" ]...
          .pairs()
          // map it to [ "key='value'" ]...
          .map(function(field){
            return field[0] + "=\'" + field[1] + "\'";
          })
          // return the value as string...
          .value().toString();
        
        // create the psql statement, defining as return value the fields
        // that are being updated with their new values...
        var sql = "UPDATE member__c SET " + updates + " WHERE name= $1 "
            + "RETURNING " + _.keys(fieldsHash).toString() + ";";

          client.query(sql, [membername], function(err, rs) {
            next(rs['rows']);
          });
      });
    },

    /*
    * Returns payments of a specific member from pg by membername
    *
    * membername - the name of the member to fetch
    * fields - the list of fields to return.  If no fields are specified then the default
    * are passed in form the action.
    * orderBy - the order_by option.
    *
    * Returns JSON containing the keys specified from the fields
    */
    payments: function(membername, fields, orderBy, next) {
      var client = new pg.Client(api.configData.pg.connString);
      client.connect(function(err) {
        if (err) { console.log(err); }

        var sql = "select "+ fields +" from payment__c p"
          + " inner join member__c m on p.member__c = m.sfid"
          + " inner join challenge__c c on p.challenge__c = c.sfid"
          + " where m.name = $1 order by " + orderBy;

        client.query(sql, [membername], function(err, rs) {
          next(rs['rows']);
        })
      })
    },

    /*
    * Returns a specific member's challenges from apex by membername
    *
    * membername - the name of the member to fetch
    */
    challenges: function(membername, next) {
      api.sfdc.org.apexRest({ uri: 'v1/members/' + membername + '/challenges' }, api.sfdc.oauth, function(err, res) {
        if (err) { console.error(err); }
        next(res);
      });
    },

    /* 
    * Returns referrals of a specific member from sfdb by membername
    *
    * membername - the name of the member to fetch
    *
    * Returns JSON containing the keys specified from the fields
    */
    referrals: function(membername, next) {
      var url = "v.9/referrals/" + escape(membername);
      api.sfdc.org.apexRest({uri: url, method: "GET"}, api.sfdc.oauth, function (err, resp) {
        if(err) { return next(err); }
        next(resp);
      });
    },


    /*
     *Searches for a member from pg by keywords search
     *
     * q - the keyword used in the search
     * fields - the list of fields to return.  If no fields are specified then the default
     * are passed in form the action.
     *
     * Returns JSON containing the keys specified from the fields
     */
    search: function(q, fields, next) {
        var client = new pg.Client(api.configData.pg.connString);
        client.connect(function(err) {
            if (err) { console.log(err); }
            var sql = "select " + fields+ " from member__c where name LIKE '" +q+ "%'";
            // console.log('$$$$ sql ', sql);
            client.query(sql, function(err, rs) {
                next(rs['rows']);
            })
        })
    }

  }
  
  next();
}
