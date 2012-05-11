(function(exports) {

  return ZendeskApps.defineApp(ZendeskApps.Site.TICKET_PROPERTIES, {
    appID: '/apps/01-bookmarks/versions/1.0.0',

    defaultSheet: 'loading',

    requests: {
      bookmarks: {
        url: '/api/v1/bookmarks.json'
      },

      add_bookmark: function() {
        return {
          url: '/api/v1/bookmarks.json',
          type: 'POST',
          data: {
            ticket_id: this.deps.ticketID
          }
        };
      }
    },

    dependencies: {
      ticketID: 'workspace.ticket.id'
    },

    events: {
      'activated': 'requestBookmarks',

      'bookmarks.always': function(e, data) {
        this.sheet('bookmarks')
          .render('main', { bookmarks: data.bookmarks })
          .show();
      },

      'add_bookmark.done': function() {
        this.services.notify('Bookmarked ticket #%@'.fmt(this.deps.ticketID));
      },

      'add_bookmark.fail': function() {
        this.services.notify('Failed to bookmark ticket #%@'.fmt(this.deps.ticketID), 'error');
      },

      'click %default': function() {
        this.request('bookmarks').perform();
      },

      'click .bookmark': function() {
        this.request('add_bookmark').perform();
      },

      'add_bookmark.always': function(e, data) {
        this.request('bookmarks').perform();
      }
    },

    requestBookmarks: function() {
      this.request('bookmarks').perform();
    }
  });

}());
