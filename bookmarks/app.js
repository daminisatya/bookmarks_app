(function(exports) {

  return ZendeskApps.defineApp(ZendeskApps.Site.TICKET_PROPERTIES, {
    appID: '/apps/01-bookmarks/versions/1.0.0',

    defaultSheet: 'loading',

    templates: {
      main: '<div class="bookmarks_app">' +
            '  <div data-sheet-name="loading" class="loading">' +
            '    <h3>{{t title}}</h3><hr/>' +
            '   {{t loading}}&hellip;' +
            '  </div>' +
            '  <div data-sheet-name="bookmarks">' +
            '    <h3>{{t title}}</h3><hr/>' +
            '    <ul>' +
            '      {{#bookmarks}}<li>' +
            '        <a href="#/tickets/{{ticketID}}">{{ticketSubject}}</a>' +
            '      </li>{{/bookmarks}}' +
            '    </ul>' +
            '    {{^bookmarks}}{{t none}}{{/bookmarks}}' +
            '    <button class="btn bookmark">{{t bookmark_this_ticket}}</button>' +
            '  </div>' +
            '</div>'
    },

    requests: {
      fetchBookmarks: {
        url: '/api/v1/bookmarks.json'
      },

      addBookmark: function() {
        return {
          url: '/api/v1/bookmarks.json',
          type: 'POST',
          data: {
            ticket_id: App.depdendency('ticketID')
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

      'fetchBookmarks.done': function(e, data) {
        App.switchTo('list', { bookmarks: data.bookmarks });
      },

      'addBookmark.success': function() {
        this.services.notify('Bookmarked ticket #%@'.fmt(this.deps.ticketID));
      },

      'addBookmark.fail': function() {
        this.services.notify('Failed to bookmark ticket #%@'.fmt(this.deps.ticketID), 'error');
      },

      'click %welcome': function() {
        App.ajax('fetchBookmarks');
      },

      'click .bookmark': function() {
        App.ajax('addBookmark');
      },

      'addBookmark.done': function(e, data) {
        App.ajax('fetchBookmarks');
      }
    },

    requestBookmarks: function() {
      App.ajax('fetchBookmarks');
    }
  });

}());
