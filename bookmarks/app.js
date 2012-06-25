(function() {

  var STATUS_CLOSED = 'closed';

  return {
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
            ticket_id: this.ticket().id()
          }
        };
      },

      destroyBookmark: function() {
        return {
          url: helpers.fmt('/api/v1/bookmarks/%@.json', this.bookmarkToDestroy),
          type: 'POST',
          data: { _method: 'DELETE' }
        };
      }
    },

    events: {
      'app.activated': 'requestBookmarks',

      'fetchBookmarks.always': function(e, data) {
        this.renderBookmarks((data || {}).bookmarks);
      },

      'addBookmark.done': function() {
        services.notify(this.I18n.t('add.done', { id: this.ticket().id() }));
      },
      'addBookmark.fail': function() {
        services.notify(this.I18n.t('add.failed', { id: this.ticket().id() }), 'error');
      },

      'click %welcome': function(event) {
        event.preventDefault();
        this.ajax('fetchBookmarks');
      },

      'click .bookmark': function(event) {
        event.preventDefault();
        this.ajax('addBookmark');
      },

      'click .destroy': function(event) {
        event.preventDefault();
        this.bookmarkToDestroy = this.bookmarkID(event);
        if (this.bookmarkToDestroy != null) { this.ajax('destroyBookmark'); }
      },

      'addBookmark.always': function(e, data) {
        this.ajax('fetchBookmarks');
      },

      'destroyBookmark.done': function() {
        var idToDelete = this.bookmarkToDestroy;
        this.renderBookmarks(_.reject(this.bookmarks, function(b) {
          return b.id === idToDelete;
        }));
        services.notify(this.I18n.t('destroy.done'));
      },
      'destroyBookmark.fail': function() {
        services.notify(this.I18n.t('destroy.failed'), 'error');
      }

    },

    renderBookmarks: function(bookmarks) {
      this.bookmarks = bookmarks;
      this.switchTo('list', {
        bookmarks:            this.bookmarks,
        ticketIsBookmarkable: this.ticketIsBookmarkable()
      });
    },

    ticketIsBookmarkable: function() {
      var status = this.ticket().status() || STATUS_CLOSED;
      if ( status == STATUS_CLOSED ) { return false; }

      var ticketID = this.ticket().id(),
          alreadyBookmarked = _.any(this.bookmarks, function(b) {
            return b.ticket.nice_id === ticketID;
          });

      return !alreadyBookmarked;
    },

    requestBookmarks: function() {
      this.ajax('fetchBookmarks');
    },

    // Get the bookmark ID for a click event within a bookmark <li>
    bookmarkID: function(event) {
      return this.$(event.target)
                 .closest('[data-bookmark-id]')
                 .data('bookmark-id');
    },

    bookmarkLI: function(id) {
      return this.$( helpers.fmt('li[data-bookmark-id="%@"]', id) );
    }
  };

}());
