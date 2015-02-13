(function() {

  return {
    defaultState: 'loading',

    requests: {
      fetchBookmarks: {
        url: '/api/v2/bookmarks.json'
      },

      addBookmark: function() {
        return {
          url: '/api/v2/bookmarks.json',
          type: 'POST',
          data: {
            bookmark: {
              ticket_id: this.ticket().id()
            }
          }
        };
      },

      destroyBookmark: function(toDestroy) {
        return {
          url: helpers.fmt('/api/v2/bookmarks/%@.json', toDestroy),
          type: 'POST',
          data: { _method: 'DELETE' }
        };
      }
    },

    events: {
      'app.activated': 'requestBookmarks',

      'fetchBookmarks.done': function(data) {
        this.renderBookmarks((data || {}).bookmarks);
      },

      'fetchBookmarks.fail': function(data) {
        this.switchTo('fetch_fail');
      },

      'addBookmark.done': function() {
        services.notify(this.I18n.t('add.done', { id: this.ticket().id() }));
      },

      'addBookmark.fail': function() {
        services.notify(this.I18n.t('add.failed', { id: this.ticket().id() }), 'error');
      },

      'addBookmark.always': function() {
        this.ajax('fetchBookmarks');
      },

      'click .bookmark': function(event) {
        event.preventDefault();
        this.ajax('addBookmark');
      },

      'click .destroy': 'destroyBookmark',

      'click a[data-role="reload-bookmarks"]': 'requestBookmarks'
    },

    renderBookmarks: function(bookmarks) {
      this.bookmarks = bookmarks;
      this.switchTo('list', {
        bookmarks:            this.bookmarks,
        ticketIsBookmarkable: this.ticketIsBookmarkable()
      });
    },

    ticketIsBookmarkable: function() {
      var status = this.ticket().status();
      if ( status == null ) { return false; }

      var ticketID = this.ticket().id();
      if ( ticketID == null ) { return false; }

      var alreadyBookmarked = _.any(this.bookmarks, function(b) {
        return b.ticket.id === ticketID;
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

    destroyBookmark: function(event) {
      event.preventDefault();
      var toDestroy = this.bookmarkID(event);
      if (!toDestroy) {
        return;
      }

      var self = this;
      this.ajax('destroyBookmark', toDestroy).done(function() {
        self.removeDestroyedBookmark(toDestroy);
      }).fail(function() {
        services.notify(self.I18n.t('destroy.failed'), 'error');
      });
    },

    removeDestroyedBookmark: function(toDestroy) {
      this.renderBookmarks(_.reject(this.bookmarks, function(b) {
        return b.id === toDestroy;
      }));
      services.notify(this.I18n.t('destroy.done'));
    }

  };

}());
