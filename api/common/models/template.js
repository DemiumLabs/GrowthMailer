'use strict';

module.exports = function(Template) {

    Template.prototype.parseBody = function(send,account){
        return this.body
            .replace('#name#',send.to.name)
            .replace('#account_owner#',account.name)
            .replace('#account_link#',account.link)
            ;
    }

    Template.prototype.parseSubject = function(send,account){
        return this.subject
        .replace('#name#',send.to.name)
        .replace('#account_name#',account.name)
        .replace('#account_link#',account.link)
        ;
    }

};
