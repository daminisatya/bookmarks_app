(function(exports) {

  return ZendeskApps.defineApp(ZendeskApps.Site.TICKET_PROPERTIES, {
    appID: '/apps/01-bookmarks/versions/1.0.0',

    defaultState: 'loading',

    requests: {
      fetchBookmarks: {
        url: '/api/v1/bookmarks.json'
      },

      addBookmark: function() {
        return {
          url: '/api/v1/bookmarks.json',
          type: 'POST',
          data: {
            ticket_id: this.dependency('ticketID')
          }
        };
      }
    },

    dependencies: {
      ticketID: 'ticket.id',
      ticketSubject: 'ticket.subject'
    },

    events: {
      'app.activated': 'requestBookmarks',

      'fetchBookmarks.always': function(e, data) {
        this.switchTo('list', { bookmarks: data.bookmarks });
      },

      'addBookmark.done': function() {
        this.services.notify('Bookmarked ticket #%@'.fmt(this.deps.ticketID));
      },

      'addBookmark.fail': function() {
        this.services.notify('Failed to bookmark ticket #%@'.fmt(this.deps.ticketID), 'error');
      },

      'click %welcome': function() {
        this.ajax('fetchBookmarks');
      },

      'click .bookmark': function() {
        this.ajax('addBookmark');
      },

      'addBookmark.always': function(e, data) {
        this.ajax('fetchBookmarks');
      }
    },

    requestBookmarks: function() {
      this.ajax('fetchBookmarks');
    }
  });

}());
