(function(exports) {

  return ZendeskApps.defineApp(ZendeskApps.Site.TICKET_PROPERTIES, {
    appID: '/apps/01-bookmarks/versions/1.0.0',

    defaultSheet: 'loading',

    templates: {
      main: '<div class="bookmarks_app">' +
            '  <div data-sheet-name="loading" class="loading">' +
            '    <h3>{{I18n.title}}</h3><hr/>' +
            '   {{I18n.loading}}&hellip;' +
            '  </div>' +
            '  <div data-sheet-name="bookmarks">' +
            '    <h3>{{I18n.title}}</h3><hr/>' +
            '    <ul>' +
            '      {{#bookmarks}}<li>' +
            '        <a href="#/tickets/{{ticket.nice_id}}">{{ticket.subject}}</a>' +
            '      </li>{{/bookmarks}}' +
            '    </ul>' +
            '    {{^bookmarks}}{{I18n.none}}{{/bookmarks}}' +
            '    <button class="btn bookmark">{{I18n.bookmark_this_ticket}}</button>' +
            '  </div>' +
            '</div>'
    },

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

      'bookmarks.done': function(e, data) {
        this.sheet('bookmarks')
          .render('main', { bookmarks: data.bookmarks })
          .show();
      },

      'add_bookmark.success': function() {
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

      'add_bookmark.done': function(e, data) {
        this.request('bookmarks').perform();
      }
    },

    requestBookmarks: function() {
      this.request('bookmarks').perform();
    }
  });

}());
