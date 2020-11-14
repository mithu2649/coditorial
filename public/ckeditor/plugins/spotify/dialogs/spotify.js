"use strict";
(function() {
  CKEDITOR.plugins.add("spotify", {
    requires: "widget",

    icons: "spotify",

    hidpi: true,

    lang: ["en", "nb", "uk"],

    init: function(editor) {
      // Adds stylesheet to classic editor. Must be copied manually for inline editors
      editor.addContentsCss(this.path + "styles/spotify.css");

      // Adds widget to toolbar
      editor.widgets.add("spotify", {
        button: editor.lang.spotify.addButton,

        template:
          '<div class="spotify-playlist-wrapper">' + '<iframe frameborder="0" class="no-border" allowtransparency="true" allow="encrypted-media"></iframe>' + '</div>',

        allowedContent:
          'div[!data-embed-code](!spotify-playlist-wrapper,align-left,align-right,align-center){width,height};' + 'iframe[allow,frameborder,allowtransparency,!width,!height](!no-border)',
        requiredContent:
          'div(!spotify-playlist-wrapper)' + 'iframe[allow,frameborder,allowtransparency,!width,!height](!no-border)',

        parts: {
          iframe: "iframe"
        },

        // Sets the outermost div as a grouped widget in the editor
        upcast: function(element) {
          return (
            element.name === "div" &&
            element.hasClass("spotify-playlist-wrapper")
          );
        },

        dialog: "spotify",

        init: function() {
          var embedCode = this.element.data("embed-code");
          if (embedCode) {
            this.setData("embedCode", embedCode);
          }

          var width = this.element.getStyle("width") || "300px";
          this.setData("width", width);

          var height = this.element.getStyle("height") || "380px";
          this.setData("height", height);

          if (this.element.hasClass("align-left")) {
            this.setData("align", "left");
          }
          if (this.element.hasClass("align-right")) {
            this.setData("align", "right");
          }
          if (this.element.hasClass("align-center")) {
            this.setData("align", "center");
          }
        },

        data: function() {
          // Update Spotify embed code and URL
          this.element.data("embed-code", this.data.embedCode);
          if (this.data.embedCode) {
            this.parts.iframe.setAttribute(
              "src",
              parseEmbedCode(this.data.embedCode)
            );
          }

          if (this.data.width === "") {
            this.element.removeStyle("width");
          } else {
            this.parts.iframe.setAttribute("width", this.data.width);
            this.element.setStyle("width", this.data.width);
          }

          if (this.data.height === "") {
            this.element.removeStyle("height");
          } else {
            this.parts.iframe.setAttribute("height", this.data.height);
            this.element.setStyle("height", this.data.height);
          }

          this.element.removeClass("align-left");
          this.element.removeClass("align-right");
          this.element.removeClass("align-center");
          if (this.data.align) {
            this.element.addClass("align-" + this.data.align);
          }
        }
      });

      // Adds dialog to widget
      CKEDITOR.dialog.add("spotify", this.path + "dialogs/spotify.js");
    }
  });

  function parseEmbedCode(embedCode) {
    // Assume embedCode is valid because of input validation
    var capturedGroups;

    var embedURLTemplate =
      "https://open.spotify.com/embed/{spotifyType}/{spotifyID}";
    var spotifyURIRegex = /^spotify:(album|playlist|track|artist):([a-zA-Z0-9]{22})$/;
    var spotifyURLRegex = /^https?:\/\/open\.spotify\.com\/(album|playlist|track|artist)\/([a-zA-Z0-9]{22})$/;

    if (spotifyURIRegex.test(embedCode)) {
      capturedGroups = embedCode.match(spotifyURIRegex);
    } else if (spotifyURLRegex.test(embedCode)) {
      capturedGroups = embedCode.match(spotifyURLRegex);
    }
    return embedURLTemplate
      .replace("{spotifyType}", capturedGroups[1])
      .replace("{spotifyID}", capturedGroups[2]);
  }
})();
